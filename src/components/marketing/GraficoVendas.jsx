import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = [
  '#1A4731', '#F47920', '#245E40', '#F9A15A', '#4A90D9', '#9B59B6',
  '#E74C3C', '#27AE60', '#2980B9', '#8E44AD'
];

function fmtMoney(val) {
  if (!val) return 'R$ 0';
  if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export default function GraficoVendas({ data, areaFiltro }) {
  const filtered = areaFiltro ? data.filter(d => d.area === areaFiltro) : data;

  // Agrupar vendas por ano e grupo_de_servico
  const { chartData, grupos } = useMemo(() => {
    const gruposSet = new Set();
    const byAno = {};

    filtered.forEach(d => {
      if (!d.vendas) return;
      const ano = String(d.ano);
      if (!byAno[ano]) byAno[ano] = { ano };
      byAno[ano][d.grupo_de_servico] = (byAno[ano][d.grupo_de_servico] || 0) + d.vendas;
      gruposSet.add(d.grupo_de_servico);
    });

    return {
      chartData: Object.values(byAno).sort((a, b) => a.ano - b.ano),
      grupos: [...gruposSet].sort()
    };
  }, [filtered]);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Vendas por Grupo de Serviço (R$)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={fmtMoney} tick={{ fontSize: 11 }} width={75} />
          <Tooltip
            formatter={(value, name) => [
              value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
              name
            ]}
            labelFormatter={label => `Ano: ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {grupos.map((grupo, i) => (
            <Bar key={grupo} dataKey={grupo} name={grupo} fill={COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}