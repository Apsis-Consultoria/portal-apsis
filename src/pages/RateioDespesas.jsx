import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileSpreadsheet, Upload, CheckCircle2, Clock } from "lucide-react";
import RateioUberTab from "@/components/rateio/RateioUberTab";
import RateioCartaoTab from "@/components/rateio/RateioCartaoTab";
import RateioComprasTab from "@/components/rateio/RateioComprasTab";
import RateioHistoricoTab from "@/components/rateio/RateioHistoricoTab";

export default function RateioDespesas() {
  const [processamentos, setProcessamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState({
    emAnalise: 0,
    validados: 0,
    exportados: 0,
    valorTotal: 0
  });

  useEffect(() => {
    carregarProcessamentos();
  }, []);

  const carregarProcessamentos = async () => {
    try {
      setLoading(true);
      const dados = await base44.entities.RateioProcessamento.list('-created_date', 100);
      setProcessamentos(dados);
      
      // Calcular resumo
      const resumoCalc = {
        emAnalise: dados.filter(p => p.status === 'em_analise').length,
        validados: dados.filter(p => p.status === 'validado').length,
        exportados: dados.filter(p => p.status === 'exportado').length,
        valorTotal: dados.reduce((sum, p) => sum + (p.valor_total || 0), 0)
      };
      setResumo(resumoCalc);
    } catch (error) {
      console.error("Erro ao carregar processamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[var(--border)] pb-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1">Rateio de Despesas</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Centralize e valide o rateio de Uber, Cartão de Crédito e Compras antes da exportação
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-white border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Em Análise</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{resumo.emAnalise}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500 opacity-60" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Validados</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{resumo.validados}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-green-600 opacity-60" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Exportados</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{resumo.exportados}</p>
            </div>
            <FileSpreadsheet className="w-8 h-8 text-blue-600 opacity-60" />
          </div>
        </Card>

        <Card className="p-4 bg-white border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] font-medium mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                R$ {resumo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-[var(--apsis-orange)] opacity-60" />
          </div>
        </Card>
      </div>

      {/* Abas */}
      <Card className="bg-white border-[var(--border)]">
        <Tabs defaultValue="uber" className="w-full">
          <TabsList className="border-b border-[var(--border)] rounded-none bg-white p-0 h-auto">
            <TabsTrigger 
              value="uber"
              className="rounded-none px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[var(--apsis-orange)] data-[state=active]:bg-transparent"
            >
              Uber
            </TabsTrigger>
            <TabsTrigger 
              value="cartao"
              className="rounded-none px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[var(--apsis-orange)] data-[state=active]:bg-transparent"
            >
              Cartão de Crédito
            </TabsTrigger>
            <TabsTrigger 
              value="compras"
              className="rounded-none px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[var(--apsis-orange)] data-[state=active]:bg-transparent"
            >
              Compras
            </TabsTrigger>
            <TabsTrigger 
              value="historico"
              className="rounded-none px-6 py-3 border-b-2 border-transparent data-[state=active]:border-[var(--apsis-orange)] data-[state=active]:bg-transparent"
            >
              Histórico
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="uber"><RateioUberTab onProcessed={carregarProcessamentos} /></TabsContent>
            <TabsContent value="cartao"><RateioCartaoTab onProcessed={carregarProcessamentos} /></TabsContent>
            <TabsContent value="compras"><RateioComprasTab onProcessed={carregarProcessamentos} /></TabsContent>
            <TabsContent value="historico"><RateioHistoricoTab processamentos={processamentos} /></TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
}