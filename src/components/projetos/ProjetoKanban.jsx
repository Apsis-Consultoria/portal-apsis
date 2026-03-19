import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Clock, User, GripVertical, AlertTriangle, Maximize2, Minimize2, Columns2 } from "lucide-react";
import PageHeader from "./shared/PageHeader";

const COLUNAS = [
  { id: "A fazer",      label: "A fazer",      color: "border-t-slate-300",   bg: "bg-slate-50",    count: "bg-slate-200 text-slate-600"   },
  { id: "Em andamento", label: "Em andamento",  color: "border-t-blue-500",   bg: "bg-blue-50/40",  count: "bg-blue-100 text-blue-700"     },
  { id: "Em revisão",   label: "Em revisão",    color: "border-t-amber-400",  bg: "bg-amber-50/40", count: "bg-amber-100 text-amber-700"   },
  { id: "Concluída",    label: "Concluída",     color: "border-t-emerald-500",bg: "bg-emerald-50/30",count: "bg-emerald-100 text-emerald-700"},
  { id: "Bloqueada",    label: "Bloqueada",     color: "border-t-red-500",    bg: "bg-red-50/30",   count: "bg-red-100 text-red-600"       },
];

const PRIO = {
  "Baixa":   { badge: "bg-slate-100 text-slate-500",   dot: "bg-slate-400"  },
  "Média":   { badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500"   },
  "Alta":    { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  "Crítica": { badge: "bg-red-100 text-red-700",       dot: "bg-red-500"    },
};

const EMPTY_FORM = { titulo: "", responsavel: "", prioridade: "Média", horas_estimadas: "", data_fim: "" };

export default function ProjetoKanban({ osId, projeto }) {
  const [tarefas,  setTarefas]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [addingIn, setAddingIn] = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [dragging, setDragging] = useState(null);
  const [over,     setOver]     = useState(null);

  useEffect(() => {
    base44.entities.Tarefa.filter({ os_id: osId }).then(t => { setTarefas(t); setLoading(false); });
  }, [osId]);

  const mover = async (tarefa, novoStatus) => {
    if (tarefa.status === novoStatus) return;
    setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: novoStatus } : t));
    await base44.entities.Tarefa.update(tarefa.id, { status: novoStatus });
  };

  const adicionar = async (status) => {
    if (!form.titulo.trim()) return;
    const nova = await base44.entities.Tarefa.create({
      os_id: osId,
      titulo: form.titulo,
      responsavel: form.responsavel || projeto?.responsavel_tecnico || "",
      prioridade: form.prioridade,
      horas_estimadas: Number(form.horas_estimadas) || 0,
      data_fim: form.data_fim,
      status,
    });
    setTarefas(prev => [...prev, nova]);
    setAddingIn(null);
    setForm(EMPTY_FORM);
  };

  const excluir = async (id) => {
    await base44.entities.Tarefa.delete(id);
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
    </div>
  );

  const [fullscreen, setFullscreen] = useState(false);

  const total = tarefas.length;
  const concluidas = tarefas.filter(t => t.status === "Concluída").length;
  const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  return (
    <div className={`space-y-5 transition-all ${fullscreen ? "fixed inset-0 z-50 bg-[#F4F6F4] p-6 overflow-auto" : "p-6"}`}>

      <PageHeader
        title="Kanban"
        subtitle={`${concluidas}/${total} tarefas concluídas · ${pct}% completo`}
        icon={Columns2}
        actions={(
          <>
            <div className="h-2 w-32 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
              <div className="h-full bg-[#1A4731] rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <Button size="sm"
              variant="outline"
              onClick={() => setFullscreen(f => !f)}
              className="gap-1.5 text-xs border-slate-300 hover:border-slate-400 hover:bg-white transition-all">
              {fullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
              {fullscreen ? "Sair" : "Tela cheia"}
            </Button>
            <Button size="sm" onClick={() => setAddingIn("A fazer")}
              className="bg-[#F47920] hover:bg-[#d96a18] active:bg-[#bf5e14] text-white gap-1.5 text-xs shadow-sm hover:shadow-md transition-all">
              <Plus size={13} /> Nova Tarefa
            </Button>
          </>
        )}
      />

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUNAS.map(col => {
          const cards = tarefas.filter(t => t.status === col.id);
          const isOver = over === col.id;

          return (
            <div key={col.id}
              className={`flex-shrink-0 w-[272px] rounded-xl border border-slate-200 border-t-4 ${col.color} flex flex-col shadow-sm transition-all ${isOver ? "ring-2 ring-[#1A4731]/30 shadow-md" : ""}`}
              onDragOver={e => { e.preventDefault(); setOver(col.id); }}
              onDragLeave={() => setOver(null)}
              onDrop={() => { dragging && mover(dragging, col.id); setOver(null); }}>

              {/* Column header */}
              <div className={`px-3 py-2.5 flex items-center justify-between ${col.bg} rounded-t-lg`}>
                <span className="font-semibold text-sm text-slate-700">{col.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${col.count}`}>{cards.length}</span>
                  <button onClick={() => setAddingIn(addingIn === col.id ? null : col.id)}
                    className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-[#1A4731] hover:bg-white/70 transition-colors">
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 min-h-[120px] max-h-[60vh] overflow-y-auto">
                {cards.map(t => {
                  const p = PRIO[t.prioridade] || PRIO["Média"];
                  const vencido = t.data_fim && new Date(t.data_fim + "T00:00:00") < new Date() && t.status !== "Concluída";
                  return (
                    <div key={t.id}
                      draggable
                      onDragStart={() => setDragging(t)}
                      onDragEnd={() => { setDragging(null); setOver(null); }}
                      className={`bg-white rounded-lg p-3 border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all group ${
                        dragging?.id === t.id ? "opacity-40" : ""
                      } ${vencido ? "border-red-200" : "border-slate-100"}`}>

                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          <GripVertical size={11} className="text-slate-300 mt-0.5 flex-shrink-0 group-hover:text-slate-400" />
                          <p className="text-xs font-semibold text-slate-800 leading-snug">{t.titulo}</p>
                        </div>
                        <button onClick={() => excluir(t.id)}
                          className="w-4 h-4 flex items-center justify-center rounded text-slate-200 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100">
                          <X size={10} />
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.badge}`}>
                          <span className={`w-1 h-1 rounded-full ${p.dot}`} />{t.prioridade}
                        </span>
                        {t.horas_estimadas > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                            <Clock size={9} /> {t.horas_estimadas}h
                          </span>
                        )}
                        {vencido && (
                          <span className="flex items-center gap-0.5 text-[10px] text-red-500 font-medium">
                            <AlertTriangle size={9} /> Atrasada
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {t.responsavel && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-500 truncate">
                            <User size={9} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate max-w-[100px]">{t.responsavel}</span>
                          </span>
                        )}
                        {t.data_fim && (
                          <span className={`text-[10px] font-medium ml-auto ${vencido ? "text-red-500" : "text-slate-400"}`}>
                            {new Date(t.data_fim + "T00:00:00").toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Inline add form */}
                {addingIn === col.id && (
                  <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200 space-y-2">
                    <Input placeholder="Título da tarefa *" value={form.titulo} autoFocus
                      onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                      className="h-8 text-xs bg-white"
                      onKeyDown={e => e.key === "Enter" && adicionar(col.id)} />
                    <Input placeholder="Responsável" value={form.responsavel}
                      onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))}
                      className="h-8 text-xs bg-white" />
                    <div className="flex gap-1.5">
                      <Select value={form.prioridade} onValueChange={v => setForm(f => ({ ...f, prioridade: v }))}>
                        <SelectTrigger className="h-8 text-xs flex-1 bg-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Baixa", "Média", "Alta", "Crítica"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input type="number" placeholder="h" value={form.horas_estimadas}
                        onChange={e => setForm(f => ({ ...f, horas_estimadas: e.target.value }))}
                        className="h-8 text-xs w-14 bg-white" />
                    </div>
                    <Input type="date" value={form.data_fim}
                      onChange={e => setForm(f => ({ ...f, data_fim: e.target.value }))}
                      className="h-8 text-xs bg-white" />
                    <div className="flex gap-1.5">
                      <Button size="sm" className="flex-1 h-7 text-xs bg-[#1A4731] hover:bg-[#245E40]"
                        onClick={() => adicionar(col.id)}>Adicionar</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs"
                        onClick={() => { setAddingIn(null); setForm(EMPTY_FORM); }}>✕</Button>
                    </div>
                  </div>
                )}

                {cards.length === 0 && addingIn !== col.id && (
                  <div className="flex items-center justify-center h-16 border-2 border-dashed border-slate-100 rounded-lg">
                    <span className="text-[11px] text-slate-300">Arraste aqui</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}