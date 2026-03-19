/**
 * Export Utilities — APSIS Portal
 * Exportação estruturada de dados em CSV e PDF com cabeçalho APSIS.
 */
import { jsPDF } from "jspdf";

const APSIS_GREEN = "#1A4731";
const APSIS_ORANGE = "#F47920";

/**
 * Faz download de um arquivo CSV.
 * @param {string} filename - nome do arquivo sem extensão
 * @param {string[]} headers - cabeçalhos das colunas
 * @param {Array<string[]>} rows - linhas de dados (strings)
 */
export function downloadCSV(filename, headers, rows) {
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  const bom = "\uFEFF"; // BOM para UTF-8 no Excel
  const blob = new Blob([bom + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Formata valor monetário em BRL.
 */
export function fmtBRL(v) {
  return (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Formata data ISO para pt-BR.
 */
export function fmtDatePTBR(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

/**
 * Faz download de um PDF com cabeçalho APSIS e tabela de dados.
 * @param {Object} opts
 * @param {string} opts.filename - nome do arquivo sem extensão
 * @param {string} opts.title - título do relatório
 * @param {string} opts.subtitle - subtítulo / nome do projeto
 * @param {string[]} opts.headers - cabeçalhos da tabela
 * @param {Array<string[]>} opts.rows - linhas de dados
 * @param {Object[]} [opts.kpis] - [{label, value}] — bloco de KPIs acima da tabela
 * @param {number[]} [opts.colWidths] - largura de cada coluna (soma deve ser 190)
 */
export function downloadPDF({ filename, title, subtitle, headers, rows, kpis, colWidths }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = 210;
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 0;

  // ── Header APSIS ─────────────────────────────────────────────────────────
  // Barra verde no topo
  doc.setFillColor(26, 71, 49); // APSIS_GREEN
  doc.rect(0, 0, pageW, 18, "F");

  // Texto da empresa
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("APSIS", margin, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(200, 230, 215);
  doc.text("Portal de Gestão de Projetos", margin + 14, 11);

  // Data de geração (canto direito)
  const now = new Date().toLocaleString("pt-BR");
  doc.setFontSize(7);
  doc.setTextColor(180, 210, 195);
  doc.text(`Gerado em: ${now}`, pageW - margin, 11, { align: "right" });

  y = 26;

  // ── Título do relatório ──────────────────────────────────────────────────
  doc.setTextColor(26, 71, 49);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, margin, y);
  y += 6;

  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(subtitle, margin, y);
    y += 8;
  } else {
    y += 2;
  }

  // Linha separadora laranja
  doc.setDrawColor(244, 121, 32); // APSIS_ORANGE
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── KPIs (opcional) ──────────────────────────────────────────────────────
  if (kpis && kpis.length > 0) {
    const kpiW = contentW / kpis.length;
    kpis.forEach((kpi, i) => {
      const x = margin + i * kpiW;
      doc.setFillColor(244, 246, 244); // surface-2
      doc.roundedRect(x, y, kpiW - 2, 14, 2, 2, "F");
      doc.setTextColor(26, 71, 49);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(String(kpi.value), x + (kpiW - 2) / 2, y + 7, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(kpi.label, x + (kpiW - 2) / 2, y + 12, { align: "center" });
    });
    y += 20;
  }

  // ── Tabela ────────────────────────────────────────────────────────────────
  const cols = colWidths || headers.map(() => Math.floor(contentW / headers.length));
  const rowH = 7;
  const headerH = 8;

  // Cabeçalho da tabela
  doc.setFillColor(26, 71, 49);
  doc.rect(margin, y, contentW, headerH, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  let cx = margin + 2;
  headers.forEach((h, i) => {
    doc.text(h, cx, y + 5.5);
    cx += cols[i];
  });
  y += headerH;

  // Linhas de dados
  rows.forEach((row, ri) => {
    // Nova página se necessário
    if (y + rowH > 280) {
      doc.addPage();
      y = 14;
    }

    // Zebra striping
    if (ri % 2 === 0) {
      doc.setFillColor(248, 250, 248);
      doc.rect(margin, y, contentW, rowH, "F");
    }

    doc.setTextColor(51, 65, 85); // slate-700
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    cx = margin + 2;
    row.forEach((cell, ci) => {
      const cellW = cols[ci] - 4;
      const text = String(cell ?? "—");
      const truncated = doc.getStringUnitWidth(text) * 7.5 / doc.internal.scaleFactor > cellW
        ? text.slice(0, Math.floor(cellW / 2.1)) + "…"
        : text;
      doc.text(truncated, cx, y + 4.8);
      cx += cols[ci];
    });

    // Linha divisória
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.1);
    doc.line(margin, y + rowH, pageW - margin, y + rowH);
    y += rowH;
  });

  // ── Footer ────────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(26, 71, 49);
    doc.rect(0, 290, pageW, 7, "F");
    doc.setTextColor(180, 210, 195);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.text("APSIS — Documento gerado automaticamente pelo Portal de Gestão de Projetos", margin, 294.5);
    doc.text(`Página ${p} de ${totalPages}`, pageW - margin, 294.5, { align: "right" });
  }

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}