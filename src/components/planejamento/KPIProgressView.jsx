import { calcKpiStatus, KPI_STATUS_CONFIG, PERSPECTIVA_COLORS } from "./peUtils";

export default function KPIProgressView({ kpis }) {
  const comMeta = kpis.filter(k => k.meta_anual);

  return (
    <div className="space-y-3">
      {comMeta.length === 0 && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-xl border border-gray-200">
          Nenhum KPI com meta definida para exibir progresso.
        </div>
      )}
      {comMeta.map(kpi => {
        const resultados = [kpi.resultado_t1, kpi.resultado_t2, kpi.resultado_t3, kpi.resultado_t4].filter(r => r != null && r !== "");
        const ultimo = resultados.length ? Number(resultados[resultados.length - 1]) : 0;
        const meta = Number(kpi.meta_anual);
        const pct = meta ? Math.min(Math.round((ultimo / meta) * 100), 100) : 0;
        const st = calcKpiStatus(kpi);
        const sc = KPI_STATUS_CONFIG[st];
        const pc = PERSPECTIVA_COLORS[kpi.perspectiva] || PERSPECTIVA_COLORS["FINANCEIRO"];
        const barColor = st === "batida" ? "bg-green-500" : st === "progresso" ? "bg-yellow-400" : st === "fora" ? "bg-red-500" : "bg-gray-300";

        return (
          <div key={kpi.id} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {kpi.numero && <span className="font-mono text-xs font-bold text-gray-400">{kpi.numero}</span>}
                  <span className="font-semibold text-gray-800 text-sm">{kpi.nome}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${pc.bg} ${pc.text} ${pc.border}`}>{kpi.perspectiva}</span>
                </div>
                {kpi.responsavel && <p className="text-xs text-gray-400">👤 {kpi.responsavel}</p>}
              </div>
              <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                {sc.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className={`h-3 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex-shrink-0 text-right">
                <span className="text-sm font-bold text-gray-800">{ultimo}{kpi.unidade || ""}</span>
                <span className="text-xs text-gray-400"> / {meta}{kpi.unidade || ""}</span>
              </div>
              <span className={`text-sm font-bold ${pct >= 100 ? "text-green-600" : pct >= 70 ? "text-yellow-600" : "text-red-500"}`}>
                {pct}%
              </span>
            </div>
            <div className="flex gap-3 mt-2 text-xs text-gray-400">
              {["resultado_t1","resultado_t2","resultado_t3","resultado_t4"].map((f, i) => (
                <span key={f}>T{i+1}: <span className="font-semibold text-gray-600">{kpi[f] != null && kpi[f] !== "" ? `${kpi[f]}${kpi.unidade||""}` : "—"}</span></span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}