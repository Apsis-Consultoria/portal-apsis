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



  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Receita Projetos" value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`} subLabel="YTD" trend={13} />
        <StatCard label="Horas Executadas" value={totalHours.toFixed(0)} subLabel="realizado" trend={7} />
        <StatCard label="Utilização" value={`${utilizationRate}%`} subLabel="vs planejado" />
        <StatCard label="Projetos Ativos" value="28" subLabel="em execução" trend={9} />
      </div>

      <VendasProjetosChart />
    </div>
  );
}