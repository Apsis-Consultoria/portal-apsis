import React, { useMemo } from 'react';

const TRIMESTRE_ORDER = ['1º Trimestre', '2º Trimestre', '3º Trimestre', '4º Trimestre'];

function fmt(val, type) {
  if (val == null || val === 0) return type === 'currency' ? 'R$ 0' : '0';
  if (type === 'currency') return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  if (type === 'number') return val.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  return val;
}

const metrics = [
  { label: 'Vendas', field: 'vendas', type: 'currency' },
  { label: 'Clientes', field: 'clientes', type: 'number' },
  { label: 'Ticket Médio', field: 'ticket_medio', type: 'currency' },
];

// Agrega linhas de dados somando vendas e clientes; ticket_medio = vendas/clientes
function agregar(rows) {
  const map = {};
  rows.forEach(d => {
    const key = `${d.ano}||${d.trimestre}`;
    if (!map[key]) map[key] = { ano: d.ano, trimestre: d.trimestre, vendas: 0, clientes: 0 };
    map[key].vendas += (d.vendas || 0);
    map[key].clientes += (d.clientes || 0);
  });
  return Object.values(map).map(r => ({
    ...r,
    ticket_medio: r.clientes > 0 ? r.vendas / r.clientes : 0,
  }));
}

export default function TabelaVendasPivot({ data, areaFiltro, grupoFiltro }) {
  // Colunas únicas de ano+trimestre
  const colunas = useMemo(() => {
    const set = new Set();
    data.forEach(d => set.add(`${d.ano}||${d.trimestre}`));
    return [...set].sort((a, b) => {
      const [anoA, triA] = a.split('||');
      const [anoB, triB] = b.split('||');
      if (anoA !== anoB) return Number(anoA) - Number(anoB);
      return TRIMESTRE_ORDER.indexOf(triA) - TRIMESTRE_ORDER.indexOf(triB);
    }).map(k => { const [ano, tri] = k.split('||'); return { ano, tri }; });
  }, [data]);

  // Agrupar colunas por ano para o header
  const anoGroups = useMemo(() => {
    const map = {};
    colunas.forEach(c => { map[c.ano] = (map[c.ano] || 0) + 1; });
    return Object.entries(map).map(([ano, count]) => ({ ano, count }));
  }, [colunas]);

  // Montar linhas da tabela
  // - sem filtro: 1 linha "Total Geral" (soma tudo)
  // - área sem grupo: 1 linha por grupo de serviço dessa área
  // - área + grupo: 1 linha com os dados daquele grupo
  const linhas = useMemo(() => {
    if (!areaFiltro && !grupoFiltro) {
      // Geral: soma tudo numa única linha
      const agg = agregar(data);
      const lookup = {};
      agg.forEach(r => { lookup[`${r.ano}||${r.trimestre}`] = r; });
      return [{ label: 'Total Geral', lookup }];
    }

    // Grupos a exibir
    const gruposSet = new Set(data.map(d => d.grupo_de_servico));
    const grupos = [...gruposSet].sort();

    return grupos.map(grupo => {
      const rowsDoGrupo = data.filter(d => d.grupo_de_servico === grupo);
      const agg = agregar(rowsDoGrupo);
      const lookup = {};
      agg.forEach(r => { lookup[`${r.ano}||${r.trimestre}`] = r; });
      return { label: grupo, lookup };
    });
  }, [data, areaFiltro, grupoFiltro]);

  if (!data || data.length === 0) {
    return <div className="text-slate-500 text-sm p-4">Sem dados para exibir.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="text-xs border-collapse min-w-full">
        <thead>
          {/* Linha de anos */}
          <tr className="bg-[#1A4731] text-white">
            <th className="px-3 py-2 text-left font-semibold border border-slate-600 min-w-[160px]">
              {areaFiltro ? 'Grupo de Serviço' : 'Consolidado'}
            </th>
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
                {`T${TRIMESTRE_ORDER.indexOf(c.tri) + 1}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map(({ label, lookup }, gi) =>
            metrics.map((metric, mi) => {
              const isFirst = mi === 0;
              const bgRow = gi % 2 === 0
                ? (isFirst ? 'bg-[#e8f0e9]' : 'bg-white')
                : (isFirst ? 'bg-[#d4e4d6]' : 'bg-slate-50');

              return (
                <tr key={`${label}-${metric.field}`} className={bgRow}>
                  {isFirst && (
                    <td
                      rowSpan={metrics.length}
                      className="px-3 py-1.5 font-semibold text-[#1A4731] border border-slate-200 align-middle bg-[#e8f0e9]"
                    >
                      {label}
                    </td>
                  )}
                  <td className={`px-3 py-1.5 font-medium border border-slate-200 whitespace-nowrap ${isFirst ? 'text-[#1A4731] font-bold' : 'text-slate-600'}`}>
                    {metric.label}
                  </td>
                  {colunas.map((c, ci) => {
                    const row = lookup[`${c.ano}||${c.tri}`];
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