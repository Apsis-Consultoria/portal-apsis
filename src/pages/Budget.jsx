import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Plus, X, Edit2, Trash2, Target, TrendingUp, TrendingDown } from "lucide-react";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);
const fmtPct = (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [natureza, setNatureza] = useState("Total");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([
    base44.entities.Budget.list(),
    base44.entities.Parcela.list(),
  ]).then(([b, p]) => { setBudgets(b); setParcelas(p); });

  useEffect(() => { load(); }, []);

  // Calcular real por mês
  const realPorMes = MESES.map((mes, i) => {
    const m = i + 1;
    const real = parcelas.filter(p => {
      const d = p.data_recebimento ? new Date(p.data_recebimento) : null;
      return d && d.getFullYear() === ano && d.getMonth() + 1 === m && p.status === "Recebida";
    }).reduce((s, p) => s + (p.valor || 0), 0);
    return { mes, m, real };
  });

  const chartData = MESES.map((mes, i) => {
    const m = i + 1;
    const orcado = budgets.filter(b => b.ano === ano && b.mes === m && b.natureza === natureza)
      .reduce((s, b) => s + (b.valor_orcado || 0), 0);
    const real = realPorMes[i].real;
    const gap = orcado > 0 ? ((real - orcado) / orcado) * 100 : 0;
    return { mes, orcado, real, gap };
  });

  const totalOrcado = chartData.reduce((s, d) => s + d.orcado, 0);
  const totalReal = chartData.reduce((s, d) => s + d.real, 0);
  const gapTotal = totalOrcado > 0 ? ((totalReal - totalOrcado) / totalOrcado) * 100 : 0;

  const salvar = async () => {
    setSaving(true);
    const { data, editing } = modal;
    if (editing?.id) await base44.entities.Budget.update(editing.id, data);
    else await base44.entities.Budget.create(data);
    await load();
    setModal(null);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Confirmar exclusão?")) return;
    await base44.entities.Budget.delete(id);
    await load();
  };

  const budgetsDoAno = budgets.filter(b => b.ano === ano);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E8ECF0] p-5">
          <p className="text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-2">Total Orçado {ano}</p>
          <p className="text-2xl font-bold text-[#0F1B35]">{fmt(totalOrcado)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E8ECF0] p-5">
          <p className="text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-2">Total Realizado</p>
          <p className="text-2xl font-bold text-[#0F1B35]">{fmt(totalReal)}</p>
        </div>
        <div className={`rounded-2xl border p-5 ${gapTotal >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <p className="text-xs font-medium text-[#6B7A99] uppercase tracking-wider mb-2 flex items-center gap-1">
            {gapTotal >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} Gap para meta
          </p>
          <p className={`text-2xl font-bold ${gapTotal >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmtPct(gapTotal)}</p>
          <p className="text-xs text-[#6B7A99] mt-1">{fmt(Math.abs(totalReal - totalOrcado))} {gapTotal >= 0 ? "acima" : "abaixo"}</p>
        </div>
      </div>

      {/* Filtros + gráfico */}
      <div className="bg-white rounded-2xl border border-[#E8ECF0] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-semibold text-[#0F1B35]">Real vs Orçado por Mês</h2>
            <p className="text-xs text-[#6B7A99] mt-0.5">Comparativo de faturamento</p>
          </div>
          <div className="flex gap-2">
            <select className="border border-[#E8ECF0] rounded-xl px-3 py-1.5 text-sm focus:outline-none"
              value={natureza} onChange={e => setNatureza(e.target.value)}>
              {["Total","Contábil","Consultoria"].map(n => <option key={n}>{n}</option>)}
            </select>
            <select className="border border-[#E8ECF0] rounded-xl px-3 py-1.5 text-sm focus:outline-none"
              value={ano} onChange={e => setAno(Number(e.target.value))}>
              {[2023,2024,2025,2026].map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barSize={16} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F5" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6B7A99" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#6B7A99" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: "1px solid #E8ECF0", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="orcado" name="Orçado" fill="#E8ECF0" radius={[4,4,0,0]} />
            <Bar dataKey="real" name="Realizado" fill="#C9A84C" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de budget + gestão */}
      <div className="bg-white rounded-2xl border border-[#E8ECF0] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#E8ECF0]">
          <h2 className="font-semibold text-[#0F1B35]">Metas Cadastradas — {ano}</h2>
          <button onClick={() => setModal({ data: { ano, mes: 1, natureza: "Total", valor_orcado: 0 }, editing: null })}
            className="flex items-center gap-2 bg-[#0F1B35] text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-[#1A2D52] transition-colors">
            <Plus size={13} /> Adicionar Meta
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8ECF0] bg-[#F7F8FA]">
                {["Mês","Natureza","Orçado","Realizado","Gap",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F8FA]">
              {budgetsDoAno.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#6B7A99]">Nenhuma meta cadastrada para {ano}</td></tr>
              ) : budgetsDoAno.map(b => {
                const realMes = realPorMes.find(r => r.m === b.mes)?.real || 0;
                const gap = b.valor_orcado > 0 ? ((realMes - b.valor_orcado) / b.valor_orcado) * 100 : 0;
                return (
                  <tr key={b.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0F1B35]">{MESES[(b.mes || 1) - 1]}</td>
                    <td className="px-4 py-3 text-[#6B7A99]">{b.natureza}</td>
                    <td className="px-4 py-3 font-semibold text-[#0F1B35]">{fmt(b.valor_orcado)}</td>
                    <td className="px-4 py-3 font-semibold text-[#0F1B35]">{fmt(realMes)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${gap >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {fmtPct(gap)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ data: { ...b }, editing: b })}
                          className="p-1.5 hover:bg-[#E8ECF0] rounded-lg"><Edit2 size={13} className="text-[#6B7A99]" /></button>
                        <button onClick={() => excluir(b.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-[#E8ECF0]">
              <h2 className="font-semibold text-[#0F1B35]">{modal.editing ? "Editar Meta" : "Nova Meta"}</h2>
              <button onClick={() => setModal(null)}><X size={18} className="text-[#6B7A99]" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Ano", field: "ano", type: "number" },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-xs font-medium text-[#6B7A99] mb-1">{f.label}</label>
                  <input type={f.type || "text"}
                    className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
                    value={modal?.data?.[f.field] || ""}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, [f.field]: f.type === "number" ? Number(e.target.value) : e.target.value } }))} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-[#6B7A99] mb-1">Mês</label>
                <select className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
                  value={modal?.data?.mes || 1}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, mes: Number(e.target.value) } }))}>
                  {MESES.map((mes, i) => <option key={i+1} value={i+1}>{mes}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7A99] mb-1">Natureza</label>
                <select className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
                  value={modal?.data?.natureza || "Total"}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, natureza: e.target.value } }))}>
                  {["Total","Contábil","Consultoria"].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#6B7A99] mb-1">Valor Orçado (R$)</label>
                <input type="number"
                  className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
                  value={modal?.data?.valor_orcado || ""}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, valor_orcado: Number(e.target.value) } }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-[#E8ECF0] rounded-xl text-sm text-[#6B7A99] hover:bg-[#F7F8FA]">Cancelar</button>
              <button onClick={salvar} disabled={saving}
                className="px-5 py-2 bg-[#0F1B35] text-white rounded-xl text-sm font-medium hover:bg-[#1A2D52] disabled:opacity-60">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}