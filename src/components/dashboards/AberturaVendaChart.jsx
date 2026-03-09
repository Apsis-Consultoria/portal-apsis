import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function AberturaVendaChart() {
  const data = [
    { tipo: "Demanda Passiva", valor: 15653, peso: 34 },
    { tipo: "Indicação Externa\n(Empresa ou Gestora de FIPs)", valor: 9633, peso: 21 },
    { tipo: "Esforço de Colaborador", valor: 8856, peso: 19 },
    { tipo: "Escritório de Advocacia", valor: 7193, peso: 16 },
    { tipo: "Executivo de Conta", valor: 2525, peso: 6 },
    { tipo: "Site - Apsis", valor: 1579, peso: 3 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#DDE3DE] rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm text-[#1A2B1F]">{data.tipo}</p>
          <p className="text-xs text-[#5C7060]">R$ {data.valor.toLocaleString('pt-BR')}</p>
          <p className="text-xs font-medium text-[#F47920]">{data.peso}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#1A2B1F] mb-1">Abertura por Tipo de Venda</h3>
        <p className="text-sm text-[#5C7060]">Peso</p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data} margin={{ top: 20, right: 80, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DDE3DE" vertical={false} />
          <XAxis 
            dataKey="tipo" 
            tick={{ fontSize: 11, fill: "#5C7060" }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis 
            yAxisId="left"
            label={{ value: 'Milhares', angle: -90, position: 'insideLeft' }}
            tick={{ fontSize: 12, fill: "#5C7060" }}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right"
            label={{ value: 'Peso (%)', angle: 90, position: 'insideRight' }}
            tick={{ fontSize: 12, fill: "#5C7060" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Bar yAxisId="left" dataKey="valor" fill="#1A4731" name="Valor (R$ Milhares)" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="peso" stroke="#F47920" strokeWidth={3} name="Peso (%)" dot={{ fill: '#F47920', r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}