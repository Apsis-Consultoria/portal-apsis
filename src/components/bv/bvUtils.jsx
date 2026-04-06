import * as XLSX from "xlsx";

export const CARGO_ORDER = [
  "Sócio", "Diretor", "Gerente Sênior", "Gerente", "Supervisor",
  "Especialista", "Analista Sênior", "Analista", "Assistente Sênior",
  "Assistente", "Trainee", "Estagiário",
];

// Consumo % por status do projeto
export const CONSUMO_STATUS = {
  "Iniciação": 0.40,
  "Execução": 0.40,
  "Revisão": 0.60,
  "Aprovação": 0.20,
  "Colado": 0.80,
  "Minuta": 0.90,
  "Concluído": 1.0,
  "Cancelado": 0,
  "Pausado": 0,
};

// Fase das checkboxes por status
export const FASES_STATUS = {
  "Iniciação":  { docRecebida: true,  modelagem: false, revisao: false, coladoValor: false, minuta: false },
  "Execução":   { docRecebida: true,  modelagem: true,  revisao: false, coladoValor: false, minuta: false },
  "Revisão":    { docRecebida: true,  modelagem: true,  revisao: true,  coladoValor: false, minuta: false },
  "Aprovação":  { docRecebida: true,  modelagem: true,  revisao: true,  coladoValor: false, minuta: false },
  "Colado":     { docRecebida: true,  modelagem: true,  revisao: true,  coladoValor: true,  minuta: false },
  "Minuta":     { docRecebida: true,  modelagem: true,  revisao: true,  coladoValor: true,  minuta: true  },
  "Concluído":  { docRecebida: true,  modelagem: true,  revisao: true,  coladoValor: true,  minuta: true  },
};

function getConsumo(status) {
  return CONSUMO_STATUS[status] ?? 0.40;
}

function getFase(status) {
  return FASES_STATUS[status] ?? { docRecebida: false, modelagem: false, revisao: false, coladoValor: false, minuta: false };
}

function excelDateToString(val) {
  if (!val) return null;
  if (typeof val === "string" && val.length >= 10) return val.slice(0, 10);
  if (typeof val === "number") {
    const date = XLSX.SSF.parse_date_code(val);
    if (date) {
      const m = String(date.m).padStart(2, "0");
      const d = String(date.d).padStart(2, "0");
      return `${date.y}-${m}-${d}`;
    }
  }
  return null;
}

function formatDate(val) {
  const s = excelDateToString(val);
  if (!s) return null;
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

function checkData(dataMinuta, prazoEmDias, dataAlocacao) {
  if (!dataMinuta) return "ATUALIZAR";
  return "OK";
}

/**
 * Processa planilha no formato SAN exportado (nova estrutura).
 * Agrupa por Pessoa, deduplica por Ordem de Serviço.
 */
export function processarDados(rows) {
  // rows é array de objetos com as colunas como chaves
  if (!rows || rows.length === 0) return { consultores: [], allStatuses: [] };

  const consultoresMap = {};
  const statusSet = new Set();

  rows.forEach(row => {
    const nome = (row["Pessoa"] || "").trim();
    if (!nome) return;

    const status = (row["Status"] || "").trim();
    if (status === "Cancelado" || status === "Pausado") return;
    if (status) statusSet.add(status);

    if (!consultoresMap[nome]) {
      consultoresMap[nome] = {
        nome,
        area: row["Área do Colaborador"] || "",
        cargo: row["Cargo do Colaborador"] || "",
        tipoContratacao: row["Tipo de Contratação"] || "",
        projetos: {},
      };
    }

    const os = (row["Ordem de Serviço"] || "").trim();
    if (!os) return;

    if (!consultoresMap[nome].projetos[os]) {
      const consumo = getConsumo(status);
      const horasAlocadas = Number(row["Horas Alocadas"]) || 0;
      const dataMinuta = formatDate(row["Data de Envio da Minuta"]);
      const prazo = row["Prazo em Dias"];
      const dataAlocacao = row["Data de Alocação"];

      consultoresMap[nome].projetos[os] = {
        os,
        cliente: (row["Cliente"] || "").trim(),
        tipoServico: (row["Tipo de Serviço"] || "").trim(),
        grupoServicos: (row["Grupo de Serviços"] || "").trim(),
        status,
        lider: row["Líder do Projeto"] || "",
        dataMinuta,
        checkData: checkData(dataMinuta, prazo, dataAlocacao),
        horasAlocadas,
        horasLancadas: Number(row["Horas Lançadas"]) || 0,
        consumo,
        horasAjustadas: Math.round(horasAlocadas * consumo),
        fases: getFase(status),
        funcaoEquipe: row["Função na Equipe"] || "",
      };
    }
  });

  const allStatuses = Array.from(statusSet);

  const consultores = Object.values(consultoresMap).map(c => {
    const projetos = Object.values(c.projetos);
    const totalHoras = projetos.reduce((s, p) => s + p.horasAlocadas, 0);
    const totalAjustado = projetos.reduce((s, p) => s + p.horasAjustadas, 0);
    const pendencias = projetos.filter(p => p.checkData === "ATUALIZAR").length;

    return {
      ...c,
      projetos,
      totalHoras,
      totalAjustado,
      pendencias,
      // compatibilidade com BVResumoCards
      nome: c.nome,
      cargo: c.cargo,
    };
  });

  // Ordena por cargo hierarchy
  consultores.sort((a, b) => {
    const ia = CARGO_ORDER.findIndex(c => a.cargo.includes(c));
    const ib = CARGO_ORDER.findIndex(c => b.cargo.includes(c));
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib) || a.nome.localeCompare(b.nome);
  });

  return { consultores, allStatuses };
}

export function exportarXlsx(consultores, comentarios) {
  const rows = [];
  consultores.forEach(c => {
    c.projetos.forEach(p => {
      rows.push({
        Consultor: c.nome,
        Area: c.area,
        Cargo: c.cargo,
        OS: p.os,
        Cliente: p.cliente,
        TipoServico: p.tipoServico,
        StatusSAN: p.status,
        HorasAlocadas: p.horasAlocadas,
        HorasAjustadas: p.horasAjustadas,
        Consumo: `${Math.round(p.consumo * 100)}%`,
        DataMinuta: p.dataMinuta || "",
        CheckData: p.checkData,
        Comentario: comentarios[p.os] || "",
      });
    });
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Controle de Horas");
  XLSX.writeFile(wb, "controle_alocacao_horas.xlsx");
}