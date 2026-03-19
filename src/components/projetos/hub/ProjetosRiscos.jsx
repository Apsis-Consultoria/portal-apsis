import { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle, AlertOctagon, CheckCircle2, ShieldCheck,
  Plus, X, Filter, Download, Calendar, Users, ChevronDown
} from "lucide-react";

const IMPACTO_STYLE = {
  "Crítico": { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300",    dot: "bg-red-500",    row: "bg-red-50/40" },
  "Alto":    { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300", dot: "bg-orange-500", row: "bg-orange-50/20" },
  "Médio":   { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300", dot: "bg-yellow-500", row: "" },
  "Baixo":   { bg: "bg-slate-100",  text: "text-slate-600",  border: "border-slate-300",  dot: "bg-slate-400",  row: "" },
};

const PROB_STYLE = {
  "Alta":  { bg: "bg-red-50",    text: "text-red-600"    },
  "Média": { bg: "bg-amber-50",  text: "text-amber-700"  },
  "Baixa": { bg: "bg-slate-50",  text: "text-slate-600"  },
};

const STATUS_STYLE = {
  "Aberto":         { bg: "bg-red-100",     text: "text-red-700",    dot: "bg-red-500"    },
  "Em mitigação":   { bg: "bg-amber-100",   text: "text-amber-700",  dot: "bg-amber-500"  },
  "Resolvido":      { bg: "bg-emerald-100", text: "text-emerald-700",dot: "bg-emerald-500"},
  "Aceito":         { bg: "bg-slate-100",   text: "text-slate-600",  dot: "bg-slate-400"  },
};

const CATEGORIAS = ["Prazo", "Escopo", "Financeiro", "Técnico", "Comunicação", "Recurso"];
const IMPACTOS   = ["Crítico", "Alto", "Médio", "Baixo"];
const PROBS      = ["Alta", "Média", "Baixa"];
const STATUSES   = ["Aberto", "Em mitigação", "Resolvido", "Aceito"];

const EMPTY_FORM = {
  os_id: "", descricao: "", categoria: "Prazo", impacto: "Médio",
  probabilidade: "Média", status: "Aberto", plano_mitigacao: "",
  responsavel: "", prazo_resolucao: "",
};

export default function ProjetosRiscos({ data, onRefresh }) {
  const { riscos = [], projetos = [] } = data;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroImpacto, setFiltroImpacto] = useState("todos");
  const [filtroOS, setFiltroOS] = useState("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const projetoNome = (id) => projetos.find(p => p.id === id)?.cliente_nome || "—";

  const filtrados = useMemo(() => riscos.filter(r => {
    if (filtroStatus !== "todos" && r.status !== filtroStatus) return false;
    if (filtroImpacto !== "todos" && r.impacto !== filtroImpacto) return false;
    if (filtroOS !== "todos" && r.os_id !== filtroOS) return false;
    return true;
  }), [riscos, filtroStatus, filtroImpacto, filtroOS]);

  const handleSave = async () => {
    if (!form.os_id || !form.descricao) return;
    setSaving(true);
    await base44.entities.RiscoProjeto.create(form);
    setForm(EMPTY_FORM);
    setShowForm(false);
    onRefresh();
    setSaving(false);
  };

  const handleStatus = async (risco, novoStatus) => {
    await base44.entities.RiscoProjeto.update(risco.id, { status: novoStatus });
    onRefresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.RiscoProjeto.delete(id);
    onRefresh();
  };

  const exportCSV = () => {
    const header = "Projeto,Risco,Categoria,Impacto,Probabilidade,Status,Responsável,Prazo\n";
    const rows = filtrados.map(r =>
      `"${projetoNome(r.os_id)}","${r.descricao}","${r.categoria}","${r.impacto}","${r.probabilidade}","${r.status}","${r.responsavel || ""}","${r.prazo_resolucao || ""}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "riscos.csv"; a.click();
  };

  // KPIs
  const abertos    = riscos.filter(r => r.status === "Aberto").length;
  const mitigando  = riscos.filter(r => r.status === "Em mitigação").length;
  const resolvidos = riscos.filter(r => r.status === "Resolvido").length;
  const criticos   = riscos.filter(r => r.impacto === "Crítico" && r.status !== "Resolvido").length;

  const activeFilters = [filtroStatus, filtroImpacto, filtroOS].filter(f => f !== "todos").length;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Riscos de Projetos</h2>
          <p className="text-sm text-slate-400 mt-0.5">Governança de riscos do portfólio com planos de mitigação</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5 text-xs">
            <Download size={12} /> Exportar
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}
            className="bg-[#F47920] hover:bg-[#d96a18] text-white gap-1.5 text-xs">
            <Plus size={13} /> Novo Risco
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={AlertTriangle}  color="red"    label="Em Aberto"        value={abertos}    />
        <KPICard icon={ShieldCheck}    color="amber"  label="Em Mitigação"     value={mitigando}  />
        <KPICard icon={CheckCircle2}   color="green"  label="Resolvidos"       value={resolvidos} />
        <KPICard icon={AlertOctagon}   color="crimson" label="Impacto Crítico" value={criticos}   />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${showFilters || activeFilters > 0 ? "bg-[#1A4731] text-white border-[#1A4731]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
            <Filter size={12} />
            Filtros {activeFilters > 0 && <span className="bg-[#F47920] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{activeFilters}</span>}
          </button>
          <span className="ml-auto text-xs text-slate-400">{filtrados.length} risco{filtrados.length !== 1 ? "s" : ""}</span>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <div className="flex gap-1 flex-wrap">
                {["todos", ...STATUSES].map(s => (
                  <button key={s} onClick={() => setFiltroStatus(s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${filtroStatus === s ? "bg-[#1A4731] text-white border-[#1A4731]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                    {s === "todos" ? "Todos" : s}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Impacto:</span>
              <Select value={filtroImpacto} onValueChange={setFiltroImpacto}>
                <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {IMPACTOS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Projeto:</span>
              <Select value={filtroOS} onValueChange={setFiltroOS}>
                <SelectTrigger className="h-8 w-44 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.cliente_nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {activeFilters > 0 && (
              <button onClick={() => { setFiltroStatus("todos"); setFiltroImpacto("todos"); setFiltroOS("todos"); }}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 ml-auto">
                <X size={12} /> Limpar
              </button>
            )}
          </div>
        )}
      </div>

      {/* New risk form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#1A4731]/20 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-[#1A4731]/5">
            <span className="text-sm font-semibold text-slate-700">Novo Risco</span>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Projeto *</label>
              <Select value={form.os_id} onValueChange={v => setForm(f => ({ ...f, os_id: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.cliente_nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Descrição do risco *</label>
              <Input className="h-9 text-sm" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descreva o risco em uma frase clara" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Categoria</label>
              <Select value={form.categoria} onValueChange={v => setForm(f => ({ ...f, categoria: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Impacto</label>
              <Select value={form.impacto} onValueChange={v => setForm(f => ({ ...f, impacto: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{IMPACTOS.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Probabilidade</label>
              <Select value={form.probabilidade} onValueChange={v => setForm(f => ({ ...f, probabilidade: v }))}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{PROBS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Responsável</label>
              <Input className="h-9 text-sm" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} placeholder="Nome do responsável" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Prazo de resolução</label>
              <Input type="date" className="h-9 text-sm" value={form.prazo_resolucao} onChange={e => setForm(f => ({ ...f, prazo_resolucao: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 md:col-span-3">
              <label className="text-xs font-medium text-slate-600 mb-1.5 block">Plano de mitigação</label>
              <Input className="h-9 text-sm" value={form.plano_mitigacao} onChange={e => setForm(f => ({ ...f, plano_mitigacao: e.target.value }))} placeholder="Descreva as ações para mitigar o risco" />
            </div>
          </div>
          <div className="px-5 pb-4 flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#1A4731] hover:bg-[#245E40] text-xs">
              {saving ? "Salvando..." : "Salvar risco"}
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtrados.length === 0 ? (
        <EmptyState onNovo={() => setShowForm(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {["Projeto", "Risco", "Categoria", "Impacto", "Probabilidade", "Status", "Responsável", "Prazo", ""].map((h, i) => (
                  <th key={i} className={`text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${i > 3 ? "hidden lg:table-cell" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtrados.map(r => (
                <RiscoRow key={r.id}
                  r={r}
                  projetoNome={projetoNome}
                  onStatus={handleStatus}
                  onDelete={handleDelete}
                  expanded={expandedId === r.id}
                  onExpand={() => setExpandedId(expandedId === r.id ? null : r.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RiscoRow({ r, projetoNome, onStatus, onDelete, expanded, onExpand }) {
  const imp = IMPACTO_STYLE[r.impacto] || IMPACTO_STYLE["Médio"];
  const prob = PROB_STYLE[r.probabilidade] || PROB_STYLE["Média"];
  const st = STATUS_STYLE[r.status] || STATUS_STYLE["Aberto"];
  const isCritico = r.impacto === "Crítico";
  const prazoVencido = r.prazo_resolucao && new Date(r.prazo_resolucao) < new Date() && r.status !== "Resolvido";

  return (
    <>
      <tr className={`hover:bg-slate-50/60 transition-colors group cursor-pointer ${isCritico ? "border-l-4 border-l-red-400" : "border-l-4 border-l-transparent"}`}
          onClick={onExpand}>
        <td className="px-4 py-3.5">
          <span className="text-sm font-medium text-slate-700 truncate block max-w-[120px]">{projetoNome(r.os_id)}</span>
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-start gap-1.5">
            {isCritico && <AlertOctagon size={13} className="text-red-500 flex-shrink-0 mt-0.5" />}
            <span className="text-sm text-slate-800 line-clamp-2 max-w-[200px]">{r.descricao}</span>
          </div>
          {r.categoria && (
            <span className="text-[10px] text-slate-400 mt-0.5 block">{r.categoria}</span>
          )}
        </td>
        <td className="px-4 py-3.5">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${imp.bg} ${imp.text}`}>{r.categoria}</span>
        </td>
        <td className="px-4 py-3.5">
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${imp.bg} ${imp.text} ${imp.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${imp.dot}`} />{r.impacto}
          </span>
        </td>
        <td className="px-4 py-3.5 hidden lg:table-cell">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${prob.bg} ${prob.text}`}>{r.probabilidade}</span>
        </td>
        <td className="px-4 py-3.5 hidden lg:table-cell">
          <Select value={r.status} onValueChange={v => { onStatus(r, v); }} onClick={e => e.stopPropagation()}>
            <SelectTrigger className="border-0 p-0 h-auto w-auto shadow-none bg-transparent focus:ring-0">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${st.bg} ${st.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />{r.status}
              </span>
            </SelectTrigger>
            <SelectContent onClick={e => e.stopPropagation()}>
              {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </td>
        <td className="px-4 py-3.5 hidden lg:table-cell">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Users size={11} className="text-slate-400" />
            <span className="truncate max-w-[80px]">{r.responsavel || "—"}</span>
          </div>
        </td>
        <td className="px-4 py-3.5 hidden lg:table-cell">
          {r.prazo_resolucao ? (
            <div className={`flex items-center gap-1 text-xs ${prazoVencido ? "text-red-500 font-semibold" : "text-slate-500"}`}>
              <Calendar size={11} />
              {new Date(r.prazo_resolucao + "T00:00:00").toLocaleDateString("pt-BR")}
            </div>
          ) : <span className="text-slate-300 text-xs">—</span>}
        </td>
        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronDown size={13} className={`text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} onClick={onExpand} />
            <button onClick={() => onDelete(r.id)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
              <X size={12} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/80">
          <td colSpan={9} className="px-6 py-3 border-b border-slate-100">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700 block mb-1">Plano de mitigação:</span>
              {r.plano_mitigacao || <span className="text-slate-400 italic">Nenhum plano cadastrado</span>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function KPICard({ icon: Icon, color, label, value }) {
  const palette = {
    red:     { icon: "text-red-500",     bg: "bg-red-50",     border: "border-red-100"    },
    amber:   { icon: "text-amber-500",   bg: "bg-amber-50",   border: "border-amber-100"  },
    green:   { icon: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100"},
    crimson: { icon: "text-red-700",     bg: "bg-red-100",    border: "border-red-200"    },
  };
  const c = palette[color] || palette.red;
  return (
    <div className={`bg-white rounded-xl border ${c.border} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={17} className={c.icon} />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 leading-tight">{value}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNovo }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 px-8 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle size={22} className="text-slate-300" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">Nenhum risco identificado</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">Registre riscos para acompanhar o plano de mitigação e garantir a saúde do portfólio.</p>
      <Button size="sm" onClick={onNovo} className="bg-[#F47920] hover:bg-[#d96a18] text-white gap-1.5 text-xs">
        <Plus size={13} /> Registrar primeiro risco
      </Button>
    </div>
  );
}