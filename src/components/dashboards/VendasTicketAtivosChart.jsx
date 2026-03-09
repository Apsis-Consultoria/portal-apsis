import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ResponsiveContainer, Cell } from "recharts";

export default function VendasTicketAtivosChart() {
  const data = [
    { trimestre: "1º trimestre", vendas2023: 1971, vendas2024: 1066, vendas2025: 3596, ticket2023: 35541, ticket2024: 48083, ticket2025: 73396 },
    { trimestre: "2º trimestre", vendas2023: 1579, vendas2024: 2015, vendas2025: 2590, ticket2023: 42880, ticket2024: 57557, ticket2025: 71769 },
    { trimestre: "3º trimestre", vendas2023: 2289, vendas2024: 1507, vendas2025: 1819, ticket2023: 30144, ticket2024: 51977, ticket2025: 58702 },
    { trimestre: "4º trimestre", vendas2023: 2815, vendas2024: 2823, vendas2025: 3328, ticket2023: 42135, ticket2024: 53677, ticket2025: 42837 },
    { trimestre: "Total", vendas2023: 8655, vendas2024: 7412, vendas2025: 11334, ticket2023: 38205, ticket2024: 51518, ticket2025: 59338 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <h3 className="text-lg font-bold text-[#1A2B1F] mb-4">Vendas e Ticket Médio</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 80, bottom: 40, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" />
          <XAxis 
            dataKey="trimestre" 
            stroke="#5C7060"
            tick={{ fontSize: 12 }}
            angle={-15}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            yAxisId="left"
            stroke="#5C7060" 
            label={{ value: "Milhares", angle: -90, position: "insideLeft" }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#5C7060"
            label={{ value: "Ticket", angle: 90, position: "insideRight" }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#FFF", border: "1px solid #DDE3DE" }}
            formatter={(value) => value.toLocaleString()}
          />
          <Legend />
          
          <Bar yAxisId="left" dataKey="vendas2023" fill="#999999" name="2023" />
          <Bar yAxisId="left" dataKey="vendas2024" fill="#245E40" name="2024" />
          <Bar yAxisId="left" dataKey="vendas2025" fill="#F47920" name="2025" />
          
          <Line yAxisId="right" type="monotone" dataKey="ticket2023" stroke="#999999" strokeWidth={2} strokeDasharray="5 5" name="Ticket 2023" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="ticket2024" stroke="#245E40" strokeWidth={2} name="Ticket 2024" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="ticket2025" stroke="#F47920" strokeWidth={2} name="Ticket 2025" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}