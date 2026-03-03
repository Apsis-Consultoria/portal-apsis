import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, TrendingUp, Activity, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { mes: "Jan", aprovadas: 18, reprovadas: 2, pendentes: 1 },
  { mes: "Fev", aprovadas: 20, reprovadas: 1, pendentes: 2 },
  { mes: "Mar", aprovadas: 16, reprovadas: 3, pendentes: 4 },
];

export default function DashboardQualidade() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevisoes: 0,
    aprovadas: 0,
    reprovadas: 0,
    pendentes: 0
  });

  useEffect(() => {
    setStats({
      totalRevisoes: 24,
      aprovadas: 18,
      reprovadas: 2,
      pendentes: 4
    });
    setLoading(false);
  }, []);

  if (loading) return <div className="text-center py-12 text-[#5C7060]">Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#DDE3DE]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#5C7060]">Total de Revisões</CardTitle>
            <Activity className="h-4 w-4 text-[#F47920]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A2B1F]">{stats.totalRevisoes}</div>
            <p className="text-xs text-[#5C7060]">Este período</p>
          </CardContent>
        </Card>

        <Card className="border-[#DDE3DE]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#5C7060]">Aprovadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A2B1F]">{stats.aprovadas}</div>
            <p className="text-xs text-[#5C7060]">{((stats.aprovadas / stats.totalRevisoes) * 100).toFixed(0)}% de aprovação</p>
          </CardContent>
        </Card>

        <Card className="border-[#DDE3DE]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#5C7060]">Reprovadas</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A2B1F]">{stats.reprovadas}</div>
            <p className="text-xs text-[#5C7060]">Requer ação</p>
          </CardContent>
        </Card>

        <Card className="border-[#DDE3DE]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#5C7060]">Pendentes</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#1A2B1F]">{stats.pendentes}</div>
            <p className="text-xs text-[#5C7060]">Aguardando revisão</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="border-[#DDE3DE]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#F47920]" />
            <CardTitle className="text-[#1A2B1F]">Tendência de Revisões</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={20} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#5C7060" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#5C7060" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #DDE3DE", fontSize: 12 }} />
              <Bar dataKey="aprovadas" name="Aprovadas" fill="#22C55E" radius={[4,4,0,0]} />
              <Bar dataKey="reprovadas" name="Reprovadas" fill="#EF4444" radius={[4,4,0,0]} />
              <Bar dataKey="pendentes" name="Pendentes" fill="#F47920" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}