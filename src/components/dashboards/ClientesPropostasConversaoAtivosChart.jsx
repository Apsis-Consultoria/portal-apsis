import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function ClientesPropostasConversaoAtivosChart() {
  const data = [
    { periodo: "1º Trimestre 2023", volume: 110, clientes: 41, taxa: 32 },
    { periodo: "2º Trimestre 2023", volume: 91, clientes: 22, taxa: 29 },
    { periodo: "3º Trimestre 2023", volume: 114, clientes: 39, taxa: 34 },
    { periodo: "4º Trimestre 2023", volume: 117, clientes: 66, taxa: 45 },
    { periodo: "1º Trimestre 2024", volume: 123, clientes: 30, taxa: 30 },
    { periodo: "2º Trimestre 2024", volume: 131, clientes: 47, taxa: 37 },
    { periodo: "3º Trimestre 2024", volume: 154, clientes: 50, taxa: 37 },
    { periodo: "4º Trimestre 2024", volume: 104, clientes: 67, taxa: 44 },
    { periodo: "1º Trimestre 2025", volume: 131, clientes: 49, taxa: 37 },
    { periodo: "2º Trimestre 2025", volume: 154, clientes: 45, taxa: 66 },
    { periodo: "3º Trimestre 2025", volume: 154, clientes: 35, taxa: 29 },
    { periodo: "4º Trimestre 2025", volume: 166, clientes: 62, taxa: 45 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <h3 className="text-lg font-bold text-[#1A2B1F] mb-4">Clientes, Volume de Propostas e Taxa de Conversão</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 80, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" />
          <XAxis 
            dataKey="periodo" 
            stroke="#5C7060"
            tick={{ fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            yAxisId="left"
            stroke="#5C7060"
            label={{ value: "Volume / Clientes", angle: -90, position: "insideLeft" }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#F47920"
            domain={[0, 70]}
            label={{ value: "Taxa %", angle: 90, position: "insideRight" }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: "#FFF", border: "1px solid #DDE3DE" }}
            formatter={(value) => value.toLocaleString()}
          />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          
          <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#245E40" strokeWidth={2.5} name="Volume (por data de criação)" dot={false} />
          <Line yAxisId="left" type="monotone" dataKey="clientes" stroke="#999999" strokeWidth={2} strokeDasharray="5 5" name="Nº de Clientes" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="taxa" stroke="#F47920" strokeWidth={2.5} name="Taxa de Conversão" dot={false} />
        </LineChart>
      </ResponsiveContainer>
      
      <p className="text-xs text-[#5C7060] mt-4">
        *Apenas a base de volume considera por data de criação de proposta, Nº de cliente e taxa de conversão está considerando data de Aceite ou Perda, portanto o cálculo da taxa de conversão é ganha/total de ganhas e perdidas no período.
      </p>
    </div>
  );
}