import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from "recharts";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

const fmt = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

export default function ProjetosBudget({ data, loading }) {
  const [filtroOS, setFiltroOS] = useState("todos");

  const { projetos, parcelas, entradas } = data;

  const getValorOS = (osId) => parcelas.filter(p => p.os_id === osId).reduce((s, p) => s + (p.valor || 0), 0);
  const getFaturadoOS = (osId) => parcelas.filter(p => p.os_id === osId && ["Faturada", "Recebida"].includes(p.status)).reduce((s, p) => s + (p.valor || 0), 0);
  const getHorasOS = (osId) => entradas.filter(e => e.os_id === osId).reduce((s, e) => s + (e.horas || 0), 0);

  const osFiltradas = filtroOS === "todos" ? projetos : projetos.filter(p => p.id === filtroOS);

  const receitaTotal = osFiltradas.reduce((s, p) => s + getValorOS(p.id), 0);
  const receitaRealizada = osFiltradas.reduce((s, p) => s + getFaturadoOS(p.id), 0);
  const receitaPendente = receitaTotal - receitaRealizada;

  // Dados por projeto para gráfico
  const chartData = projetos
    .filter(p => getValorOS(p.id) > 0)
    .slice(0, 12)
    .map(p => ({
      name: (p.cliente_nome || "").split(" ")[0],
      orcado: getValorOS(p.id),
      realizado: getFaturadoOS(p.id),
    }));

  // Parcelas por mês
  const parcelasPorMes = {};
  parcelas.forEach(p => {
    if (!p.data_vencimento) return;
    const key = p.data_vencimento.substring(0, 7);
    if (!parcelasPorMes[key]) parcelasPorMes[key] = { mes: key, previsto: 0, realizado: 0 };
    parcelasPorMes[key].previsto += p.valor || 0;
    if (["Faturada", "Recebida"].includes(p.status)) parcelasPorMes[key].realizado += p.valor || 0;
  });
  const tendencia = Object.values(parcelasPorMes).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-12);

  return (
    <div className="p-6 space-y-6">
      {/* Filtro */}
      <div className="flex items-center gap-4">
        <Select value={filtroOS} onValueChange={setFiltroOS}>
          <SelectTrigger className="w-64 h-9">
            <SelectValue placeholder="Todos os projetos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os projetos</SelectItem>
            {projetos.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.cliente_nome} {p.proposta_numero ? `— ${p.proposta_numero}` : ""}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign size={22} className="text-blue-500" />
              <div>
                <p className="text-lg font-bold text-slate-800">{fmt(receitaTotal)}</p>
                <p className="text-xs text-slate-400">Orçamento Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp size={22} className="text-green-500" />
              <div>
                <p className="text-lg font-bold text-slate-800">{fmt(receitaRealizada)}</p>
                <p className="text-xs text-slate-400">Faturado ({receitaTotal > 0 ? Math.round(receitaRealizada / receitaTotal * 100) : 0}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown size={22} className="text-[#F47920]" />
              <div>
                <p className="text-lg font-bold text-slate-800">{fmt(receitaPendente)}</p>
                <p className="text-xs text-slate-400">Saldo Pendente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real vs Planejado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Real vs Planejado por Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="orcado" fill="#CBD5E1" name="Orçado" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="realizado" fill="#1A4731" name="Realizado" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-300 text-sm">Sem dados de parcelas</div>
            )}
          </CardContent>
        </Card>

        {/* Tendência mensal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Receita Mensal — Previsto vs Realizado</CardTitle>
          </CardHeader>
          <CardContent>
            {tendencia.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={tendencia}>
                  <XAxis dataKey="mes" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="previsto" stroke="#CBD5E1" strokeWidth={2} name="Previsto" dot={false} />
                  <Line type="monotone" dataKey="realizado" stroke="#1A4731" strokeWidth={2} name="Realizado" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-300 text-sm">Sem dados históricos</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela por projeto */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Budget por Projeto</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Projeto</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Orçado</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Faturado</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Saldo</th>
                  <th className="text-left px-4 py-3 text-slate-500 font-medium">Execução</th>
                  <th className="text-right px-4 py-3 text-slate-500 font-medium">Horas</th>
                </tr>
              </thead>
              <tbody>
                {osFiltradas.filter(p => getValorOS(p.id) > 0).map(p => {
                  const orcado = getValorOS(p.id);
                  const fat = getFaturadoOS(p.id);
                  const saldo = orcado - fat;
                  const perc = orcado > 0 ? (fat / orcado) * 100 : 0;
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{p.cliente_nome || "—"}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{fmt(orcado)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-semibold">{fmt(fat)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${saldo < 0 ? "text-red-500" : "text-slate-600"}`}>{fmt(saldo)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#1A4731] rounded-full" style={{ width: `${Math.min(100, perc)}%` }} />
                          </div>
                          <span className="text-slate-500">{perc.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">{getHorasOS(p.id).toFixed(0)}h</td>
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