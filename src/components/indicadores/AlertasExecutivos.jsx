import { AlertCircle, TrendingDown, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

const ALERTAS = [
  {
    tipo: 'aviso',
    icon: TrendingDown,
    titulo: 'Tendência de Queda',
    descricao: 'Inadimplência subiu 1.2% nos últimos 30 dias. Recomenda-se ação de cobrança reforçada.'
  },
  {
    tipo: 'crítico',
    icon: AlertCircle,
    titulo: 'Projetos em Atraso',
    descricao: '2 projetos críticos atrasados. Cliente XYZ aguardando retorno há 5 dias.'
  },
  {
    tipo: 'aviso',
    icon: Clock,
    titulo: 'Fluxo de Caixa Apertado',
    descricao: 'Possível déficit de caixa em Julho. Recomenda-se acelerar cobrança.'
  }
];

function AlertCard({ tipo, icon: Icon, titulo, descricao }) {
  const estilos = {
    crítico: {
      bg: 'bg-red-50',
      borda: 'border-red-200',
      titulo: 'text-red-900',
      descricao: 'text-red-800',
      icone: 'text-red-600'
    },
    aviso: {
      bg: 'bg-orange-50',
      borda: 'border-orange-200',
      titulo: 'text-orange-900',
      descricao: 'text-orange-800',
      icone: 'text-orange-600'
    }
  };

  const estilo = estilos[tipo] || estilos.aviso;

  return (
    <Card className={`p-4 border ${estilo.bg} ${estilo.borda}`}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 ${estilo.icone} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-semibold text-sm ${estilo.titulo}`}>{titulo}</h3>
          <p className={`text-sm mt-1 ${estilo.descricao}`}>{descricao}</p>
        </div>
      </div>
    </Card>
  );
}

export default function AlertasExecutivos() {
  const alertasCríticos = ALERTAS.filter(a => a.tipo === 'crítico');
  const alertasAvisos = ALERTAS.filter(a => a.tipo === 'aviso');

  if (ALERTAS.length === 0) {
    return (
      <Card className="p-6 border-[var(--border)] bg-green-50">
        <p className="text-sm text-green-800">✓ Nenhum alerta crítico no momento</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alertasCríticos.map((alerta, idx) => (
        <AlertCard key={`crítico-${idx}`} {...alerta} />
      ))}
      {alertasAvisos.map((alerta, idx) => (
        <AlertCard key={`aviso-${idx}`} {...alerta} />
      ))}
    </div>
  );
}