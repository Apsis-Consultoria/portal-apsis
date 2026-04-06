import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Search, MapPin, BedDouble, Bath, Maximize, Star, TrendingUp, ExternalLink, ChevronDown, RotateCcw } from "lucide-react";
import FormularioImovel from "../components/imoveis/FormularioImovel";
import ResultadoAvaliacao from "../components/imoveis/ResultadoAvaliacao";

export default function AvaliacaoImoveis() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [dadosImovel, setDadosImovel] = useState(null);

  const handleAvaliar = async (dados) => {
    setLoading(true);
    setErro(null);
    setResultado(null);
    setDadosImovel(dados);
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
              <div className="space-y-4">
                {/* Skeleton card principal */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="bg-[#1A4731] px-6 py-5">
                    <div className="h-3 w-32 bg-white/20 rounded animate-pulse mb-3" />
                    <div className="h-8 w-48 bg-white/30 rounded animate-pulse" />
                  </div>
                  <div className="p-5 grid grid-cols-2 gap-3">
                    <div className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                </div>
                {/* Portais */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="h-4 w-36 bg-gray-200 rounded animate-pulse mb-3" />
                  <div className="grid grid-cols-2 gap-2">
                    {["🏠 Viva Real","🏢 ZAP Imóveis","🏡 Imóveis Web","🔑 Quinto Andar"].map(p => (
                      <div key={p} className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 bg-gray-50">
                        <span>{p.split(" ")[0]}</span>
                        <div className="flex-1">
                          <div className="h-3 bg-gray-200 rounded animate-pulse mb-1.5" />
                          <div className="h-2 w-16 bg-gray-100 rounded animate-pulse" />
                        </div>
                        <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Tabela skeleton */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-4" />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3 py-2 border-b border-gray-50">
                      <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 flex-1 bg-gray-100 rounded animate-pulse" />
                      <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-400 animate-pulse">Consultando portais e gerando comparativos...</p>
              </div>
            )}
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 text-sm">{erro}</div>
            )}
            {resultado && !loading && (
              <ResultadoAvaliacao resultado={resultado} dadosImovel={dadosImovel} />
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