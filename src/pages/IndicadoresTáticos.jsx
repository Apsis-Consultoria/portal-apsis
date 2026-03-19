import { useState, useEffect } from 'react';
import { Calendar, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import ResumoExecutivo from '@/components/indicadores/ResumoExecutivo';
import ResumoExecutivoAvancadoDinamico from '@/components/indicadores/ResumoExecutivoAvancadoDinamico';
import FinanceiroAvancadoDinamico from '@/components/indicadores/FinanceiroAvancadoDinamico';
import ProjetosAvancadoDinamico from '@/components/indicadores/ProjetosAvancadoDinamico';
import ComercialAvancadoDinamico from '@/components/indicadores/ComercialAvancadoDinamico';
import TendenciasExecutivo from '@/components/indicadores/TendenciasExecutivo';
import AlertasExecutivos from '@/components/indicadores/AlertasExecutivos';
import IndicadoresRisco from '@/components/indicadores/IndicadoresRisco';
import IndicadoresCaixa from '@/components/indicadores/IndicadoresCaixa';

export default function IndicadoresTáticos() {
  const [periodo, setPeriodo] = useState('mes');
  const [unidade, setUnidade] = useState('todas');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [dados, setDados] = useState(null);

  useEffect(() => {
    carregarDados();
  }, [periodo, unidade, ano]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setErro(null);
      const projetos = await base44.entities.Projeto?.list?.('-updated_date', 100).catch(() => []);
      const vendas = await base44.entities.SalesTransaction?.list?.('-updated_date', 100).catch(() => []);
      const despesas = await base44.entities.RateioLancamento?.list?.('-updated_date', 100).catch(() => []);
      const equipamentos = await base44.entities.AtivoTI?.list?.('-updated_date', 100).catch(() => []);
      setDados({ projetos: projetos || [], vendas: vendas || [], despesas: despesas || [], equipamentos: equipamentos || [] });
    } catch (err) {
      console.error('Erro:', err);
      setErro('Dados simulados. Verifique a integração.');
    } finally {
      setLoading(false);
    }
  };

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

      {/* Status de Integração */}
      {erro && (
        <Card className="bg-yellow-50 border-2 border-yellow-200 p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-medium text-yellow-900">{erro}</p>
            {dados && <p className="text-xs text-yellow-700 mt-1">Entidades detectadas: {dados.projetos.length} projetos | {dados.vendas.length} vendas | {dados.despesas.length} despesas | {dados.equipamentos.length} ativos</p>}
          </div>
        </Card>
      )}
      {!erro && !loading && dados && (
        <Card className="bg-green-50 border-2 border-green-200 p-4 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={18} />
          <p className="text-sm font-medium text-green-900">Sistema integrado: {dados.projetos.length} projetos | {dados.vendas.length} vendas | {dados.despesas.length} despesas | {dados.equipamentos.length} ativos</p>
        </Card>
      )}

      {/* Alertas Executivos */}
      <AlertasExecutivos />

      {/* Resumo Executivo */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Resumo Executivo</h2>
        <ResumoExecutivo filtros={filtros} />
      </div>

      {/* Indicadores Avançados com Dados Reais */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Indicadores Financeiros Avançados (Dados Reais)</h2>
        <ResumoExecutivoAvancadoDinamico filtros={filtros} />
      </div>

      {/* Grid de Seções */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financeiro */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Saúde Financeira (Dados Reais)</h2>
          <FinanceiroAvancadoDinamico filtros={filtros} />
        </div>

        {/* Projetos */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Projetos (Dados Reais)</h2>
          <ProjetosAvancadoDinamico filtros={filtros} />
        </div>
      </div>

      {/* Comercial */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Comercial / Vendas (Dados Reais)</h2>
        <ComercialAvancadoDinamico filtros={filtros} />
      </div>

      {/* Tendências */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Tendências e Evolução</h2>
        <TendenciasExecutivo filtros={filtros} />
      </div>

      {/* Indicadores de Risco */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Indicadores de Risco</h2>
        <IndicadoresRisco />
      </div>

      {/* Indicadores de Caixa */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Saúde do Caixa</h2>
        <IndicadoresCaixa />
      </div>
    </div>
  );
}