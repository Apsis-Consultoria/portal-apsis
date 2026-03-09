import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/ui/StatCard";
import VendasTicketEstrategicaChart from "@/components/dashboards/VendasTicketEstrategicaChart";
import ClientesVolumeConversaoEstrategicaChart from "@/components/dashboards/ClientesVolumeConversaoEstrategicaChart";

export default function DashboardEstrategica() {
  const [proposals, setProposals] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposal.filter({ business_unit_id: "estrategica" }),
      base44.entities.SalesTransaction.list()
    ]).then(([prop, sal]) => {
      setProposals(prop || []);
      setSales(sal || []);
    });
  }, []);

  const estrategicaSales = sales.filter(s => s.business_unit_id === "estrategica");
  const totalRevenue = estrategicaSales.reduce((sum, s) => sum + s.revenue_value, 0);
  const engagedClients = new Set(estrategicaSales.map(s => s.client_id)).size;
  const avgEngagement = estrategicaSales.length > 0 ? (totalRevenue / engagedClients) : 0;



  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Receita Estratégica" value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`} subLabel="YTD" trend={18} />
        <StatCard label="Clientes Engajados" value={engagedClients} subLabel="relacionamentos" trend={14} />
        <StatCard label="Receita por Cliente" value={`R$ ${(avgEngagement / 1000).toFixed(0)}k`} subLabel="ticket" trend={9} />
        <StatCard label="Pipeline Aberto" value={`R$ ${(proposals.length * 50).toFixed(0)}k`} subLabel="próximos 6 meses" />
      </div>

      <VendasTicketEstrategicaChart />

      <ClientesVolumeConversaoEstrategicaChart />
    </div>
  );
}