import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Plus, Check, Trash2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const fmt = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_COLOR = {
  "Lançada": "bg-gray-100 text-gray-600",
  "Faturada": "bg-blue-100 text-blue-700",
  "Recebida": "bg-green-100 text-green-700",
  "Em atraso": "bg-red-100 text-red-700",
};

export default function ProjetoFinanceiro({ osId, projeto }) {
  const [parcelas, setParcelas] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ valor: "", data_vencimento: "", mes_referencia: "", observacoes: "", status: "Lançada" });

  useEffect(() => {
    Promise.all([
      base44.entities.Parcela.filter({ os_id: osId }),
      base44.entities.EntradaTempo.filter({ os_id: osId }),
    ]).then(([p, e]) => {
      setParcelas(p.sort((a, b) => a.data_vencimento?.localeCompare(b.data_vencimento)));
      setEntradas(e);
      setLoading(false);
    });
  }, [osId]);

  const salvar = async () => {
    if (!form.valor || !form.data_vencimento) return;
    const nova = await base44.entities.Parcela.create({
      ...form,
      os_id: osId,
      proposta_id: projeto.proposta_id || "",
      cliente_nome: projeto.cliente_nome,
      valor: Number(form.valor),
    });
    setParcelas(prev => [...prev, nova].sort((a, b) => a.data_vencimento?.localeCompare(b.data_vencimento)));
    setShowForm(false);
    setForm({ valor: "", data_vencimento: "", mes_referencia: "", observacoes: "", status: "Lançada" });
  };

  const atualizarStatus = async (id, status) => {
    const extra = status === "Recebida" ? { data_recebimento: new Date().toISOString().slice(0, 10) } : {};
    await base44.entities.Parcela.update(id, { status, ...extra });
    setParcelas(prev => prev.map(p => p.id === id ? { ...p, status, ...extra } : p));
  };

  const excluir = async (id) => {
    await base44.entities.Parcela.delete(id);
    setParcelas(prev => prev.filter(p => p.id !== id));
  };

  const valorTotal = parcelas.reduce((s, p) => s + (p.valor || 0), 0);
  const valorFaturado = parcelas.filter(p => ["Faturada", "Recebida"].includes(p.status)).reduce((s, p) => s + (p.valor || 0), 0);
  const valorRecebido = parcelas.filter(p => p.status === "Recebida").reduce((s, p) => s + (p.valor || 0), 0);
  const valorPendente = parcelas.filter(p => p.status === "Lançada").reduce((s, p) => s + (p.valor || 0), 0);
  const horasFaturaveis = entradas.filter(e => e.faturavel).reduce((s, e) => s + (e.horas || 0), 0);

  const chartData = [
    { name: "Total", valor: valorTotal, color: "#64748b" },
    { name: "Faturado", valor: valorFaturado, color: "#3b82f6" },
    { name: "Recebido", valor: valorRecebido, color: "#22c55e" },
    { name: "Pendente", valor: valorPendente, color: "#f59e0b" },
  ];

  const hoje = new Date().toISOString().slice(0, 10);
  const em_atraso = parcelas.filter(p => p.data_vencimento < hoje && !["Faturada", "Recebida"].includes(p.status));

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-slate-400"><CardContent className="p-4"><p className="text-lg font-bold">{fmt(valorTotal)}</p><p className="text-xs text-slate-500">Valor total</p></CardContent></Card>
        <Card className="border-l-4 border-l-blue-500"><CardContent className="p-4"><p className="text-lg font-bold text-blue-600">{fmt(valorFaturado)}</p><p className="text-xs text-slate-500">Faturado</p></CardContent></Card>
        <Card className="border-l-4 border-l-green-500"><CardContent className="p-4"><p className="text-lg font-bold text-green-600">{fmt(valorRecebido)}</p><p className="text-xs text-slate-500">Recebido</p></CardContent></Card>
        <Card className="border-l-4 border-l-orange-400"><CardContent className="p-4"><p className="text-lg font-bold text-orange-500">{fmt(valorPendente)}</p><p className="text-xs text-slate-500">Pendente</p></CardContent></Card>
      </div>

      {/* Alerta atraso */}
      {em_atraso.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          ⚠️ {em_atraso.length} parcela(s) em atraso totalizando {fmt(em_atraso.reduce((s, p) => s + (p.valor || 0), 0))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfico */}
        <Card>
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Visão Financeira</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rentabilidade estimada */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Rentabilidade</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Receita prevista</span><span className="font-medium">{fmt(valorTotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-500">Horas faturáveis</span><span className="font-medium">{horasFaturaveis.toFixed(1)}h</span></div>
            {horasFaturaveis > 0 && valorTotal > 0 && (
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-slate-500">Receita por hora</span>
                <span className="font-bold text-green-600">{fmt(valorTotal / horasFaturaveis)}/h</span>
              </div>
            )}
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-slate-500">% realizado</span>
              <span className="font-bold text-blue-600">{valorTotal > 0 ? ((valorRecebido / valorTotal) * 100).toFixed(1) : 0}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão novo */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Nova Parcela</Button>
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader><CardTitle className="text-sm">Nova Parcela</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><label className="text-xs text-slate-500 mb-1 block">Valor *</label><Input type="number" placeholder="0.00" value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">Vencimento *</label><Input type="date" value={form.data_vencimento} onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))} /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">Mês referência</label><Input placeholder="Ex: Jan/2025" value={form.mes_referencia} onChange={e => setForm(f => ({ ...f, mes_referencia: e.target.value }))} /></div>
              <div><label className="text-xs text-slate-500 mb-1 block">Status</label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Lançada", "Faturada", "Recebida"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><label className="text-xs text-slate-500 mb-1 block">Observações</label><Input placeholder="Notas" value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={salvar} className="gap-1"><Check className="w-4 h-4" /> Salvar</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista parcelas */}
      <Card>
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4" /> Parcelas</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {parcelas.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">Nenhuma parcela cadastrada.</p>}
            {parcelas.map(p => (
              <div key={p.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-slate-50 flex-wrap ${p.data_vencimento < hoje && !["Faturada", "Recebida"].includes(p.status) ? "bg-red-50/50" : ""}`}>
                <div className="flex-1 min-w-[150px]">
                  <p className="text-sm font-bold">{fmt(p.valor)}</p>
                  <p className="text-xs text-slate-500">{p.mes_referencia || "—"} · {p.observacoes || ""}</p>
                </div>
                <span className="text-xs text-slate-500">{p.data_vencimento ? new Date(p.data_vencimento + "T00:00:00").toLocaleDateString("pt-BR") : "—"}</span>
                <Badge className={`text-xs ${STATUS_COLOR[p.status] || "bg-gray-100 text-gray-600"}`}>{p.status}</Badge>
                <div className="flex gap-1">
                  {p.status === "Lançada" && <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => atualizarStatus(p.id, "Faturada")}>Faturar</Button>}
                  {p.status === "Faturada" && <Button size="sm" variant="outline" className="h-7 text-xs text-green-600 border-green-300" onClick={() => atualizarStatus(p.id, "Recebida")}>Recebido</Button>}
                </div>
                <button onClick={() => excluir(p.id)} className="text-slate-300 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}