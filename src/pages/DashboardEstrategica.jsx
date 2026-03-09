import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import StatCard from "@/components/ui/StatCard";

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

  const monthlyGrowth = [
    { month: "Jan", faturado: 35000, pipeline: 120000 },
    { month: "Fev", faturado: 42000, pipeline: 145000 },
    { month: "Mar", faturado: 38000, pipeline: 165000 },
    { month: "Abr", faturado: 45000, pipeline: 180000 }
  ];

  const clientSegmentation = [
    { name: "Indústria", value: 40 },
    { name: "Comércio", value: 30 },
    { name: "Serviços", value: 30 }
  ];

  const colors = ["#1A4731", "#F47920", "#245E40"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Receita Estratégica" value={`R$ ${(totalRevenue / 1000).toFixed(0)}k`} subLabel="YTD" trend={18} />
        <StatCard label="Clientes Engajados" value={engagedClients} subLabel="relacionamentos" trend={14} />
        <StatCard label="Receita por Cliente" value={`R$ ${(avgEngagement / 1000).toFixed(0)}k`} subLabel="ticket" trend={9} />
        <StatCard label="Pipeline Aberto" value={`R$ ${(proposals.length * 50).toFixed(0)}k`} subLabel="próximos 6 meses" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
          <h3 className="text-sm font-semibold text-[#1A2B1F] mb-4">Faturado vs Pipeline</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" />
              <XAxis dataKey="month" stroke="#5C7060" />
              <YAxis stroke="#5C7060" />
              <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #DDE3DE" }} />
              <Legend />
              <Bar dataKey="faturado" fill="#1A4731" />
              <Bar dataKey="pipeline" fill="#F47920" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
          <h3 className="text-sm font-semibold text-[#1A2B1F] mb-4">Segmentação de Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={clientSegmentation} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                {clientSegmentation.map((entry, index) => (
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