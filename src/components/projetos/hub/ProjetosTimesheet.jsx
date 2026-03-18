import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer, Check, Trash2, Plus, Clock } from "lucide-react";

export default function ProjetosTimesheet({ data, onRefresh }) {
  const { entradas, projetos, tarefas } = data;
  const [showForm, setShowForm] = useState(false);
  const [filtroOS, setFiltroOS] = useState("todos");
  const [filtroColab, setFiltroColab] = useState("todos");
  const [form, setForm] = useState({ os_id: "", tarefa_id: "", colaborador: "", data: new Date().toISOString().split("T")[0], horas: "", descricao: "", faturavel: true });
  const [saving, setSaving] = useState(false);

  const colaboradores = [...new Set(entradas.map(e => e.colaborador).filter(Boolean))];

  const entradasFiltradas = entradas.filter(e => {
    const matchOS = filtroOS === "todos" || e.os_id === filtroOS;
    const matchC = filtroColab === "todos" || e.colaborador === filtroColab;
    return matchOS && matchC;
  }).slice(0, 200);

  const totalHoras = entradasFiltradas.reduce((s, e) => s + (e.horas || 0), 0);
  const horasFaturavel = entradasFiltradas.filter(e => e.faturavel).reduce((s, e) => s + (e.horas || 0), 0);
  const horasAprovadas = entradasFiltradas.filter(e => e.aprovado).reduce((s, e) => s + (e.horas || 0), 0);

  const handleSave = async () => {
    if (!form.os_id || !form.colaborador || !form.data || !form.horas) return;
    setSaving(true);
    await base44.entities.EntradaTempo.create({ ...form, horas: parseFloat(form.horas) });
    setForm({ os_id: "", tarefa_id: "", colaborador: "", data: new Date().toISOString().split("T")[0], horas: "", descricao: "", faturavel: true });
    setShowForm(false);
    onRefresh();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.EntradaTempo.delete(id);
    onRefresh();
  };

  const handleApprove = async (e) => {
    await base44.entities.EntradaTempo.update(e.id, { aprovado: !e.aprovado });
    onRefresh();
  };

  const projetoNome = (osId) => projetos.find(p => p.id === osId)?.cliente_nome || osId;
  const tarefaNome = (tId) => tarefas.find(t => t.id === tId)?.titulo || "—";

  return (
    <div className="p-6 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock size={20} className="text-[#1A4731]" />
            <div>
              <p className="text-xl font-bold text-slate-800">{totalHoras.toFixed(1)}h</p>
              <p className="text-xs text-slate-400">Total lançado</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Timer size={20} className="text-green-500" />
            <div>
              <p className="text-xl font-bold text-slate-800">{horasFaturavel.toFixed(1)}h</p>
              <p className="text-xs text-slate-400">Faturável</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Check size={20} className="text-blue-500" />
            <div>
              <p className="text-xl font-bold text-slate-800">{horasAprovadas.toFixed(1)}h</p>
              <p className="text-xs text-slate-400">Aprovadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros + novo */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filtroOS} onValueChange={setFiltroOS}>
          <SelectTrigger className="w-56 h-9"><SelectValue placeholder="Todos os projetos" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os projetos</SelectItem>
            {projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.cliente_nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filtroColab} onValueChange={setFiltroColab}>
          <SelectTrigger className="w-44 h-9"><SelectValue placeholder="Colaborador" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {colaboradores.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5 bg-[#1A4731] hover:bg-[#245E40]">
          <Plus size={13} /> Nova Entrada
        </Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="border-[#1A4731]/20 bg-[#1A4731]/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Projeto *</label>
                <Select value={form.os_id} onValueChange={v => setForm(f => ({ ...f, os_id: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.cliente_nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Tarefa</label>
                <Select value={form.tarefa_id} onValueChange={v => setForm(f => ({ ...f, tarefa_id: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Opcional" /></SelectTrigger>
                  <SelectContent>
                    {tarefas.filter(t => t.os_id === form.os_id).map(t => <SelectItem key={t.id} value={t.id}>{t.titulo}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Colaborador *</label>
                <Input className="h-8 text-xs" value={form.colaborador} onChange={e => setForm(f => ({ ...f, colaborador: e.target.value }))} placeholder="Nome" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Data *</label>
                <Input type="date" className="h-8 text-xs" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Horas *</label>
                <Input type="number" step="0.5" min="0.5" max="24" className="h-8 text-xs" value={form.horas} onChange={e => setForm(f => ({ ...f, horas: e.target.value }))} placeholder="Ex: 2.5" />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Faturável</label>
                <Select value={form.faturavel ? "sim" : "nao"} onValueChange={v => setForm(f => ({ ...f, faturavel: v === "sim" }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 md:col-span-3">
                <label className="text-xs text-slate-500 mb-1 block">Descrição da atividade</label>
                <Input className="h-8 text-xs" value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} placeholder="Descreva o que foi feito..." />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#1A4731] hover:bg-[#245E40]">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Projeto</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Tarefa</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Colaborador</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Data</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Horas</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Descrição</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium">Fat.</th>
                  <th className="text-center px-4 py-3 text-slate-500 font-medium">Aprovado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {entradasFiltradas.map(e => (
                  <tr key={e.id} className={`border-b border-slate-50 hover:bg-slate-50 ${e.aprovado ? "bg-green-50/30" : ""}`}>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{projetoNome(e.os_id)}</td>
                    <td className="px-4 py-2.5 text-slate-500">{tarefaNome(e.tarefa_id)}</td>
                    <td className="px-4 py-2.5 text-slate-600">{e.colaborador || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500">{e.data ? new Date(e.data + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-[#1A4731]">{(e.horas || 0).toFixed(1)}h</td>
                    <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">{e.descricao || "—"}</td>
                    <td className="px-4 py-2.5 text-center">
                      {e.faturavel ? <span className="text-green-600">✓</span> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button onClick={() => handleApprove(e)} title="Aprovar/Reprovar">
                        {e.aprovado
                          ? <Check size={13} className="text-green-500" />
                          : <span className="text-slate-300 text-xs">—</span>}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => handleDelete(e.id)} className="text-slate-300 hover:text-red-400">
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
                {entradasFiltradas.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-10 text-slate-300">Nenhuma entrada de tempo</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}