import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/ui/StatCard";
import VendasProjetosChart from "@/components/dashboards/VendasProjetosChart";

export default function DashboardProjetos() {
  const [proposals, setProposals] = useState([]);
  const [sales, setSales] = useState([]);
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposal.filter({ business_unit_id: "projetos" }),
      base44.entities.SalesTransaction.list(),
      base44.entities.AlocacaoHoras.list()
    ]).then(([prop, sal, aloc]) => {
      setProposals(prop || []);
      setSales(sal || []);
      setAllocations(aloc || []);
    });
  }, []);

  const projectsSales = sales.filter(s => s.business_unit_id === "projetos");
  const totalRevenue = projectsSales.reduce((sum, s) => sum + s.revenue_value, 0);
  const totalHours = allocations.reduce((sum, a) => sum + a.horas_executadas, 0);
  const utilizationRate = allocations.length > 0 
    ? ((allocations.reduce((sum, a) => sum + a.horas_executadas, 0) / allocations.reduce((sum, a) => sum + a.horas_previstas, 0)) * 100).toFixed(1)
    : 0;

  const projectDistribution = [
    { name: "Ativo", value: 28, color: "#1A4731" },
    { name: "Pausado", value: 4, color: "#F47920" },
    { name: "Finalizado", value: 42, color: "#245E40" }
  ];

  const monthlyMetrics = [
    { month: "Jan", horas: 480, receita: 55000, projetos: 12 },
    { month: "Fev", horas: 520, receita: 62000, projetos: 14 },
    { month: "Mar", horas: 495, receita: 58000, projetos: 13 },
    { month: "Abr", horas: 535, receita: 68000, projetos: 16 }
  ];

  const colors = ["#1A4731", "#F47920", "#245E40"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Receita Projetos" value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`} subLabel="YTD" trend={13} />
        <StatCard label="Horas Executadas" value={totalHours.toFixed(0)} subLabel="realizado" trend={7} />
        <StatCard label="Utilização" value={`${utilizationRate}%`} subLabel="vs planejado" />
        <StatCard label="Projetos Ativos" value="28" subLabel="em execução" trend={9} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
          <h3 className="text-sm font-semibold text-[#1A2B1F] mb-4">Horas e Receita Mensais</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" />
              <XAxis dataKey="month" stroke="#5C7060" />
              <YAxis stroke="#5C7060" />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #DDE3DE" }} />
              <Legend />
              <Bar dataKey="receita" fill="#1A4731" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
          <h3 className="text-sm font-semibold text-[#1A2B1F] mb-4">Status dos Projetos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={projectDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {projectDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #DDE3DE" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}