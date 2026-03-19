import { Card } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DADOS_RECEITA = [
  { mes: 'Jan', receita: 280, meta: 250 },
  { mes: 'Fev', receita: 290, meta: 260 },
  { mes: 'Mar', receita: 285, meta: 270 },
  { mes: 'Abr', receita: 310, meta: 280 },
  { mes: 'Mai', receita: 320, meta: 290 },
  { mes: 'Jun', receita: 340, meta: 300 }
];

const DADOS_CRESCIMENTO = [
  { mes: 'Jan', crescimento: 0, tendencia: 'estável' },
  { mes: 'Fev', crescimento: 3.6, tendencia: 'positiva' },
  { mes: 'Mar', crescimento: 1.7, tendencia: 'positiva' },
  { mes: 'Abr', crescimento: 8.8, tendencia: 'positiva' },
  { mes: 'Mai', crescimento: 3.2, tendencia: 'positiva' },
  { mes: 'Jun', crescimento: 6.2, tendencia: 'positiva' }
];

export default function TendenciasExecutivo({ filtros }) {
  const crescimentoMedio = (6.2).toFixed(1);
  const tendencia = 'Crescimento';

  return (
    <div className="space-y-6">
      {/* Indicadores de Tendência */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Crescimento Médio Mensal</p>
          <p className="text-2xl font-bold text-green-600">{crescimentoMedio}%</p>
          <p className="text-xs text-green-600 mt-1">↑ acelerado</p>
        </Card>

        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Projeção para Junho</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">R$ 360k</p>
          <p className="text-xs text-green-600 mt-1">+5.9% vs planejado</p>
        </Card>

        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Status da Empresa</p>
          <p className="text-2xl font-bold text-green-600">Expansão</p>
          <p className="text-xs text-green-600 mt-1">tendência positiva</p>
        </Card>
      </div>

      {/* Gráfico Receita */}
      <Card className="p-6 border-[var(--border)] bg-white">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Evolução de Receita ao Longo do Tempo (R$ mil)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={DADOS_RECEITA}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--apsis-green)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--apsis-green)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="receita"
              stroke="var(--apsis-green)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorReceita)"
              name="Receita Real"
            />
            <Line type="monotone" dataKey="meta" stroke="var(--apsis-orange)" strokeDasharray="5 5" name="Meta" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico Crescimento */}
      <Card className="p-6 border-[var(--border)] bg-white">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Taxa de Crescimento Mensal (%)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={DADOS_CRESCIMENTO}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="crescimento"
              stroke="var(--apsis-green)"
              strokeWidth={3}
              dot={{ fill: 'var(--apsis-green)', r: 5 }}
              name="Crescimento"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Análise Textual */}
      <Card className="p-6 border-[var(--border)] bg-blue-50">
        <h3 className="font-semibold text-[var(--text-primary)] mb-3">Análise da Tendência</h3>
        <ul className="space-y-2 text-sm text-[var(--text-primary)]">
          <li>✓ Empresa em fase de crescimento com 6.2% de aumento médio mensal</li>
          <li>✓ Trajetória consistente acima da meta estabelecida</li>
          <li>✓ Projeção positiva para os próximos períodos</li>
          <li>⚠ Atenção: Pico em Abril pode não se repetir em curto prazo</li>
        </ul>
      </Card>
    </div>
  );
}