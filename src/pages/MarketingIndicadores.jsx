import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const INDICADORES_POR_AREA = {
  business_valuation: {
    titulo: 'Business Valuation',
    kpis: [
      { label: 'Avaliações Realizadas', valor: '0', meta: 'Processos concluídos', status: 'neutral' },
      { label: 'Valor Total Avaliado', valor: 'R$ 0', meta: 'Portfolio em análise', status: 'neutral' },
      { label: 'Ticket Médio', valor: 'R$ 0', meta: 'Valor médio por avaliação', status: 'neutral' },
      { label: 'Taxa Finalização', valor: '0%', meta: 'Processos completados', status: 'neutral' },
    ],
  },
  contabil_fiscal: {
    titulo: 'Consultoria Contábil & Fiscal',
    kpis: [
      { label: 'Laudos Contábeis', valor: '0', meta: 'Emissões realizadas', status: 'neutral' },
      { label: 'Receita Fiscal', valor: 'R$ 0', meta: 'Faturamento consultoria', status: 'neutral' },
      { label: 'Clientes Ativos', valor: '0', meta: 'Portfolio em atendimento', status: 'neutral' },
      { label: 'Conformidade Fiscal', valor: '100%', meta: 'Documentos compliance', status: 'success' },
    ],
  },
  ativos_fixos: {
    titulo: 'Ativos Fixos',
    kpis: [
      { label: 'Avaliações Ativas', valor: '0', meta: 'Em processamento', status: 'neutral' },
      { label: 'Valor Total do Inventário', valor: 'R$ 0', meta: 'Patrimônio avaliado', status: 'neutral' },
      { label: 'Ticket Médio', valor: 'R$ 0', meta: 'Valor médio por ativo', status: 'neutral' },
      { label: 'Taxa Documentação', valor: '0%', meta: 'Ativos registrados', status: 'neutral' },
    ],
  },
  consultoria_estrategica: {
    titulo: 'Consultoria Estratégica',
    kpis: [
      { label: 'Projetos em Execução', valor: '0', meta: 'Consultoria ativa', status: 'neutral' },
      { label: 'Receita Contratada', valor: 'R$ 0', meta: 'Valor total de projetos', status: 'neutral' },
      { label: 'Clientes Atendidos', valor: '0', meta: 'Empresas consultadas', status: 'neutral' },
      { label: 'Taxa Conclusão', valor: '0%', meta: 'Projetos finalizados', status: 'neutral' },
    ],
  },
  ma: {
    titulo: 'M&A',
    kpis: [
      { label: 'Deals em Pipeline', valor: '0', meta: 'Transações em análise', status: 'neutral' },
      { label: 'Valor em Due Diligence', valor: 'R$ 0', meta: 'Volume total M&A', status: 'neutral' },
      { label: 'Deals Fechados', valor: '0', meta: 'Transações concluídas', status: 'success' },
      { label: 'Ticket Médio', valor: 'R$ 0', meta: 'Valor médio por deal', status: 'neutral' },
    ],
  },
  projetos_especiais: {
    titulo: 'Projetos Especiais',
    kpis: [
      { label: 'Projetos Ativos', valor: '0', meta: 'Em execução', status: 'neutral' },
      { label: 'Valor Total Investido', valor: 'R$ 0', meta: 'Orçamento empenhado', status: 'neutral' },
      { label: 'Ticket Médio', valor: 'R$ 0', meta: 'Valor médio por projeto', status: 'neutral' },
      { label: 'Taxa Pontualidade', valor: '0%', meta: 'Projetos no prazo', status: 'neutral' },
    ],
  },
  financeiro: {
    titulo: 'Financeiro',
    kpis: [
      { label: 'Receita Mês Atual', valor: 'R$ 0', meta: 'Faturamento total', status: 'neutral' },
      { label: 'Ticket Médio', valor: 'R$ 0', meta: 'Valor médio por transação', status: 'neutral' },
      { label: 'Contas a Receber', valor: 'R$ 0', meta: 'Valores em cobrança', status: 'warning' },
      { label: 'Fluxo de Caixa Líquido', valor: 'R$ 0', meta: 'Saldo disponível', status: 'neutral' },
    ],
  },
  capital_humano: {
    titulo: 'Capital Humano',
    kpis: [
      { label: 'Colaboradores Ativos', valor: '0', meta: 'Efetivo total', status: 'neutral' },
      { label: 'Utilização de Horas', valor: '0%', meta: 'Horas produtivas alocadas', status: 'neutral' },
      { label: 'Custo Médio CH', valor: 'R$ 0', meta: 'Despesa mensal por pessoa', status: 'neutral' },
      { label: 'Produtividade', valor: '0 h', meta: 'Horas por colaborador', status: 'neutral' },
    ],
  },
  mercado_clientes: {
    titulo: 'Mercado / Clientes',
    kpis: [
      { label: 'Clientes Ativos', valor: '0', meta: 'Portfolio total', status: 'neutral' },
      { label: 'Ticket Médio', valor: 'R$ 0', meta: 'Receita média por cliente', status: 'neutral' },
      { label: 'Volume de Propostas', valor: '0', meta: 'Propostas geradas', status: 'neutral' },
      { label: 'Taxa de Conversão', valor: '0%', meta: 'Propostas ganhas', status: 'neutral' },
    ],
  },
};

function KPICard({ label, valor, meta, status }) {
  const statusColors = {
    success: 'border-green-200 bg-green-50',
    warning: 'border-orange-200 bg-orange-50',
    info: 'border-blue-200 bg-blue-50',
    neutral: 'border-slate-200 bg-white',
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${statusColors[status] || statusColors.neutral}`}>
      <p className="text-xs font-medium text-slate-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mb-2">{valor}</p>
      <p className="text-xs text-slate-500">{meta}</p>
    </div>
  );
}

export default function MarketingIndicadores() {
  const [selectedArea, setSelectedArea] = useState('business_valuation');
  const indicador = INDICADORES_POR_AREA[selectedArea];

  return (
    <div className="space-y-6">
      {/* Header com Dropdown */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Indicadores Estratégicos</h1>
          <p className="text-sm text-slate-500 mt-1">Métricas por área de negócio</p>
        </div>

        <div className="relative">
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="appearance-none bg-white border-2 border-slate-200 rounded-lg px-4 py-2 pr-10 font-medium text-slate-900 cursor-pointer hover:border-slate-300 focus:outline-none focus:border-orange-500"
          >
            {Object.entries(INDICADORES_POR_AREA).map(([key, data]) => (
              <option key={key} value={key}>
                {data.titulo}
              </option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {indicador.kpis.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>

      {/* Placeholder para Charts */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
        <p className="text-slate-600 font-medium">Gráficos analíticos em desenvolvimento</p>
        <p className="text-sm text-slate-500 mt-1">
          Visualizações de tendências e análises por período
        </p>
      </div>
    </div>
  );
}