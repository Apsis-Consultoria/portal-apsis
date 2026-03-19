import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search, LayoutList, LayoutGrid, AlertTriangle, ChevronRight,
  Calendar, Users, DollarSign, FileText, Filter, ArrowUpDown,
  Plus, ExternalLink, X, SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NovoProjetoModal from "@/components/projetos/NovoProjetoModal";

const fmt = (v) => v >= 1000000 ? `R$ ${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `R$ ${(v / 1000).toFixed(0)}K` : `R$ ${(v || 0).toFixed(0)}`;

const STATUS_STYLE = {
  "Ativo":        { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Em Execução" },
  "Pausado":      { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400",   label: "Pausado" },
  "Cancelado":    { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400",     label: "Cancelado" },
  "Não iniciado": { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400",   label: "Iniciação" },
};

const RISK_STYLE = {
  "Crítico": "bg-red-100 text-red-600",
  "Alto":    "bg-orange-100 text-orange-600",
  "Médio":   "bg-yellow-100 text-yellow-600",
  "Baixo":   "bg-slate-100 text-slate-500",
};

const SORT_OPTIONS = [
  { value: "cliente",   label: "Cliente A→Z" },
  { value: "prazo",     label: "Prazo" },
  { value: "progresso", label: "Progresso ↓" },
  { value: "valor",     label: "Valor ↓" },
  { value: "recente",   label: "Recente" },
];

const PAGE_SIZE = 20;

export default function ProjetosLista({ data, onRefresh }) {
  const { projetos = [], parcelas = [], riscos = [] } = data;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [respFilter, setRespFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [sort, setSort] = useState("recente");
  const [view, setView] = useState("lista"); // "lista" | "cards"
  const [page, setPage] = useState(1);
  const [showNovo, setShowNovo] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // derived lists for filter dropdowns
  const responsaveis = useMemo(() => {
    const set = new Set(projetos.map(p => p.responsavel_tecnico).filter(Boolean));
    return Array.from(set).sort();
  }, [projetos]);

  const tipos = useMemo(() => {
    const set = new Set(projetos.map(p => p.natureza).filter(Boolean));
    return Array.from(set).sort();
  }, [projetos]);

  const getValor = (osId) => parcelas.filter(p => p.os_id === osId).reduce((s, p) => s + (p.valor || 0), 0);
  const getRisco = (osId) => {
    const riscosProjeto = riscos.filter(r => r.os_id === osId && r.status === "Aberto");
    if (riscosProjeto.some(r => r.impacto === "Crítico")) return "Crítico";
    if (riscosProjeto.some(r => r.impacto === "Alto")) return "Alto";
    if (riscosProjeto.length > 0) return "Médio";
    return null;
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return projetos
      .filter(p => {
        if (q && ![p.cliente_nome, p.natureza, p.responsavel_tecnico, p.proposta_numero].some(v => v?.toLowerCase().includes(q))) return false;
        if (statusFilter !== "todos" && p.status !== statusFilter) return false;
        if (respFilter !== "todos" && p.responsavel_tecnico !== respFilter) return false;
        if (tipoFilter !== "todos" && p.natureza !== tipoFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (sort === "cliente")   return (a.cliente_nome || "").localeCompare(b.cliente_nome || "");
        if (sort === "prazo")     return (a.prazo_previsto || "9999").localeCompare(b.prazo_previsto || "9999");
        if (sort === "progresso") return (b.percentual_conclusao || 0) - (a.percentual_conclusao || 0);
        if (sort === "valor")     return getValor(b.id) - getValor(a.id);
        return new Date(b.updated_date || 0) - new Date(a.updated_date || 0);
      });
  }, [projetos, search, statusFilter, respFilter, tipoFilter, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilters = [statusFilter, respFilter, tipoFilter].filter(f => f !== "todos").length;

  const clearFilters = () => { setStatusFilter("todos"); setRespFilter("todos"); setTipoFilter("todos"); setPage(1); };

  const handleSearch = (v) => { setSearch(v); setPage(1); };

  return (
    <div className="p-6 space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Lista de Projetos</h2>
          <p className="text-sm text-slate-400 mt-0.5">Localize, filtre e acesse qualquer projeto do portfólio</p>
        </div>
        <Button size="sm" className="bg-[#F47920] hover:bg-[#d96a18] text-white gap-1.5 text-xs"
          onClick={() => setShowNovo(true)}>
          <Plus size={13} /> Novo Projeto
        </Button>
      </div>

      {/* Search + controls */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Buscar por cliente, responsável, natureza ou código..."
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20 focus:border-[#1A4731]/40 bg-slate-50 placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${showFilters || activeFilters > 0 ? "bg-[#1A4731] text-white border-[#1A4731]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
          >
            <SlidersHorizontal size={13} />
            Filtros {activeFilters > 0 && <span className="bg-[#F47920] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{activeFilters}</span>}
          </button>
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setView("lista")} className={`p-2 transition-colors ${view === "lista" ? "bg-[#1A4731] text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
              <LayoutList size={14} />
            </button>
            <button onClick={() => setView("cards")} className={`p-2 transition-colors ${view === "cards" ? "bg-[#1A4731] text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
              <LayoutGrid size={14} />
            </button>
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#1A4731]/20 bg-white">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <div className="flex gap-1 flex-wrap">
                {["todos", "Ativo", "Não iniciado", "Pausado", "Cancelado"].map(s => (
                  <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${statusFilter === s ? "bg-[#1A4731] text-white border-[#1A4731]" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"}`}>
                    {s === "todos" ? "Todos" : STATUS_STYLE[s]?.label || s}
                  </button>
                ))}
              </div>
            </div>
            {responsaveis.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Responsável:</span>
                <select value={respFilter} onChange={e => { setRespFilter(e.target.value); setPage(1); }}
                  className="px-2 py-1 text-xs border border-slate-200 rounded-md text-slate-600 focus:outline-none bg-white">
                  <option value="todos">Todos</option>
                  {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            )}
            {tipos.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Tipo de serviço:</span>
                <select value={tipoFilter} onChange={e => { setTipoFilter(e.target.value); setPage(1); }}
                  className="px-2 py-1 text-xs border border-slate-200 rounded-md text-slate-600 focus:outline-none bg-white">
                  <option value="todos">Todos</option>
                  {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
            {activeFilters > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 ml-auto">
                <X size={12} /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {filtered.length === projetos.length
            ? `${projetos.length} projeto${projetos.length !== 1 ? "s" : ""} no portfólio`
            : `${filtered.length} de ${projetos.length} projeto${projetos.length !== 1 ? "s" : ""}`}
        </span>
        {totalPages > 1 && (
          <span>Página {page} de {totalPages}</span>
        )}
      </div>

      {/* Content */}
      {view === "lista" ? (
        <ListView projetos={paginated} getValor={getValor} getRisco={getRisco} />
      ) : (
        <CardsView projetos={paginated} getValor={getValor} getRisco={getRisco} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">
            Anterior
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const n = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
            return (
              <button key={n} onClick={() => setPage(n)}
                className={`w-8 h-8 text-xs rounded-lg border transition-colors ${page === n ? "bg-[#1A4731] text-white border-[#1A4731]" : "border-slate-200 hover:bg-slate-50"}`}>
                {n}
              </button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">
            Próxima
          </button>
        </div>
      )}

      {showNovo && (
        <NovoProjetoModal onClose={() => setShowNovo(false)} onSaved={() => { setShowNovo(false); onRefresh(); }} />
      )}
    </div>
  );
}

// ── List View
function ListView({ projetos, getValor, getRisco }) {
  if (projetos.length === 0) return <EmptyState />;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            {["Projeto / Cliente", "Responsável", "Status", "Progresso", "Prazo", "Risco", "Valor", ""].map((h, i) => (
              <th key={i} className={`text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${i > 2 ? "hidden md:table-cell" : ""}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {projetos.map(p => <ListRow key={p.id} p={p} getValor={getValor} getRisco={getRisco} />)}
        </tbody>
      </table>
    </div>
  );
}

function ListRow({ p, getValor, getRisco }) {
  const s = STATUS_STYLE[p.status] || STATUS_STYLE["Não iniciado"];
  const valor = getValor(p.id);
  const risco = getRisco(p.id);
  const atrasado = p.prazo_previsto && new Date(p.prazo_previsto) < new Date() && (p.percentual_conclusao || 0) < 100;
  const diasRestantes = p.prazo_previsto ? Math.ceil((new Date(p.prazo_previsto) - new Date()) / 86400000) : null;

  return (
    <tr className="hover:bg-slate-50/70 transition-colors group">
      <td className="px-4 py-3.5">
        <Link to={`/ProjetoDetalhe?id=${p.id}`} className="block">
          <div className="text-sm font-semibold text-slate-800 group-hover:text-[#1A4731] transition-colors truncate max-w-[200px]">
            {p.cliente_nome || "—"}
          </div>
          {p.natureza && <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{p.natureza}</div>}
        </Link>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-[#1A4731]/10 flex items-center justify-center flex-shrink-0">
            <Users size={10} className="text-[#1A4731]" />
          </div>
          <span className="text-xs text-slate-600 truncate max-w-[100px]">{p.responsavel_tecnico || "—"}</span>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${atrasado ? "bg-red-400" : "bg-[#1A4731]"}`} style={{ width: `${p.percentual_conclusao || 0}%` }} />
          </div>
          <span className={`text-xs font-medium ${atrasado ? "text-red-500" : "text-slate-500"}`}>{p.percentual_conclusao || 0}%</span>
        </div>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        {diasRestantes !== null ? (
          <div className={`flex items-center gap-1 text-xs ${atrasado ? "text-red-500 font-semibold" : diasRestantes <= 7 ? "text-amber-500 font-medium" : "text-slate-500"}`}>
            <Calendar size={11} />
            {atrasado ? `${Math.abs(diasRestantes)}d atraso` : diasRestantes === 0 ? "Hoje" : `${diasRestantes}d`}
          </div>
        ) : <span className="text-slate-300 text-xs">—</span>}
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        {risco ? (
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${RISK_STYLE[risco]}`}>
            {risco}
          </span>
        ) : <span className="text-slate-200 text-xs">—</span>}
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <span className="text-xs font-medium text-slate-700">{valor > 0 ? fmt(valor) : <span className="text-slate-300">—</span>}</span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link to={`/ProjetoDetalhe?id=${p.id}`} title="Abrir projeto"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#1A4731]/10 text-slate-400 hover:text-[#1A4731] transition-colors">
            <ExternalLink size={13} />
          </Link>
          <Link to={`/ProjetoDetalhe?id=${p.id}&tab=documentos`} title="Ver documentos"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors">
            <FileText size={13} />
          </Link>
          <Link to={`/ProjetoDetalhe?id=${p.id}&tab=riscos`} title="Ver riscos"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
            <AlertTriangle size={13} />
          </Link>
        </div>
      </td>
    </tr>
  );
}

// ── Cards View
function CardsView({ projetos, getValor, getRisco }) {
  if (projetos.length === 0) return <EmptyState />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {projetos.map(p => <ProjectCard key={p.id} p={p} getValor={getValor} getRisco={getRisco} />)}
    </div>
  );
}

function ProjectCard({ p, getValor, getRisco }) {
  const s = STATUS_STYLE[p.status] || STATUS_STYLE["Não iniciado"];
  const valor = getValor(p.id);
  const risco = getRisco(p.id);
  const atrasado = p.prazo_previsto && new Date(p.prazo_previsto) < new Date() && (p.percentual_conclusao || 0) < 100;
  const diasRestantes = p.prazo_previsto ? Math.ceil((new Date(p.prazo_previsto) - new Date()) / 86400000) : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group overflow-hidden">
      {/* Color accent */}
      <div className={`h-1 w-full ${p.status === "Ativo" ? "bg-emerald-400" : p.status === "Pausado" ? "bg-amber-400" : p.status === "Cancelado" ? "bg-red-400" : "bg-slate-200"}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <Link to={`/ProjetoDetalhe?id=${p.id}`}>
              <h3 className="font-semibold text-sm text-slate-800 group-hover:text-[#1A4731] transition-colors truncate">{p.cliente_nome || "—"}</h3>
            </Link>
            {p.natureza && <p className="text-xs text-slate-400 mt-0.5 truncate">{p.natureza}</p>}
          </div>
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} /> {s.label}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={11} className="text-slate-400" />
            <span className="truncate">{p.responsavel_tecnico || "—"}</span>
          </div>
          {diasRestantes !== null && (
            <div className={`flex items-center gap-1.5 text-xs ${atrasado ? "text-red-500 font-semibold" : diasRestantes <= 7 ? "text-amber-500 font-medium" : "text-slate-500"}`}>
              <Calendar size={11} />
              {atrasado ? `Atrasado ${Math.abs(diasRestantes)}d` : `${diasRestantes}d restantes`}
            </div>
          )}
          {valor > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <DollarSign size={11} className="text-slate-400" />
              <span>{fmt(valor)}</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>Progresso</span>
            <span className={`font-medium ${atrasado ? "text-red-500" : "text-slate-600"}`}>{p.percentual_conclusao || 0}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${atrasado ? "bg-red-400" : "bg-[#1A4731]"}`} style={{ width: `${p.percentual_conclusao || 0}%` }} />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          {risco ? (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${RISK_STYLE[risco]}`}>⚠ Risco {risco}</span>
          ) : <span />}
          <div className="flex items-center gap-1">
            <Link to={`/ProjetoDetalhe?id=${p.id}&tab=documentos`} title="Documentos"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-300 hover:text-blue-500 transition-colors">
              <FileText size={13} />
            </Link>
            <Link to={`/ProjetoDetalhe?id=${p.id}`}
              className="flex items-center gap-1 text-xs font-medium text-[#F47920] hover:text-[#d96a18] transition-colors">
              Abrir <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
      <Search size={28} className="text-slate-200 mx-auto mb-3" />
      <p className="text-sm text-slate-400 font-medium">Nenhum projeto encontrado</p>
      <p className="text-xs text-slate-300 mt-1">Tente ajustar os filtros ou termo de busca</p>
    </div>
  );
}