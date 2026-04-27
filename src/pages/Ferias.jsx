import { useState, useEffect } from "react";
import { colaboradoresService } from "@/lib/supabaseColaboradores";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays, Plus, Trash2, Search, ChevronDown, ChevronUp,
  AlertCircle, CheckCircle2, Clock
} from "lucide-react";
import { getDiasUteisNoIntervalo } from "@/components/rateiocaju/feriadosUtils";

// ── Integração com o localStorage do Rateio Caju ──────────────────────────
const STORAGE_KEY = "ferias_programadas_caju";

function loadFerias() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function saveFerias(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Helpers ────────────────────────────────────────────────────────────────
const UNIDADE_CONFIG = {
  SP:     { badge: "bg-blue-100 text-blue-800",     border: "border-blue-200",   header: "bg-blue-50"   },
  RJ:     { badge: "bg-emerald-100 text-emerald-800", border: "border-emerald-200", header: "bg-emerald-50" },
  Carbon: { badge: "bg-teal-100 text-teal-800",     border: "border-teal-200",   header: "bg-teal-50"   },
  REDD:   { badge: "bg-purple-100 text-purple-800", border: "border-purple-200", header: "bg-purple-50"  },
};

function formatDate(d) {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function getStatusPeriodo(inicio, fim) {
  const hoje = new Date();
  const ini = new Date(inicio + "T00:00:00");
  const f = new Date(fim + "T00:00:00");
  if (f < hoje) return { label: "Encerrado", cls: "bg-slate-100 text-slate-500", icon: CheckCircle2 };
  if (ini <= hoje) return { label: "Em andamento", cls: "bg-green-100 text-green-700", icon: Clock };
  return { label: "Agendado", cls: "bg-orange-100 text-orange-700", icon: AlertCircle };
}

function totalDiasCalendario(inicio, fim) {
  if (!inicio || !fim) return 0;
  const ini = new Date(inicio + "T00:00:00");
  const f = new Date(fim + "T00:00:00");
  return Math.max(0, Math.round((f - ini) / 86400000) + 1);
}

// ── Componente principal ───────────────────────────────────────────────────
export default function Ferias() {
  const [colaboradores, setColaboradores] = useState([]);
  const [ferias, setFerias] = useState({});
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [expandidos, setExpandidos] = useState({});
  const [unidadesExpandidas, setUnidadesExpandidas] = useState({});
  const [adicionando, setAdicionando] = useState(null);
  const [novoInicio, setNovoInicio] = useState("");
  const [novoFim, setNovoFim] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("Todas");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  useEffect(() => {
    setLoading(true);
    colaboradoresService.list().then(data => {
      setColaboradores((data || []).filter(c => c.ativo !== false));
      setFerias(loadFerias());
      setLoading(false);
    });
  }, []);

  const handleAdd = (id) => {
    if (!novoInicio || !novoFim || novoFim < novoInicio) return;
    const atual = ferias[id] || [];
    const updated = { ...ferias, [id]: [...atual, { inicio: novoInicio, fim: novoFim }] };
    setFerias(updated);
    saveFerias(updated);
    setAdicionando(null);
    setNovoInicio("");
    setNovoFim("");
  };

  const handleRemove = (id, idx) => {
    if (!window.confirm("Remover este período de férias?")) return;
    const atual = ferias[id] || [];
    const updated = { ...ferias, [id]: atual.filter((_, i) => i !== idx) };
    setFerias(updated);
    saveFerias(updated);
  };

  const toggleExpand = (id) => setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleUnidade = (u) => setUnidadesExpandidas(prev => ({ ...prev, [u]: !prev[u] }));

  // ── Filtragem ──────────────────────────────────────────────────────────
  const cajuColabs = colaboradores;

  const unidades = ["Todas", ...new Set(cajuColabs.map(c => c.unidade).filter(Boolean))];

  const filtrados = cajuColabs.filter(c => {
    const nomeOk = !busca || (c.nome || "").toLowerCase().includes(busca.toLowerCase());
    const unidadeOk = filtroUnidade === "Todas" || c.unidade === filtroUnidade;
    const periodos = ferias[c.id] || [];
    const statusOk =
      filtroStatus === "Todos" ||
      (filtroStatus === "Com férias" && periodos.length > 0) ||
      (filtroStatus === "Sem férias" && periodos.length === 0);
    return nomeOk && unidadeOk && statusOk;
  });

  // ── KPIs ──────────────────────────────────────────────────────────────
  const vinculos = [...new Set(cajuColabs.map(c => c.tipo_vinculo || c.tipo_contrato).filter(Boolean))];
  const subTotalColabs = vinculos.length > 0 ? vinculos.join(" + ") : "Todos os vínculos";
  const totalComFerias = cajuColabs.filter(c => (ferias[c.id] || []).length > 0).length;
  const totalPeriodos = Object.values(ferias).reduce((acc, arr) => acc + (arr?.length || 0), 0);
  const hoje = new Date();
  const emAndamento = cajuColabs.filter(c =>
    (ferias[c.id] || []).some(p => new Date(p.inicio + "T00:00:00") <= hoje && new Date(p.fim + "T00:00:00") >= hoje)
  ).length;

  // ── Agrupamento por unidade ────────────────────────────────────────────
  const porUnidade = ["SP", "RJ", "Carbon", "REDD"]
    .map(u => ({
      unidade: u,
      colabs: filtrados.filter(c => c.unidade === u),
    }))
    .filter(g => g.colabs.length > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
        <span className="text-sm">Carregando colaboradores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1A4731]">Férias</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gerencie os períodos de férias de todos os colaboradores.
          </p>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Colaboradores",    value: cajuColabs.length,   sub: subTotalColabs, cls: "text-[#1A4731]",   bg: "bg-[#1A4731]/10" },
          { label: "Com férias",        value: totalComFerias,      sub: "ao menos 1 período", cls: "text-orange-600", bg: "bg-orange-50" },
          { label: "Em andamento",      value: emAndamento,         sub: "atualmente de férias", cls: "text-blue-600",  bg: "bg-blue-50" },
          { label: "Períodos totais",   value: totalPeriodos,       sub: "registrados",        cls: "text-purple-600", bg: "bg-purple-50" },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{k.label}</span>
              <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center`}>
                <CalendarDays size={15} className={k.cls} />
              </div>
            </div>
            <p className={`text-3xl font-bold leading-none ${k.cls}`}>{k.value}</p>
            <p className="text-xs text-slate-400 mt-2">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar colaborador..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A4731] bg-slate-50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {unidades.map(u => (
            <button
              key={u}
              onClick={() => setFiltroUnidade(u)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                filtroUnidade === u
                  ? "bg-[#1A4731] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["Todos", "Com férias", "Sem férias"].map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                filtroStatus === s
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lista por unidade ───────────────────────────────────────── */}
      <div className="space-y-4">
        {porUnidade.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">Nenhum colaborador encontrado.</div>
        )}
        {porUnidade.map(({ unidade, colabs }) => {
          const cfg = UNIDADE_CONFIG[unidade] || UNIDADE_CONFIG.SP;
          const isUnidadeExpanded = !!unidadesExpandidas[unidade];
          return (
            <div key={unidade} className={`bg-white rounded-2xl border-2 ${cfg.border} shadow-sm overflow-hidden`}>
              {/* Header unidade — clicável para expandir/colapsar */}
              <button
                onClick={() => toggleUnidade(unidade)}
                className={`w-full px-5 py-3 flex items-center gap-3 ${cfg.header} hover:opacity-80 transition`}
              >
                <Badge className={`${cfg.badge} font-bold px-3`}>{unidade}</Badge>
                <span className="text-xs text-slate-500 font-medium">{colabs.length} colaborador{colabs.length !== 1 ? "es" : ""}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500">
                  {colabs.filter(c => (ferias[c.id] || []).length > 0).length} com férias registradas
                </span>
                <span className="ml-auto text-slate-400">
                  {isUnidadeExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </button>

              {/* Lista de colaboradores — visível apenas se expandida */}
              {isUnidadeExpanded && <div className="divide-y divide-slate-100">
                {colabs.map(c => {
                  const periodos = ferias[c.id] || [];
                  const isExpanded = expandidos[c.id];
                  const isAdding = adicionando === c.id;
                  const estado = unidade === "SP" ? "SP" : "RJ";

                  return (
                    <div key={c.id} className="px-5 py-3">
                      {/* Linha principal */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-800">{c.nome}</span>
                            {c.area && <span className="text-xs text-slate-400">{c.area}</span>}
                            {(c.tipo_vinculo || c.tipo_contrato) && (
                              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                (c.tipo_vinculo || c.tipo_contrato) === "Estagiário"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}>
                                {c.tipo_vinculo || c.tipo_contrato}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Badges de períodos */}
                        <div className="flex items-center gap-2">
                          {periodos.length > 0 ? (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                              {periodos.length} período{periodos.length !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">Sem férias</span>
                          )}
                          <button
                            onClick={() => { setAdicionando(c.id); setNovoInicio(""); setNovoFim(""); }}
                            className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded-lg transition"
                          >
                            <Plus size={12} /> Adicionar
                          </button>
                          {periodos.length > 0 && (
                            <button
                              onClick={() => toggleExpand(c.id)}
                              className="p-1 rounded-lg hover:bg-slate-100 transition text-slate-400"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Formulário inline para adicionar */}
                      {isAdding && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                          <span className="text-xs text-orange-700 font-medium">Novo período:</span>
                          <input
                            type="date"
                            value={novoInicio}
                            onChange={e => setNovoInicio(e.target.value)}
                            className="border border-orange-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-orange-400 bg-white"
                          />
                          <span className="text-xs text-slate-400">até</span>
                          <input
                            type="date"
                            value={novoFim}
                            min={novoInicio}
                            onChange={e => setNovoFim(e.target.value)}
                            className="border border-orange-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-orange-400 bg-white"
                          />
                          {novoInicio && novoFim && novoFim >= novoInicio && (
                            <span className="text-xs text-slate-500">
                              {totalDiasCalendario(novoInicio, novoFim)} dias corridos
                            </span>
                          )}
                          <button
                            onClick={() => handleAdd(c.id)}
                            disabled={!novoInicio || !novoFim || novoFim < novoInicio}
                            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 rounded-lg disabled:opacity-40 transition"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => setAdicionando(null)}
                            className="text-xs text-slate-400 hover:text-slate-600"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}

                      {/* Períodos expandidos */}
                      {isExpanded && periodos.length > 0 && (
                        <div className="mt-2 space-y-1.5 pl-2">
                          {periodos.map((p, idx) => {
                            const status = getStatusPeriodo(p.inicio, p.fim);
                            const StatusIcon = status.icon;
                            const diasCorr = totalDiasCalendario(p.inicio, p.fim);
                            return (
                              <div key={idx} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                                <CalendarDays size={13} className="text-slate-400 flex-shrink-0" />
                                <span className="text-xs font-medium text-slate-700">
                                  {formatDate(p.inicio)} → {formatDate(p.fim)}
                                </span>
                                <span className="text-xs text-slate-400">{diasCorr} dias corridos</span>
                                <span className={`flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${status.cls}`}>
                                  <StatusIcon size={9} />
                                  {status.label}
                                </span>
                                <button
                                  onClick={() => handleRemove(c.id, idx)}
                                  className="ml-auto text-slate-300 hover:text-red-500 transition"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>}
            </div>
          );
        })}
      </div>



    </div>
  );
}