import { useState } from "react";
import { ExternalLink, ArrowUpDown, ArrowUp, ArrowDown, BarChart3, TrendingUp, Activity } from "lucide-react";

const fmt = (v) => v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "—";
const fmtM2 = (v) => v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) + "/m²" : "—";

const PORTAL_BADGES = {
  vivareal: { label: "Viva Real", bg: "bg-emerald-100", text: "text-emerald-700" },
  zapimoveis: { label: "ZAP Imóveis", bg: "bg-red-100", text: "text-red-700" },
  imoveisweb: { label: "Imóveis Web", bg: "bg-blue-100", text: "text-blue-700" },
  quintoandar: { label: "Quinto Andar", bg: "bg-purple-100", text: "text-purple-700" },
};

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ArrowUpDown size={12} className="text-gray-300" />;
  return sortDir === "asc" ? <ArrowUp size={12} className="text-[#1A4731]" /> : <ArrowDown size={12} className="text-[#1A4731]" />;
}

export default function TabelaComparativos({ comparaveis, stats, imovelRef }) {
  const [sortField, setSortField] = useState("preco");
  const [sortDir, setSortDir] = useState("asc");
  const [filterPortal, setFilterPortal] = useState("todos");

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const portaisDisponiveis = [...new Set(comparaveis.map(c => c.portal_key).filter(Boolean))];

  const lista = [...comparaveis]
    .filter(c => filterPortal === "todos" || c.portal_key === filterPortal)
    .sort((a, b) => {
      const va = a[sortField] ?? 0;
      const vb = b[sortField] ?? 0;
      return sortDir === "asc" ? va - vb : vb - va;
    });

  const mediana = stats?.mediana || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-[#1A4731]" />
          <h3 className="font-semibold text-gray-800 text-sm">Comparativos de Mercado</h3>
          <span className="bg-[#1A4731]/10 text-[#1A4731] text-xs font-medium px-2 py-0.5 rounded-full">
            {comparaveis.length} imóveis
          </span>
        </div>

        {/* Filtro portal */}
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setFilterPortal("todos")}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filterPortal === "todos" ? "bg-[#1A4731] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Todos
          </button>
          {portaisDisponiveis.map(p => {
            const badge = PORTAL_BADGES[p] || { label: p, bg: "bg-gray-100", text: "text-gray-600" };
            return (
              <button
                key={p}
                onClick={() => setFilterPortal(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${filterPortal === p ? "bg-[#1A4731] text-white" : `${badge.bg} ${badge.text} hover:opacity-80`}`}
              >
                {badge.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Mediana m²", value: fmtM2(stats.mediana), icon: TrendingUp, color: "text-[#1A4731]" },
            { label: "Média m²", value: fmtM2(stats.media), icon: Activity, color: "text-blue-600" },
            { label: "Mínimo m²", value: fmtM2(stats.min), icon: ArrowDown, color: "text-green-600" },
            { label: "Máximo m²", value: fmtM2(stats.max), icon: ArrowUp, color: "text-red-500" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <s.icon size={13} className={s.color} />
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-3 py-2.5 text-left text-gray-500 font-medium">Portal</th>
              <th className="px-3 py-2.5 text-left text-gray-500 font-medium">Endereço/Bairro</th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-medium cursor-pointer hover:text-gray-700" onClick={() => toggleSort("area")}>
                <span className="flex items-center justify-center gap-1">Área <SortIcon field="area" sortField={sortField} sortDir={sortDir} /></span>
              </th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-medium cursor-pointer hover:text-gray-700" onClick={() => toggleSort("quartos")}>
                <span className="flex items-center justify-center gap-1">Qts <SortIcon field="quartos" sortField={sortField} sortDir={sortDir} /></span>
              </th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-medium">Banh</th>
              <th className="px-3 py-2.5 text-right text-gray-500 font-medium cursor-pointer hover:text-gray-700" onClick={() => toggleSort("preco")}>
                <span className="flex items-center justify-end gap-1">Preço <SortIcon field="preco" sortField={sortField} sortDir={sortDir} /></span>
              </th>
              <th className="px-3 py-2.5 text-right text-gray-500 font-medium cursor-pointer hover:text-gray-700" onClick={() => toggleSort("preco_m2")}>
                <span className="flex items-center justify-end gap-1">R$/m² <SortIcon field="preco_m2" sortField={sortField} sortDir={sortDir} /></span>
              </th>
              <th className="px-3 py-2.5 text-center text-gray-500 font-medium">Link</th>
            </tr>
          </thead>
          <tbody>
            {/* Linha de referência do imóvel avaliado */}
            {imovelRef && (
              <tr className="bg-[#1A4731]/8 border-b border-[#1A4731]/20">
                <td className="px-3 py-2.5" colSpan={2}>
                  <span className="inline-flex items-center gap-1.5 bg-[#1A4731] text-white px-2 py-0.5 rounded text-xs font-medium">
                    ★ Imóvel Avaliado
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center font-semibold text-gray-700">{imovelRef.area}m²</td>
                <td className="px-3 py-2.5 text-center text-gray-700">{imovelRef.quartos}</td>
                <td className="px-3 py-2.5 text-center text-gray-700">{imovelRef.banheiros}</td>
                <td className="px-3 py-2.5 text-right font-bold text-[#1A4731]">{fmt(imovelRef.estimativa)}</td>
                <td className="px-3 py-2.5 text-right font-semibold text-[#1A4731]">{fmtM2(imovelRef.valor_m2)}</td>
                <td className="px-3 py-2.5 text-center text-gray-300">—</td>
              </tr>
            )}

            {lista.map((item, i) => {
              const badge = PORTAL_BADGES[item.portal_key] || { label: item.portal || "Portal", bg: "bg-gray-100", text: "text-gray-600" };
              const abaixoMediana = mediana > 0 && item.preco_m2 > 0 && item.preco_m2 < mediana;
              const acimaMediana = mediana > 0 && item.preco_m2 > 0 && item.preco_m2 > mediana * 1.1;

              return (
                <tr key={item.id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {item.origem === "estimado" && (
                        <span className="text-gray-400 text-[10px]">estimado</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 max-w-[140px]">
                    <p className="text-gray-700 font-medium truncate">{item.titulo || "Imóvel"}</p>
                    <p className="text-gray-400 truncate">{item.bairro || item.endereco || "—"}</p>
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{item.area > 0 ? `${item.area}m²` : "—"}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{item.quartos || "—"}</td>
                  <td className="px-3 py-2.5 text-center text-gray-700">{item.banheiros || "—"}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-gray-800">{fmt(item.preco)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-semibold ${abaixoMediana ? "text-green-600" : acimaMediana ? "text-red-500" : "text-gray-700"}`}>
                      {fmtM2(item.preco_m2)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[#1A4731]/10 text-gray-400 hover:text-[#1A4731] transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    ) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-200 border border-green-400 inline-block" /> Abaixo da mediana</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300 inline-block" /> Acima da mediana (+10%)</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 border border-gray-300 inline-block" /> "estimado" = gerado por modelo de mercado</span>
        </div>
      </div>
    </div>
  );
}