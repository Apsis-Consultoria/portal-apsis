import { AlertTriangle, TrendingDown, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';

const RISCOS_MOCK = [
  {
    titulo: 'Projeto A - Risco Financeiro',
    descricao: 'Margem negativa estimada de -8%',
    severidade: 'crítico',
    impacto: 'R$ 45k'
  },
  {
    titulo: 'Cliente B - Inadimplência',
    descricao: 'Faturamento atrasado há 45 dias (R$ 120k)',
    severidade: 'crítico',
    impacto: 'R$ 120k'
  },
  {
    titulo: 'Concentração de Receita',
    descricao: '35% da receita de apenas 3 clientes',
    severidade: 'atencao',
    impacto: 'R$ 975k'
  },
  {
    titulo: 'Projeto C - Atraso Crítico',
    descricao: 'Atraso de 22 dias (estimativa de custo adicional)',
    severidade: 'atencao',
    impacto: 'R$ 12k'
  }
];

function RiscoCard({ titulo, descricao, severidade, impacto }) {
  const estilos = {
    crítico: 'border-red-300 bg-red-50',
    atencao: 'border-yellow-300 bg-yellow-50',
  };

  return (
    <Card className={`p-4 border-l-4 ${estilos[severidade]}`}>
      <div className="flex items-start gap-3">
        {severidade === 'crítico' ? (
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        ) : (
          <TrendingDown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${severidade === 'crítico' ? 'text-red-900' : 'text-yellow-900'}`}>
            {titulo}
          </h3>
          <p className={`text-xs mt-1 ${severidade === 'crítico' ? 'text-red-700' : 'text-yellow-700'}`}>
            {descricao}
          </p>
          <p className={`text-xs font-bold mt-2 ${severidade === 'crítico' ? 'text-red-600' : 'text-yellow-600'}`}>
            Impacto: {impacto}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function IndicadoresRisco() {
  const criticos = RISCOS_MOCK.filter(r => r.severidade === 'crítico').length;
  const avisos = RISCOS_MOCK.filter(r => r.severidade === 'atencao').length;

  return (
    <div className="space-y-6">
      {/* KPIs de Risco */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-2 border-red-200 bg-red-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Riscos Críticos</p>
              <p className="text-2xl font-bold text-red-600">{criticos}</p>
              <p className="text-xs text-red-600 mt-1">Ação imediata</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600 opacity-40" />
          </div>
        </Card>

        <Card className="p-4 border-2 border-yellow-200 bg-yellow-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Avisos</p>
              <p className="text-2xl font-bold text-yellow-600">{avisos}</p>
              <p className="text-xs text-yellow-600 mt-1">Monitorar</p>
            </div>
            <TrendingDown className="w-8 h-8 text-yellow-600 opacity-40" />
          </div>
        </Card>

        <Card className="p-4 border-2 border-slate-200 bg-slate-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Exposição Total</p>
              <p className="text-2xl font-bold text-slate-900">R$ 1.15M</p>
              <p className="text-xs text-slate-600 mt-1">Impacto financeiro</p>
            </div>
            <Users className="w-8 h-8 text-slate-600 opacity-40" />
          </div>
        </Card>
      </div>

      {/* Lista de Riscos */}
      <Card className="p-6 border-[var(--border)] bg-white">
        <h3 className="font-semibold text-[var(--text-primary)] mb-4">Riscos Identificados</h3>
        <div className="space-y-3">
          {RISCOS_MOCK.map((risco, idx) => (
            <RiscoCard key={idx} {...risco} />
          ))}
        </div>
      </Card>

      {/* Recomendação */}
      <Card className="p-4 border-[var(--border)] bg-blue-50">
        <p className="text-sm text-blue-900">
          <strong>Recomendação:</strong> Priorizar cobrança do Cliente B e replanejar Projeto A antes de comprometer margem operacional.
        </p>
      </Card>
    </div>
  );
}