import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { AlertCircle, MessageSquare, CheckCircle, TrendingUp, FileText, Check } from 'lucide-react';

export default function SeuDiaBloco() {
  // Dados simulados de pendências (em produção, viriam da API)
  const pendencias = [
    { type: 'projetos', icon: AlertCircle, label: 'Projetos em atraso', count: 3, color: 'text-red-600', bgColor: 'bg-red-50', page: 'Projetos' },
    { type: 'mensagens', icon: MessageSquare, label: 'Mensagens não lidas', count: 5, color: 'text-blue-600', bgColor: 'bg-blue-50', page: 'Projetos' },
    { type: 'solicitacoes', icon: CheckCircle, label: 'Solicitações abertas', count: 2, color: 'text-amber-600', bgColor: 'bg-amber-50', page: 'Projetos' },
    { type: 'vendas', icon: TrendingUp, label: 'Oportunidades paradas', count: 4, color: 'text-orange-600', bgColor: 'bg-orange-50', page: 'Vendas' },
  ];

  // Filtrar apenas items com count > 0 para demo
  const pendenciasAtivas = pendencias.filter(p => p.count > 0);
  
  // Se não há pendências, mostrar empty state
  if (pendenciasAtivas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-[#DDE3DE] p-8 text-center space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <Check size={24} className="text-green-600" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1A4731]">Tudo em Dia</h3>
          <p className="text-sm text-[#5C7060] mt-1">Nenhuma pendência no momento. Suas operações estão em ordem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="space-y-4">
        <h2 className="text-sm uppercase font-bold text-[#5C7060] tracking-widest">Seu Dia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pendenciasAtivas.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.type} to={createPageUrl(item.page)}>
                <div className={`${item.bgColor} card-hover rounded-lg p-5 border border-[#DDE3DE] cursor-pointer hover:border-[#F47920] group`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <Icon size={20} className={item.color} />
                      <span className={`${item.color} text-xl font-bold`}>{item.count}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A4731]">{item.label}</p>
                      <p className={`text-xs ${item.color} mt-1 group-hover:font-medium transition-all`}>
                        Ver detalhes →
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}