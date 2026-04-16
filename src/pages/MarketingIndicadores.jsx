import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import TabelaVendasPivot from '@/components/marketing/TabelaVendasPivot';
import GraficoVendas from '@/components/marketing/GraficoVendas';

export default function MarketingIndicadores() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [areaFiltro, setAreaFiltro] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('');

  useEffect(() => {
    base44.functions.invoke('getMarketingData', {})
      .then(res => setData(res.data?.data || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Áreas únicas dos dados reais
  const areasDisponiveis = useMemo(() =>
    [...new Set(data.map(d => d.area))].sort(),
    [data]
  );

  // Grupos disponíveis dependem da área selecionada
  const gruposDisponiveis = useMemo(() => {
    const base = areaFiltro ? data.filter(d => d.area === areaFiltro) : data;
    return [...new Set(base.map(d => d.grupo_de_servico))].sort();
  }, [data, areaFiltro]);

  // Ao mudar área, reset grupo
  const handleAreaChange = (val) => {
    setAreaFiltro(val);
    setGrupoFiltro('');
  };

  // Dados filtrados para exibição
  const dadosFiltrados = useMemo(() => {
    let d = data;
    if (areaFiltro) d = d.filter(r => r.area === areaFiltro);
    if (grupoFiltro) d = d.filter(r => r.grupo_de_servico === grupoFiltro);
    return d;
  }, [data, areaFiltro, grupoFiltro]);

  const tituloContexto = grupoFiltro
    ? `${areaFiltro} › ${grupoFiltro}`
    : areaFiltro
      ? areaFiltro
      : 'Toda a Empresa';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Indicadores Estratégicos</h1>
          <p className="text-sm text-slate-500 mt-1">Vendas, Clientes e Ticket Médio por área e grupo de serviço</p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Filtro 1: Área */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Área</label>
            <select
              value={areaFiltro}
              onChange={e => handleAreaChange(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-900 cursor-pointer hover:border-slate-300 focus:outline-none focus:border-orange-500 min-w-[180px]"
            >
              <option value="">Todas as Áreas</option>
              {areasDisponiveis.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Filtro 2: Grupo de Serviço */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Grupo de Serviço</label>
            <select
              value={grupoFiltro}
              onChange={e => setGrupoFiltro(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-200 rounded-lg px-4 py-2 font-medium text-slate-900 cursor-pointer hover:border-slate-300 focus:outline-none focus:border-orange-500 min-w-[200px]"
              disabled={gruposDisponiveis.length === 0}
            >
              <option value="">Todos os Grupos</option>
              {gruposDisponiveis.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
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
          <GraficoVendas data={dadosFiltrados} />

          {/* Tabela Pivô */}
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3">
              {tituloContexto} — Detalhamento por Grupo de Serviço
            </h2>
            <TabelaVendasPivot data={dadosFiltrados} areaFiltro={areaFiltro} grupoFiltro={grupoFiltro} />
          </div>
        </>
      )}
    </div>
  );
}