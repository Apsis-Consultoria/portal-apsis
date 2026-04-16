import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import TabelaVendasPivot from '@/components/marketing/TabelaVendasPivot';
import GraficoVendas from '@/components/marketing/GraficoVendas';

const AREAS = [
  'Todas as Áreas',
  'Business Valuation',
  'Ativos Fixos',
  'Consultoria Estratégica',
  'M&A',
  'Projetos Especiais',
];

export default function MarketingIndicadores() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [areaFiltro, setAreaFiltro] = useState('');

  useEffect(() => {
    base44.functions.invoke('getMarketingData', {})
      .then(res => {
        const rows = res.data?.data || [];
        setData(rows);
        // popular areas reais dos dados
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Extrair áreas únicas dos dados reais
  const areasDisponiveis = ['Todas as Áreas', ...[...new Set(data.map(d => d.area))].sort()];

  const dadosFiltrados = areaFiltro ? data.filter(d => d.area === areaFiltro) : data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Indicadores Estratégicos</h1>
          <p className="text-sm text-slate-500 mt-1">Vendas, Clientes e Ticket Médio por área e grupo de serviço</p>
        </div>

        <select
          value={areaFiltro}
          onChange={e => setAreaFiltro(e.target.value === 'Todas as Áreas' ? '' : e.target.value)}
          className="appearance-none bg-white border-2 border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-900 cursor-pointer hover:border-slate-300 focus:outline-none focus:border-orange-500"
        >
          {areasDisponiveis.map(a => (
            <option key={a} value={a === 'Todas as Áreas' ? 'Todas as Áreas' : a}>{a}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48 text-slate-500">
          Carregando dados...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          Erro ao carregar dados: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Gráfico */}
          <GraficoVendas data={data} areaFiltro={areaFiltro} />

          {/* Tabela Pivô */}
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              {areaFiltro || 'Todas as Áreas'} — Detalhamento por Grupo de Serviço
            </h2>
            <TabelaVendasPivot data={data} areaFiltro={areaFiltro} />
          </div>
        </>
      )}
    </div>
  );
}