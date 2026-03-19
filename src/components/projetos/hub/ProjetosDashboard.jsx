import { Link } from "react-router-dom";
import {
  Briefcase, DollarSign, AlertTriangle, Clock, CheckCircle2,
  TrendingUp, ChevronRight, AlertOctagon, BarChart3, Users,
  Activity, Calendar
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from "recharts";

const fmt = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
const fmtK = (v) => v >= 1000000 ? `R$ ${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `R$ ${(v / 1000).toFixed(0)}K` : fmt(v);

const STATUS_STYLE = {
  "Ativo":        { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Pausado":      { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  "Cancelado":    { bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400" },
  "Não iniciado": { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400" },
};

export default function ProjetosDashboard({ data, loading }) {
  if (loading) return <SkeletonDashboard />;

  const { projetos = [], parcelas = [], entradas = [], alocacoes = [], riscos = [] } = data;

  // ── KPIs
  const ativos = projetos.filter(p => p.status === "Ativo").length;
  const concluidos = projetos.filter(p => p.percentual_conclusao === 100).length;
  const atrasados = projetos.filter(p =>
    p.prazo_previsto && new Date(p.prazo_previsto) < new Date() && (p.percentual_conclusao || 0) < 100
  ).length;
  const emRisco = riscos.filter(r => r.status === "Aberto" && r.impacto === "Crítico").length;
  const receitaTotal = parcelas.reduce((s, p) => s + (p.valor || 0), 0);
  const receitaFaturada = parcelas.filter(p => ["Faturada", "Recebida"].includes(p.status)).reduce((s, p) => s + (p.valor || 0), 0);
  const saldoFaturar = receitaTotal - receitaFaturada;
  const horasLancadas = entradas.reduce((s, e) => s + (e.horas || 0), 0);
  const horasFaturaveis = entradas.filter(e => e.faturavel).reduce((s, e) => s + (e.horas || 0), 0);

  // ── Status dos projetos (pie)
  const statusData = [
    { name: "Em Execução", value: projetos.filter(p => p.status === "Ativo").length, color: "#22C55E" },
    { name: "Iniciação", value: projetos.filter(p => p.status === "Não iniciado").length, color: "#94A3B8" },
    { name: "Pausado", value: projetos.filter(p => p.status === "Pausado").length, color: "#F59E0B" },
    { name: "Cancelado", value: projetos.filter(p => p.status === "Cancelado").length, color: "#EF4444" },
  ].filter(d => d.value > 0);

  // ── Por natureza (bar)
  const naturezaMap = {};
  projetos.forEach(p => { if (p.natureza) { const k = p.natureza.split(" - ")[1] || p.natureza; naturezaMap[k] = (naturezaMap[k] || 0) + 1; } });
  const naturezaData = Object.entries(naturezaMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  // ── Por responsável (bar)
  const respMap = {};
  projetos.forEach(p => { if (p.responsavel_tecnico) respMap[p.responsavel_tecnico] = (respMap[p.responsavel_tecnico] || 0) + 1; });
  const respData = Object.entries(respMap).map(([name, value]) => ({ name: name.split(" ")[0], value })).sort((a, b) => b.value - a.value).slice(0, 6);

  // ── Horas planejadas vs realizadas por projeto
  const horasData = projetos
    .filter(p => p.status === "Ativo")
    .map(p => {
      const realizadas = entradas.filter(e => e.os_id === p.id).reduce((s, e) => s + (e.horas || 0), 0);
      const planejadas = alocacoes.filter(a => a.projeto_id === p.id).reduce((s, a) => s + (a.horas_previstas || 0), 0);
      return { name: (p.cliente_nome || "").split(" ")[0], planejadas, realizadas };
    })
    .filter(d => d.planejadas > 0 || d.realizadas > 0)
    .slice(0, 6);

  // ── Parcelas previstas vs faturadas por mês
  const parcelaMesMap = {};
  parcelas.forEach(p => {
    if (!p.data_vencimento) return;
    const mes = p.data_vencimento.slice(0, 7);
    if (!parcelaMesMap[mes]) parcelaMesMap[mes] = { mes, previsto: 0, faturado: 0 };
    parcelaMesMap[mes].previsto += p.valor || 0;
    if (["Faturada", "Recebida"].includes(p.status)) parcelaMesMap[mes].faturado += p.valor || 0;
  });
  const parcelaData = Object.values(parcelaMesMap)
    .sort((a, b) => a.mes.localeCompare(b.mes))
    .slice(-6)
    .map(d => ({ ...d, mes: d.mes.slice(5, 7) + "/" + d.mes.slice(2, 4) }));

  // ── Evolução mensal receita (line)
  const receitaMesData = [...parcelaData];

  // ── Alertas críticos
  const alertas = [];
  projetos.filter(p => p.prazo_previsto && new Date(p.prazo_previsto) < new Date() && (p.percentual_conclusao || 0) < 100)
    .forEach(p => alertas.push({ tipo: "atraso", msg: `${p.cliente_nome} — prazo vencido`, link: `/ProjetoDetalhe?id=${p.id}` }));
  riscos.filter(r => r.status === "Aberto" && (r.impacto === "Crítico" || r.impacto === "Alto"))
    .slice(0, 3).forEach(r => alertas.push({ tipo: "risco", msg: r.descricao, link: null }));

  // ── Tabela projetos em andamento
  const tabelaProjetos = projetos
    .filter(p => ["Ativo", "Não iniciado"].includes(p.status))
    .sort((a, b) => (a.prazo_previsto || "").localeCompare(b.prazo_previsto || ""))
    .slice(0, 10);

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard de Projetos</h2>
        <p className="text-sm text-slate-400 mt-0.5">Visão executiva consolidada do portfólio ativo</p>
      </div>

      {/* KPIs Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={Briefcase}    color="green"  label="Projetos Ativos"     value={ativos}              sub={`${projetos.length} no portfólio`} />
        <KPICard icon={AlertTriangle} color="red"   label="Em Atraso"           value={atrasados}            sub="prazo vencido" />
        <KPICard icon={DollarSign}   color="teal"   label="Receita do Portfólio" value={fmtK(receitaTotal)}  sub={`Faturado: ${fmtK(receitaFaturada)}`} small />
        <KPICard icon={Clock}        color="purple" label="Horas Lançadas"      value={`${horasLancadas.toFixed(0)}h`} sub={`${horasFaturaveis.toFixed(0)}h faturáveis`} />
      </div>

      {/* KPIs Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={TrendingUp}    color="orange" label="Saldo a Faturar"    value={fmtK(saldoFaturar)}   sub="pendente de faturamento" small />
        <KPICard icon={CheckCircle2}  color="slate"  label="Concluídos"         value={concluidos}           sub="projetos encerrados" />
        <KPICard icon={AlertOctagon}  color="red"    label="Em Risco Crítico"   value={emRisco}              sub="riscos críticos abertos" />
        <KPICard icon={Activity}      color="blue"   label="Taxa de Conclusão"  value={`${projetos.length > 0 ? Math.round((concluidos / projetos.length) * 100) : 0}%`} sub="do portfólio" />
      </div>

      {/* Gráficos Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Pie */}
        <ChartCard title="Status dos Projetos" icon={BarChart3}>
          <div className="flex justify-center pt-2">
            <PieChart width={180} height={160}>
              <Pie data={statusData} cx={85} cy={75} innerRadius={42} outerRadius={70} dataKey="value" paddingAngle={2}>
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [v, "projetos"]} />
            </PieChart>
          </div>
          <div className="space-y-1.5 mt-1">
            {statusData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{d.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Por tipo de serviço */}
        <ChartCard title="Por Tipo de Serviço" icon={Briefcase}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={naturezaData} layout="vertical" margin={{ left: 0, right: 8 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={72} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1A4731" radius={[0, 4, 4, 0]} name="Projetos" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Por Responsável */}
        <ChartCard title="Projetos por Responsável" icon={Users}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={respData} layout="vertical" margin={{ left: 0, right: 8 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#F47920" radius={[0, 4, 4, 0]} name="Projetos" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Gráficos Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horas planejadas vs realizadas */}
        <ChartCard title="Horas Planejadas vs Realizadas" icon={Clock}>
          {horasData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={horasData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="planejadas" fill="#94A3B8" radius={[3, 3, 0, 0]} name="Planejadas" />
                <Bar dataKey="realizadas" fill="#1A4731" radius={[3, 3, 0, 0]} name="Realizadas" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="Nenhuma alocação registrada" />}
        </ChartCard>

        {/* Parcelas previstas vs faturadas */}
        <ChartCard title="Parcelas Previstas vs Faturadas" icon={DollarSign}>
          {parcelaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={parcelaData} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v) => [fmt(v)]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="previsto" fill="#CBD5E1" radius={[3, 3, 0, 0]} name="Previsto" />
                <Bar dataKey="faturado" fill="#22C55E" radius={[3, 3, 0, 0]} name="Faturado" />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="Nenhuma parcela cadastrada" />}
        </ChartCard>
      </div>

      {/* Evolução mensal de receita */}
      <ChartCard title="Evolução Mensal de Receita" icon={TrendingUp} fullWidth>
        {receitaMesData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={receitaMesData} margin={{ left: -10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}K`} />
              <Tooltip formatter={(v) => [fmt(v)]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="previsto" stroke="#94A3B8" strokeWidth={2} dot={false} name="Previsto" />
              <Line type="monotone" dataKey="faturado" stroke="#1A4731" strokeWidth={2.5} dot={{ r: 3, fill: "#1A4731" }} name="Faturado" />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyChart label="Sem dados de parcelas mensais" />}
      </ChartCard>

      {/* Alertas críticos */}
      {alertas.length > 0 && (
        <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-red-50 flex items-center gap-2">
            <AlertOctagon size={15} className="text-red-500" />
            <span className="text-sm font-semibold text-slate-700">Alertas Críticos do Portfólio</span>
            <span className="ml-auto text-xs text-red-500 font-medium">{alertas.length} alerta{alertas.length > 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {alertas.slice(0, 6).map((a, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3 hover:bg-red-50/40 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.tipo === "atraso" ? "bg-red-500" : "bg-amber-500"}`} />
                <span className="text-xs text-slate-700 flex-1">{a.msg}</span>
                {a.link && (
                  <Link to={a.link} className="text-xs text-[#F47920] hover:underline flex items-center gap-0.5">
                    Ver <ChevronRight size={11} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela projetos em andamento */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-slate-400" />
            <span className="text-sm font-semibold text-slate-700">Projetos em Andamento</span>
          </div>
          <Link to="/Projetos?tab=lista" className="text-xs text-[#F47920] hover:underline flex items-center gap-0.5">
            Ver todos <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {["Cliente", "Natureza", "Responsável", "Progresso", "Prazo", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tabelaProjetos.map(p => {
                const atrasado = p.prazo_previsto && new Date(p.prazo_previsto) < new Date() && (p.percentual_conclusao || 0) < 100;
                const s = STATUS_STYLE[p.status] || STATUS_STYLE["Não iniciado"];
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-4 py-3">
                      <Link to={`/ProjetoDetalhe?id=${p.id}`} className="text-sm font-medium text-slate-800 hover:text-[#1A4731] transition-colors">
                        {p.cliente_nome || "—"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.natureza || "—"}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{p.responsavel_tecnico || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${atrasado ? "bg-red-400" : "bg-[#1A4731]"}`} style={{ width: `${p.percentual_conclusao || 0}%` }} />
                        </div>
                        <span className={`text-xs font-medium ${atrasado ? "text-red-500" : "text-slate-500"}`}>{p.percentual_conclusao || 0}%</span>
                      </div>
                    </td>
                    <td className={`px-4 py-3 text-xs ${atrasado ? "text-red-500 font-semibold" : "text-slate-500"}`}>
                      {p.prazo_previsto ? new Date(p.prazo_previsto + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                      {atrasado && " ⚠"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/ProjetoDetalhe?id=${p.id}`}>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-[#1A4731] transition-colors" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {tabelaProjetos.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-sm text-slate-300">Nenhum projeto em andamento</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components

function KPICard({ icon: Icon, color, label, value, sub, small }) {
  const palette = {
    green:  { icon: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-100" },
    red:    { icon: "text-red-500",     bg: "bg-red-50",      border: "border-red-100" },
    teal:   { icon: "text-teal-600",    bg: "bg-teal-50",     border: "border-teal-100" },
    purple: { icon: "text-purple-600",  bg: "bg-purple-50",   border: "border-purple-100" },
    orange: { icon: "text-[#F47920]",   bg: "bg-orange-50",   border: "border-orange-100" },
    slate:  { icon: "text-slate-500",   bg: "bg-slate-100",   border: "border-slate-200" },
    blue:   { icon: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-100" },
  };
  const c = palette[color] || palette.blue;
  return (
    <div className={`bg-white rounded-xl border ${c.border} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={17} className={c.icon} />
        </div>
        <div className="min-w-0">
          <div className={`font-bold text-slate-900 leading-tight ${small ? "text-base" : "text-2xl"}`}>{value}</div>
          <div className="text-xs text-slate-600 mt-0.5 font-medium">{label}</div>
          {sub && <div className="text-[11px] text-slate-400 mt-0.5 truncate">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, icon: Icon, children, fullWidth }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${fullWidth ? "col-span-full" : ""}`}>
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <Icon size={14} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-slate-300">{label}</div>
  );
}

function SkeletonDashboard() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-6 w-48 bg-slate-200 rounded" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-slate-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="h-52 bg-slate-100 rounded-xl" />)}
      </div>
      <div className="h-52 bg-slate-100 rounded-xl" />
      <div className="h-64 bg-slate-100 rounded-xl" />
    </div>
  );
}