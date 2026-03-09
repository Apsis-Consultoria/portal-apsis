import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/ui/StatCard";
import VendasTicketMAChart from "@/components/dashboards/VendasTicketMAChart";

export default function DashboardMA() {
  const [proposals, setProposals] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposal.filter({ business_unit_id: "ma" }),
      base44.entities.SalesTransaction.list()
    ]).then(([prop, sal]) => {
      setProposals(prop || []);
      setSales(sal || []);
    });
  }, []);

  const maSales = sales.filter(s => s.business_unit_id === "ma");
  const totalRevenue = maSales.reduce((sum, s) => sum + s.revenue_value, 0);
  const avgDealSize = maSales.length > 0 ? (totalRevenue / maSales.length) : 0;
  const winRate = proposals.length > 0 ? ((proposals.filter(p => p.is_won).length / proposals.length) * 100).toFixed(1) : 0;

  const dealPipeline = [
    { stage: "Prospecção", value: 500000 },
    { stage: "Apresentação", value: 800000 },
    { stage: "Negociação", value: 1200000 },
    { stage: "Finalização", value: 600000 }
  ];

  const dealTimeline = [
    { month: "Jan", volume: 1, value: 180000 },
    { month: "Fev", value: 220000, volume: 1 },
    { month: "Mar", value: 280000, volume: 2 },
    { month: "Abr", value: 350000, volume: 1 }
  ];

  const colors = ["#1A4731", "#F47920", "#245E40", "#F9A15A"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Receita M&A" value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`} subLabel="YTD" trend={22} />
        <StatCard label="Deals Ativos" value={proposals.length} subLabel="em pipeline" trend={16} />
        <StatCard label="Ticket Médio Deal" value={`R$ ${(avgDealSize / 1000).toFixed(0)}k`} subLabel="valor médio" />
        <StatCard label="Win Rate" value={`${winRate}%`} subLabel="taxa sucesso" trend={11} />
      </div>

      <VendasTicketMAChart />
    </div>
  );
}