import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/ui/StatCard";
import VendasTicketAtivosChart from "@/components/dashboards/VendasTicketAtivosChart";
import ClientesPropostasConversaoAtivosChart from "@/components/dashboards/ClientesPropostasConversaoAtivosChart";
import AvaliacaoBensImoveisTable from "@/components/dashboards/AvaliacaoBensImoveisTable";
import AvaliacaoImoveisTable from "@/components/dashboards/AvaliacaoImoveisTable";
import InventarioConciliacaoTable from "@/components/dashboards/InventarioConciliacaoTable";

export default function DashboardAtivos() {
  const [proposals, setProposals] = useState([]);
  const [sales, setSales] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposal.filter({ business_unit_id: "ativos" }),
      base44.entities.SalesTransaction.list()
    ]).then(([prop, sal]) => {
      setProposals(prop || []);
      setSales(sal || []);
    });
  }, []);

  const ativosSales = sales.filter(s => s.business_unit_id === "ativos");
  const totalRevenue = ativosSales.reduce((sum, s) => sum + s.revenue_value, 0);
  const totalProposals = proposals.length;
  const avgValue = totalProposals > 0 ? (totalRevenue / totalProposals) : 0;

  const quarterlyPerformance = [
    { quarter: "Q1", receita: 45000, clientes: 8, projetos: 12 },
    { quarter: "Q2", receita: 52000, clientes: 10, projetos: 14 },
    { quarter: "Q3", receita: 38000, clientes: 7, projetos: 10 },
    { quarter: "Q4", receita: 61000, clientes: 12, projetos: 16 }
  ];

  const projectStatus = [
    { status: "Ativo", count: 18 },
    { status: "Finalizado", count: 35 },
    { status: "Suspenso", count: 4 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Receita Ativos" value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`} subLabel="YTD" trend={10} />
        <StatCard label="Projetos Ativos" value="18" subLabel="em execução" trend={6} />
        <StatCard label="Valor Médio Projeto" value={`R$ ${(avgValue / 1000).toFixed(0)}k`} subLabel="ticket médio" />
        <StatCard label="Taxa Conclusão" value="89%" subLabel="histórico" trend={4} />
      </div>

      <VendasTicketAtivosChart />

      <ClientesPropostasConversaoAtivosChart />

      <AvaliacaoBensImoveisTable />

      <AvaliacaoImoveisTable />

      <InventarioConciliacaoTable />
    </div>
  );
}