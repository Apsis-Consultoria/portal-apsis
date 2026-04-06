// Hierarquia de cargo para ordenação
export const CARGO_ORDER = [
  "Diretor", "Executivo B", "Executivo A",
  "Consultor B", "Consultor A", "Consultor Jr",
  "Trainee", "Estagiário"
];

// % consumo por status
const STATUS_CONSUMO = {
  "Iniciação": 0.20,
  "Execução": 0.40,
  "Revisão": 0.60,
  "Colado Valores": 0.80,
  "Aprovação (Minuta Enviada)": 0.90,
  "Aprovação Cliente/Auditoria": 1.00,
};

export function calcHorasAjustadas(status, horasAlocadas) {
  const pct = STATUS_CONSUMO[status];
  if (pct === undefined) return horasAlocadas * 0.5;
  return horasAlocadas * (1 - pct);
}

export function minutaAlert(dataMinuta) {
  if (!dataMinuta) return "sem_minuta";
  const d = dataMinuta instanceof Date ? dataMinuta : new Date(dataMinuta);
  if (isNaN(d.getTime())) return "sem_minuta";
  const diff = (new Date() - d) / (1000 * 60 * 60 * 24);
  if (diff > 30) return "atualizar";
  return "ok";
}

export function cargaStatus(horasAjustadas) {
  if (horasAjustadas <= 80) return "disponivel";
  if (horasAjustadas <= 160) return "atencao";
  return "sobrecarregado";
}

// Parse e processa as linhas do Excel
export function processarDados(rows, excluirTerceiro = false) {
  // Detectar header na primeira linha
  // Colunas esperadas (índice 0-based):
  // 0: Pessoa, 1: Área Colaborador, 2: Cargo, 3: Tipo Contratação, 4: Status,
  // 5: OS, 6: Cliente, 7: Grupo Serviços, 8: Tipo Serviço, 9: Área Serviço,
  // 10: Líder, 11: Prazo Dias, 12: Data Minuta, 13: Função Equipe,
  // 14: Data Alocação, 15: Data Esforço, 16: Data Avaliação, 17: Avaliação,
  // 18: Comentário Avaliação, 19: Avaliador, 20: Horas Alocadas, 21: Valor Alocado,
  // 22: Horas Lançadas, 23: Valor Lançado

  const header = rows[0];
  const data = rows.slice(1);

  function col(row, name) {
    const idx = header.findIndex(h => h && h.toString().toLowerCase().includes(name.toLowerCase()));
    return idx >= 0 ? row[idx] : undefined;
  }

  const filtered = data.filter(row => {
    if (!row || row.every(c => c === null || c === undefined || c === "")) return false;
    const status = (col(row, "Status") || "").toString().trim();
    if (status === "Cancelado" || status === "Pausado") return false;
    const grupo = (col(row, "Grupo de Servi") || "").toString();
    if (grupo.toLowerCase().includes("jurídico") || grupo.toLowerCase().includes("juridico")) return false;
    if (excluirTerceiro) {
      const tipo = (col(row, "Tipo de Contrata") || "").toString();
      if (tipo.toLowerCase().includes("terceiro")) return false;
    }
    return true;
  });

  const projects = filtered.map(row => {
    const horasAlocadas = parseFloat(col(row, "Horas Alocadas") || 0) || 0;
    const status = (col(row, "Status") || "").toString().trim();
    const horasAjustadas = calcHorasAjustadas(status, horasAlocadas);

    // Data minuta
    let dataMinuta = col(row, "Data de Envio");
    if (dataMinuta && typeof dataMinuta === "number") {
      // Excel serial date
      dataMinuta = new Date(Math.round((dataMinuta - 25569) * 86400 * 1000));
    } else if (dataMinuta) {
      dataMinuta = new Date(dataMinuta);
    }

    return {
      pessoa: (col(row, "Pessoa") || "").toString().trim(),
      area: (col(row, "Área do Colaborador") || "").toString().trim(),
      cargo: (col(row, "Cargo do Colaborador") || "").toString().trim(),
      tipoContratacao: (col(row, "Tipo de Contrata") || "").toString().trim(),
      status,
      os: (col(row, "Ordem de Servi") || "").toString().trim(),
      cliente: (col(row, "Cliente") || "").toString().trim(),
      grupoServicos: (col(row, "Grupo de Servi") || "").toString().trim(),
      tipoServico: (col(row, "Tipo de Servi") || "").toString().trim(),
      lider: (col(row, "Líder") || "").toString().trim(),
      dataMinuta,
      funcao: (col(row, "Função") || col(row, "Funcao") || "").toString().trim(),
      horasAlocadas,
      horasAjustadas,
      valorAlocado: parseFloat(col(row, "Valor Alocado") || 0) || 0,
      horasLancadas: parseFloat(col(row, "Horas Lan") || 0) || 0,
    };
  }).filter(p => p.pessoa);

  // Agrupar por consultor
  const consultorMap = {};
  for (const p of projects) {
    if (!consultorMap[p.pessoa]) {
      consultorMap[p.pessoa] = { nome: p.pessoa, cargo: p.cargo, area: p.area, projetos: [] };
    }
    consultorMap[p.pessoa].projetos.push(p);
  }

  const consultores = Object.values(consultorMap).map(c => {
    const horasBrutas = c.projetos.reduce((s, p) => s + p.horasAlocadas, 0);
    const horasAjustadas = c.projetos.reduce((s, p) => s + p.horasAjustadas, 0);
    const pendencias = c.projetos.filter(p => minutaAlert(p.dataMinuta) !== "ok").length;
    return { ...c, horasBrutas, horasAjustadas, pendencias };
  });

  // Ordenar por hierarquia de cargo, depois nome
  consultores.sort((a, b) => {
    const ia = CARGO_ORDER.findIndex(c => a.cargo.toLowerCase().includes(c.toLowerCase()));
    const ib = CARGO_ORDER.findIndex(c => b.cargo.toLowerCase().includes(c.toLowerCase()));
    const oa = ia === -1 ? 99 : ia;
    const ob = ib === -1 ? 99 : ib;
    if (oa !== ob) return oa - ob;
    return a.nome.localeCompare(b.nome);
  });

  return { consultores, allStatuses: [...new Set(projects.map(p => p.status))].sort() };
}

export function exportarXlsx(consultores, comentarios) {
  import("xlsx").then(XLSX => {
    const rows = [["Consultor","Cargo","OS","Cliente","Tipo Serviço","Status","Horas Alocadas","Horas Ajustadas","Data Minuta","Comentário"]];
    for (const c of consultores) {
      for (const p of c.projetos) {
        rows.push([
          c.nome, c.cargo, p.os, p.cliente, p.tipoServico, p.status,
          p.horasAlocadas, Math.round(p.horasAjustadas * 10) / 10,
          p.dataMinuta ? p.dataMinuta.toLocaleDateString("pt-BR") : "",
          comentarios[p.os] || ""
        ]);
      }
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Alocação BV");
    XLSX.writeFile(wb, `alocacao_bv_${new Date().toISOString().slice(0,10)}.xlsx`);
  });
}