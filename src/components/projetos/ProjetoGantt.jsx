import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertTriangle, Calendar, ZoomIn, ZoomOut, Flag } from "lucide-react";

const STATUS = {
  "A fazer":      { color: "#94a3b8", bg: "bg-slate-100",   text: "text-slate-600"   },
  "Em andamento": { color: "#3b82f6", bg: "bg-blue-100",    text: "text-blue-700"    },
  "Em revisão":   { color: "#f59e0b", bg: "bg-amber-100",   text: "text-amber-700"   },
  "Concluída":    { color: "#10b981", bg: "bg-emerald-100", text: "text-emerald-700" },
  "Bloqueada":    { color: "#ef4444", bg: "bg-red-100",     text: "text-red-700"     },
};

const VIEWS = [
  { id: "week",    label: "Semana",  days: 14 },
  { id: "month",   label: "Mês",    days: 30 },
  { id: "quarter", label: "Trimestre", days: 90 },
];

function buildDays(start, count) {
  const days = [];
  const cur = new Date(start);
  for (let i = 0; i < count; i++) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function groupByEntrega(tarefas) {
  const map = {};
  tarefas.forEach(t => {
    const key = t.entrega || "Sem fase";
    if (!map[key]) map[key] = [];
    map[key].push(t);
  });
  return map;
}

export default function ProjetoGantt({ osId, projeto }) {
  const [tarefas,   setTarefas]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [viewMode,  setViewMode]  = useState("month");
  const [viewStart, setViewStart] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const [collapsed, setCollapsed] = useState({});

  const view = VIEWS.find(v => v.id === viewMode);
  const DIAS = view.days;

  useEffect(() => {
    base44.entities.Tarefa.filter({ os_id: osId }).then(t => {
      setTarefas(t);
      // auto-scroll to earliest start
      const datas = t.filter(x => x.data_inicio).map(x => new Date(x.data_inicio + "T00:00:00"));
      if (datas.length) {
        const min = new Date(Math.min(...datas));
        min.setDate(1);
        setViewStart(min);
      }
      setLoading(false);
    });
  }, [osId]);

  const viewEnd = useMemo(() => {
    const d = new Date(viewStart);
    d.setDate(d.getDate() + DIAS - 1);
    return d;
  }, [viewStart, DIAS]);

  const days = useMemo(() => buildDays(viewStart, DIAS), [viewStart, DIAS]);
  const todayIdx = days.findIndex(d => d.toDateString() === new Date().toDateString());
  const groups = useMemo(() => groupByEntrega(tarefas), [tarefas]);

  const nav = (delta) => {
    const d = new Date(viewStart);
    d.setDate(d.getDate() + delta);
    setViewStart(d);
  };
  const goToday = () => {
    const d = new Date(); d.setDate(1); setViewStart(d);
  };

  const getBar = (tarefa) => {
    if (!tarefa.data_inicio || !tarefa.data_fim) return null;
    const inicio = new Date(tarefa.data_inicio + "T00:00:00");
    const fim    = new Date(tarefa.data_fim + "T00:00:00");
    const startIdx = Math.round((inicio - viewStart) / 86400000);
    const endIdx   = Math.round((fim    - viewStart) / 86400000);
    if (endIdx < 0 || startIdx >= DIAS) return null;
    const left  = Math.max(0, startIdx);
    const right = Math.min(DIAS - 1, endIdx);
    return {
      left:  (left / DIAS) * 100,
      width: ((right - left + 1) / DIAS) * 100,
      color: STATUS[tarefa.status]?.color || "#94a3b8",
      clipped: startIdx < 0 || endIdx >= DIAS,
    };
  };

  // ── Header months ──────────────────────────────────────────────────────────
  const monthLabels = useMemo(() => {
    const labels = [];
    let cur = null; let start = 0;
    days.forEach((d, i) => {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (key !== cur) {
        if (cur !== null) labels.push({ label: days[start].toLocaleDateString("pt-BR", { month: "long", year: "numeric" }), start, span: i - start });
        cur = key; start = i;
      }
    });
    if (cur !== null) labels.push({ label: days[start].toLocaleDateString("pt-BR", { month: "long", year: "numeric" }), start, span: days.length - start });
    return labels;
  }, [days]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const total     = tarefas.length;
  const concluidas = tarefas.filter(t => t.status === "Concluída").length;
  const andamento  = tarefas.filter(t => t.status === "Em andamento").length;
  const bloqueadas = tarefas.filter(t => t.status === "Bloqueada").length;
  const pct        = total > 0 ? Math.round((concluidas / total) * 100) : 0;
  const comDatas   = tarefas.filter(t => t.data_inicio && t.data_fim).length;

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
    </div>
  );

  const COL_W = DIAS <= 14 ? 52 : DIAS <= 30 ? 32 : 14;
  const LEFT_W = 220;

  return (
    <div className="p-6 space-y-4">

      {/* ── Indicador consolidado ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#1A4731]/10 flex items-center justify-center">
              <Calendar size={16} className="text-[#1A4731]" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">{pct}%</div>
              <div className="text-xs text-slate-400">concluído</div>
            </div>
          </div>

          <div className="flex-1 min-w-[120px]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{concluidas}/{total} tarefas</span>
              <span className="font-semibold text-slate-700">{pct}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1A4731] rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <Pill icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-50" label="Concluídas" value={concluidas} />
            <Pill icon={Clock}        color="text-blue-600"    bg="bg-blue-50"    label="Em andamento" value={andamento} />
            <Pill icon={AlertTriangle} color="text-red-600"   bg="bg-red-50"     label="Bloqueadas"  value={bloqueadas} />
            <Pill icon={Flag}         color="text-violet-600" bg="bg-violet-50"  label="Com datas"   value={comDatas} />
          </div>
        </div>
      </div>

      {/* ── Controles ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                viewMode === v.id ? "bg-white shadow-sm text-[#1A4731]" : "text-slate-500 hover:text-slate-700"
              }`}>{v.label}</button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => nav(-DIAS / 2)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ChevronLeft size={14} className="text-slate-500" />
          </button>
          <button onClick={goToday} className="text-xs px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            Hoje
          </button>
          <button onClick={() => nav(DIAS / 2)} className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            <ChevronRight size={14} className="text-slate-500" />
          </button>
        </div>
        <span className="text-xs text-slate-400 ml-1 capitalize">
          {viewStart.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
          {viewMode !== "week" && ` – ${viewEnd.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}`}
        </span>
      </div>

      {/* ── Gantt ─────────────────────────────────────────────────────── */}
      {tarefas.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-16 gap-3">
          <Calendar size={32} className="text-slate-200" />
          <p className="text-sm text-slate-400">Nenhuma tarefa cadastrada. Adicione tarefas no Kanban.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-auto">
            <div style={{ minWidth: LEFT_W + DIAS * COL_W }}>

              {/* Month row */}
              <div className="flex border-b border-slate-100 bg-slate-50">
                <div style={{ width: LEFT_W, minWidth: LEFT_W }} className="border-r border-slate-100 shrink-0 px-3 py-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tarefa / Fase</span>
                </div>
                <div className="flex flex-1">
                  {monthLabels.map((m, i) => (
                    <div key={i} className="border-r border-slate-100 px-2 py-2 text-[10px] font-semibold text-slate-500 capitalize"
                      style={{ width: m.span * COL_W, minWidth: m.span * COL_W }}>
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Day header */}
              <div className="flex border-b border-slate-100 sticky top-0 bg-white z-10">
                <div style={{ width: LEFT_W, minWidth: LEFT_W }} className="border-r border-slate-100 shrink-0" />
                <div className="flex">
                  {days.map((d, i) => {
                    const isToday = d.toDateString() === new Date().toDateString();
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <div key={i} style={{ width: COL_W, minWidth: COL_W }}
                        className={`border-r border-slate-50 text-center py-1 text-[9px] select-none ${
                          isToday ? "bg-[#F47920]/10 text-[#F47920] font-bold" : isWeekend ? "bg-slate-50 text-slate-300" : "text-slate-400"
                        }`}>
                        {DIAS <= 30 ? (
                          <>
                            <div className="font-medium">{d.getDate()}</div>
                            {DIAS <= 14 && <div>{d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</div>}
                          </>
                        ) : (
                          d.getDate() % 5 === 0 ? d.getDate() : ""
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Groups */}
              {Object.entries(groups).map(([fase, tarefasFase]) => (
                <div key={fase}>
                  {/* Phase header */}
                  <div className="flex border-b border-slate-100 bg-slate-50/70 hover:bg-slate-100/60 cursor-pointer"
                    onClick={() => setCollapsed(c => ({ ...c, [fase]: !c[fase] }))}>
                    <div style={{ width: LEFT_W, minWidth: LEFT_W }}
                      className="border-r border-slate-100 shrink-0 px-3 py-2 flex items-center gap-2">
                      <span className={`text-[10px] transition-transform ${collapsed[fase] ? "-rotate-90" : ""}`}>▾</span>
                      <span className="text-xs font-bold text-slate-700 truncate">{fase}</span>
                      <span className="text-[10px] text-slate-400 ml-auto shrink-0">{tarefasFase.length}</span>
                    </div>
                    <div className="flex-1 relative h-8">
                      {/* Phase span bar */}
                      {(() => {
                        const datas = tarefasFase.filter(t => t.data_inicio && t.data_fim);
                        if (!datas.length) return null;
                        const minD = new Date(Math.min(...datas.map(t => new Date(t.data_inicio + "T00:00:00"))));
                        const maxD = new Date(Math.max(...datas.map(t => new Date(t.data_fim + "T00:00:00"))));
                        const si = Math.round((minD - viewStart) / 86400000);
                        const ei = Math.round((maxD - viewStart) / 86400000);
                        if (ei < 0 || si >= DIAS) return null;
                        const l = (Math.max(0, si) / DIAS) * 100;
                        const w = ((Math.min(DIAS - 1, ei) - Math.max(0, si) + 1) / DIAS) * 100;
                        return <div className="absolute top-1.5 h-5 rounded bg-[#1A4731]/10 border border-[#1A4731]/20"
                          style={{ left: `${l}%`, width: `${w}%` }} />;
                      })()}
                      {/* Today line */}
                      {todayIdx >= 0 && (
                        <div className="absolute top-0 bottom-0 w-px bg-[#F47920]/60 z-20"
                          style={{ left: `${((todayIdx + 0.5) / DIAS) * 100}%` }} />
                      )}
                    </div>
                  </div>

                  {/* Tarefas */}
                  {!collapsed[fase] && tarefasFase.map((t, idx) => {
                    const bar = getBar(t);
                    const st  = STATUS[t.status] || STATUS["A fazer"];
                    const vencida = t.data_fim && new Date(t.data_fim + "T00:00:00") < new Date() && t.status !== "Concluída";
                    return (
                      <div key={t.id} className={`flex border-b border-slate-50 last:border-0 group ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                        <div style={{ width: LEFT_W, minWidth: LEFT_W }}
                          className="border-r border-slate-100 shrink-0 px-3 py-2 flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0`} style={{ backgroundColor: st.color }} />
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-medium truncate ${vencida ? "text-red-500" : "text-slate-700"}`}>{t.titulo}</p>
                            <p className="text-[10px] text-slate-400 truncate">{t.responsavel || "—"}</p>
                          </div>
                          {t.prioridade === "Crítica" && <span className="text-red-400 flex-shrink-0"><AlertTriangle size={10} /></span>}
                        </div>

                        <div className="flex-1 relative" style={{ height: 40 }}>
                          {/* Weekend shade */}
                          <div className="absolute inset-0 flex pointer-events-none">
                            {days.map((d, i) => (
                              <div key={i} style={{ width: COL_W }} className={`${d.getDay() === 0 || d.getDay() === 6 ? "bg-slate-50/60" : ""} border-r border-slate-50/80`} />
                            ))}
                          </div>

                          {/* Bar */}
                          {bar ? (
                            <div className="absolute top-2 rounded-md flex items-center px-1.5 text-white text-[10px] font-medium shadow-sm z-10 overflow-hidden"
                              style={{
                                left:  `${bar.left}%`,
                                width: `${bar.width}%`,
                                height: 24,
                                backgroundColor: bar.color,
                                opacity: t.status === "A fazer" ? 0.6 : 1,
                              }}
                              title={`${t.titulo} · ${t.status}${t.data_inicio ? ` · ${new Date(t.data_inicio + "T00:00:00").toLocaleDateString("pt-BR")}` : ""} – ${t.data_fim ? new Date(t.data_fim + "T00:00:00").toLocaleDateString("pt-BR") : "?"}`}>
                              {/* Progress fill */}
                              {t.status === "Em andamento" && (
                                <div className="absolute inset-0 bg-white/20 rounded-md"
                                  style={{ width: `${t.horas_realizadas && t.horas_estimadas ? Math.min(100, (t.horas_realizadas / t.horas_estimadas) * 100) : 30}%` }} />
                              )}
                              <span className="relative truncate">{DIAS <= 30 ? t.titulo : ""}</span>
                            </div>
                          ) : (
                            <div className="absolute top-0 bottom-0 flex items-center px-1">
                              <span className="text-[10px] text-slate-300 italic">sem datas</span>
                            </div>
                          )}

                          {/* Today line */}
                          {todayIdx >= 0 && (
                            <div className="absolute top-0 bottom-0 w-px bg-[#F47920]/50 z-20"
                              style={{ left: `${((todayIdx + 0.5) / DIAS) * 100}%` }} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Legenda ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4">
        {Object.entries(STATUS).map(([s, v]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: v.color }} />
            {s}
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-auto">
          <span className="w-3 h-0.5 bg-[#F47920]" /> Hoje
        </div>
      </div>
    </div>
  );
}

function Pill({ icon: Icon, color, bg, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center`}>
        <Icon size={12} className={color} />
      </div>
      <div>
        <div className="text-sm font-bold text-slate-800 leading-none">{value}</div>
        <div className="text-[10px] text-slate-400">{label}</div>
      </div>
    </div>
  );
}