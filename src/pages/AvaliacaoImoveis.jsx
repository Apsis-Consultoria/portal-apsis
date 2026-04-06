import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Search, MapPin, BedDouble, Bath, Maximize, Star, TrendingUp, ExternalLink, ChevronDown, RotateCcw } from "lucide-react";
import FormularioImovel from "../components/imoveis/FormularioImovel";
import ResultadoAvaliacao from "../components/imoveis/ResultadoAvaliacao";

export default function AvaliacaoImoveis() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const handleAvaliar = async (dados) => {
    setLoading(true);
    setErro(null);
    setResultado(null);
    const res = await base44.functions.invoke("buscarImoveis", dados);
    if (res.data?.success) {
      setResultado(res.data);
    } else {
      setErro(res.data?.error || "Erro ao processar avaliação.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center gap-3">
        <div className="w-1 h-8 rounded-full bg-[#F47920]" />
        <div>
          <h1 className="text-xl font-bold text-[#1A4731]">Avaliação de Imóveis</h1>
          <p className="text-sm text-gray-500">Avaliação de mercado integrada · Viva Real · ZAP Imóveis · Imóveis Web · Quinto Andar</p>
        </div>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <FormularioImovel onAvaliar={handleAvaliar} loading={loading} />
          </div>

          {/* Resultado */}
          <div className="lg:col-span-3">
            {loading && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-[#1A4731] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium">Consultando portais imobiliários...</p>
                <div className="flex gap-3 text-xs text-gray-400">
                  <span>🏠 Viva Real</span>
                  <span>🏢 ZAP Imóveis</span>
                  <span>🏡 Imóveis Web</span>
                  <span>🔑 Quinto Andar</span>
                </div>
              </div>
            )}
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">{erro}</div>
            )}
            {resultado && !loading && (
              <ResultadoAvaliacao resultado={resultado} />
            )}
            {!resultado && !loading && !erro && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1A4731]/10 flex items-center justify-center">
                  <Building2 size={32} className="text-[#1A4731]" />
                </div>
                <p className="text-lg font-semibold text-gray-700">Preencha os dados do imóvel</p>
                <p className="text-sm text-gray-400 max-w-xs">Insira as características do imóvel no formulário ao lado para gerar a avaliação de mercado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}