import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase, DollarSign, AlertTriangle, CheckCircle2,
  TrendingUp, Clock, Users, Calendar, ChevronRight, Timer
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

const fmt = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ProjetosDashboard({ data, loading }) {
  if (loading) return <LoadingState />;

  const { projetos, parcelas, tarefas, entradas, riscos } = data;

  const totalAtivos = projetos.filter(p => p.status === "Ativo").length;
  const totalConcluidos = projetos.filter(p => p.percentual_conclusao === 100).length;
  const atrasados = projetos.filter(p =>
    p.prazo_previsto && new Date(p.prazo_previsto) < new Date() && p.percentual_conclusao < 100
  ).length;

  const receitaTotal = parcelas.reduce((s, p) => s + (p.valor || 0), 0);
  const receitaFaturada = parcelas.filter(p => ["Faturada", "Recebida"].includes(p.status))
    .reduce((s, p) => s + (p.valor || 0), 0);

  const horasTotais = entradas.reduce((s, e) => s + (e.horas || 0), 0);
  const riscosAbertos = riscos.filter(r => r.status === "Aberto").length;

  // Por status
  const statusData = [
    { name: "Ativo", value: projetos.filter(p => p.status === "Ativo").length, color: "#22C55E" },
    { name: "Pausado", value: projetos.filter(p => p.status === "Pausado").length, color: "#F59E0B" },
    { name: "Não iniciado", value: projetos.filter(p => p.status === "Não iniciado").length, color: "#94A3B8" },
    { name: "Cancelado", value: projetos.filter(p => p.status === "Cancelado").length, color: "#EF4444" },
  ].filter(d => d.value > 0);

  // Por natureza
  const naturezaMap = {};
  projetos.forEach(p => {
    if (p.natureza) naturezaMap[p.natureza] = (naturezaMap[p.natureza] || 0) + 1;
  });
  const naturezaData = Object.entries(naturezaMap).map(([name, value]) => ({ name: name.split(" - ")[1] || name, value }));

  // Projetos recentes com risco/atraso
  const destacados = projetos
    .filter(p => p.status === "Ativo" || p.status === "Não iniciado")
    .sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))
    .slice(0, 8);

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Briefcase} color="blue" title="Em Execução" value={totalAtivos} sub={`${projetos.length} total`} />
        <KPICard icon={DollarSign} color="green" title="Faturado" value={fmt(receitaFaturada)} sub={`de ${fmt(receitaTotal)}`} small />
        <KPICard icon={AlertTriangle} color="orange" title="Em Atraso" value={atrasados} sub={`${riscosAbertos} riscos abertos`} />
        <KPICard icon={Timer} color="purple" title="Horas Lançadas" value={`${horasTotais.toFixed(0)}h`} sub="total registrado" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projetos por status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Status dos Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-2">
              <PieChart width={160} height={140}>
                <Pie data={statusData} cx={75} cy={65} innerRadius={40} outerRadius={65} dataKey="value">
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
              </PieChart>
            </div>
            <div className="space-y-1.5">
              {statusData.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-600">{d.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Por natureza */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Por Tipo de Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={naturezaData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#1A4731" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Receita */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Receita do Portfólio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Faturado</span>
                <span className="font-semibold text-green-600">{fmt(receitaFaturada)}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${receitaTotal > 0 ? (receitaFaturada / receitaTotal) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Pendente</span>
                <span className="font-semibold text-amber-600">{fmt(receitaTotal - receitaFaturada)}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${receitaTotal > 0 ? ((receitaTotal - receitaFaturada) / receitaTotal) * 100 : 0}%` }} />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total portfólio</span>
                <span className="font-bold text-slate-800">{fmt(receitaTotal)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <div className="font-bold text-slate-800">{totalConcluidos}</div>
                <div className="text-slate-500">Concluídos</div>
              </div>
              <div className="bg-red-50 rounded-lg p-2 text-center">
                <div className="font-bold text-red-600">{atrasados}</div>
                <div className="text-slate-500">Com atraso</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projetos em destaque */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-700">Projetos em Andamento</CardTitle>
          <Link to="/Projetos?tab=busca" className="text-xs text-[#F47920] hover:underline flex items-center gap-1">
            Ver todos <ChevronRight size={12} />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Cliente</th>
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Natureza</th>
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Responsável</th>
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Progresso</th>
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Prazo</th>
                  <th className="text-left px-4 py-2.5 text-slate-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {destacados.map(p => {
                  const atrasado = p.prazo_previsto && new Date(p.prazo_previsto) < new Date() && p.percentual_conclusao < 100;
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                      <td className="px-4 py-2.5">
                        <Link to={`/ProjetoDetalhe?id=${p.id}`} className="font-medium text-slate-800 hover:text-[#1A4731]">
                          {p.cliente_nome || "—"}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{p.natureza || "—"}</td>
                      <td className="px-4 py-2.5 text-slate-600">{p.responsavel_tecnico || "—"}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${atrasado ? "bg-red-400" : "bg-[#1A4731]"}`} style={{ width: `${p.percentual_conclusao || 0}%` }} />
                          </div>
                          <span className={atrasado ? "text-red-500" : "text-slate-500"}>{p.percentual_conclusao || 0}%</span>
                        </div>
                      </td>
                      <td className={`px-4 py-2.5 ${atrasado ? "text-red-500 font-medium" : "text-slate-500"}`}>
                        {p.prazo_previsto ? new Date(p.prazo_previsto + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
                        {atrasado && <span className="ml-1">⚠</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KPICard({ icon: Icon, color, title, value, sub, small }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    green: "text-green-600 bg-green-50 border-green-200",
    orange: "text-[#F47920] bg-orange-50 border-orange-200",
    purple: "text-purple-600 bg-purple-50 border-purple-200",
  };
  return (
    <Card className={`border ${colors[color].split(" ").slice(2).join(" ")}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors[color].split(" ").slice(1, 2).join(" ")}`}>
            <Icon size={18} className={colors[color].split(" ")[0]} />
          </div>
          <div>
            <p className={`${small ? "text-base" : "text-xl"} font-bold text-slate-800`}>{value}</p>
            <p className="text-xs text-slate-500">{title}</p>
            {sub && <p className="text-xs text-slate-400">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }) {
  const map = {
    "Ativo": "bg-green-100 text-green-700",
    "Pausado": "bg-yellow-100 text-yellow-700",
    "Cancelado": "bg-red-100 text-red-700",
    "Não iniciado": "bg-slate-100 text-slate-600",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>;
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
    </div>
  );
}