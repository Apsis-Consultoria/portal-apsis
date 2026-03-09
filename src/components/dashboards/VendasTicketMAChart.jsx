import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function VendasTicketMAChart() {
  const data = [
    { quarter: "1º Trimestre", vendas2024: 65000, vendas2025: 40000, ticket2024: 13333, ticket2025: 65000 },
    { quarter: "2º Trimestre", vendas2024: 35000, vendas2025: 150000, ticket2024: 35000, ticket2025: 75000 },
    { quarter: "3º Trimestre", vendas2024: 0, vendas2025: 150000, ticket2024: 0, ticket2025: 10667 },
    { quarter: "4º Trimestre", vendas2024: 126500, vendas2025: 32000, ticket2024: 42167, ticket2025: 30834 },
    { quarter: "Total", vendas2024: 226500, vendas2025: 372000, ticket2024: 33818, ticket2025: 37750, isTotal: true },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <h3 className="text-lg font-bold text-[#1A2B1F] mb-4">Vendas e Ticket Médio</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 80, bottom: 20, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" />
          <XAxis 
            dataKey="quarter" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            label={{ value: 'Vendas (R$)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            label={{ value: 'Ticket Médio', angle: 90, position: 'insideRight' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #DDE3DE', borderRadius: '8px' }}
            formatter={(value) => value.toLocaleString('pt-BR')}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="vendas2024" fill="#1A4731" name="2024 - Vendas" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="vendas2025" fill="#F47920" name="2025 - Vendas" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="ticket2024" stroke="#1A4731" strokeWidth={2} name="2024 - Ticket Médio" dot={{ fill: '#1A4731', r: 4 }} />
          <Line yAxisId="right" type="monotone" dataKey="ticket2025" stroke="#F47920" strokeWidth={2} name="2025 - Ticket Médio" dot={{ fill: '#F47920', r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}