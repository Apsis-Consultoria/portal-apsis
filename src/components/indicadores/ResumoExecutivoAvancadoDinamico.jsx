import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import MetricCardAvancado from './MetricCardAvancado';
import { TrendingUp, DollarSign, BarChart3, AlertCircle, Percent } from 'lucide-react';

export default function ResumoExecutivoAvancadoDinamico({ filtros }) {
  const [metricas, setMetricas] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    calcularMetricas();
  }, [filtros]);

  const calcularMetricas = async () => {
    try {
      const projetos = await base44.entities.Projeto?.list?.('-updated_date', 1000).catch(() => []);
      const vendas = await base44.entities.SalesTransaction?.list?.('-updated_date', 1000).catch(() => []);
      const despesas = await base44.entities.RateioLancamento?.list?.('-updated_date', 1000).catch(() => []);
      const parcelasProjetos = await base44.entities.ProjectInstallment?.list?.('-updated_date', 1000).catch(() => []);

      const receita = vendas?.reduce((sum, v) => sum + (v.valor_total || 0), 0) || 0;
      const custos = despesas?.reduce((sum, d) => sum + (d.valor || 0), 0) || 0;
      const custosProjetos = parcelasProjetos?.reduce((sum, p) => sum + (p.custo || 0), 0) || 0;
      
      const margemBruta = receita > 0 ? ((receita - custos) / receita * 100).toFixed(1) : 0;
      const margemLiquida = receita > custos ? ((receita - custos - custosProjetos) / receita * 100).toFixed(1) : 0;
      const ticketMedio = vendas?.length > 0 ? (receita / vendas.length / 1000).toFixed(0) : 0;
      const receitaPorProjeto = projetos?.length > 0 ? (receita / projetos.length / 1000).toFixed(0) : 0;

      setMetricas({
        margemBruta,
        margemLiquida,
        receitaTotal: (receita / 1000000).toFixed(1),
        ticketMedio,
        custoOperacional: (custos / 1000000).toFixed(2),
        receitaPorProjeto,
        projetos: projetos?.length || 0,
        vendas: vendas?.length || 0
      });
    } catch (err) {
      console.error('Erro ao calcular métricas:', err);
      setMetricas(null);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando || !metricas) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCardAvancado
        icon={Percent}
        label="Margem Bruta"
        valor={metricas.margemBruta}
        unidade="%"
        tipo="positivo"
        tooltip="(Receita - Custos Diretos) / Receita"
      />

      <MetricCardAvancado
        icon={Percent}
        label="Margem Líquida"
        valor={metricas.margemLiquida}
        unidade="%"
        tipo="positivo"
        tooltip="Lucro Líquido / Receita Total"
      />

      <MetricCardAvancado
        icon={DollarSign}
        label="Receita Total"
        valor={`R$ ${metricas.receitaTotal}M`}
        tipo="positivo"
        tooltip="Receita total de todas as vendas"
      />

      <MetricCardAvancado
        icon={BarChart3}
        label="Ticket Médio"
        valor={`R$ ${metricas.ticketMedio}k`}
        tipo="positivo"
        tooltip="Receita média por venda"
      />

      <MetricCardAvancado
        icon={DollarSign}
        label="Custo Operacional"
        valor={`R$ ${metricas.custoOperacional}M`}
        tipo="atencao"
        tooltip="Total de despesas operacionais"
      />

      <MetricCardAvancado
        icon={BarChart3}
        label="Receita por Projeto"
        valor={`R$ ${metricas.receitaPorProjeto}k`}
        tipo="positivo"
        tooltip="Receita média por projeto"
      />

      <MetricCardAvancado
        icon={TrendingUp}
        label="Projetos Ativos"
        valor={metricas.projetos}
        tipo="positivo"
        tooltip="Total de projetos em execução"
      />

      <MetricCardAvancado
        icon={TrendingUp}
        label="Vendas"
        valor={metricas.vendas}
        tipo="positivo"
        tooltip="Total de transações de venda"
      />
    </div>
  );
}