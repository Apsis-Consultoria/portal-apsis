import { STATUS_CONFIG } from "./peUtils";

const DIRETORES = ["Bruno Bottino", "Caio Favero", "Marcelo Nascimento", "Angela Magalhães", "Miguel Monteiro", "Outro"];
const DIRETOR_COLORS = {
  "Bruno Bottino": { bg: "bg-blue-600", light: "bg-blue-50", border: "border-blue-200", text: "text-blue-800" },
  "Caio Favero": { bg: "bg-orange-500", light: "bg-orange-50", border: "border-orange-200", text: "text-orange-800" },
  "Marcelo Nascimento": { bg: "bg-purple-600", light: "bg-purple-50", border: "border-purple-200", text: "text-purple-800" },
  "Angela Magalhães": { bg: "bg-pink-500", light: "bg-pink-50", border: "border-pink-200", text: "text-pink-800" },
  "Miguel Monteiro": { bg: "bg-green-600", light: "bg-green-50", border: "border-green-200", text: "text-green-800" },
  "Outro": { bg: "bg-gray-500", light: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
};

export default function MetasCardsView({ items }) {
  const diretores = DIRETORES.filter(d => items.some(i => i.diretor === d));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {diretores.map(diretor => {
        const grupo = items.filter(i => i.diretor === diretor);
        const concluidas = grupo.filter(i => i.status === "Concluído").length;
        const pct = grupo.length ? Math.round((concluidas / grupo.length) * 100) : 0;
        const dc = DIRETOR_COLORS[diretor] || DIRETOR_COLORS["Outro"];
        const temas = [...new Set(grupo.map(i => i.tema))];

        return (
          <div key={diretor} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className={`px-5 py-4 ${dc.bg} text-white`}>
              <h3 className="font-bold text-base">{diretor}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-white/80 text-sm">{grupo.length} metas · {concluidas} concluídas</span>
                <span className="font-bold text-lg">{pct}%</span>
              </div>
              <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                <div className="h-2 rounded-full bg-white transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Temas */}
            <div className="px-4 py-2 border-b border-gray-100 flex gap-2 flex-wrap">
              {temas.map(t => (
                <span key={t} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${dc.light} ${dc.text} ${dc.border}`}>{t}</span>
              ))}
            </div>

            {/* Metas */}
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {grupo.map(item => {
                const sc = STATUS_CONFIG[item.status || "Não Iniciado"];
                const hoje = new Date();
                const atrasada = item.prazo && new Date(item.prazo + "T12:00:00") < hoje && item.status !== "Concluído";
                return (
                  <div key={item.id} className="px-4 py-3 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{item.iniciativa}</p>
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-400">
                        {item.responsavel_execucao && <span>👤 {item.responsavel_execucao}</span>}
                        {item.prazo && (
                          <span className={atrasada ? "text-red-600 font-semibold" : ""}>
                            📅 {new Date(item.prazo + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            {atrasada && " ⚠️"}
                          </span>
                        )}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full border ${dc.light} ${dc.text} ${dc.border}`}>{item.tema}</span>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${sc.bg} ${sc.text} ${sc.border}`}>
                      {sc.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}