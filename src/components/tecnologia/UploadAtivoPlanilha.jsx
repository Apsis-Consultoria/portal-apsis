import { useState, useRef } from "react";
import { Upload, AlertCircle, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function UploadAtivoPlanilha({ onSuccess }) {
  const [arquivo, setArquivo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    setCarregando(true);
    setMensagem("");

    try {
      // Upload do arquivo
      const uploadRes = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = uploadRes.file_url;

      // Extração de dados
      const schema = await base44.entities.AtivoTI.schema();
      const extractRes = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: fileUrl,
        json_schema: {
          type: "object",
          properties: {
            tipo: { type: "string" },
            marca: { type: "string" },
            modelo: { type: "string" },
            numero_serie: { type: "string" },
            patrimonio: { type: "string" },
            processador: { type: "string" },
            ram_gb: { type: "number" },
            armazenamento_gb: { type: "number" },
            sistema_operacional: { type: "string" },
            status: { type: "string" },
            data_aquisicao: { type: "string" },
            valor: { type: "number" },
            fornecedor: { type: "string" },
            observacoes: { type: "string" },
          },
        },
      });

      if (extractRes.status === "error") {
        setMensagem(`Erro ao processar: ${extractRes.details}`);
        setCarregando(false);
        return;
      }

      const dados = Array.isArray(extractRes.output) ? extractRes.output : [extractRes.output];

      // Salvar dados
      await base44.entities.AtivoTI.bulkCreate(dados);

      setMensagem(`✓ ${dados.length} ativo(s) importado(s) com sucesso!`);
      setArquivo(null);
      if (inputRef.current) inputRef.current.value = "";
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (erro) {
      setMensagem(`Erro: ${erro.message}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#DDE3DE] p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-[#1A2B1F] mb-6">Upload de Carga de Ativos</h2>

        {/* Área de Upload */}
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-[#DDE3DE] rounded-lg p-12 text-center cursor-pointer hover:bg-[#F4F6F4] transition-colors"
        >
          <Upload size={32} className="mx-auto mb-3 text-[#5C7060]" />
          <p className="text-sm font-medium text-[#1A2B1F] mb-1">
            Clique para selecionar ou arraste uma planilha
          </p>
          <p className="text-xs text-[#5C7060]">
            Formatos suportados: CSV, Excel (.xlsx), JSON
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setArquivo(file);
                handleFile(file);
              }
            }}
            className="hidden"
          />
        </div>

        {/* Feedback */}
        {mensagem && (
          <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${
            mensagem.includes("✓") 
              ? "bg-green-50 border border-green-200" 
              : "bg-red-50 border border-red-200"
          }`}>
            {mensagem.includes("✓") ? (
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${mensagem.includes("✓") ? "text-green-700" : "text-red-700"}`}>
              {mensagem}
            </p>
          </div>
        )}

        {/* Status */}
        {carregando && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              Processando arquivo...
            </p>
          </div>
        )}

        {/* Instruções */}
        <div className="mt-8 p-4 bg-[#F4F6F4] rounded-lg">
          <h3 className="text-sm font-bold text-[#1A2B1F] mb-3">Colunas esperadas:</h3>
          <ul className="text-xs text-[#5C7060] space-y-1">
            <li>• tipo (notebook, desktop, monitor, etc)</li>
            <li>• marca</li>
            <li>• modelo</li>
            <li>• numero_serie</li>
            <li>• patrimonio (opcional)</li>
            <li>• processador (opcional)</li>
            <li>• ram_gb (opcional)</li>
            <li>• armazenamento_gb (opcional)</li>
            <li>• status (em_estoque, em_uso, etc)</li>
            <li>• data_aquisicao (opcional)</li>
            <li>• valor (opcional)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}