import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import {
  Maximize2, Minimize2, LayoutList, Columns2, Filter,
  Calendar, Users, AlertTriangle, X, ChevronDown, Plus
} from "lucide-react";
import NovoProjetoModal from "@/components/projetos/NovoProjetoModal";

const COLUMNS = [
  { id: "Não iniciado", label: "Iniciação",  color: "#94A3B8", bg: "bg-slate-100",  border: "border-slate-300",  text: "text-slate-600",  dot: "bg-slate-400" },
  { id: "Ativo",        label: "Execução",   color: "#22C55E", bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", dot: "bg-emerald-500" },
  { id: "Revisão",      label: "Aprovação",  color: "#6366F1", bg: "bg-indigo-50",  border: "border-indigo-300",  text: "text-indigo-700",  dot: "bg-indigo-500" },
  { id: "Concluído",    label: "Concluído",  color: "#0EA5E9", bg: "bg-sky-50",     border: "border-sky-300",     text: "text-sky-700",     dot: "bg-sky-500" },
  { id: "Pausado",      label: "Pausado",    color: "#F59E0B", bg: "bg-amber-50",   border: "border-amber-300",   text: "text-amber-700",   dot: "bg-amber-500" },
  { id: "Cancelado",    label: "Cancelado",  color: "#EF4444", bg: "bg-red-50",     border: "border-red-300",     text: "text-red-600",     dot: "bg-red-400" },
];

const RISK_COLORS = {
  "Crítico": { bg: "bg-red-100",    text: "text-red-600"    },
  "Alto":    { bg: "bg-orange-100", text: "text-orange-600" },
  "Médio":   { bg: "bg-yellow-100", text: "text-yellow-700" },
};

const fmt = (n) => {
  if (n === null) return null;
  if (n < 0) return `${Math.abs(n)}d atraso`;
  if (n === 0) return "Hoje";
  return `${n}d restantes`;
};

const getDias = (prazo, pct) => {
  if (!prazo) return null;
  const diff = Math.ceil((new Date(prazo + "T00:00:00") - new Date()) / 86400000);
  if (pct >= 100) return null;
  return diff;
};

const NATUREZA_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-cyan-100 text-cyan-700",
  "bg-pink-100 text-pink-700",
];

export default function ProjetosKanban({ data, onRefresh }) {
  const { projetos = [], riscos = [] } = data;

  const [fullscreen, setFullscreen] = useState(false);
  const [view, setView] = useState("kanban");
  const [showFilters, setShowFilters] = useState(false);
  const [respFilter, setRespFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [showNovo, setShowNovo] = useState(false);
  const [cards, setCards] = useState({});

  // build natureza color map
  const naturezaColorMap = useMemo(() => {
    const tipos = [...new Set(projetos.map(p => p.natureza).filter(Boolean))];
    return Object.fromEntries(tipos.map((t, i) => [t, NATUREZA_COLORS[i % NATUREZA_COLORS.length]]));
  }, [projetos]);

  const responsaveis = useMemo(() => [...new Set(projetos.map(p => p.responsavel_tecnico).filter(Boolean))].sort(), [projetos]);
  const tipos = useMemo(() => [...new Set(projetos.map(p => p.natureza).filter(Boolean))].sort(), [projetos]);

  const getRisco = (osId) => {
    const r = riscos.filter(r => r.os_id === osId && r.status === "Aberto");
    if (r.some(x => x.impacto === "Crítico")) return "Crítico";
    if (r.some(x => x.impacto === "Alto")) return "Alto";
    if (r.length > 0) return "Médio";
    return null;
  };

  const filtered = useMemo(() => projetos.filter(p => {
    if (respFilter !== "todos" && p.responsavel_tecnico !== respFilter) return false;
    if (tipoFilter !== "todos" && p.natureza !== tipoFilter) return false;
    return true;
  }), [projetos, respFilter, tipoFilter]);

  // init cards grouped by column status
  useEffect(() => {
    const grouped = {};
    COLUMNS.forEach(c => { grouped[c.id] = []; });
    filtered.forEach(p => {
      const colId = COLUMNS.find(c => c.id === p.status)?.id || "Não iniciado";
      grouped[colId].push(p);
    });
    setCards(grouped);
  }, [filtered]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const srcCol = [...(cards[source.droppableId] || [])];
    const dstCol = source.droppableId === destination.droppableId ? srcCol : [...(cards[destination.droppableId] || [])];
    const [moved] = srcCol.splice(source.index, 1);
    dstCol.splice(destination.index, 0, moved);

    const newCards = {
      ...cards,
      [source.droppableId]: srcCol,
      [destination.droppableId]: dstCol,
    };
    setCards(newCards);

    if (source.droppableId !== destination.droppableId) {
      await base44.entities.OrdemServico.update(draggableId, { status: destination.droppableId });
      onRefresh();
    }
  };

  const activeFilters = [respFilter, tipoFilter].filter(f => f !== "todos").length;

  return (
    <div className={`${fullscreen ? "fixed inset-0 z-50 bg-[#F4F6F4]" : ""} flex flex-col`}
         style={fullscreen ? { padding: "20px" } : {}}>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kanban de Projetos</h2>
          <p className="text-sm text-slate-400 mt-0.5">Gerencie o fluxo de projetos por arrastar e soltar</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filters toggle */}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${showFilters || activeFilters > 0 ? "bg-[#1A4731] text-white border-[#1A4731]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
            <Filter size={12} />
            Filtros {activeFilters > 0 && <span className="bg-[#F47920] text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">{activeFilters}</span>}
          </button>

          {/* View toggle */}
          <div className="flex border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setView("kanban")} className={`px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${view === "kanban" ? "bg-[#1A4731] text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              <Columns2 size={13} /> Kanban
            </button>
            <button onClick={() => setView("lista")} className={`px-3 py-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${view === "lista" ? "bg-[#1A4731] text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
              <LayoutList size={13} /> Lista
            </button>
          </div>

          {/* Fullscreen */}
          <button onClick={() => setFullscreen(!fullscreen)}
            className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

        </div>
      </div>

      {/* Filters row */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-4 flex flex-wrap gap-3 items-center shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={13} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Responsável:</span>
            <select value={respFilter} onChange={e => setRespFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none">
              <option value="todos">Todos</option>
              {responsaveis.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">Tipo:</span>
            <select value={tipoFilter} onChange={e => setTipoFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none">
              <option value="todos">Todos</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {activeFilters > 0 && (
            <button onClick={() => { setRespFilter("todos"); setTipoFilter("todos"); }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 ml-auto">
              <X size={12} /> Limpar
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {view === "kanban" ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 260px)" }}>
            {COLUMNS.map(col => (
              <KanbanColumn key={col.id} col={col} cards={cards[col.id] || []}
                getRisco={getRisco} naturezaColorMap={naturezaColorMap} />
            ))}
          </div>
        </DragDropContext>
      ) : (
        <KanbanList cards={cards} getRisco={getRisco} naturezaColorMap={naturezaColorMap} />
      )}

      {showNovo && (
        <NovoProjetoModal onClose={() => setShowNovo(false)} onSaved={() => { setShowNovo(false); onRefresh(); }} />
      )}
    </div>
  );
}

function KanbanColumn({ col, cards, getRisco, naturezaColorMap }) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-t-xl border-x border-t ${col.border} bg-white`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
          <span className={`text-sm font-semibold ${col.text}`}>{col.label}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.bg} ${col.text}`}>{cards.length}</span>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={col.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 flex flex-col gap-2.5 p-2 rounded-b-xl border-x border-b min-h-[120px] transition-colors ${col.border} ${snapshot.isDraggingOver ? col.bg : "bg-slate-50/60"}`}
          >
            {cards.map((p, index) => (
              <Draggable key={p.id} draggableId={p.id} index={index}>
                {(drag, dragSnap) => (
                  <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}>
                    <ProjectCard p={p} getRisco={getRisco} naturezaColorMap={naturezaColorMap} isDragging={dragSnap.isDragging} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {cards.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 flex items-center justify-center py-8 text-center">
                <div>
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-300">Sem projetos</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

function ProjectCard({ p, getRisco, naturezaColorMap, isDragging }) {
  const risco = getRisco(p.id);
  const dias = getDias(p.prazo_previsto, p.percentual_conclusao || 0);
  const atrasado = dias !== null && dias < 0;
  const urgente = dias !== null && dias >= 0 && dias <= 3;
  const nomeNatureza = p.natureza ? (p.natureza.split(" - ")[1] || p.natureza) : null;
  const natColorClass = naturezaColorMap[p.natureza] || "bg-slate-100 text-slate-500";

  return (
    <div className={`bg-white rounded-xl border transition-all cursor-grab active:cursor-grabbing
      ${isDragging ? "shadow-2xl rotate-1 scale-105 border-[#1A4731]/30" : "border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"}
      ${atrasado ? "border-l-4 border-l-red-400" : urgente ? "border-l-4 border-l-amber-400" : "border-l-4 border-l-transparent"}
    `}>
      <div className="p-3">
        {/* Top badges */}
        <div className="flex items-start justify-between gap-1 mb-2">
          {nomeNatureza && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md truncate max-w-[130px] ${natColorClass}`}>
              {nomeNatureza}
            </span>
          )}
          {risco && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 ${RISK_COLORS[risco]?.bg} ${RISK_COLORS[risco]?.text}`}>
              ⚠ {risco}
            </span>
          )}
        </div>

        {/* Client name */}
        <Link to={`/ProjetoDetalhe?id=${p.id}`} onClick={e => e.stopPropagation()}>
          <h4 className="text-sm font-semibold text-slate-800 hover:text-[#1A4731] leading-snug mb-1 line-clamp-2">
            {p.cliente_nome || "—"}
          </h4>
        </Link>

        {/* Responsável */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="w-5 h-5 rounded-full bg-[#1A4731]/10 flex items-center justify-center flex-shrink-0">
            <Users size={9} className="text-[#1A4731]" />
          </div>
          <span className="text-xs text-slate-500 truncate">{p.responsavel_tecnico || "—"}</span>
        </div>

        {/* Progress */}
        <div className="mb-2.5">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
            <span>Progresso</span>
            <span className={`font-semibold ${atrasado ? "text-red-500" : "text-slate-600"}`}>{p.percentual_conclusao || 0}%</span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${atrasado ? "bg-red-400" : p.percentual_conclusao >= 75 ? "bg-emerald-500" : "bg-[#1A4731]"}`}
              style={{ width: `${p.percentual_conclusao || 0}%` }} />
          </div>
        </div>

        {/* Prazo */}
        {dias !== null && (
          <div className={`flex items-center gap-1 text-[11px] font-medium ${atrasado ? "text-red-500" : urgente ? "text-amber-500" : "text-slate-400"}`}>
            <Calendar size={10} />
            <span>{fmt(dias)}</span>
            {p.prazo_previsto && (
              <span className="ml-auto text-slate-300 font-normal">
                {new Date(p.prazo_previsto + "T00:00:00").toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanList({ cards, getRisco, naturezaColorMap }) {
  return (
    <div className="space-y-4">
      {COLUMNS.map(col => {
        const colCards = cards[col.id] || [];
        if (colCards.length === 0) return null;
        return (
          <div key={col.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className={`px-4 py-2.5 border-b ${col.border} ${col.bg} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                <span className={`text-sm font-semibold ${col.text}`}>{col.label}</span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 ${col.text}`}>{colCards.length}</span>
            </div>
            <table className="w-full">
              <tbody className="divide-y divide-slate-50">
                {colCards.map(p => {
                  const risco = getRisco(p.id);
                  const dias = getDias(p.prazo_previsto, p.percentual_conclusao || 0);
                  const atrasado = dias !== null && dias < 0;
                  const nomeNatureza = p.natureza ? (p.natureza.split(" - ")[1] || p.natureza) : null;
                  const natClass = naturezaColorMap[p.natureza] || "bg-slate-100 text-slate-500";
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-4 py-3">
                        <Link to={`/ProjetoDetalhe?id=${p.id}`} className="font-semibold text-sm text-slate-800 group-hover:text-[#1A4731]">
                          {p.cliente_nome || "—"}
                        </Link>
                        {nomeNatureza && <div className={`mt-0.5 inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${natClass}`}>{nomeNatureza}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{p.responsavel_tecnico || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${atrasado ? "bg-red-400" : "bg-[#1A4731]"}`} style={{ width: `${p.percentual_conclusao || 0}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${atrasado ? "text-red-500" : "text-slate-500"}`}>{p.percentual_conclusao || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {dias !== null && (
                          <span className={`text-xs font-medium ${atrasado ? "text-red-500" : dias <= 3 ? "text-amber-500" : "text-slate-400"}`}>
                            {fmt(dias)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {risco && (
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${RISK_COLORS[risco]?.bg} ${RISK_COLORS[risco]?.text}`}>
                            ⚠ {risco}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}