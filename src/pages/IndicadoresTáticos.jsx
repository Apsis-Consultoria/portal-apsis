import { useState, useEffect } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ResumoExecutivo from '@/components/indicadores/ResumoExecutivo';
import FinanceiroExecutivo from '@/components/indicadores/FinanceiroExecutivo';
import ProjetosExecutivo from '@/components/indicadores/ProjetosExecutivo';
import ComercialExecutivo from '@/components/indicadores/ComercialExecutivo';
import TendenciasExecutivo from '@/components/indicadores/TendenciasExecutivo';
import AlertasExecutivos from '@/components/indicadores/AlertasExecutivos';

export default function IndicadoresTáticos() {
  const [periodo, setPeriodo] = useState('mes');
  const [unidade, setUnidade] = useState('todas');
  const [ano, setAno] = useState(new Date().getFullYear());

  const periodos = [
    { label: 'Mês Atual', value: 'mes' },
    { label: 'Trimestre', value: 'trimestre' },
    { label: 'Semestre', value: 'semestre' },
    { label: 'Ano', value: 'ano' },
    { label: 'Customizado', value: 'customizado' }
  ];

  const unidades = [
    { label: 'Todas as Unidades', value: 'todas' },
    { label: 'São Paulo', value: 'sp' },
    { label: 'Rio de Janeiro', value: 'rj' }
  ];

  const filtros = { periodo, unidade, ano };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--border)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">Indicadores Táticos</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Dashboard executivo com visão consolidada da empresa
        </p>
      </div>

      {/* Filtros */}
      <Card className="bg-white border-[var(--border)] p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Período</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--apsis-orange)]"
            >
              {periodos.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Unidade</label>
            <select
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--apsis-orange)]"
            >
              {unidades.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Ano</label>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--apsis-orange)]"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
          </div>

          <Button className="gap-2">
            <Filter size={16} />
            Aplicar Filtros
          </Button>
        </div>
      </Card>

      {/* Alertas Executivos */}
      <AlertasExecutivos />

      {/* Resumo Executivo */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Resumo Executivo</h2>
        <ResumoExecutivo filtros={filtros} />
      </div>

      {/* Grid de Seções */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financeiro */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Saúde Financeira</h2>
          <FinanceiroExecutivo filtros={filtros} />
        </div>

        {/* Projetos */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Projetos</h2>
          <ProjetosExecutivo filtros={filtros} />
        </div>
      </div>

      {/* Comercial */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Comercial / Vendas</h2>
        <ComercialExecutivo filtros={filtros} />
      </div>

      {/* Tendências */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Tendências e Evolução</h2>
        <TendenciasExecutivo filtros={filtros} />
      </div>
    </div>
  );
}