import { TrendingUp, Building2, ExternalLink, Star, Award, Info, CheckCircle } from "lucide-react";

const fmt = (v) => v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "—";

const PORTAIS_INFO = {
  vivareal: { nome: "Viva Real", cor: "#00A868", logo: "🏠" },
  zapimoveis: { nome: "ZAP Imóveis", cor: "#E63329", logo: "🏢" },
  imoveisweb: { nome: "Imóveis Web", cor: "#0066CC", logo: "🏡" },
  quintoandar: { nome: "Quinto Andar", cor: "#6B3FA0", logo: "🔑" },
};

function ConfiancaBadge({ nivel }) {
  const cfg = {
    Alta: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
    Média: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" },
    Estimada: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  }[nivel] || { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      Confiança {nivel}
    </span>
  );
}

export default function ResultadoAvaliacao({ resultado }) {
  const { avaliacao, plano_presidente, portais, comparaveis } = resultado;

  return (
    <div className="space-y-4">
      {/* Card principal de avaliação */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1A4731] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide">Avaliação de Mercado</p>
            <p className="text-white text-3xl font-bold mt-1">{fmt(avaliacao.estimativa)}</p>
          </div>
          <div className="text-right">
            <ConfiancaBadge nivel={avaliacao.confianca} />
            <p className="text-white/60 text-xs mt-2">{fmt(avaliacao.valor_m2)}/m²</p>
          </div>
        </div>
        <div className="px-6 py-4 grid grid-cols-2 gap-4 border-b border-gray-100">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Faixa Mínima</p>
            <p className="text-lg font-bold text-gray-700">{fmt(avaliacao.faixa_min)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">Faixa Máxima</p>
            <p className="text-lg font-bold text-gray-700">{fmt(avaliacao.faixa_max)}</p>
          </div>
        </div>
        {avaliacao.media_mercado && (
          <div className="px-6 py-3 flex items-center gap-2 text-sm text-gray-600">
            <TrendingUp size={14} className="text-[#F47920]" />
            <span>Média dos portais consultados: <strong>{fmt(avaliacao.media_mercado)}</strong></span>
          </div>
        )}
      </div>

      {/* Plano Presidente */}
      <div className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="bg-amber-50 px-5 py-3 flex items-center gap-2 border-b border-amber-200">
          <Award size={16} className="text-amber-600" />
          <span className="font-semibold text-amber-800 text-sm">Plano Presidente</span>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">{plano_presidente.descricao}</p>
            <p className="text-xs text-gray-500 mt-0.5">Honorários de referência para este município</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-700">{fmt(plano_presidente.valor)}</p>
            <p className="text-xs text-gray-400">por avaliação</p>
          </div>
        </div>
      </div>

      {/* Status dos portais */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={15} className="text-[#1A4731]" />
          <h3 className="font-semibold text-gray-800 text-sm">Portais Consultados</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(portais).map(([key, p]) => {
            const info = PORTAIS_INFO[key];
            const temDados = p.listings?.length > 0;
            return (
              <div key={key} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${temDados ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
                <span className="text-base">{info?.logo}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">{info?.nome || p.portal}</p>
                  <p className="text-gray-400 truncate">{temDados ? `${p.listings.length} imóveis` : p.info || p.erro || "Sem resultados"}</p>
                </div>
                {temDados && <CheckCircle size={12} className="text-green-500 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Imóveis comparáveis */}
      {comparaveis && comparaveis.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star size={15} className="text-[#1A4731]" />
            <h3 className="font-semibold text-gray-800 text-sm">Imóveis Comparáveis no Mercado</h3>
          </div>
          <div className="space-y-2">
            {comparaveis.map((imovel, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium text-gray-800 truncate">{imovel.titulo}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {imovel.bairro && <span>{imovel.bairro} · </span>}
                    {imovel.quartos > 0 && <span>{imovel.quartos} qts · </span>}
                    {imovel.area > 0 && <span>{imovel.area}m²</span>}
                  </p>
                </div>
                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1A4731]">{fmt(imovel.preco)}</span>
                  {imovel.link && (
                    <a href={imovel.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1A4731]">
                      <ExternalLink size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center px-4">
        * Avaliação estimada com base em dados de mercado e índices FIPE/ZAP. Não substitui laudo técnico de engenharia ou arquitetura.
      </p>
    </div>
  );
}