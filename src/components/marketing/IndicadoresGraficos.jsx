import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const dados_tendencias = {
  business_valuation: [
    { periodo: 'Jan', avaliacoes: 4, valor_medio: 2.8 },
    { periodo: 'Fev', avaliacoes: 6, valor_medio: 3.2 },
    { periodo: 'Mar', avaliacoes: 8, valor_medio: 3.5 },
    { periodo: 'Abr', avaliacoes: 5, valor_medio: 3.1 },
    { periodo: 'Mai', avaliacoes: 9, valor_medio: 3.8 },
    { periodo: 'Jun', avaliacoes: 11, valor_medio: 4.2 },
  ],
  contabil_fiscal: [
    { periodo: 'Jan', laudos: 12, receita: 45 },
    { periodo: 'Fev', laudos: 14, receita: 52 },
    { periodo: 'Mar', laudos: 16, receita: 58 },
    { periodo: 'Abr', laudos: 13, receita: 48 },
    { periodo: 'Mai', laudos: 18, receita: 65 },
    { periodo: 'Jun', laudos: 20, receita: 72 },
  ],
  ativos_fixos: [
    { periodo: 'Jan', ativos: 25, valor: 150 },
    { periodo: 'Fev', ativos: 28, valor: 165 },
    { periodo: 'Mar', ativos: 32, valor: 185 },
    { periodo: 'Abr', ativos: 30, valor: 175 },
    { periodo: 'Mai', ativos: 35, valor: 200 },
    { periodo: 'Jun', ativos: 38, valor: 220 },
  ],
  consultoria_estrategica: [
    { periodo: 'Jan', projetos: 3, receita: 120 },
    { periodo: 'Fev', projetos: 4, receita: 155 },
    { periodo: 'Mar', projetos: 5, receita: 185 },
    { periodo: 'Abr', projetos: 4, receita: 165 },
    { periodo: 'Mai', projetos: 6, receita: 225 },
    { periodo: 'Jun', projetos: 7, receita: 260 },
  ],
  ma: [
    { periodo: 'Jan', deals: 2, valor: 500 },
    { periodo: 'Fev', deals: 3, valor: 750 },
    { periodo: 'Mar', deals: 4, valor: 1200 },
    { periodo: 'Abr', deals: 3, valor: 900 },
    { periodo: 'Mai', deals: 5, valor: 1800 },
    { periodo: 'Jun', deals: 6, valor: 2100 },
  ],
  projetos_especiais: [
    { periodo: 'Jan', projetos: 5, valor: 200 },
    { periodo: 'Fev', projetos: 6, valor: 240 },
    { periodo: 'Mar', projetos: 7, valor: 280 },
    { periodo: 'Abr', projetos: 6, valor: 250 },
    { periodo: 'Mai', projetos: 8, valor: 320 },
    { periodo: 'Jun', projetos: 9, valor: 360 },
  ],
  financeiro: [
    { periodo: 'Jan', receita: 450, ticket: 3.2 },
    { periodo: 'Fev', receita: 520, ticket: 3.5 },
    { periodo: 'Mar', receita: 580, ticket: 3.8 },
    { periodo: 'Abr', receita: 510, ticket: 3.4 },
    { periodo: 'Mai', receita: 650, ticket: 4.2 },
    { periodo: 'Jun', receita: 720, ticket: 4.5 },
  ],
  capital_humano: [
    { periodo: 'Jan', colaboradores: 45, utilizacao: 78 },
    { periodo: 'Fev', colaboradores: 46, utilizacao: 82 },
    { periodo: 'Mar', colaboradores: 48, utilizacao: 85 },
    { periodo: 'Abr', colaboradores: 47, utilizacao: 80 },
    { periodo: 'Mai', colaboradores: 50, utilizacao: 88 },
    { periodo: 'Jun', colaboradores: 52, utilizacao: 90 },
  ],
  mercado_clientes: [
    { periodo: 'Jan', clientes: 28, conversao: 12 },
    { periodo: 'Fev', clientes: 31, conversao: 15 },
    { periodo: 'Mar', clientes: 35, conversao: 18 },
    { periodo: 'Abr', clientes: 32, conversao: 16 },
    { periodo: 'Mai', clientes: 40, conversao: 22 },
    { periodo: 'Jun', clientes: 45, conversao: 25 },
  ],
};

export default function IndicadoresGraficos({ selectedArea }) {
  const dados = dados_tendencias[selectedArea] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico 1 - Tendência Principal */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Tendência Mensal</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(dados[0] || {}).filter(k => k !== 'periodo').slice(0, 1).map(key => (
              <Line key={key} type="monotone" dataKey={key} stroke="#F47920" strokeWidth={2} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico 2 - Comparativo */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Análise Comparativa</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip />
            <Legend />
            {Object.keys(dados[0] || {}).filter(k => k !== 'periodo').map((key, idx) => (
              <Bar key={key} dataKey={key} fill={idx === 0 ? '#1A4731' : '#F47920'} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}