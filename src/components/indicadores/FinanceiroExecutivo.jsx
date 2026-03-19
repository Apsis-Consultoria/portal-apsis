import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DADOS_FLUXO = [
  { mes: 'Jan', entradas: 280, saidas: 168 },
  { mes: 'Fev', entradas: 290, saidas: 170 },
  { mes: 'Mar', entradas: 285, saidas: 175 },
  { mes: 'Abr', entradas: 310, saidas: 180 },
  { mes: 'Mai', entradas: 320, saidas: 185 },
  { mes: 'Jun', entradas: 340, saidas: 190 }
];

const DADOS_EVOLUCAO = [
  { mes: 'Jan', receita: 280, meta: 250 },
  { mes: 'Fev', receita: 290, meta: 260 },
  { mes: 'Mar', receita: 285, meta: 270 },
  { mes: 'Abr', receita: 310, meta: 280 },
  { mes: 'Mai', receita: 320, meta: 290 },
  { mes: 'Jun', receita: 340, meta: 300 }
];

export default function FinanceiroExecutivo({ filtros }) {
  return (
    <div className="space-y-6">
      {/* KPIs Financeiros */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Contas a Receber</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">R$ 640k</p>
          <p className="text-xs text-orange-600 mt-1">8% a vencer</p>
        </Card>

        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Contas a Pagar</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">R$ 420k</p>
          <p className="text-xs text-green-600 mt-1">Saudável</p>
        </Card>

        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Inadimplência</p>
          <p className="text-2xl font-bold text-[var(--text-primary)]">2.3%</p>
          <p className="text-xs text-green-600 mt-1">↓ 0.8%</p>
        </Card>

        <Card className="p-4 border-[var(--border)] bg-white">
          <p className="text-xs text-[var(--text-secondary)] mb-1">Caixa</p>
          <p className="text-2xl font-bold text-green-600">R$ 1.2M</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">↑ 15%</p>
        </Card>
      </div>

      {/* Gráfico Fluxo */}
      <Card className="p-6 border-[var(--border)] bg-white">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Fluxo de Caixa</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={DADOS_FLUXO}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="entradas" fill="var(--apsis-green)" name="Entradas (R$ mil)" />
            <Bar dataKey="saidas" fill="var(--apsis-orange)" name="Saídas (R$ mil)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico Evolução */}
      <Card className="p-6 border-[var(--border)] bg-white">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Evolução Mensal de Receita</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={DADOS_EVOLUCAO}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="receita" stroke="var(--apsis-green)" strokeWidth={2} name="Receita Real" />
            <Line type="monotone" dataKey="meta" stroke="var(--apsis-orange)" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}