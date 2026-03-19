/**
 * projectsExport — Backend function para exportação estruturada de dados de projetos.
 *
 * Parâmetros de entrada (JSON body):
 *   type: "dashboard" | "lista" | "riscos" | "documentos" | "horas" | "financeiro"
 *   os_id?: string — obrigatório para exportações de projeto específico
 *   filters?: object — filtros opcionais (status, responsavel, etc.)
 *   format: "csv" | "json" — formato de saída (padrão: json)
 */

import { createClientFromRequest } from "npm:@base44/sdk@0.8.21";

const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "";
const fmtBRL = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function toCSV(headers, rows) {
  const escape = (v) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const bom = "\uFEFF";
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  return bom + lines.join("\n");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const { type, os_id, filters = {}, format = "json" } = body;

    let headers = [];
    let rows = [];
    let meta = {};

    if (type === "lista" || type === "dashboard") {
      // Exporta lista completa de projetos
      const projetos = await base44.entities.OrdemServico.list("-created_date", 500);
      const parcelas = await base44.entities.Parcela.list("-created_date", 2000);
      const riscos   = await base44.entities.RiscoProjeto.list("-created_date", 2000);

      const filtrados = projetos.filter((p) => {
        if (filters.status && filters.status !== "todos" && p.status !== filters.status) return false;
        if (filters.responsavel && p.responsavel_tecnico !== filters.responsavel) return false;
        if (filters.natureza && p.natureza !== filters.natureza) return false;
        return true;
      });

      headers = ["Cliente", "Natureza", "Responsável", "Status", "Progresso (%)", "Prazo Previsto", "Valor (R$)", "Riscos Abertos", "Criado em"];
      rows = filtrados.map((p) => {
        const valorTotal = parcelas.filter(pa => pa.os_id === p.id).reduce((s, pa) => s + (pa.valor || 0), 0);
        const riscosAbertos = riscos.filter(r => r.os_id === p.id && r.status === "Aberto").length;
        return [
          p.cliente_nome || "",
          p.natureza || "",
          p.responsavel_tecnico || "",
          p.status || "",
          p.percentual_conclusao || 0,
          fmtDate(p.prazo_previsto),
          fmtBRL(valorTotal),
          riscosAbertos,
          fmtDate(p.created_date?.slice(0, 10)),
        ];
      });
      meta = { total: filtrados.length, exportedAt: new Date().toISOString() };

    } else if (type === "riscos") {
      if (!os_id) return Response.json({ error: "os_id obrigatório para exportação de riscos" }, { status: 400 });
      const projeto = await base44.entities.OrdemServico.filter({ id: os_id });
      const riscos = await base44.entities.RiscoProjeto.filter({ os_id });

      headers = ["Descrição", "Categoria", "Probabilidade", "Impacto", "Status", "Responsável", "Prazo Resolução", "Plano de Mitigação"];
      rows = riscos.map((r) => [
        r.descricao || "",
        r.categoria || "",
        r.probabilidade || "",
        r.impacto || "",
        r.status || "",
        r.responsavel || "",
        fmtDate(r.prazo_resolucao),
        r.plano_mitigacao || "",
      ]);
      meta = { projeto: projeto[0]?.cliente_nome || os_id, total: riscos.length };

    } else if (type === "documentos") {
      if (!os_id) return Response.json({ error: "os_id obrigatório para exportação de documentos" }, { status: 400 });
      const docs = await base44.entities.DocumentoProjeto.filter({ os_id });

      headers = ["Nome", "Tipo", "Versão", "Status", "Responsável", "Prazo Entrega", "Enviado ao Cliente", "URL", "Observações"];
      rows = docs.map((d) => [
        d.nome || "",
        d.tipo || "",
        d.versao || "1.0",
        d.status || "",
        d.responsavel || "",
        fmtDate(d.data_entrega),
        d.enviado_cliente ? "Sim" : "Não",
        d.url || "",
        d.observacoes || "",
      ]);
      meta = { os_id, total: docs.length };

    } else if (type === "horas") {
      if (!os_id) return Response.json({ error: "os_id obrigatório para exportação de horas" }, { status: 400 });
      const entradas   = await base44.entities.EntradaTempo.filter({ os_id });
      const alocacoes  = await base44.entities.AlocacaoHoras.filter({ projeto_id: os_id });

      headers = ["Colaborador", "Data", "Horas", "Faturável", "Aprovado", "Descrição", "Tarefa ID"];
      rows = entradas.map((e) => [
        e.colaborador || "",
        fmtDate(e.data),
        (e.horas || 0).toFixed(2),
        e.faturavel ? "Sim" : "Não",
        e.aprovado ? "Sim" : "Não",
        e.descricao || "",
        e.tarefa_id || "",
      ]);
      const totalHoras = entradas.reduce((s, e) => s + (e.horas || 0), 0);
      meta = {
        os_id,
        total_entradas: entradas.length,
        total_horas: totalHoras.toFixed(2),
        total_alocacoes: alocacoes.length,
        horas_previstas: alocacoes.reduce((s, a) => s + (a.horas_previstas || 0), 0).toFixed(2),
      };

    } else if (type === "financeiro") {
      if (!os_id) return Response.json({ error: "os_id obrigatório para exportação financeira" }, { status: 400 });
      const parcelas = await base44.entities.Parcela.filter({ os_id });

      headers = ["Vencimento", "Valor", "Status", "Mês Referência", "Nota Fiscal", "Data Recebimento", "Observações"];
      rows = parcelas.map((p) => [
        fmtDate(p.data_vencimento),
        fmtBRL(p.valor),
        p.status || "",
        p.mes_referencia || "",
        p.nota_fiscal || "",
        fmtDate(p.data_recebimento),
        p.observacoes || "",
      ]);
      const valorTotal    = parcelas.reduce((s, p) => s + (p.valor || 0), 0);
      const valorRecebido = parcelas.filter(p => p.status === "Recebida").reduce((s, p) => s + (p.valor || 0), 0);
      meta = {
        os_id,
        total_parcelas: parcelas.length,
        valor_total: fmtBRL(valorTotal),
        valor_recebido: fmtBRL(valorRecebido),
        saldo: fmtBRL(valorTotal - valorRecebido),
      };

    } else {
      return Response.json({ error: `Tipo de exportação desconhecido: ${type}` }, { status: 400 });
    }

    if (format === "csv") {
      const csv = toCSV(headers, rows);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${type}_${os_id || "portfolio"}_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return Response.json({ headers, rows, meta, exportedAt: new Date().toISOString() });

  } catch (error) {
    console.error("projectsExport error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});