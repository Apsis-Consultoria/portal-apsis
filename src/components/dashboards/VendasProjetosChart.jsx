import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function VendasProjetosChart() {
  const data = [
    { quarter: "1º Trimestre", vendas2023: 227, vendas2024: 0, vendas2025: 148, clientes2023: 1, clientes2024: 0, clientes2025: 2 },
    { quarter: "2º Trimestre", vendas2023: 500, vendas2024: 350, vendas2025: 1288, clientes2023: 1, clientes2024: 1, clientes2025: 3 },
    { quarter: "3º Trimestre", vendas2023: 70, vendas2024: 24, vendas2025: 106, clientes2023: 1, clientes2024: 0, clientes2025: 1 },
    { quarter: "4º Trimestre", vendas2023: 3299, vendas2024: 449, vendas2025: 10055, clientes2023: 1, clientes2024: 3, clientes2025: 5 },
    { quarter: "Total", vendas2023: 4096, vendas2024: 10429, vendas2025: 1990, clientes2023: 5, clientes2024: 6, clientes2025: 10, isTotal: true },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <h3 className="text-lg font-bold text-[#1A2B1F] mb-4">Vendas e Número de Clientes</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 80, bottom: 20, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" />
          <XAxis 
            dataKey="quarter" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            label={{ value: 'Vendas (Milhares)', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            label={{ value: 'Número de Clientes', angle: 90, position: 'insideRight' }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #DDE3DE', borderRadius: '8px' }}
            formatter={(value) => value}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="vendas2023" fill="#D3D3D3" name="2023 - Vendas" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="vendas2024" fill="#1A4731" name="2024 - Vendas" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="left" dataKey="vendas2025" fill="#F47920" name="2025 - Vendas" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="clientes2023" stroke="#D3D3D3" strokeWidth={2} name="2023 - Clientes" dot={{ fill: '#D3D3D3', r: 4 }} />
          <Line yAxisId="right" type="monotone" dataKey="clientes2024" stroke="#1A4731" strokeWidth={2} name="2024 - Clientes" dot={{ fill: '#1A4731', r: 4 }} />
          <Line yAxisId="right" type="monotone" dataKey="clientes2025" stroke="#F47920" strokeWidth={2} name="2025 - Clientes" dot={{ fill: '#F47920', r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}