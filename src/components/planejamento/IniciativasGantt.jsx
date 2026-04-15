import { STATUS_CONFIG, PERSPECTIVA_COLORS } from "./peUtils";

export default function IniciativasGantt({ items }) {
  const comDeadline = [...items].filter(i => i.deadline).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  const semDeadline = items.filter(i => !i.deadline);
  const hoje = new Date();
  const hojeStr = hoje.toLocaleDateString("pt-BR");

  const formatDate = (d) => new Date(d + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  const getBarWidth = (deadline) => {
    const d = new Date(deadline + "T12:00:00");
    const inicio = new Date("2026-01-01");
    const fim = new Date("2026-12-31");
    const total = fim - inicio;
    const posicao = Math.min(Math.max(d - inicio, 0), total);
    return Math.round((posicao / total) * 100);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-sm">Timeline 2026 — Ordenado por Deadline</h3>
        <div className="flex gap-4 text-xs text-gray-400">
          <div className="w-full flex gap-1">
            {["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map(m => (
              <span key={m} className="flex-1 text-center text-gray-300 font-medium">{m}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Meses header */}
      <div className="px-5 pt-2 pb-1">
        <div className="flex text-xs text-gray-300 font-semibold border-b border-gray-100 pb-1 ml-[280px]">
          {["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"].map(m => (
            <span key={m} className="flex-1 text-center">{m}</span>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
        {comDeadline.map(item => {
          const sc = STATUS_CONFIG[item.status || "Não Iniciado"];
          const pc = PERSPECTIVA_COLORS[item.perspectiva] || PERSPECTIVA_COLORS["FINANCEIRO"];
          const barPct = getBarWidth(item.deadline);
          const atrasada = new Date(item.deadline + "T12:00:00") < hoje && item.status !== "Concluído";
          const barColor = item.status === "Concluído" ? "bg-green-500" : atrasada ? "bg-red-400" : item.status === "Em Andamento" ? "bg-blue-400" : "bg-gray-300";

          return (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
              {/* Info */}
              <div className="w-72 flex-shrink-0 min-w-0">
                <div className="flex items-center gap-1.5">
                  {item.numero && <span className="font-mono text-xs text-gray-400 font-bold flex-shrink-0">{item.numero}</span>}
                  <span className="text-sm font-medium text-gray-800 truncate">{item.iniciativa}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.responsavel && <span className="text-xs text-gray-400 truncate">👤 {item.responsavel}</span>}
                  <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>{sc.label}</span>
                </div>
              </div>

              {/* Bar */}
              <div className="flex-1 relative h-6">
                <div className="absolute inset-0 bg-gray-100 rounded-full" />
                {/* Today line */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10" style={{ left: `${getBarWidth(hoje.toISOString().split("T")[0])}%` }} />
                {/* Bar to deadline */}
                <div className={`absolute left-0 top-1 bottom-1 rounded-full ${barColor} transition-all duration-500`} style={{ width: `${barPct}%` }} />
                {/* Deadline marker */}
                <div className={`absolute top-0 bottom-0 w-0.5 ${atrasada ? "bg-red-600" : "bg-[#003366]"}`} style={{ left: `${barPct}%` }}>
                  <div className={`absolute -top-0.5 left-1 text-xs whitespace-nowrap font-semibold ${atrasada ? "text-red-600" : "text-[#003366]"}`}>
                    {formatDate(item.deadline)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {semDeadline.length > 0 && (
          <div className="px-5 py-3 bg-gray-50">
            <p className="text-xs text-gray-400 font-semibold mb-2">Sem deadline definido ({semDeadline.length})</p>
            {semDeadline.map(item => {
              const sc = STATUS_CONFIG[item.status || "Não Iniciado"];
              return (
                <div key={item.id} className="flex items-center gap-2 py-1.5">
                  {item.numero && <span className="font-mono text-xs text-gray-400 font-bold">{item.numero}</span>}
                  <span className="text-sm text-gray-600">{item.iniciativa}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>{sc.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {comDeadline.length === 0 && semDeadline.length === 0 && (
          <div className="text-center py-16 text-gray-400">Nenhuma iniciativa para exibir</div>
        )}
      </div>
    </div>
  );
}