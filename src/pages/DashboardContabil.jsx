import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import StatCard from "@/components/ui/StatCard";
import VendasTicketContabilChart from "@/components/dashboards/VendasTicketContabilChart";

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

  const monthlyRevenue = [
    { month: "Jan", contabil: 28000, fiscal: 18000 },
    { month: "Fev", contabil: 31000, fiscal: 22000 },
    { month: "Mar", contabil: 35000, fiscal: 25000 },
    { month: "Abr", contabil: 32000, fiscal: 20000 }
  ];

  const serviceDistribution = [
    { name: "Contabilidade", value: 55 },
    { name: "Fiscal", value: 35 },
    { name: "Outros", value: 10 }
  ];

  const colors = ["#1A4731", "#F47920", "#245E40"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Receita Contábil" value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`} subLabel="YTD" trend={15} />
        <StatCard label="Clientes Ativos" value={activeClients} subLabel="base crescente" trend={12} />
        <StatCard label="Ticket Médio" value={`R$ ${(avgTicket / 1000).toFixed(0)}k`} subLabel="por cliente" trend={8} />
        <StatCard label="Propostas Ativas" value={proposals.length} subLabel="em negociação" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
          <h3 className="text-sm font-semibold text-[#1A2B1F] mb-4">Receita: Contabilidade vs Fiscal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" />
              <XAxis dataKey="month" stroke="#5C7060" />
              <YAxis stroke="#5C7060" />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #DDE3DE" }} />
              <Legend />
              <Bar dataKey="contabil" fill="#1A4731" />
              <Bar dataKey="fiscal" fill="#F47920" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
          <h3 className="text-sm font-semibold text-[#1A2B1F] mb-4">Distribuição de Serviços</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={serviceDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {serviceDistribution.map((entry, index) => (
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