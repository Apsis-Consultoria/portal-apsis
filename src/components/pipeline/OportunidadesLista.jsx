import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import OportunidadeDetalhe from "./OportunidadeDetalhe";
import {
  Search, Plus, Download, FileText, Edit2, Trash2,
  ChevronUp, ChevronDown, ChevronsUpDown, X, Briefcase
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";

const fmt = (v) =>
  v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "—";

const STATUS_STYLES = {
  "Aberta":     { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"    },
  "Em análise": { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
  "Encerrada":  { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400"   },
};

const NATUREZA_STYLES = {
  "Contábil":    { bg: "bg-indigo-50",  text: "text-indigo-700"  },
  "Consultoria": { bg: "bg-teal-50",    text: "text-teal-700"    },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function NaturezaBadge({ natureza }) {
  const s = NATUREZA_STYLES[natureza] || { bg: "bg-slate-100", text: "text-slate-500" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${s.bg} ${s.text}`}>
      {natureza}
    </span>
  );
}

function SortIcon({ field, sortConfig }) {
  if (sortConfig.key !== field) return <ChevronsUpDown size={12} className="text-slate-300" />;
  return sortConfig.dir === "asc"
    ? <ChevronUp size={12} className="text-[#F47920]" />
    : <ChevronDown size={12} className="text-[#F47920]" />;
}

const emptyOAP = { cliente_nome: "", natureza: "Contábil", responsavel: "", status: "Aberta", observacoes: "" };

export default function OportunidadesLista({ oaps, onReload }) {
  const [selected, setSelected] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroResp, setFiltroResp] = useState("Todos");
  const [sortConfig, setSortConfig] = useState({ key: "created_date", dir: "desc" });
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const responsaveis = ["Todos", ...new Set(oaps.map(o => o.responsavel).filter(Boolean))];

  const filtered = useMemo(() => {
    let list = oaps.filter(o => {
      const matchBusca = !busca || o.cliente_nome?.toLowerCase().includes(busca.toLowerCase()) || o.observacoes?.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === "Todos" || o.status === filtroStatus;
      const matchResp = filtroResp === "Todos" || o.responsavel === filtroResp;
      return matchBusca && matchStatus && matchResp;
    });

    list = [...list].sort((a, b) => {
      const { key, dir } = sortConfig;
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return dir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [oaps, busca, filtroStatus, filtroResp, sortConfig]);

  const toggleSort = (key) => setSortConfig(prev =>
    prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
  );

  const exportCSV = () => {
    const header = ["Cliente", "Natureza", "Responsável", "Status", "Observações", "Data"];
    const rows = filtered.map(o => [
      o.cliente_nome, o.natureza, o.responsavel, o.status,
      o.observacoes?.replace(/\n/g, " "),
      o.created_date ? format(new Date(o.created_date), "dd/MM/yyyy") : ""
    ]);
    const csv = [header, ...rows].map(r => r.map(c => `"${c ?? ""}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "oportunidades.csv"; a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16); doc.text("Oportunidades", 14, 18);
    doc.setFontSize(9);
    const headers = ["Cliente", "Natureza", "Responsável", "Status", "Data"];
    const widths = [60, 40, 40, 30, 30];
    let y = 28;
    doc.setFillColor(26, 71, 49); doc.rect(14, y - 5, widths.reduce((a, b) => a + b, 0), 8, "F");
    doc.setTextColor(255, 255, 255);
    let x = 14;
    headers.forEach((h, i) => { doc.text(h, x + 1, y); x += widths[i]; });
    doc.setTextColor(30, 30, 30);
    filtered.forEach((o, idx) => {
      y += 8;
      if (y > 180) { doc.addPage(); y = 20; }
      if (idx % 2 === 0) { doc.setFillColor(244, 246, 244); doc.rect(14, y - 5, widths.reduce((a, b) => a + b, 0), 8, "F"); }
      x = 14;
      const row = [o.cliente_nome, o.natureza, o.responsavel, o.status, o.created_date ? format(new Date(o.created_date), "dd/MM/yyyy") : "—"];
      row.forEach((val, i) => { doc.text(String(val ?? "—").substring(0, 28), x + 1, y); x += widths[i]; });
    });
    doc.save("oportunidades.pdf");
  };

  const salvar = async () => {
    setSaving(true);
    if (modal.editing?.id) await base44.entities.OAP.update(modal.editing.id, modal.data);
    else await base44.entities.OAP.create(modal.data);
    await onReload();
    setModal(null);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Confirma exclusão?")) return;
    await base44.entities.OAP.delete(id);
    await onReload();
  };

  const InputField = ({ label, field, type = "text", options }) => (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {options ? (
        <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
          value={modal?.data?.[field] || ""}
          onChange={e => setModal(m => ({ ...m, data: { ...m.data, [field]: e.target.value } }))}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
          value={modal?.data?.[field] || ""}
          onChange={e => setModal(m => ({ ...m, data: { ...m.data, [field]: e.target.value } }))} />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Oportunidades</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gerencie as oportunidades abertas e em análise</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 bg-white transition-colors">
            <FileText size={13} /> CSV
          </button>
          <button onClick={exportPDF}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 bg-white transition-colors">
            <Download size={13} /> PDF
          </button>
          <button onClick={() => setModal({ data: { ...emptyOAP }, editing: null })}
            className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors">
            <Plus size={15} /> Nova Oportunidade
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por cliente ou descrição..."
            className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#F47920]" />
          {busca && (
            <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          )}
        </div>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          {["Todos", "Aberta", "Em análise", "Encerrada"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={filtroResp} onChange={e => setFiltroResp(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
          {responsaveis.map(r => <option key={r}>{r}</option>)}
        </select>
        <div className="text-xs text-slate-500 ml-1">
          <span className="font-semibold text-slate-700">{filtered.length}</span> oportunidade(s)
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Briefcase size={24} className="text-slate-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Nenhuma oportunidade encontrada</p>
              <p className="text-xs text-slate-400 mt-1">Ajuste os filtros ou crie uma nova oportunidade</p>
            </div>
            <button onClick={() => setModal({ data: { ...emptyOAP }, editing: null })}
              className="mt-1 flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors">
              <Plus size={14} /> Nova Oportunidade
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {[
                    { label: "Cliente", key: "cliente_nome" },
                    { label: "Natureza", key: "natureza" },
                    { label: "Responsável", key: "responsavel" },
                    { label: "Status", key: "status" },
                    { label: "Observações", key: null },
                    { label: "Data", key: "created_date" },
                    { label: "", key: null },
                  ].map(({ label, key }) => (
                    <th key={label}
                      onClick={key ? () => toggleSort(key) : undefined}
                      className={`text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${key ? "cursor-pointer hover:text-slate-700 select-none" : ""}`}>
                      <div className="flex items-center gap-1">
                        {label}
                        {key && <SortIcon field={key} sortConfig={sortConfig} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, idx) => (
                  <tr key={o.id || idx}
                    onClick={() => setSelected(o)}
                    className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800">{o.cliente_nome || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <NaturezaBadge natureza={o.natureza} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-600 text-xs">{o.responsavel || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      <span className="text-slate-500 text-xs line-clamp-1">{o.observacoes || "—"}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-slate-500 text-xs">
                        {o.created_date ? format(new Date(o.created_date), "dd/MM/yyyy") : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => setModal({ data: { ...o }, editing: o })}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit2 size={13} className="text-slate-500" />
                        </button>
                        <button onClick={() => excluir(o.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={13} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">
                {modal.editing ? "Editar" : "Nova"} Oportunidade
              </h2>
              <button onClick={() => setModal(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={16} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2"><InputField label="Cliente" field="cliente_nome" /></div>
              <InputField label="Natureza" field="natureza" options={["Contábil", "Consultoria"]} />
              <InputField label="Responsável" field="responsavel" />
              <InputField label="Status" field="status" options={["Aberta", "Em análise", "Encerrada"]} />
              <div className="col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Observações</label>
                <textarea rows={3}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920] resize-none"
                  value={modal?.data?.observacoes || ""}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, observacoes: e.target.value } }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={salvar} disabled={saving}
                className="px-5 py-2 bg-[#1A4731] text-white rounded-xl text-sm font-medium hover:bg-[#245E40] disabled:opacity-60 transition-colors">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}