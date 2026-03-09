import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/ui/StatCard";
import VendasTicketChart from "@/components/dashboards/VendasTicketChart";
import VendasPorGrupoTable from "@/components/dashboards/VendasPorGrupoTable";
import OrcadoRealizadoChart from "@/components/dashboards/OrcadoRealizadoChart";

export default function DashboardValuation() {
  const [proposals, setProposals] = useState([]);
  const [sales, setSales] = useState([]);
  const [budget, setBudget] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposal.filter({ business_unit_id: "valuation" }),
      base44.entities.SalesTransaction.list(),
      base44.entities.Budget.list()
    ]).then(([prop, sal, bud]) => {
      setProposals(prop || []);
      setSales(sal || []);
      setBudget(bud || []);
    });
  }, []);

  const valuationSales = sales.filter(s => s.business_unit_id === "valuation");
  const totalRevenue = valuationSales.reduce((sum, s) => sum + s.revenue_value, 0);
  const totalProposals = proposals.length;
  const wonProposals = proposals.filter(p => p.is_won).length;
  const conversionRate = totalProposals > 0 ? ((wonProposals / totalProposals) * 100).toFixed(1) : 0;

  const revenueByQuarter = [
    { quarter: "Q1", revenue: 45000, budget: 50000 },
    { quarter: "Q2", revenue: 52000, budget: 50000 },
    { quarter: "Q3", revenue: 38000, budget: 45000 },
    { quarter: "Q4", revenue: 61000, budget: 55000 }
  ];

  const pipelineStage = [
    { stage: "Qualificação", value: 120000 },
    { stage: "Proposta", value: 180000 },
    { stage: "Negociação", value: 240000 },
    { stage: "Fechamento", value: 90000 }
  ];

  const colors = ["#F47920", "#1A4731", "#245E40", "#F9A15A"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Receita Total" value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`} subLabel="YTD" trend={12} />
        <StatCard label="Propostas Ativas" value={totalProposals} subLabel="pipeline aberto" trend={8} />
        <StatCard label="Taxa Conversão" value={`${conversionRate}%`} subLabel="Won/Total" trend={5} />
        <StatCard label="Ticket Médio" value={`R$ ${totalProposals > 0 ? (totalRevenue / totalProposals / 1000).toFixed(0) : 0}k`} subLabel="por proposta" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
          <h3 className="text-sm font-semibold text-[#1A2B1F] mb-4">Receita vs Orçado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByQuarter}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" />
              <XAxis dataKey="quarter" stroke="#5C7060" />
              <YAxis stroke="#5C7060" />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #DDE3DE" }} />
              <Legend />
              <Bar dataKey="budget" fill="#1A4731" />
              <Bar dataKey="revenue" fill="#F47920" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
          <h3 className="text-sm font-semibold text-[#1A2B1F] mb-4">Pipeline por Estágio</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pipelineStage} dataKey="value" nameKey="stage" cx="50%" cy="50%" outerRadius={100}>
                {pipelineStage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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