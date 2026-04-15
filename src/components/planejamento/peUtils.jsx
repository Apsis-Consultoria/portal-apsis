export const PERSPECTIVAS = ["FINANCEIRO", "MERCADO/CLIENTES", "PROCESSOS INTERNOS", "APRENDIZADO/CRESCIMENTO"];

export const STATUS_INICIATIVA = ["Concluído", "Em Andamento", "Aguardando", "Atrasado", "Não Iniciado"];

export const PERSPECTIVA_COLORS = {
  "FINANCEIRO": { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200", dot: "bg-blue-600" },
  "MERCADO/CLIENTES": { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200", dot: "bg-orange-500" },
  "PROCESSOS INTERNOS": { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200", dot: "bg-purple-600" },
  "APRENDIZADO/CRESCIMENTO": { bg: "bg-green-100", text: "text-green-800", border: "border-green-200", dot: "bg-green-600" },
};

export const STATUS_CONFIG = {
  "Concluído":    { label: "🟢 Concluído",    bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300" },
  "Em Andamento": { label: "🔵 Em Andamento", bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300" },
  "Aguardando":   { label: "🟡 Aguardando",   bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  "Atrasado":     { label: "🔴 Atrasado",     bg: "bg-red-100",    text: "text-red-800",    border: "border-red-300" },
  "Não Iniciado": { label: "⚪ Não Iniciado", bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-300" },
};

export function calcKpiStatus(kpi) {
  const resultados = [kpi.resultado_t1, kpi.resultado_t2, kpi.resultado_t3, kpi.resultado_t4].filter(r => r !== null && r !== undefined && r !== "");
  if (!resultados.length || !kpi.meta_anual) return "sem_dados";
  const ultimo = resultados[resultados.length - 1];
  const meta = Number(kpi.meta_anual);
  const pct = (Number(ultimo) / meta) * 100;
  if (pct >= 100) return "batida";
  if (pct >= 70) return "progresso";
  return "fora";
}

export const KPI_STATUS_CONFIG = {
  batida:    { label: "✅ Meta Batida",   bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300" },
  progresso: { label: "⚠️ Em Progresso",  bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  fora:      { label: "🔴 Fora da Meta",  bg: "bg-red-100",    text: "text-red-800",    border: "border-red-300" },
  sem_dados: { label: "⚪ Sem Dados",     bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-300" },
};

export function isSubItem(numero) {
  return numero && numero.includes(".");
}

export function exportToExcel(data, filename) {
  import("xlsx").then(XLSX => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, filename);
  });
}