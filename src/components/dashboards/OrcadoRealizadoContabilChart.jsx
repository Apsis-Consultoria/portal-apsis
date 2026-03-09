import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, ResponsiveContainer, Cell } from "recharts";

export default function OrcadoRealizadoContabilChart() {
  const data = [
    { grupo: "Consultoria Contábil & Fiscal", realizado: 2445, orcado: 2000, percentual: 122 },
    { grupo: "Contábil", realizado: 6070, orcado: 5750, percentual: 105 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <h3 className="text-lg font-bold text-[#1A2B1F] mb-4">Orçado x Realizado por Grupo de Serviço</h3>
      
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} margin={{ top: 20, right: 80, bottom: 20, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" />
          <XAxis 
            dataKey="grupo" 
            stroke="#5C7060"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            yAxisId="left"
            stroke="#5C7060" 
            label={{ value: "Milhões", angle: -90, position: "insideLeft" }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#F47920"
            domain={[95, 125]}
            label={{ value: "%", angle: 90, position: "insideRight" }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#FFF", border: "1px solid #DDE3DE" }}
            formatter={(value, name) => {
              if (name === "percentual") return `${value}%`;
              return value;
            }}
          />
          <Legend />
          
          <Bar yAxisId="left" dataKey="realizado" fill="#245E40" name="Realizado" />
          <Bar yAxisId="left" dataKey="orcado" fill="#999999" name="Orçado" />
          <Line yAxisId="right" type="monotone" dataKey="percentual" stroke="#F47920" strokeWidth={3} name="%" dot={{ fill: "#F47920", r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}