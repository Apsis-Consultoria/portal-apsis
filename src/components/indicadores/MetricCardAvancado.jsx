import { TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export default function MetricCardAvancado({ icon: Icon, label, valor, unidade = '', variacao = null, tipo = 'neutral', tooltip = null }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const cores = {
    positivo: { bg: 'bg-green-50', border: 'border-green-200', texto: 'text-green-600', icone: 'text-green-600' },
    negativo: { bg: 'bg-red-50', border: 'border-red-200', texto: 'text-red-600', icone: 'text-red-600' },
    atencao: { bg: 'bg-yellow-50', border: 'border-yellow-200', texto: 'text-yellow-600', icone: 'text-yellow-600' },
    neutro: { bg: 'bg-slate-50', border: 'border-slate-200', texto: 'text-slate-600', icone: 'text-slate-600' }
  };

  const estilo = cores[tipo] || cores.neutro;
  const variacaoTipo = variacao?.valor > 0 ? 'positiva' : 'negativa';

  return (
    <Card className={`p-4 border-2 ${estilo.bg} ${estilo.border} relative`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs text-[var(--text-secondary)] font-medium">{label}</p>
            {tooltip && (
              <div className="relative">
                <button
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  className="opacity-50 hover:opacity-100"
                >
                  <HelpCircle size={14} className={estilo.icone} />
                </button>
                {showTooltip && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-900 text-white text-xs rounded shadow-lg z-10">
                    {tooltip}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <p className="text-2xl font-bold text-[var(--text-primary)]">
            {valor}{unidade && <span className="text-lg ml-1">{unidade}</span>}
          </p>
          
          {variacao && (
            <div className="flex items-center gap-1 mt-2">
              {variacaoTipo === 'positiva' ? (
                <TrendingUp size={14} className={estilo.texto} />
              ) : (
                <TrendingDown size={14} className={estilo.texto} />
              )}
              <span className={`text-xs font-medium ${estilo.texto}`}>
                {variacaoTipo === 'positiva' ? '↑' : '↓'} {Math.abs(variacao.valor)}%
              </span>
              {variacao.label && <span className="text-xs text-[var(--text-secondary)]">{variacao.label}</span>}
            </div>
          )}
        </div>
        {Icon && <Icon className={`w-8 h-8 ${estilo.icone} opacity-40`} />}
      </div>
    </Card>
  );
}