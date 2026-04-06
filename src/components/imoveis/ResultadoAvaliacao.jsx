import { TrendingUp, Building2, ExternalLink, CheckCircle, Award, FileText, MapPin, AlertCircle, Sparkles } from "lucide-react";
import TabelaComparativos from "./TabelaComparativos";

const fmt = (v) => v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "—";
const fmtM2 = (v) => v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) + "/m²" : "—";

const PORTAIS_INFO = {
  vivareal: { nome: "Viva Real", logo: "🏠" },
  zapimoveis: { nome: "ZAP Imóveis", logo: "🏢" },
  imoveisweb: { nome: "Imóveis Web", logo: "🏡" },
  quintoandar: { nome: "Quinto Andar", logo: "🔑" },
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

function AnimatedCounter({ value }) {
  return <span className="font-bold tabular-nums">{value?.toLocaleString("pt-BR")}</span>;
}

export default function ResultadoAvaliacao({ resultado, dadosImovel }) {
  const { avaliacao, plano_presidente, plano_diretor, portais, comparaveis, stats, usou_ia } = resultado;

  const imovelRef = dadosImovel ? {
    area: dadosImovel.area,
    quartos: dadosImovel.quartos,
    banheiros: dadosImovel.banheiros,
    estimativa: avaliacao.estimativa,
    valor_m2: avaliacao.valor_m2,
  } : null;

  return (
    <div className="space-y-4">
      {/* Card principal */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1A4731] px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">Avaliação de Mercado</p>
            <p className="text-white text-3xl font-bold">{fmt(avaliacao.estimativa)}</p>
            {avaliacao.total_anuncios_analisados > 0 && (
              <p className="text-white/60 text-xs mt-2 flex items-center gap-1.5">
                <Sparkles size={11} />
                <AnimatedCounter value={avaliacao.total_anuncios_analisados} /> anúncios analisados
                {usou_ia && <span className="ml-1 bg-white/10 px-1.5 py-0.5 rounded text-[10px]">+ modelo IA</span>}
              </p>
            )}
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <ConfiancaBadge nivel={avaliacao.confianca} />
            <p className="text-white/60 text-xs">{fmtM2(avaliacao.valor_m2)}</p>
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
          <div className="px-6 py-3 flex flex-wrap items-center gap-4 text-sm text-gray-600 border-b border-gray-100">
            <span className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#F47920]" />
              Média mercado: <strong>{fmt(avaliacao.media_mercado)}</strong>
            </span>
            {avaliacao.mediana_m2 > 0 && (
              <span className="text-gray-500 text-xs">Mediana m²: <strong>{fmtM2(avaliacao.mediana_m2)}</strong></span>
            )}
          </div>
        )}
      </div>

      {/* Portais consultados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <Building2 size={15} className="text-[#1A4731]" />
          <h3 className="font-semibold text-gray-800 text-sm">Portais Consultados</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(portais).map(([key, p]) => {
            const info = PORTAIS_INFO[key];
            const temDados = p.listings?.length > 0;
            const temErro = !!p.erro;
            return (
              <div key={key} className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${
                temDados ? "border-green-200 bg-green-50" : temErro ? "border-red-100 bg-red-50" : "border-gray-100 bg-gray-50"
              }`}>
                <span className="text-base">{info?.logo}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 truncate">{info?.nome || p.portal}</p>
                  <p className="text-gray-400 truncate text-[11px]">
                    {temDados ? `${p.listings.length} imóveis encontrados` : p.erro ? `Indisponível: ${p.erro}` : p.info || "Sem resultados"}
                  </p>
                </div>
                {temDados && <CheckCircle size={12} className="text-green-500 flex-shrink-0" />}
                {temErro && !temDados && <AlertCircle size={12} className="text-red-400 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Última atualização: {new Date(resultado.timestamp).toLocaleString("pt-BR")}
        </p>
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
            <p className="text-xs text-gray-500 mt-0.5">Honorários de referência APSIS para este município</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-700">{fmt(plano_presidente.valor)}</p>
            <p className="text-xs text-gray-400">por avaliação</p>
          </div>
        </div>
      </div>

      {/* Plano Diretor Municipal */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-[#1A4731]/5 px-5 py-3 flex items-center gap-2 border-b border-gray-200">
          <FileText size={16} className="text-[#1A4731]" />
          <span className="font-semibold text-gray-800 text-sm">📋 Legislação Urbanística</span>
          <span className="text-xs text-gray-500 ml-1">— {plano_diretor?.municipio}</span>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Plano Diretor",
              href: plano_diretor?.url,
              desc: "Lei de desenvolvimento urbano municipal",
              emoji: "📋",
            },
            {
              label: "Lei de Zoneamento",
              href: plano_diretor?.lei_zoneamento,
              desc: "Uso e ocupação do solo",
              emoji: "🗺️",
            },
            {
              label: "IPTU / Base Fiscal",
              href: plano_diretor?.iptu,
              desc: "Consulta de valor venal",
              emoji: "🏛️",
            },
          ].map(item => (
            <div key={item.label} className={`rounded-lg border p-3 ${item.href ? "border-[#1A4731]/20 hover:border-[#1A4731]/40 transition-colors" : "border-gray-100 opacity-60"}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <span>{item.emoji}</span> {item.label}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.desc}</p>
                </div>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-1 text-[#1A4731] hover:underline text-xs font-medium">
                    Acessar <ExternalLink size={11} />
                  </a>
                ) : (
                  <span className="text-[11px] text-gray-400 flex-shrink-0">Não mapeado</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {!plano_diretor?.url && (
          <div className="px-5 pb-4">
            <p className="text-xs text-gray-500 flex items-center gap-1.5">
              <MapPin size={11} />
              Para localizar o Plano Diretor de {plano_diretor?.municipio}, pesquise:
              <a
                href={`https://www.google.com/search?q=Plano+Diretor+${encodeURIComponent(plano_diretor?.municipio || "")}+site:.gov.br`}
                target="_blank" rel="noopener noreferrer"
                className="text-[#1A4731] hover:underline font-medium flex items-center gap-0.5"
              >
                Google <ExternalLink size={10} />
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Tabela comparativos */}
      {comparaveis && comparaveis.length > 0 && (
        <TabelaComparativos
          comparaveis={comparaveis}
          stats={stats}
          imovelRef={imovelRef}
        />
      )}

      <p className="text-xs text-gray-400 text-center px-4">
        * Avaliação estimada com base em dados de mercado e índices FIPE/ZAP. Não substitui laudo técnico de engenharia ou arquitetura.
      </p>
    </div>
  );
}