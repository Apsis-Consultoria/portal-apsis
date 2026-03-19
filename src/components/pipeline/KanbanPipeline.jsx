import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { base44 } from "@/api/base44Client";
import {
  AlertTriangle, User, DollarSign, Calendar, Percent,
  Maximize2, Minimize2, Search, X
} from "lucide-react";
import { differenceInDays } from "date-fns";

const fmt = (v) =>
  v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "—";

// Mapeamento de status para coluna e vice-versa
const COLUMNS = [
  { id: "Lead",          label: "Lead",          color: "bg-slate-100",   header: "bg-slate-200",   text: "text-slate-700",   border: "border-slate-300"   },
  { id: "Qualificação",  label: "Qualificação",   color: "bg-violet-50",   header: "bg-violet-100",  text: "text-violet-700",  border: "border-violet-200"  },
  { id: "Em elaboração", label: "Proposta",       color: "bg-blue-50",     header: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200"    },
  { id: "Enviada",       label: "Negociação",     color: "bg-amber-50",    header: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200"   },
  { id: "Fechamento",    label: "Fechamento",     color: "bg-orange-50",   header: "bg-orange-100",  text: "text-orange-700",  border: "border-orange-200"  },
  { id: "Ganha",         label: "Ganho",          color: "bg-emerald-50",  header: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  { id: "Perdida",       label: "Perdido",        color: "bg-red-50",      header: "bg-red-100",     text: "text-red-700",     border: "border-red-200"     },
];

const PROB_COLOR = (p) => {
  if (!p) return "text-slate-400";
  if (p >= 70) return "text-emerald-600";
  if (p >= 40) return "text-amber-600";
  return "text-red-500";
};

function PropostaCard({ proposta, index }) {
  const diasSemFup = proposta.ultimo_followup
    ? differenceInDays(new Date(), new Date(proposta.ultimo_followup))
    : null;
  const atrasado = diasSemFup !== null && diasSemFup >= 14;
  const vencendo = proposta.data_envio
    ? differenceInDays(new Date(), new Date(proposta.data_envio)) > 30
    : false;

  return (
    <Draggable draggableId={proposta.id || proposta.numero_ap || String(index)} index={index} isDragDisabled={!!proposta._planilha}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            bg-white rounded-xl border border-slate-200 p-3 shadow-sm
            hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5
            transition-all duration-150 cursor-grab active:cursor-grabbing select-none
            ${snapshot.isDragging ? "shadow-lg rotate-1 scale-105 border-[#F47920] ring-1 ring-[#F47920]/30" : ""}
            ${proposta._planilha ? "opacity-75 cursor-not-allowed" : ""}
          `}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-1 mb-2">
            <p className="text-xs font-bold text-slate-800 leading-tight line-clamp-2 flex-1">
              {proposta.cliente_nome || "—"}
            </p>
            <div className="flex gap-1 flex-shrink-0">
              {atrasado && (
                <span title="Sem follow-up há mais de 14 dias"
                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                  <AlertTriangle size={8} /> FUP
                </span>
              )}
              {proposta._planilha && (
                <span className="text-[9px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">planilha</span>
              )}
            </div>
          </div>

          {/* Valor */}
          <div className="flex items-center gap-1 mb-1.5">
            <DollarSign size={10} className="text-[#F47920] flex-shrink-0" />
            <span className="text-sm font-bold text-slate-900">{fmt(proposta.valor_total)}</span>
          </div>

          {/* Natureza */}
          {proposta.natureza && (
            <p className="text-[10px] text-slate-400 mb-2 truncate">{proposta.natureza}</p>
          )}

          {/* Footer chips */}
          <div className="flex flex-wrap gap-1 mt-1">
            {proposta.responsavel && (
              <span className="inline-flex items-center gap-0.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                <User size={8} /> {proposta.responsavel}
              </span>
            )}
            {proposta.chance_conversao != null && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-50 ${PROB_COLOR(proposta.chance_conversao)}`}>
                <Percent size={8} /> {proposta.chance_conversao}%
              </span>
            )}
            {proposta.data_envio && (
              <span className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full ${vencendo ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                <Calendar size={8} /> {new Date(proposta.data_envio + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function KanbanPipeline({ propostas, onUpdate }) {
  const [busca, setBusca] = useState("");
  const [filtroResp, setFiltroResp] = useState("Todos");
  const [fullscreen, setFullscreen] = useState(false);

  // Responsáveis únicos
  const responsaveis = ["Todos", ...new Set(propostas.map(p => p.responsavel).filter(Boolean))];

  // Filtragem
  const filtered = propostas.filter(p => {
    const matchBusca = !busca || p.cliente_nome?.toLowerCase().includes(busca.toLowerCase());
    const matchResp = filtroResp === "Todos" || p.responsavel === filtroResp;
    return matchBusca && matchResp;
  });

  // Agrupa por coluna
  const getColItems = (colId) => filtered.filter(p => {
    const s = p.status || "Lead";
    return s === colId;
  });

  const handleDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination || destination.droppableId === source.droppableId) return;
    const newStatus = destination.droppableId;
    // Atualiza otimisticamente apenas propostas reais (não planilha)
    const proposta = propostas.find(p => (p.id || p.numero_ap) === draggableId);
    if (!proposta || proposta._planilha) return;
    onUpdate(draggableId, newStatus);
    await base44.entities.Proposta.update(proposta.id, { status: newStatus });
  };

  const totalValor = filtered.reduce((s, p) => s + (p.valor_total || 0), 0);

  return (
    <div className={`flex flex-col ${fullscreen ? "fixed inset-0 z-50 bg-[#F4F6F4] p-4" : ""}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-[#F47920]"
          />
          {busca && (
            <button onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          )}
        </div>

        <select
          value={filtroResp}
          onChange={e => setFiltroResp(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
        >
          {responsaveis.map(r => <option key={r}>{r}</option>)}
        </select>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <DollarSign size={12} className="text-[#F47920]" />
          <span className="text-xs font-bold text-slate-700">{fmt(totalValor)}</span>
          <span className="text-xs text-slate-400">pipeline</span>
        </div>

        <button
          onClick={() => setFullscreen(f => !f)}
          className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors"
          title={fullscreen ? "Sair de tela cheia" : "Tela cheia"}
        >
          {fullscreen ? <Minimize2 size={14} className="text-slate-600" /> : <Maximize2 size={14} className="text-slate-600" />}
        </button>
      </div>

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={`flex gap-3 overflow-x-auto pb-4 ${fullscreen ? "flex-1" : "min-h-[520px]"}`}
          style={{ scrollSnapType: "x mandatory" }}>
          {COLUMNS.map(col => {
            const items = getColItems(col.id);
            const colTotal = items.reduce((s, p) => s + (p.valor_total || 0), 0);
            return (
              <div key={col.id} className="flex-shrink-0 w-60 flex flex-col" style={{ scrollSnapAlign: "start" }}>
                {/* Column header */}
                <div className={`${col.header} rounded-xl px-3 py-2.5 mb-2 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${col.text}`}>{col.label}</span>
                    <span className={`text-[10px] font-semibold ${col.text} bg-white/60 px-1.5 py-0.5 rounded-full`}>
                      {items.length}
                    </span>
                  </div>
                  {colTotal > 0 && (
                    <span className={`text-[10px] font-bold ${col.text}`}>
                      {fmt(colTotal)}
                    </span>
                  )}
                </div>

                {/* Droppable */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`
                        flex-1 rounded-xl p-2 space-y-2 min-h-[100px] transition-colors border-2
                        ${snapshot.isDraggingOver
                          ? `${col.color} ${col.border} border-dashed`
                          : "border-transparent bg-slate-100/50"}
                      `}
                    >
                      {items.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex flex-col items-center justify-center py-8 gap-1 opacity-40">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                            <span className="text-slate-400 text-sm">—</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Sem itens</p>
                        </div>
                      )}
                      {items.map((p, i) => (
                        <PropostaCard key={p.id || p.numero_ap || i} proposta={p} index={i} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}