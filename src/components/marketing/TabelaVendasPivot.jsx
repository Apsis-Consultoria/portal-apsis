import React, { useMemo } from 'react';

const TRIMESTRE_ORDER = ['1º Trimestre', '2º Trimestre', '3º Trimestre', '4º Trimestre'];

function fmt(val, type) {
  if (val == null || val === 0) return type === 'currency' ? 'R$ 0' : '0';
  if (type === 'currency') return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  if (type === 'number') return val.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  return val;
}

export default function TabelaVendasPivot({ data, areaFiltro }) {
  // Filtrar por área se selecionada
  const filtered = areaFiltro ? data.filter(d => d.area === areaFiltro) : data;

  // Extrair combinações únicas de ano+trimestre ordenadas
  const colunas = useMemo(() => {
    const set = new Set();
    filtered.forEach(d => set.add(`${d.ano}||${d.trimestre}`));
    return [...set].sort((a, b) => {
      const [anoA, triA] = a.split('||');
      const [anoB, triB] = b.split('||');
      if (anoA !== anoB) return Number(anoA) - Number(anoB);
      return TRIMESTRE_ORDER.indexOf(triA) - TRIMESTRE_ORDER.indexOf(triB);
    }).map(k => { const [ano, tri] = k.split('||'); return { ano, tri }; });
  }, [filtered]);

  // Extrair grupos de serviço únicos
  const grupos = useMemo(() => {
    const set = new Set(filtered.map(d => d.grupo_de_servico));
    return [...set].sort();
  }, [filtered]);

  // Montar lookup
  const lookup = useMemo(() => {
    const map = {};
    filtered.forEach(d => {
      const key = `${d.grupo_de_servico}||${d.ano}||${d.trimestre}`;
      map[key] = d;
    });
    return map;
  }, [filtered]);

  if (!data || data.length === 0) {
    return <div className="text-slate-500 text-sm p-4">Carregando dados...</div>;
  }

  const metrics = [
    { label: 'Vendas', field: 'vendas', type: 'currency' },
    { label: 'Clientes', field: 'clientes', type: 'number' },
    { label: 'Ticket Médio', field: 'ticket_medio', type: 'currency' },
  ];

  // Agrupar colunas por ano para o header
  const anoGroups = useMemo(() => {
    const map = {};
    colunas.forEach(c => { map[c.ano] = (map[c.ano] || 0) + 1; });
    return Object.entries(map).map(([ano, count]) => ({ ano, count }));
  }, [colunas]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="text-xs border-collapse min-w-full">
        <thead>
          {/* Linha de anos */}
          <tr className="bg-[#1A4731] text-white">
            <th className="px-3 py-2 text-left font-semibold border border-slate-600 min-w-[140px]">Grupo de Serviço</th>
            <th className="px-3 py-2 text-left font-semibold border border-slate-600 min-w-[100px]">Métrica</th>
            {anoGroups.map(({ ano, count }) => (
              <th key={ano} colSpan={count} className="px-3 py-2 text-center font-bold border border-slate-600">{ano}</th>
            ))}
          </tr>
          {/* Linha de trimestres */}
          <tr className="bg-[#245E40] text-white">
            <th className="border border-slate-600 px-3 py-1"></th>
            <th className="border border-slate-600 px-3 py-1"></th>
            {colunas.map((c, i) => (
              <th key={i} className="px-2 py-1 text-center font-medium border border-slate-600 whitespace-nowrap">
                {c.tri.replace('º Trimestre', 'T').replace('º', 'T')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grupos.map((grupo, gi) =>
            metrics.map((metric, mi) => {
              const isFirst = mi === 0;
              const isLastMetric = mi === metrics.length - 1;
              const bgRow = gi % 2 === 0
                ? (isFirst ? 'bg-[#e8f0e9]' : 'bg-white')
                : (isFirst ? 'bg-[#d4e4d6]' : 'bg-slate-50');

              return (
                <tr key={`${grupo}-${metric.field}`} className={bgRow}>
                  {isFirst && (
                    <td
                      rowSpan={metrics.length}
                      className="px-3 py-1.5 font-semibold text-[#1A4731] border border-slate-200 align-middle bg-[#e8f0e9]"
                    >
                      {grupo}
                    </td>
                  )}
                  <td className={`px-3 py-1.5 font-medium border border-slate-200 whitespace-nowrap ${isFirst ? 'text-[#1A4731] font-bold' : 'text-slate-600'}`}>
                    {metric.label}
                  </td>
                  {colunas.map((c, ci) => {
                    const row = lookup[`${grupo}||${c.ano}||${c.tri}`];
                    const val = row ? row[metric.field] : null;
                    return (
                      <td key={ci} className="px-2 py-1.5 text-right border border-slate-200 whitespace-nowrap">
                        {fmt(val, metric.type)}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}