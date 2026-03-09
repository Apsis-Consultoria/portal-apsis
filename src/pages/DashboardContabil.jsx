import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/ui/StatCard";
import VendasTicketContabilChart from "@/components/dashboards/VendasTicketContabilChart";
import LaudosContabeisTable from "@/components/dashboards/LaudosContabeisTable";
import ConsultoriaContabilFiscalTable from "@/components/dashboards/ConsultoriaContabilFiscalTable";

export default function DashboardContabil() {
  const [proposals, setProposals] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposal.filter({ business_unit_id: "contabil" }),
      base44.entities.SalesTransaction.list()
    ]).then(([prop, sal]) => {
      setProposals(prop || []);
      setSales(sal || []);
    });
  }, []);

  const contabilSales = sales.filter(s => s.business_unit_id === "contabil");
  const totalRevenue = contabilSales.reduce((sum, s) => sum + s.revenue_value, 0);
  const activeClients = new Set(contabilSales.map(s => s.client_id)).size;
  const avgTicket = contabilSales.length > 0 ? (totalRevenue / contabilSales.length) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Receita Contábil" value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`} subLabel="YTD" trend={15} />
        <StatCard label="Clientes Ativos" value={activeClients} subLabel="base crescente" trend={12} />
        <StatCard label="Ticket Médio" value={`R$ ${(avgTicket / 1000).toFixed(0)}k`} subLabel="por cliente" trend={8} />
        <StatCard label="Propostas Ativas" value={proposals.length} subLabel="em negociação" />
      </div>

      <VendasTicketContabilChart />

      <ConsultoriaContabilFiscalTable />

      <LaudosContabeisTable />
    </div>
  );
}