import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { TrendingUp, DollarSign, Briefcase, CheckCircle2, XCircle, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const fmt = (v) =>
  v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "R$ 0";

const STATUS_COLORS = {
  "Em elaboração": "#60a5fa",
  "Enviada":       "#fbbf24",
  "Ganha":         "#10b981",
  "Perdida":       "#f87171",
  "Caducada":      "#94a3b8",
};

const STATUS_ORDER = ["Em elaboração", "Enviada", "Ganha", "Perdida", "Caducada"];

export default function VendasDashboard() {
  const [propostas, setPropostas] = useState([]);
  const [oaps, setOaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposta.list("-created_date", 500),
      base44.entities.OAP.list("-created_date", 200),
    ]).then(([p, o]) => { setPropostas(p); setOaps(o); setLoading(false); });
  }, []);

  // --- KPIs ---
  const ganhas  = propostas.filter(p => p.status === "Ganha");
  const perdidas = propostas.filter(p => p.status === "Perdida");
  const ativas  = propostas.filter(p => ["Em elaboração", "Enviada"].includes(p.status));
  const valorPipeline = ativas.reduce((s, p) => s + (p.valor_total || 0), 0);
  const valorGanho    = ganhas.reduce((s, p) => s + (p.valor_total || 0), 0);
  const taxaConversao = propostas.length > 0 ? ((ganhas.length / propostas.length) * 100).toFixed(1) : 0;
  const ticketMedio   = ganhas.length > 0 ? valorGanho / ganhas.length : 0;

  const kpis = [
    { label: "Total de Oportunidades", value: propostas.length, icon: Briefcase,     color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-100" },
    { label: "Valor do Pipeline",       value: fmt(valorPipeline), icon: DollarSign,  color: "text-[#F47920]",   bg: "bg-orange-50",  border: "border-orange-100" },
    { label: "Taxa de Conversão",       value: `${taxaConversao}%`, icon: Target,     color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-100" },
    { label: "Ticket Médio (Ganhas)",   value: fmt(ticketMedio),    icon: TrendingUp, color: "text-cyan-600",    bg: "bg-cyan-50",    border: "border-cyan-100" },
    { label: "Oportunidades Ganhas",    value: ganhas.length,       icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Oportunidades Perdidas",  value: perdidas.length,     icon: XCircle,    color: "text-red-500",     bg: "bg-red-50",     border: "border-red-100" },
  ];

  // --- Gráfico: pipeline por etapa ---
  const pipelineEtapa = STATUS_ORDER.map(s => ({
    name: s,
    quantidade: propostas.filter(p => p.status === s).length,
    valor: propostas.filter(p => p.status === s).reduce((acc, p) => acc + (p.valor_total || 0), 0),
    fill: STATUS_COLORS[s],
  }));

  // --- Gráfico: evolução mensal (últimos 6 meses) ---
  const evolucaoMensal = Array.from({ length: 6 }, (_, i) => {
    const ref = subMonths(new Date(), 5 - i);
    const inicio = startOfMonth(ref);
    const fim = endOfMonth(ref);
    const mes = propostas.filter(p => {
      const d = p.data_envio ? new Date(p.data_envio) : null;
      return d && d >= inicio && d <= fim;
    });
    return {
      mes: format(ref, "MMM", { locale: ptBR }),
      enviadas: mes.length,
      ganhas: mes.filter(p => p.status === "Ganha").length,
    };
  });

  // --- Gráfico: conversão por etapa ---
  const conversaoPorEtapa = STATUS_ORDER.slice(0, 4).map(s => ({
    name: s.replace("Em elaboração", "Elaboração"),
    pct: propostas.length > 0 ? Math.round((propostas.filter(p => p.status === s).length / propostas.length) * 100) : 0,
    fill: STATUS_COLORS[s],
  }));

  // --- Tabela: oportunidades recentes ---
  const recentes = [...propostas].slice(0, 8);

  if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard de Vendas</h1>
        <p className="text-sm text-slate-500 mt-1">Visão executiva do pipeline comercial</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`bg-white rounded-2xl border ${k.border} p-5 shadow-sm flex items-start gap-4`}>
            <div className={`w-11 h-11 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}>
              <k.icon size={20} className={k.color} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1 leading-tight">{k.label}</p>
              <p className={`text-2xl font-black tracking-tight leading-none ${k.color}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos — linha 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pipeline por etapa */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-4">Pipeline por Etapa</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={pipelineEtapa} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, name) => [name === "quantidade" ? v : fmt(v), name === "quantidade" ? "Qtd." : "Valor"]}
                contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }}
              />
              <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                {pipelineEtapa.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Evolução mensal */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-4">Evolução Mensal (últimos 6 meses)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={evolucaoMensal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 12 }} />
              <Line type="monotone" dataKey="enviadas" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 4, fill: "#60a5fa" }} name="Enviadas" />
              <Line type="monotone" dataKey="ganhas"   stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} name="Ganhas" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-0.5 bg-blue-400 rounded inline-block" />Enviadas</span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="w-3 h-0.5 bg-emerald-500 rounded inline-block" />Ganhas</span>
          </div>
        </div>
      </div>

      {/* Gráfico conversão + Tabela recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversão por etapa */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-4">Conversão por Etapa</p>
          <div className="space-y-3">
            {conversaoPorEtapa.map(e => (
              <div key={e.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-500">{e.name}</span>
                  <span className="text-xs font-bold text-slate-700">{e.pct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${e.pct}%`, background: e.fill }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Oportunidades recentes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-sm font-bold text-slate-700 mb-4">Oportunidades Recentes</p>
          {recentes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhuma oportunidade cadastrada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Cliente", "Natureza", "Valor", "Status", "Responsável"].map(h => (
                      <th key={h} className="text-left pb-2 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentes.map((p, i) => (
                    <tr key={p.id || i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-2 font-semibold text-slate-700">{p.cliente_nome}</td>
                      <td className="py-2.5 px-2 text-slate-400 max-w-[120px] truncate">{p.natureza}</td>
                      <td className="py-2.5 px-2 font-bold text-slate-700">{fmt(p.valor_total)}</td>
                      <td className="py-2.5 px-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: STATUS_COLORS[p.status] + "22", color: STATUS_COLORS[p.status] }}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-400">{p.responsavel || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}