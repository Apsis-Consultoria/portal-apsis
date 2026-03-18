import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Plus, Check, X, Trash2 } from "lucide-react";

export default function ProjetoTimesheet({ osId, projeto }) {
  const [entradas, setEntradas] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    colaborador: "",
    data: new Date().toISOString().slice(0, 10),
    horas: "",
    descricao: "",
    tarefa_id: "",
    faturavel: true,
  });

  useEffect(() => {
    Promise.all([
      base44.entities.EntradaTempo.filter({ os_id: osId }),
      base44.entities.Tarefa.filter({ os_id: osId }),
    ]).then(([e, t]) => {
      setEntradas(e.sort((a, b) => b.data?.localeCompare(a.data)));
      setTarefas(t);
      setLoading(false);
    });
  }, [osId]);

  const salvar = async () => {
    if (!form.colaborador || !form.horas) return;
    const nova = await base44.entities.EntradaTempo.create({
      ...form,
      os_id: osId,
      cliente_nome: projeto.cliente_nome,
      horas: Number(form.horas),
    });
    setEntradas(prev => [nova, ...prev]);
    setShowForm(false);
    setForm({ colaborador: "", data: new Date().toISOString().slice(0, 10), horas: "", descricao: "", tarefa_id: "", faturavel: true });
  };

  const excluir = async (id) => {
    await base44.entities.EntradaTempo.delete(id);
    setEntradas(prev => prev.filter(e => e.id !== id));
  };

  const aprovar = async (id, aprovado) => {
    await base44.entities.EntradaTempo.update(id, { aprovado });
    setEntradas(prev => prev.map(e => e.id === id ? { ...e, aprovado } : e));
  };

  const totalHoras = entradas.reduce((s, e) => s + (e.horas || 0), 0);
  const horasFaturaveis = entradas.filter(e => e.faturavel).reduce((s, e) => s + (e.horas || 0), 0);
  const horasAprovadas = entradas.filter(e => e.aprovado).reduce((s, e) => s + (e.horas || 0), 0);

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-slate-800">{totalHoras.toFixed(1)}h</p><p className="text-xs text-slate-500">Total lançado</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-green-600">{horasFaturaveis.toFixed(1)}h</p><p className="text-xs text-slate-500">Faturáveis</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-blue-600">{horasAprovadas.toFixed(1)}h</p><p className="text-xs text-slate-500">Aprovadas</p></CardContent></Card>
      </div>

      {/* Botão novo */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} className="gap-2" size="sm"><Plus className="w-4 h-4" /> Lançar Horas</Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader><CardTitle className="text-sm">Nova Entrada de Tempo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Colaborador *</label>
                <Input placeholder="Nome" value={form.colaborador} onChange={e => setForm(f => ({ ...f, colaborador: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Data *</label>
                <Input type="date" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Horas *</label>
                <Input type="number" step="0.5" min="0" placeholder="0.0" value={form.horas} onChange={e => setForm(f => ({ ...f, horas: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-500 mb-1 block">Tarefa</label>
                <Select value={form.tarefa_id} onValueChange={v => setForm(f => ({ ...f, tarefa_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione a tarefa (opcional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Sem tarefa específica</SelectItem>
                    {tarefas.map(t => <SelectItem key={t.id} value={t.id}>{t.titulo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.faturavel} onChange={e => setForm(f => ({ ...f, faturavel: e.target.checked }))} className="w-4 h-4" />
                  Faturável
                </label>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Descrição</label>
              <Input placeholder="O que foi feito?" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={salvar} className="gap-1"><Check className="w-4 h-4" /> Salvar</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Entradas de Tempo</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {entradas.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">Nenhuma entrada lançada.</p>}
            {entradas.map(e => (
              <div key={e.id} className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <p className="text-sm font-medium text-slate-800">{e.colaborador}</p>
                  <p className="text-xs text-slate-500">{e.descricao || "—"}</p>
                </div>
                <span className="text-xs text-slate-400">{e.data ? new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</span>
                <span className="font-bold text-slate-800 w-12 text-right">{e.horas}h</span>
                <div className="flex gap-1">
                  {e.faturavel && <Badge className="text-xs bg-green-100 text-green-700">Faturável</Badge>}
                  {e.aprovado ? (
                    <Badge className="text-xs bg-blue-100 text-blue-700">Aprovado</Badge>
                  ) : (
                    <button onClick={() => aprovar(e.id, true)} className="text-xs text-slate-400 hover:text-blue-500 border rounded px-2 py-0.5">Aprovar</button>
                  )}
                </div>
                <button onClick={() => excluir(e.id)} className="text-slate-300 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}