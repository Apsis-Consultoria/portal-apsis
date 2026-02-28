import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Plus, X, Edit2, Trash2, TrendingUp, TrendingDown } from "lucide-react";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);
const fmtPct = (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;

// Dados reais planilha BUDGET 2026
const BUDGET2026 = {
  orcamentoTotal: 8700000,
  laudoContabil: 6200000,
  consultoria: 2500000,
  metaMensal: 725000,
  laudoMetaMensal: 516666.67,
  consultoriaMetaMensal: 208333.33,
  realizado: 161182.27,
  laudoRealizado: 47290.64,
  consultoriaRealizado: 113891.63,
  robOrcado: 7728759.46,
  robRealizado: 65353.04,
  ticketMedioTotal: 27187.5,
  ticketMedioLaudo: 24800,
  ticketMedioConsultoria: 35714.29,
  volumeLaudo: 250,
  volumeConsultoria: 70,
  vendas: [
    { mes:"Jan", contabil:0, consultoria:75862.07, total:75862.07, rob:5446.09 },
    { mes:"Fev", contabil:47290.64, consultoria:38029.56, total:85320.20, rob:5446.09 },
    { mes:"Mar", contabil:0, consultoria:0, total:0, rob:5446.09 },
    { mes:"Abr", contabil:0, consultoria:0, total:0, rob:5446.09 },
    { mes:"Mai", contabil:0, consultoria:0, total:0, rob:5446.09 },
    { mes:"Jun", contabil:0, consultoria:0, total:0, rob:5446.09 },
    { mes:"Jul", contabil:0, consultoria:0, total:0, rob:5446.09 },
    { mes:"Ago", contabil:0, consultoria:0, total:0, rob:5446.09 },
    { mes:"Set", contabil:0, consultoria:0, total:0, rob:5446.09 },
    { mes:"Out", contabil:0, consultoria:0, total:0, rob:5446.09 },
    { mes:"Nov", contabil:0, consultoria:0, total:0, rob:5446.09 },
    { mes:"Dez", contabil:0, consultoria:0, total:0, rob:5446.09 },
  ],
};

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [ano, setAno] = useState(2026);
  const [natureza, setNatureza] = useState("Total");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([
    base44.entities.Budget.list(),
    base44.entities.Parcela.list(),
  ]).then(([b, p]) => { setBudgets(b); setParcelas(p); });

  useEffect(() => { load(); }, []);

  const gapTotal = BUDGET2026.orcamentoTotal > 0
    ? ((BUDGET2026.realizado - BUDGET2026.orcamentoTotal) / BUDGET2026.orcamentoTotal) * 100 : 0;

  const chartData = ano === 2026
    ? BUDGET2026.vendas.map(v => ({
        mes: v.mes,
        orcado: 725000,
        real: natureza === "Total" ? v.total : natureza === "Contábil" ? v.contabil : v.consultoria,
      }))
    : MESES.map((mes, i) => {
        const m = i + 1;
        const orcado = budgets.filter(b => b.ano === ano && b.mes === m && b.natureza === natureza)
          .reduce((s, b) => s + (b.valor_orcado || 0), 0);
        const real = parcelas.filter(p => {
          const d = p.data_recebimento ? new Date(p.data_recebimento) : null;
          return d && d.getFullYear() === ano && d.getMonth() + 1 === m && p.status === "Recebida";
        }).reduce((s, p) => s + (p.valor || 0), 0);
        return { mes, orcado, real };
      });

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
      {/* KPIs Budget 2026 da planilha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Orçamento Total 2026", value: fmt(BUDGET2026.orcamentoTotal), sub: "Meta vendas anual" },
          { label: "Realizado Acumulado", value: fmt(BUDGET2026.realizado), sub: `${((BUDGET2026.realizado/BUDGET2026.orcamentoTotal)*100).toFixed(1)}% da meta` },
          { label: "Falta Realizar", value: fmt(BUDGET2026.orcamentoTotal - BUDGET2026.realizado), sub: "Restante 2026" },
          { label: "ROB Realizado", value: fmt(BUDGET2026.robRealizado), sub: `de ${fmt(BUDGET2026.robOrcado)} orçados` },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
            <p className="text-xs font-medium text-[#5C7060] uppercase tracking-wider mb-2">{k.label}</p>
            <p className="text-2xl font-bold text-[#1A2B1F]">{k.value}</p>
            {k.sub && <p className="text-xs text-[#5C7060] mt-1">{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* Indicadores Laudo vs Consultoria */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Laudo Contábil", orcado: BUDGET2026.laudoContabil, real: BUDGET2026.laudoRealizado, meta: BUDGET2026.laudoMetaMensal, vol: BUDGET2026.volumeLaudo, ticket: BUDGET2026.ticketMedioLaudo },
          { label: "Consultoria", orcado: BUDGET2026.consultoria, real: BUDGET2026.consultoriaRealizado, meta: BUDGET2026.consultoriaMetaMensal, vol: BUDGET2026.volumeConsultoria, ticket: BUDGET2026.ticketMedioConsultoria },
        ].map(item => {
          const pct = item.orcado > 0 ? (item.real / item.orcado) * 100 : 0;
          return (
            <div key={item.label} className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-[#1A2B1F]">{item.label}</p>
                  <p className="text-xs text-[#5C7060] mt-0.5">Meta mensal: {fmt(item.meta)}</p>
                </div>
                <span className="text-xs bg-[#F4F6F4] text-[#5C7060] px-2 py-1 rounded-lg">
                  Vol. orçado: {item.vol}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><p className="text-xs text-[#5C7060]">Orçado</p><p className="font-bold text-[#1A2B1F]">{fmt(item.orcado)}</p></div>
                <div><p className="text-xs text-[#5C7060]">Realizado</p><p className="font-bold text-[#F47920]">{fmt(item.real)}</p></div>
                <div><p className="text-xs text-[#5C7060]">Ticket Médio</p><p className="font-semibold text-[#1A2B1F]">{fmt(item.ticket)}</p></div>
                <div><p className="text-xs text-[#5C7060]">% Atingido</p><p className="font-semibold text-[#1A2B1F]">{pct.toFixed(1)}%</p></div>
              </div>
              <div className="w-full bg-[#F4F6F4] rounded-full h-2">
                <div className="h-2 bg-[#F47920] rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-semibold text-[#1A2B1F]">Real vs Orçado por Mês</h2>
            <p className="text-xs text-[#5C7060] mt-0.5">Vendas mensais vs meta de {fmt(725000)}/mês</p>
          </div>
          <div className="flex gap-2">
            <select className="border border-[#DDE3DE] rounded-xl px-3 py-1.5 text-sm focus:outline-none"
              value={natureza} onChange={e => setNatureza(e.target.value)}>
              {["Total","Contábil","Consultoria"].map(n => <option key={n}>{n}</option>)}
            </select>
            <select className="border border-[#DDE3DE] rounded-xl px-3 py-1.5 text-sm focus:outline-none"
              value={ano} onChange={e => setAno(Number(e.target.value))}>
              {[2025,2026].map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barSize={16} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#5C7060" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#5C7060" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: "1px solid #DDE3DE", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="orcado" name="Orçado" fill="#E8EDE9" radius={[4,4,0,0]} />
            <Bar dataKey="real" name="Realizado" fill="#F47920" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela metas adicionais (portal) */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#DDE3DE]">
          <div>
            <h2 className="font-semibold text-[#1A2B1F]">Metas Complementares — {ano}</h2>
            <p className="text-xs text-[#5C7060] mt-0.5">Metas adicionais cadastradas no portal</p>
          </div>
          <button onClick={() => setModal({ data: { ano, mes: 1, natureza: "Total", valor_orcado: 0 }, editing: null })}
            className="flex items-center gap-2 bg-[#1A4731] text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-[#245E40] transition-colors">
            <Plus size={13} /> Adicionar Meta
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                {["Mês","Natureza","Orçado",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F4]">
              {budgetsDoAno.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-[#5C7060] text-sm">Nenhuma meta complementar cadastrada</td></tr>
              ) : budgetsDoAno.map(b => (
                <tr key={b.id} className="hover:bg-[#F4F6F4] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A2B1F]">{MESES[(b.mes || 1) - 1]}</td>
                  <td className="px-4 py-3 text-[#5C7060]">{b.natureza}</td>
                  <td className="px-4 py-3 font-semibold text-[#1A2B1F]">{fmt(b.valor_orcado)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ data: { ...b }, editing: b })}
                        className="p-1.5 hover:bg-[#E8EDE9] rounded-lg"><Edit2 size={13} className="text-[#5C7060]" /></button>
                      <button onClick={() => excluir(b.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-[#DDE3DE]">
              <h2 className="font-semibold text-[#1A2B1F]">{modal.editing ? "Editar Meta" : "Nova Meta"}</h2>
              <button onClick={() => setModal(null)}><X size={18} className="text-[#5C7060]" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[{ label: "Ano", field: "ano", type: "number" }].map(f => (
                <div key={f.field}>
                  <label className="block text-xs font-medium text-[#5C7060] mb-1">{f.label}</label>
                  <input type={f.type}
                    className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                    value={modal?.data?.[f.field] || ""}
                    onChange={e => setModal(m => ({ ...m, data: { ...m.data, [f.field]: Number(e.target.value) } }))} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Mês</label>
                <select className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                  value={modal?.data?.mes || 1}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, mes: Number(e.target.value) } }))}>
                  {MESES.map((mes, i) => <option key={i+1} value={i+1}>{mes}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Natureza</label>
                <select className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                  value={modal?.data?.natureza || "Total"}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, natureza: e.target.value } }))}>
                  {["Total","Contábil","Consultoria"].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Valor Orçado (R$)</label>
                <input type="number"
                  className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                  value={modal?.data?.valor_orcado || ""}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, valor_orcado: Number(e.target.value) } }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-[#DDE3DE] rounded-xl text-sm text-[#5C7060] hover:bg-[#F4F6F4]">Cancelar</button>
              <button onClick={salvar} disabled={saving}
                className="px-5 py-2 bg-[#1A4731] text-white rounded-xl text-sm font-medium hover:bg-[#245E40] disabled:opacity-60">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}