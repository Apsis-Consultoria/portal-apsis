import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const TRIMESTRE_COLORS = {
  'T1': '#4A90D9',
  'T2': '#E74C3C',
  'T3': '#27AE60',
  'T4': '#9B59B6',
};

const TRIMESTRE_ORDER = ['1º Trimestre', '2º Trimestre', '3º Trimestre', '4º Trimestre'];
const TRIMESTRE_LABEL = {
  '1º Trimestre': 'T1',
  '2º Trimestre': 'T2',
  '3º Trimestre': 'T3',
  '4º Trimestre': 'T4',
};

function fmtMoney(val) {
  if (!val) return 'R$ 0';
  if (val >= 1000000) return `R$ ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `R$ ${(val / 1000).toFixed(0)}K`;
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export default function GraficoVendas({ data }) {
  // chartData: uma entrada por ANO, com campos T1, T2, T3, T4 somando vendas
  const { chartData, trimestresPresentes } = useMemo(() => {
    const byAno = {};

    data.forEach(d => {
      if (!d.vendas) return;
      const ano = String(d.ano);
      const triLabel = TRIMESTRE_LABEL[d.trimestre] || d.trimestre;
      if (!byAno[ano]) byAno[ano] = { ano };
      byAno[ano][triLabel] = (byAno[ano][triLabel] || 0) + d.vendas;
    });

    const chartData = Object.values(byAno).sort((a, b) => Number(a.ano) - Number(b.ano));

    // Quais trimestres aparecem nos dados
    const triSet = new Set();
    data.forEach(d => {
      const lbl = TRIMESTRE_LABEL[d.trimestre];
      if (lbl) triSet.add(lbl);
    });
    const trimestresPresentes = ['T1', 'T2', 'T3', 'T4'].filter(t => triSet.has(t));

    return { chartData, trimestresPresentes };
  }, [data]);

  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Vendas por Ano e Trimestre (R$)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }} barCategoryGap="20%" barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={fmtMoney} tick={{ fontSize: 11 }} width={80} />
          <Tooltip
            formatter={(value, name) => [
              value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
              name
            ]}
            labelFormatter={label => `Ano: ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {trimestresPresentes.map(tri => (
            <Bar key={tri} dataKey={tri} name={tri} fill={TRIMESTRE_COLORS[tri]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}