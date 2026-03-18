import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Clock, User, AlertTriangle } from "lucide-react";

const COLUNAS = ["A fazer", "Em andamento", "Em revisão", "Concluída", "Bloqueada"];

const COL_COLOR = {
  "A fazer": "border-t-gray-300",
  "Em andamento": "border-t-blue-500",
  "Em revisão": "border-t-yellow-400",
  "Concluída": "border-t-green-500",
  "Bloqueada": "border-t-red-500",
};

const PRIORIDADE_COLOR = {
  "Baixa": "bg-slate-100 text-slate-600",
  "Média": "bg-blue-100 text-blue-700",
  "Alta": "bg-orange-100 text-orange-700",
  "Crítica": "bg-red-100 text-red-700",
};

export default function ProjetoKanban({ osId, projeto }) {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingIn, setAddingIn] = useState(null);
  const [novaForm, setNovaForm] = useState({ titulo: "", responsavel: "", prioridade: "Média", horas_estimadas: 0, data_fim: "" });
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    base44.entities.Tarefa.filter({ os_id: osId }).then(t => { setTarefas(t); setLoading(false); });
  }, [osId]);

  const moverTarefa = async (tarefa, novoStatus) => {
    if (tarefa.status === novoStatus) return;
    setTarefas(prev => prev.map(t => t.id === tarefa.id ? { ...t, status: novoStatus } : t));
    await base44.entities.Tarefa.update(tarefa.id, { status: novoStatus });
  };

  const adicionarTarefa = async (status) => {
    if (!novaForm.titulo.trim()) return;
    const nova = await base44.entities.Tarefa.create({
      os_id: osId,
      titulo: novaForm.titulo,
      responsavel: novaForm.responsavel || projeto.responsavel_tecnico,
      prioridade: novaForm.prioridade,
      horas_estimadas: novaForm.horas_estimadas,
      data_fim: novaForm.data_fim,
      status,
    });
    setTarefas(prev => [...prev, nova]);
    setAddingIn(null);
    setNovaForm({ titulo: "", responsavel: "", prioridade: "Média", horas_estimadas: 0, data_fim: "" });
  };

  const excluirTarefa = async (id) => {
    await base44.entities.Tarefa.delete(id);
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex gap-4 overflow-x-auto pb-4" onDragOver={e => e.preventDefault()}>
        {COLUNAS.map(col => {
          const cards = tarefas.filter(t => t.status === col);
          return (
            <div
              key={col}
              className={`flex-shrink-0 w-72 bg-slate-50 rounded-xl border-t-4 ${COL_COLOR[col]} flex flex-col`}
              onDragOver={e => e.preventDefault()}
              onDrop={() => dragging && moverTarefa(dragging, col)}
            >
              <div className="p-3 flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-700">{col}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-white border rounded-full px-2 py-0.5 text-slate-500">{cards.length}</span>
                  <button onClick={() => setAddingIn(col)} className="text-slate-400 hover:text-blue-500">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                {cards.map(t => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => setDragging(t)}
                    onDragEnd={() => setDragging(null)}
                    className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-medium text-slate-800 leading-snug flex-1">{t.titulo}</p>
                      <button onClick={() => excluirTarefa(t.id)} className="text-slate-300 hover:text-red-400 shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge className={`text-xs ${PRIORIDADE_COLOR[t.prioridade] || "bg-gray-100 text-gray-600"}`}>{t.prioridade}</Badge>
                      {t.horas_estimadas > 0 && (
                        <span className="flex items-center gap-0.5 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />{t.horas_estimadas}h
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      {t.responsavel && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <User className="w-3 h-3" />{t.responsavel}
                        </span>
                      )}
                      {t.data_fim && (
                        <span className={`text-xs ${new Date(t.data_fim + "T00:00:00") < new Date() && t.status !== "Concluída" ? "text-red-500 font-medium" : "text-slate-400"}`}>
                          {new Date(t.data_fim + "T00:00:00").toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {addingIn === col && (
                  <div className="bg-white rounded-lg p-3 border-2 border-blue-200 space-y-2">
                    <Input
                      placeholder="Título da tarefa"
                      value={novaForm.titulo}
                      onChange={e => setNovaForm(f => ({ ...f, titulo: e.target.value }))}
                      className="text-sm h-8"
                      autoFocus
                      onKeyDown={e => e.key === "Enter" && adicionarTarefa(col)}
                    />
                    <Input placeholder="Responsável" value={novaForm.responsavel} onChange={e => setNovaForm(f => ({ ...f, responsavel: e.target.value }))} className="text-sm h-8" />
                    <div className="flex gap-2">
                      <Select value={novaForm.prioridade} onValueChange={v => setNovaForm(f => ({ ...f, prioridade: v }))}>
                        <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["Baixa", "Média", "Alta", "Crítica"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input type="number" placeholder="Horas" value={novaForm.horas_estimadas} onChange={e => setNovaForm(f => ({ ...f, horas_estimadas: Number(e.target.value) }))} className="h-8 text-xs w-16" />
                    </div>
                    <Input type="date" value={novaForm.data_fim} onChange={e => setNovaForm(f => ({ ...f, data_fim: e.target.value }))} className="h-8 text-xs" />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => adicionarTarefa(col)}>Adicionar</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setAddingIn(null)}>Cancelar</Button>
                    </div>
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