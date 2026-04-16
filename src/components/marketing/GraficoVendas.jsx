import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = [
  '#1A4731', '#F47920', '#245E40', '#F9A15A', '#4A90D9', '#9B59B6',
  '#E74C3C', '#27AE60', '#2980B9', '#8E44AD'
];

const TRIMESTRE_ORDER = ['1º Trimestre', '2º Trimestre', '3º Trimestre', '4º Trimestre'];
const TRIMESTRE_LABEL = { '1º Trimestre': 'T1', '2º Trimestre': 'T2', '3º Trimestre': 'T3', '4º Trimestre': 'T4' };

function fmtMoney(val) {
  if (!val) return 'R$ 0';
  if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export default function GraficoVendas({ data }) {
  const { chartData, anos } = useMemo(() => {
    const anosSet = new Set();
    // acumular vendas por trimestre+ano
    const byTri = {};

    data.forEach(d => {
      if (!d.vendas) return;
      const tri = d.trimestre;
      const ano = String(d.ano);
      anosSet.add(ano);
      if (!byTri[tri]) byTri[tri] = { trimestre: TRIMESTRE_LABEL[tri] || tri };
      byTri[tri][ano] = (byTri[tri][ano] || 0) + d.vendas;
    });

    const anosOrdenados = [...anosSet].sort();

    const chartData = TRIMESTRE_ORDER
      .filter(t => byTri[t])
      .map(t => byTri[t]);

    return { chartData, anos: anosOrdenados };
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Vendas por Trimestre (R$)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="trimestre" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={fmtMoney} tick={{ fontSize: 11 }} width={75} />
          <Tooltip
            formatter={(value, name) => [
              value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
              `Ano ${name}`
            ]}
            labelFormatter={label => `Trimestre: ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={val => `Ano ${val}`} />
          {anos.map((ano, i) => (
            <Bar key={ano} dataKey={ano} name={ano} fill={COLORS[i % COLORS.length]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}