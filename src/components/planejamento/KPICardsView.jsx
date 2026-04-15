import { PERSPECTIVAS, PERSPECTIVA_COLORS, calcKpiStatus, KPI_STATUS_CONFIG } from "./peUtils";

export default function KPICardsView({ kpis }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {PERSPECTIVAS.map(p => {
        const grupo = kpis.filter(k => k.perspectiva === p);
        if (!grupo.length) return null;
        const batidas = grupo.filter(k => calcKpiStatus(k) === "batida").length;
        const pct = grupo.length ? Math.round((batidas / grupo.length) * 100) : 0;
        const colors = PERSPECTIVA_COLORS[p];
        return (
          <div key={p} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className={`px-5 py-4 border-b ${colors.bg} ${colors.border}`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-sm ${colors.text}`}>{p}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${colors.text}`}>{pct}% metas batidas</span>
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                </div>
              </div>
              <div className="mt-2 w-full bg-white/60 rounded-full h-2">
                <div className={`h-2 rounded-full ${colors.dot} transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{batidas} de {grupo.length} KPIs com meta batida</p>
            </div>
            <div className="divide-y divide-gray-50">
              {grupo.map(kpi => {
                const st = calcKpiStatus(kpi);
                const sc = KPI_STATUS_CONFIG[st];
                return (
                  <div key={kpi.id} className="px-5 py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {kpi.numero && <span className="text-xs font-mono font-bold text-gray-400">{kpi.numero}</span>}
                        <span className="text-sm font-medium text-gray-800 truncate">{kpi.nome}</span>
                      </div>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        {kpi.responsavel && <span>👤 {kpi.responsavel}</span>}
                        {kpi.meta_anual && <span>🎯 Meta: {kpi.meta_anual}{kpi.unidade}</span>}
                        {kpi.periodicidade && <span>📅 {kpi.periodicidade}</span>}
                      </div>
                      {/* Mini resultados */}
                      <div className="flex gap-2 mt-2">
                        {["resultado_t1","resultado_t2","resultado_t3","resultado_t4"].map((f,i) => (
                          kpi[f] != null && kpi[f] !== "" ? (
                            <span key={f} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">T{i+1}: {kpi[f]}{kpi.unidade || ""}</span>
                          ) : null
                        ))}
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
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