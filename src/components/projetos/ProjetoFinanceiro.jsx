import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "./shared/PageHeader";
import {
  DollarSign, Plus, Check, Trash2, TrendingUp, AlertTriangle,
  Download, X, Loader2, BarChart3, Calendar, TrendingDown, Clock
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, CartesianGrid, Legend, ReferenceLine
} from "recharts";

const fmt = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";
const hoje = new Date().toISOString().slice(0, 10);

const STATUS_STYLE = {
  "Lançada":   { badge: "bg-slate-100 text-slate-600",     dot: "bg-slate-400"   },
  "Faturada":  { badge: "bg-blue-100 text-blue-700",       dot: "bg-blue-500"    },
  "Recebida":  { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  "Em atraso": { badge: "bg-red-100 text-red-700",         dot: "bg-red-500"     },
};

const EMPTY_FORM = { valor: "", data_vencimento: "", mes_referencia: "", observacoes: "", status: "Lançada", nota_fiscal: "" };

export default function ProjetoFinanceiro({ osId, projeto }) {
  const [parcelas,  setParcelas]  = useState([]);
  const [entradas,  setEntradas]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);

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

  // ── Financeiros ───────────────────────────────────────────────────────────
  const orcamentoTotal  = projeto?.valor_proporcional || 0;
  const valorContrato   = parcelas.reduce((s, p) => s + (p.valor || 0), 0);
  const valorFaturado   = parcelas.filter(p => ["Faturada", "Recebida"].includes(p.status)).reduce((s, p) => s + (p.valor || 0), 0);
  const valorRecebido   = parcelas.filter(p => p.status === "Recebida").reduce((s, p) => s + (p.valor || 0), 0);
  const aFaturar        = parcelas.filter(p => p.status === "Lançada" && p.data_vencimento >= hoje).reduce((s, p) => s + (p.valor || 0), 0);
  const emAtraso        = parcelas.filter(p => p.status === "Lançada" && p.data_vencimento < hoje);
  const valorEmAtraso   = emAtraso.reduce((s, p) => s + (p.valor || 0), 0);
  const horasFaturaveis = entradas.filter(e => e.faturavel).reduce((s, e) => s + (e.horas || 0), 0);
  const receitaPorHora  = horasFaturaveis > 0 ? valorRecebido / horasFaturaveis : 0;
  const saldo           = valorContrato - valorRecebido;
  const pctRecebido     = valorContrato > 0 ? Math.round((valorRecebido / valorContrato) * 100) : 0;
  const pctOrcado       = orcamentoTotal > 0 ? Math.round((valorRecebido / orcamentoTotal) * 100) : 0;

  // ── Evolução mensal ───────────────────────────────────────────────────────
  const evolucao = useMemo(() => {
    const map = {};
    parcelas.forEach(p => {
      const mes = p.data_vencimento?.slice(0, 7);
      if (!mes) return;
      if (!map[mes]) map[mes] = { mes, previsto: 0, recebido: 0, faturado: 0 };
      map[mes].previsto += p.valor || 0;
      if (["Faturada", "Recebida"].includes(p.status)) map[mes].faturado += p.valor || 0;
      if (p.status === "Recebida") map[mes].recebido += p.valor || 0;
    });
    return Object.values(map).sort((a, b) => a.mes.localeCompare(b.mes)).map(d => ({
      ...d,
      mesLabel: new Date(d.mes + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    }));
  }, [parcelas]);

  // ── Comparativo real vs orçado ────────────────────────────────────────────
  const comparativo = [
    { name: "Orçado", valor: orcamentoTotal, color: "#94a3b8" },
    { name: "Contrato", valor: valorContrato, color: "#3b82f6" },
    { name: "Faturado", valor: valorFaturado, color: "#f59e0b" },
    { name: "Recebido", valor: valorRecebido, color: "#22c55e" },
  ];

  // ── Actions ───────────────────────────────────────────────────────────────
  const salvar = async () => {
    if (!form.valor || !form.data_vencimento) return;
    setSaving(true);
    const nova = await base44.entities.Parcela.create({
      ...form, os_id: osId,
      proposta_id: projeto?.proposta_id || "",
      cliente_nome: projeto?.cliente_nome || "",
      valor: Number(form.valor),
    });
    setParcelas(prev => [...prev, nova].sort((a, b) => a.data_vencimento?.localeCompare(b.data_vencimento)));
    setShowForm(false);
    setForm(EMPTY_FORM);
    setSaving(false);
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

  const exportCSV = () => {
    const header = "Vencimento,Valor,Status,Mês Ref.,NF,Observações\n";
    const rows = parcelas.map(p =>
      `"${p.data_vencimento}",${p.valor},"${p.status}","${p.mes_referencia || ""}","${p.nota_fiscal || ""}","${p.observacoes || ""}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `financeiro_${osId}.csv`; a.click();
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      <PageHeader
        title="Financeiro"
        subtitle="Parcelas, recebimentos e análise de rentabilidade"
        icon={DollarSign}
        actions={(
          <>
            <Button size="sm" onClick={() => setShowForm(!showForm)}
              className="bg-[#1A4731] hover:bg-[#245E40] active:bg-[#15372a] text-white gap-1.5 text-xs shadow-sm hover:shadow-md transition-all">
              <Plus size={12} /> Nova Parcela
            </Button>
            <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5 text-xs border-slate-200 text-slate-500 hover:bg-white transition-all">
              <Download size={12} /> CSV
            </Button>
          </>
        )}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={DollarSign}   color="slate"  label="Orçamento Total"   value={fmt(orcamentoTotal)}
          sub={`contrato: ${fmt(valorContrato)}`} />
        <KPICard icon={TrendingUp}   color="green"  label="Recebido"          value={fmt(valorRecebido)}
          sub={`${pctRecebido}% do contrato`} />
        <KPICard icon={Clock}        color="blue"   label="A faturar"         value={fmt(aFaturar)}
          sub="parcelas em aberto" />
        <KPICard icon={AlertTriangle} color={valorEmAtraso > 0 ? "red" : "slate"} label="Em atraso"
          value={fmt(valorEmAtraso)} sub={`${emAtraso.length} parcela${emAtraso.length !== 1 ? "s" : ""}`} />
      </div>

      {/* ── Alerta atraso ────────────────────────────────────────────── */}
      {emAtraso.length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertTriangle size={15} className="flex-shrink-0" />
          <span><strong>{emAtraso.length}</strong> parcela{emAtraso.length !== 1 ? "s" : ""} em atraso totalizando <strong>{fmt(valorEmAtraso)}</strong>.</span>
        </div>
      )}

      {/* ── Form Nova Parcela ─────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#1A4731]/20 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-[#1A4731]/5">
            <span className="text-sm font-semibold text-slate-700">Nova Parcela</span>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <Field label="Valor *">
                <Input type="number" placeholder="0.00" className="h-9 text-sm"
                  value={form.valor} onChange={e => setForm(f => ({ ...f, valor: e.target.value }))} />
              </Field>
              <Field label="Vencimento *">
                <Input type="date" className="h-9 text-sm"
                  value={form.data_vencimento} onChange={e => setForm(f => ({ ...f, data_vencimento: e.target.value }))} />
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Lançada", "Faturada", "Recebida"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Mês de referência">
                <Input placeholder="Ex: Mar/2025" className="h-9 text-sm"
                  value={form.mes_referencia} onChange={e => setForm(f => ({ ...f, mes_referencia: e.target.value }))} />
              </Field>
              <Field label="Nota Fiscal">
                <Input placeholder="Nº da NF" className="h-9 text-sm"
                  value={form.nota_fiscal} onChange={e => setForm(f => ({ ...f, nota_fiscal: e.target.value }))} />
              </Field>
              <Field label="Observações">
                <Input placeholder="Notas" className="h-9 text-sm"
                  value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))} />
              </Field>
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs">Cancelar</Button>
              <Button size="sm" onClick={salvar} disabled={saving}
                className="bg-[#1A4731] hover:bg-[#245E40] text-white text-xs gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Parcelas + Saldo/Previsão ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Parcelas */}
        <div className="md:col-span-2">
          <Section title="Parcelas do Projeto" icon={Calendar} iconColor="text-blue-500">
            {parcelas.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 italic">Nenhuma parcela cadastrada</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2 px-2 text-slate-500 font-semibold">Vencimento</th>
                      <th className="text-right py-2 px-2 text-slate-500 font-semibold">Valor</th>
                      <th className="text-left py-2 px-2 text-slate-500 font-semibold">Ref.</th>
                      <th className="text-left py-2 px-2 text-slate-500 font-semibold">Status</th>
                      <th className="py-2 px-2 text-slate-500 font-semibold">Ação</th>
                      <th className="py-2 px-2"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {parcelas.map(p => {
                      const atrasada = p.data_vencimento < hoje && p.status === "Lançada";
                      const st = STATUS_STYLE[p.status] || STATUS_STYLE["Lançada"];
                      return (
                        <tr key={p.id} className={`group hover:bg-slate-50/60 ${atrasada ? "bg-red-50/40" : ""}`}>
                          <td className={`py-2.5 px-2 font-medium ${atrasada ? "text-red-600" : "text-slate-700"}`}>
                            {fmtDate(p.data_vencimento)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-bold text-slate-800">{fmt(p.valor)}</td>
                          <td className="py-2.5 px-2 text-slate-400">{p.mes_referencia || "—"}</td>
                          <td className="py-2.5 px-2">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${st.badge}`}>
                              <span className={`w-1 h-1 rounded-full ${st.dot}`} />{atrasada ? "Em atraso" : p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            {p.status === "Lançada" && (
                              <button onClick={() => atualizarStatus(p.id, "Faturada")}
                                className="text-[10px] border border-blue-200 text-blue-600 rounded px-1.5 py-0.5 hover:bg-blue-50 transition-colors">
                                Faturar
                              </button>
                            )}
                            {p.status === "Faturada" && (
                              <button onClick={() => atualizarStatus(p.id, "Recebida")}
                                className="text-[10px] border border-emerald-200 text-emerald-600 rounded px-1.5 py-0.5 hover:bg-emerald-50 transition-colors">
                                Recebido
                              </button>
                            )}
                          </td>
                          <td className="py-2.5 px-2">
                            <button onClick={() => excluir(p.id)}
                              className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all">
                              <Trash2 size={11} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>

        {/* Saldo e previsão */}
        <div className="space-y-4">
          <Section title="Saldo" icon={TrendingDown} iconColor="text-slate-500">
            <SaldoRow label="Valor do contrato"  value={fmt(valorContrato)} />
            <SaldoRow label="Recebido"           value={fmt(valorRecebido)} color="text-emerald-600" />
            <SaldoRow label="A faturar"          value={fmt(aFaturar)}     color="text-blue-600" />
            <SaldoRow label="Em atraso"          value={fmt(valorEmAtraso)} color={valorEmAtraso > 0 ? "text-red-500" : undefined} />
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-500">Realização</span>
                <span className="font-bold text-slate-700">{pctRecebido}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctRecebido}%` }} />
              </div>
            </div>
          </Section>

          <Section title="Rentabilidade" icon={TrendingUp} iconColor="text-emerald-600">
            <SaldoRow label="Horas faturáveis" value={`${horasFaturaveis.toFixed(1)}h`} />
            {receitaPorHora > 0 && <SaldoRow label="Receita/hora" value={fmt(receitaPorHora)} color="text-emerald-600" />}
            <SaldoRow label="Orçado" value={fmt(orcamentoTotal)} />
            {orcamentoTotal > 0 && <SaldoRow label="vs. Orçado" value={`${pctOrcado}%`}
              color={pctOrcado >= 80 ? "text-emerald-600" : "text-amber-600"} />}
          </Section>
        </div>
      </div>

      {/* ── Evolução financeira ──────────────────────────────────────── */}
      {evolucao.length > 0 && (
        <Section title="Evolução Financeira Mensal" icon={BarChart3} iconColor="text-blue-500">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={evolucao} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mesLabel" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="previsto" name="Previsto" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="faturado" name="Faturado" fill="#60a5fa" radius={[3, 3, 0, 0]} />
              <Bar dataKey="recebido" name="Recebido" fill="#34d399" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      )}

      {/* ── Comparativo real vs orçado ───────────────────────────────── */}
      <Section title="Comparativo Real vs Orçado" icon={TrendingUp} iconColor="text-violet-500">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={comparativo} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 60 }}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={60} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
              {comparativo.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Section>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function KPICard({ icon: Icon, color, label, value, sub }) {
  const c = {
    slate:  { icon: "text-slate-500",   bg: "bg-slate-50",    border: "border-slate-200"   },
    green:  { icon: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-100" },
    blue:   { icon: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-100"    },
    red:    { icon: "text-red-600",     bg: "bg-red-50",      border: "border-red-100"     },
  }[color] || { icon: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" };
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={17} className={c.icon} />
        </div>
        <div className="min-w-0">
          <div className="text-lg font-bold text-slate-900 leading-tight truncate">{value}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
          {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, iconColor, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <Icon size={14} className={iconColor} />
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function SaldoRow({ label, value, color }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${color || "text-slate-800"}`}>{value}</span>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}