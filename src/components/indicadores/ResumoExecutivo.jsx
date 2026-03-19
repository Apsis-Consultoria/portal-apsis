import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const DADOS_MOCK = {
  receita_total: { valor: 2850000, moeda: 'R$' },
  receita_mes: { valor: 285000, moeda: 'R$' },
  custos_totais: { valor: 1710000, moeda: 'R$' },
  margem: { valor: 40, moeda: '%' },
  resultado: { valor: 425000, moeda: 'R$', tipo: 'lucro' },
  crescimento: { valor: 12.5, moeda: '%', tipo: 'positivo' }
};

function MetricCard({ icon: Icon, label, valor, variacao, tipo = 'neutral' }) {
  const cores = {
    lucro: 'text-green-600',
    prejuizo: 'text-red-600',
    positivo: 'text-green-600',
    negativo: 'text-red-600',
    neutral: 'text-[var(--apsis-orange)]'
  };

  const bgCores = {
    lucro: 'bg-green-50',
    prejuizo: 'bg-red-50',
    positivo: 'bg-green-50',
    negativo: 'bg-red-50',
    neutral: 'bg-orange-50'
  };

  return (
    <Card className={`p-6 border-[var(--border)] ${bgCores[tipo]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-[var(--text-secondary)] font-medium mb-2">{label}</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{valor}</p>
          {variacao && (
            <div className="flex items-center gap-1 mt-2">
              {variacao.tipo === 'positivo' ? (
                <TrendingUp size={14} className="text-green-600" />
              ) : (
                <TrendingDown size={14} className="text-red-600" />
              )}
              <span className={`text-xs font-medium ${variacao.tipo === 'positivo' ? 'text-green-600' : 'text-red-600'}`}>
                {variacao.tipo === 'positivo' ? '+' : '-'}{variacao.valor}%
              </span>
            </div>
          )}
        </div>
        <Icon className={`w-10 h-10 ${cores[tipo]} opacity-30`} />
      </div>
    </Card>
  );
}

export default function ResumoExecutivo({ filtros }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        icon={DollarSign}
        label="Receita Total"
        valor={`${DADOS_MOCK.receita_total.moeda} ${(DADOS_MOCK.receita_total.valor / 1000000).toFixed(2)}M`}
        tipo="positivo"
      />

      <MetricCard
        icon={DollarSign}
        label="Receita do Mês"
        valor={`${DADOS_MOCK.receita_mes.moeda} ${(DADOS_MOCK.receita_mes.valor / 1000).toFixed(0)}k`}
        variacao={{ valor: 5.2, tipo: 'positivo' }}
        tipo="neutral"
      />

      <MetricCard
        icon={AlertCircle}
        label="Custos Totais"
        valor={`${DADOS_MOCK.custos_totais.moeda} ${(DADOS_MOCK.custos_totais.valor / 1000000).toFixed(2)}M`}
        variacao={{ valor: 2.1, tipo: 'negativo' }}
        tipo="neutral"
      />

      <MetricCard
        icon={Target}
        label="Margem Operacional"
        valor={`${DADOS_MOCK.margem.valor}${DADOS_MOCK.margem.moeda}`}
        tipo="positivo"
      />

      <MetricCard
        icon={DollarSign}
        label="Resultado Líquido"
        valor={`${DADOS_MOCK.resultado.moeda} ${(DADOS_MOCK.resultado.valor / 1000).toFixed(0)}k`}
        tipo="lucro"
      />

      <MetricCard
        icon={TrendingUp}
        label="Crescimento YoY"
        valor={`${DADOS_MOCK.crescimento.valor}${DADOS_MOCK.crescimento.moeda}`}
        tipo="positivo"
      />
    </div>
  );
}