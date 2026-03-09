import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";

export default function VendasTicketChart() {
  const data = [
    { period: "1º Trimestre", vendas2023: 3555, vendas2024: 2360, vendas2025: 5335, ticket2023: 42142, ticket2024: 65828, ticket2025: 80827 },
    { period: "2º Trimestre", vendas2023: 2394, vendas2024: 2578, vendas2025: 4172, ticket2023: 49868, ticket2024: 58593, ticket2025: 86921 },
    { period: "3º Trimestre", vendas2023: 2433, vendas2024: 3210, vendas2025: 6110, ticket2023: 49661, ticket2024: 58364, ticket2025: 95476 },
    { period: "4º Trimestre", vendas2023: 2813, vendas2024: 4678, vendas2025: 6326, ticket2023: 54096, ticket2024: 70876, ticket2025: 112965 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#1A2B1F] mb-1">Vendas e Ticket Médio</h3>
        <p className="text-xs text-[#5C7060]">Orçado: RS 13.800.000</p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" />
          <XAxis dataKey="period" stroke="#5C7060" angle={-45} textAnchor="end" height={80} />
          <YAxis yAxisId="left" stroke="#5C7060" />
          <YAxis yAxisId="right" orientation="right" stroke="#F47920" />
          <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #DDE3DE" }} />
          <Legend />
          <Bar yAxisId="left" dataKey="vendas2023" fill="#CCCCCC" name="Vendas 2023" />
          <Bar yAxisId="left" dataKey="vendas2024" fill="#1A4731" name="Vendas 2024" />
          <Bar yAxisId="left" dataKey="vendas2025" fill="#F47920" name="Vendas 2025" />
          <Line yAxisId="right" type="monotone" dataKey="ticket2023" stroke="#999999" name="Ticket 2023" />
          <Line yAxisId="right" type="monotone" dataKey="ticket2024" stroke="#1A4731" name="Ticket 2024" />
          <Line yAxisId="right" type="monotone" dataKey="ticket2025" stroke="#F47920" strokeWidth={2} name="Ticket 2025" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}