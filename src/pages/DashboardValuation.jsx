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



  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Receita Total" value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`} subLabel="YTD" trend={12} />
        <StatCard label="Propostas Ativas" value={totalProposals} subLabel="pipeline aberto" trend={8} />
        <StatCard label="Taxa Conversão" value={`${conversionRate}%`} subLabel="Won/Total" trend={5} />
        <StatCard label="Ticket Médio" value={`R$ ${totalProposals > 0 ? (totalRevenue / totalProposals / 1000).toFixed(0) : 0}k`} subLabel="por proposta" />
      </div>

      <div className="space-y-6">
        <VendasTicketChart />
        <VendasPorGrupoTable />
        <OrcadoRealizadoChart />
      </div>
    </div>
  );
}