import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileSpreadsheet, Check } from "lucide-react";
import RateioTabela from "./RateioTabela";

const COLUNAS_ESPERADAS = [
  "data", "colaborador", "origem", "destino", "valor",
  "centro_custo", "projeto", "tipo_despesa", "reembolsavel", "observacao"
];

export default function RateioUberTab({ onProcessed }) {
  const [arquivo, setArquivo] = useState(null);
  const [lancamentos, setLancamentos] = useState([]);
  const [processado, setProcessado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivo(file);
    }
  };

  const processarArquivo = async () => {
    if (!arquivo) return;
    
    setLoading(true);
    try {
      // Upload do arquivo
      const uploadRes = await base44.integrations.Core.UploadFile({ file: arquivo });
      
      // Extrair dados da planilha
      const extractRes = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: uploadRes.file_url,
        json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  data: { type: "string" },
                  colaborador: { type: "string" },
                  origem: { type: "string" },
                  destino: { type: "string" },
                  valor: { type: "number" },
                  centro_custo: { type: "string" },
                  projeto: { type: "string" },
                  tipo_despesa: { type: "string" },
                  reembolsavel: { type: "boolean" },
                  observacao: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (extractRes.status === "success" && extractRes.output?.items) {
        const dados = extractRes.output.items.map(item => ({
          ...item,
          tipo_fonte: "uber",
          validado: false
        }));
        setLancamentos(dados);
        setProcessado(true);
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
    } finally {
      setLoading(false);
    }
  };

  const salvarProcessamento = async () => {
    try {
      // Criar processamento
      const processo = await base44.entities.RateioProcessamento.create({
        tipo_arquivo: "uber",
        data_upload: new Date().toISOString(),
        usuario_upload: (await base44.auth.me())?.email,
        quantidade_linhas: lancamentos.length,
        valor_total: lancamentos.reduce((sum, l) => sum + (l.valor || 0), 0),
        status: "em_analise",
        arquivo_original: arquivo.name
      });

      // Salvar lançamentos
      for (const lancamento of lancamentos) {
        await base44.entities.RateioLancamento.create({
          processo_id: processo.id,
          tipo_fonte: "uber",
          data: lancamento.data,
          descricao: `${lancamento.origem} → ${lancamento.destino}`,
          valor: lancamento.valor,
          colaborador: lancamento.colaborador,
          projeto: lancamento.projeto,
          centro_custo: lancamento.centro_custo,
          tipo_despesa: lancamento.tipo_despesa || "reembolso",
          reembolsavel: lancamento.reembolsavel === true,
          notas: lancamento.observacao,
          validado: false
        });
      }

      setArquivo(null);
      setLancamentos([]);
      setProcessado(false);
      onProcessed?.();
    } catch (error) {
      console.error("Erro ao salvar processamento:", error);
    }
  };

  if (!processado) {
    return (
      <div className="space-y-4">
        <Card className="p-8 border-2 border-dashed border-[var(--border)] bg-[var(--surface-2)]">
          <div className="text-center">
            <Upload className="w-12 h-12 text-[var(--text-secondary)] opacity-40 mx-auto mb-4" />
            <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
              Envie o relatório de despesas Uber
            </p>
            <p className="text-xs text-[var(--text-secondary)] mb-6">
              Suporte: planilha (XLSX, CSV)
            </p>
            
            <label className="inline-block">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleUpload}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--apsis-orange)] text-white rounded-lg hover:opacity-90 cursor-pointer text-sm font-medium">
                <Upload className="w-4 h-4" />
                Selecionar arquivo
              </span>
            </label>

            {arquivo && (
              <p className="text-xs text-[var(--text-secondary)] mt-4">
                📄 {arquivo.name}
              </p>
            )}
          </div>
        </Card>

        {arquivo && (
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setArquivo(null)}
              className="border-[var(--border)] text-[var(--text-primary)]"
            >
              Cancelar
            </Button>
            <Button
              onClick={processarArquivo}
              disabled={loading}
              className="bg-[var(--apsis-orange)] hover:opacity-90 text-white"
            >
              {loading ? "Processando..." : "Processar Arquivo"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">
              {lancamentos.length} registros carregados
            </p>
            <p className="text-xs text-green-700">
              Valor total: R$ {lancamentos.reduce((sum, l) => sum + (l.valor || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <RateioTabela lancamentos={lancamentos} setLancamentos={setLancamentos} />

      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => { setArquivo(null); setProcessado(false); }}
          className="border-[var(--border)] text-[var(--text-primary)]"
        >
          Cancelar
        </Button>
        <Button
          onClick={salvarProcessamento}
          className="bg-[var(--apsis-orange)] hover:opacity-90 text-white gap-2"
        >
          <Check className="w-4 h-4" />
          Salvar e Validar
        </Button>
      </div>
    </div>
  );
}