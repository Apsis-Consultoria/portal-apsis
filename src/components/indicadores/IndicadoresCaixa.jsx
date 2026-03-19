import { Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import MetricCardAvancado from './MetricCardAvancado';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PROJECAO_CAIXA = [
  { mes: 'Ago', saldo: 1200 },
  { mes: 'Set', saldo: 1350 },
  { mes: 'Out', saldo: 1480 },
  { mes: 'Nov', saldo: 1580 },
  { mes: 'Dez', saldo: 1720 },
  { mes: 'Jan', saldo: 1890 }
];

export default function IndicadoresCaixa() {
  const diasCaixa = 85;
  const saldoProjetado = 1890;
  const gapFinanceiro = 0;
  const necessidadeCapital = 0;

  return (
    <div className="space-y-6">
      {/* KPIs Caixa */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCardAvancado
          icon={Calendar}
          label="Dias de Caixa"
          valor={diasCaixa}
          unidade="dias"
          variacao={{ valor: 12, label: 'vs mês anterior' }}
          tipo="positivo"
          tooltip="Quantos dias a empresa consegue se manter com o caixa disponível"
        />

        <MetricCardAvancado
          icon={TrendingUp}
          label="Saldo Projetado (6 meses)"
          valor={`R$ ${saldoProjetado / 1000}`}
          unidade="k"
          tipo="positivo"
          tooltip="Saldo de caixa estimado para o final do período"
        />

        <Card className="p-4 border-2 border-green-200 bg-green-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Gap Financeiro</p>
              <p className="text-2xl font-bold text-green-600">R$ 0</p>
              <p className="text-xs text-green-600 mt-1">Sem necessidade</p>
            </div>
            <AlertCircle className="w-8 h-8 text-green-600 opacity-40" />
          </div>
        </Card>

        <Card className="p-4 border-2 border-green-200 bg-green-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Necessidade Capital</p>
              <p className="text-2xl font-bold text-green-600">R$ 0</p>
              <p className="text-xs text-green-600 mt-1">Saudável</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600 opacity-40" />
          </div>
        </Card>
      </div>

      {/* Gráfico Projeção */}
      <Card className="p-6 border-[var(--border)] bg-white">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Projeção de Saldo de Caixa (R$ mil)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={PROJECAO_CAIXA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="var(--apsis-green)"
              strokeWidth={3}
              dot={{ fill: 'var(--apsis-green)', r: 5 }}
              name="Saldo Projetado"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Análise */}
      <Card className="p-4 border-[var(--border)] bg-green-50">
        <p className="text-sm text-green-900">
          <strong>Status:</strong> Empresa com saúde financeira sólida. Caixa pode cobrir 85 dias de operação. Projeção positiva para os próximos 6 meses sem necessidade de capital externo.
        </p>
      </Card>
    </div>
  );
}