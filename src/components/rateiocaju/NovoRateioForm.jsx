import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { colaboradoresService } from "@/lib/supabaseColaboradores";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMes, getDiasUteisNoIntervalo } from "./feriadosUtils";
import { getDiasUteisParaMes } from "./FeriadosModal";
import { CalendarDays, ArrowLeft } from "lucide-react";
import FeriasColaboradorModal from "./FeriasColaboradorModal";

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Valor VR diário padrão por unidade (CLT)
const VR_DIARIO_DEFAULT = { RJ: 29.0, SP: 31.5, Carbon: 29.0, REDD: 29.0 };
// Valor VR diário padrão para estagiários (apenas RJ e SP)
const VR_ESTAGIARIO_DEFAULT = { RJ: 20.0, SP: 20.0 };

// Unidades que usam dias úteis de RJ
const USA_DIAS_RJ = ["RJ", "Carbon", "REDD"];

// Config visual de cada unidade
const UNIDADE_CONFIG = {
  RJ:     { color: "green",  label: "Rio de Janeiro", badgeCls: "bg-green-100 text-green-800",   borderCls: "border-green-200",  hoverCls: "hover:bg-green-50",  totalCls: "text-green-700",  infoCls: "text-green-700 bg-green-50"  },
  SP:     { color: "blue",   label: "São Paulo",       badgeCls: "bg-blue-100 text-blue-800",     borderCls: "border-blue-200",   hoverCls: "hover:bg-blue-50",   totalCls: "text-blue-700",   infoCls: "text-blue-700 bg-blue-50"    },
  Carbon: { color: "teal",   label: "Carbon",          badgeCls: "bg-teal-100 text-teal-800",     borderCls: "border-teal-200",   hoverCls: "hover:bg-teal-50",   totalCls: "text-teal-700",   infoCls: "text-teal-700 bg-teal-50"    },
  REDD:   { color: "purple", label: "REDD",            badgeCls: "bg-purple-100 text-purple-800", borderCls: "border-purple-200", hoverCls: "hover:bg-purple-50", totalCls: "text-purple-700", infoCls: "text-purple-700 bg-purple-50" },
};

const UNIDADES = ["RJ", "SP", "Carbon", "REDD"];

// Calcula dias de férias de um colaborador no mês a partir dos períodos
function calcDiasFeriasMes(colaboradorId, ferias, ano, mes, estado) {
  const periodos = ferias[colaboradorId] || [];
  return periodos.reduce((acc, p) => acc + getDiasUteisNoIntervalo(p.inicio, p.fim, ano, mes, estado), 0);
}

function ColaboradorRow({ c, cfg, selecionado, onToggle, diasFerias, diasEfetivos, valor, periodos, onAddFerias, onRemoveFerias }) {
  const [novoInicio, setNovoInicio] = useState("");
  const [novoFim, setNovoFim] = useState("");
  const [adicionando, setAdicionando] = useState(false);

  const handleAdd = () => {
    if (!novoInicio || !novoFim || novoFim < novoInicio) return;
    onAddFerias(c.id, { inicio: novoInicio, fim: novoFim });
    setNovoInicio("");
    setNovoFim("");
    setAdicionando(false);
  };

  return (
    <div className={`p-2.5 rounded-lg ${cfg.hoverCls} transition`}>
      {/* Linha principal */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={selecionado}
          onChange={() => onToggle(c.id)}
          className="w-4 h-4 cursor-pointer flex-shrink-0"
        />
        <span className="text-sm flex-1 text-gray-800 cursor-pointer font-medium" onClick={() => onToggle(c.id)}>
          {c.nome}
        </span>
        {c.area && <span className="text-xs text-gray-400">{c.area}</span>}
        {/* Botão para adicionar férias */}
        <button
          onClick={() => setAdicionando(a => !a)}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition px-1.5 py-0.5 rounded hover:bg-orange-50"
          title="Adicionar período de férias"
        >
          <CalendarDays size={12} />
          <span>férias</span>
        </button>
        {diasFerias > 0 && (
          <span className="text-xs text-orange-500 font-medium">
            -{diasFerias}d → {diasEfetivos}d úteis
          </span>
        )}
        <span className="text-sm font-medium text-gray-700 w-20 text-right">{fmt(valor)}</span>
      </div>

      {/* Períodos de férias existentes */}
      {periodos.length > 0 && (
        <div className="ml-7 mt-1.5 flex flex-wrap gap-1.5">
          {periodos.map((p, idx) => (
            <span key={idx} className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-md px-2 py-0.5">
              <CalendarDays size={10} />
              {p.inicio} → {p.fim}
              <button onClick={() => onRemoveFerias(c.id, idx)} className="ml-0.5 text-red-400 hover:text-red-600 leading-none">×</button>
            </span>
          ))}
        </div>
      )}

      {/* Formulário inline para adicionar período */}
      {adicionando && (
        <div className="ml-7 mt-2 flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={novoInicio}
            onChange={e => setNovoInicio(e.target.value)}
            className="border border-orange-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-orange-400"
          />
          <span className="text-xs text-gray-400">até</span>
          <input
            type="date"
            value={novoFim}
            min={novoInicio}
            onChange={e => setNovoFim(e.target.value)}
            className="border border-orange-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-orange-400"
          />
          <button
            onClick={handleAdd}
            disabled={!novoInicio || !novoFim}
            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 rounded-lg disabled:opacity-40 transition"
          >
            Adicionar
          </button>
          <button
            onClick={() => { setAdicionando(false); setNovoInicio(""); setNovoFim(""); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}

function SubgrupoColabs({ titulo, cor, colaboradores, selecionados, onToggle, diasUteis, vrDiario, ferias, onFeriasChange, estado, ano, mes, cfg }) {
  const getDiasEfetivos = (id) => {
    const diasFerias = calcDiasFeriasMes(id, ferias, ano, mes, estado);
    return Math.max(0, diasUteis - diasFerias);
  };

  const handleAddFerias = (id, periodo) => {
    const atual = ferias[id] || [];
    onFeriasChange(id, [...atual, periodo]);
  };

  const handleRemoveFerias = (id, idx) => {
    const atual = ferias[id] || [];
    onFeriasChange(id, atual.filter((_, i) => i !== idx));
  };

  const total = colaboradores
    .filter(c => selecionados.includes(String(c.id)))
    .reduce((acc, c) => acc + vrDiario * getDiasEfetivos(c.id), 0);

  const selCount = colaboradores.filter(c => selecionados.includes(String(c.id))).length;

  return (
    <div className={`rounded-lg border ${cor.borderCls} p-3`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cor.badgeCls}`}>{titulo}</span>
          <span className="text-xs text-gray-400">{fmt(vrDiario)}/dia</span>
        </div>
        <span className={`text-xs font-medium ${cfg.totalCls}`}>{fmt(total)}</span>
      </div>
      <div className="space-y-1">
        {colaboradores.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">Nenhum cadastrado</p>
        )}
        {colaboradores.map(c => {
          const diasFerias = calcDiasFeriasMes(c.id, ferias, ano, mes, estado);
          const diasEfetivos = getDiasEfetivos(c.id);
          return (
            <ColaboradorRow
              key={c.id}
              c={c}
              cfg={cfg}
              selecionado={selecionados.includes(String(c.id))}
              onToggle={onToggle}
              diasFerias={diasFerias}
              diasEfetivos={diasEfetivos}
              valor={vrDiario * diasEfetivos}
              periodos={ferias[c.id] || []}
              onAddFerias={handleAddFerias}
              onRemoveFerias={handleRemoveFerias}
            />
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-2">{selCount} de {colaboradores.length} selecionados</p>
    </div>
  );
}

function UnidadeSection({ unidade, colaboradores, selecionados, onToggle, diasUteis, vrDiario, vrEstagiario, ferias, onFeriasChange, ano, mes }) {
  const cfg = UNIDADE_CONFIG[unidade];
  const estado = unidade === "SP" ? "SP" : "RJ";
  const temEstagiarios = unidade === "RJ" || unidade === "SP";

  const clts = temEstagiarios ? colaboradores.filter(c => (c.tipo_vinculo || c.tipo_contrato || "CLT") !== "Estagiário") : colaboradores;
  const estagiarios = temEstagiarios ? colaboradores.filter(c => (c.tipo_vinculo || c.tipo_contrato) === "Estagiário") : [];

  const getDiasEfetivos = (id) => {
    const diasFerias = calcDiasFeriasMes(id, ferias, ano, mes, estado);
    return Math.max(0, diasUteis - diasFerias);
  };

  const totalCLT = clts
    .filter(c => selecionados.includes(String(c.id)))
    .reduce((acc, c) => acc + vrDiario * getDiasEfetivos(c.id), 0);

  const totalEst = estagiarios
    .filter(c => selecionados.includes(String(c.id)))
    .reduce((acc, c) => acc + (vrEstagiario || vrDiario) * getDiasEfetivos(c.id), 0);

  const total = totalCLT + totalEst;

  const handleAddFerias = (id, periodo) => {
    const atual = ferias[id] || [];
    onFeriasChange(id, [...atual, periodo]);
  };

  const handleRemoveFerias = (id, idx) => {
    const atual = ferias[id] || [];
    onFeriasChange(id, atual.filter((_, i) => i !== idx));
  };

  return (
    <div className={`bg-white border-2 ${cfg.borderCls} rounded-2xl overflow-hidden shadow-sm`}>
      {/* Header da unidade */}
      <div className={`px-5 py-3 flex items-center justify-between border-b ${cfg.borderCls}`}
        style={{ background: `color-mix(in srgb, currentColor 4%, white)` }}>
        <div className="flex items-center gap-2">
          <Badge className={`${cfg.badgeCls} text-sm font-bold px-3 py-0.5`}>{unidade}</Badge>
          <span className="text-xs text-slate-500 font-medium">{UNIDADE_CONFIG[unidade]?.label || unidade}</span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${cfg.infoCls}`}>
          <CalendarDays size={11} />
          <span>{diasUteis} dias úteis</span>
        </div>
      </div>

      <div className="p-4">
        {temEstagiarios ? (
          <div className="space-y-3 mb-4">
            <SubgrupoColabs
              titulo="CLT"
              cor={{ borderCls: cfg.borderCls, badgeCls: cfg.badgeCls }}
              colaboradores={clts}
              selecionados={selecionados}
              onToggle={onToggle}
              diasUteis={diasUteis}
              vrDiario={vrDiario}
              ferias={ferias}
              onFeriasChange={onFeriasChange}
              estado={estado}
              ano={ano}
              mes={mes}
              cfg={cfg}
            />
            <SubgrupoColabs
              titulo="Estagiários"
              cor={{ borderCls: "border-amber-200", badgeCls: "bg-amber-100 text-amber-800" }}
              colaboradores={estagiarios}
              selecionados={selecionados}
              onToggle={onToggle}
              diasUteis={diasUteis}
              vrDiario={vrEstagiario || vrDiario}
              ferias={ferias}
              onFeriasChange={onFeriasChange}
              estado={estado}
              ano={ano}
              mes={mes}
              cfg={cfg}
            />
          </div>
        ) : (
          <div className="space-y-1 mb-4">
            {colaboradores.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Nenhum colaborador cadastrado</p>
            )}
            {colaboradores.map(c => {
              const diasFerias = calcDiasFeriasMes(c.id, ferias, ano, mes, estado);
              const diasEfetivos = getDiasEfetivos(c.id);
              return (
                <ColaboradorRow
                  key={c.id}
                  c={c}
                  cfg={cfg}
                  selecionado={selecionados.includes(String(c.id))}
                  onToggle={onToggle}
                  diasFerias={diasFerias}
                  diasEfetivos={diasEfetivos}
                  valor={vrDiario * diasEfetivos}
                  periodos={ferias[c.id] || []}
                  onAddFerias={handleAddFerias}
                  onRemoveFerias={handleRemoveFerias}
                />
              );
            })}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <span className="text-xs text-slate-400">
            {selecionados.length} de {colaboradores.length} selecionados
          </span>
          <span className={`text-lg font-bold ${cfg.totalCls}`}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

// Extrai valores VR salvos de um rateio existente
function extrairVrSalvo(rateio) {
  const vrD = { ...VR_DIARIO_DEFAULT };
  const vrE = { ...VR_ESTAGIARIO_DEFAULT };
  const campos = { RJ: "colaboradores_rj", SP: "colaboradores_sp", Carbon: "colaboradores_carbon", REDD: "colaboradores_redd" };
  UNIDADES.forEach(u => {
    const raw = rateio[campos[u]];
    if (!raw) return;
    const list = JSON.parse(raw);
    const clt  = list.find(c => (c.tipo_contrato || "CLT") === "CLT");
    const est  = list.find(c => c.tipo_contrato === "Estagiário");
    if (clt) vrD[u] = clt.valor_diario;
    if (est && (u === "RJ" || u === "SP")) vrE[u] = est.valor_diario;
  });
  return { vrD, vrE };
}

// Extrai IDs dos colaboradores selecionados de um rateio existente
function extrairSelecionados(rateio) {
  const campos = { RJ: "colaboradores_rj", SP: "colaboradores_sp", Carbon: "colaboradores_carbon", REDD: "colaboradores_redd" };
  const sel = { RJ: [], SP: [], Carbon: [], REDD: [] };
  UNIDADES.forEach(u => {
    const raw = rateio[campos[u]];
    if (raw) sel[u] = JSON.parse(raw).map(c => c.id);
  });
  return sel;
}

export default function NovoRateioForm({ onCancel, onSaved, feriasProgramadas = {}, rateioExistente = null }) {
  const editando = Boolean(rateioExistente?.id);

  const [mesRef, setMesRef] = useState(() => {
    if (rateioExistente?.mes_referencia) return rateioExistente.mes_referencia;
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [selecionados, setSelecionados] = useState({ RJ: [], SP: [], Carbon: [], REDD: [] });
  const [saving, setSaving] = useState(false);
  const [showFeriasModal, setShowFeriasModal] = useState(false);

  const vrSalvo = editando ? extrairVrSalvo(rateioExistente) : null;
  const [vrDiario, setVrDiario] = useState(vrSalvo ? vrSalvo.vrD : { ...VR_DIARIO_DEFAULT });
  const [vrEstagiario, setVrEstagiario] = useState(vrSalvo ? vrSalvo.vrE : { ...VR_ESTAGIARIO_DEFAULT });
  const [editingVr, setEditingVr] = useState(null);
  const [vrTemp, setVrTemp] = useState("");

  const [ferias, setFerias] = useState(feriasProgramadas);

  const [ano, mes] = mesRef.split("-").map(Number);
  const diasUteisSP = getDiasUteisParaMes(ano, mes, "SP");
  const diasUteisRJ = getDiasUteisParaMes(ano, mes, "RJ");

  const getDias = (unidade) => USA_DIAS_RJ.includes(unidade) ? diasUteisRJ : diasUteisSP;
  const getEstado = (unidade) => unidade === "SP" ? "SP" : "RJ";

  const startEditVr = (key) => { setEditingVr(key); setVrTemp(String(key.endsWith("_est") ? vrEstagiario[key.replace("_est", "")] : vrDiario[key])); };
  const confirmEditVr = (key) => {
    const val = parseFloat(vrTemp.replace(",", "."));
    if (!isNaN(val) && val >= 0) {
      if (key.endsWith("_est")) {
        setVrEstagiario(prev => ({ ...prev, [key.replace("_est", "")]: val }));
      } else {
        setVrDiario(prev => ({ ...prev, [key]: val }));
      }
    }
    setEditingVr(null);
  };

  useEffect(() => {
    colaboradoresService.list().then(data => {
      const ativos = data.filter(c => c.ativo !== false);
      setColaboradores(ativos);
      if (editando) {
        setSelecionados(extrairSelecionados(rateioExistente));
      } else {
        const init = { RJ: [], SP: [], Carbon: [], REDD: [] };
        UNIDADES.forEach(u => { init[u] = ativos.filter(c => c.unidade === u).map(c => String(c.id)); });
        setSelecionados(init);
      }
    });
  }, []);

  const toggleUnidade = (unidade, id) => {
    const sid = String(id);
    setSelecionados(prev => ({
      ...prev,
      [unidade]: prev[unidade].includes(sid)
        ? prev[unidade].filter(x => x !== sid)
        : [...prev[unidade], sid],
    }));
  };

  const getColabs = (unidade) => colaboradores.filter(c => c.unidade === unidade);

  const handleFeriasChange = (colaboradorId, periodos) => {
    setFerias(prev => ({ ...prev, [colaboradorId]: periodos }));
  };

  const getVrColaborador = (unidade, c) => {
    const tipo = c.tipo_vinculo || c.tipo_contrato || "CLT";
    if ((unidade === "RJ" || unidade === "SP") && tipo === "Estagiário") {
      return vrEstagiario[unidade] || vrDiario[unidade];
    }
    return vrDiario[unidade];
  };

  const calcTotal = (unidade) => {
    const dias = getDias(unidade);
    const estado = getEstado(unidade);
    return getColabs(unidade)
      .filter(c => selecionados[unidade].includes(String(c.id)))
      .reduce((acc, c) => {
        const diasFerias = calcDiasFeriasMes(c.id, ferias, ano, mes, estado);
        const diasEfetivos = Math.max(0, dias - diasFerias);
        return acc + getVrColaborador(unidade, c) * diasEfetivos;
      }, 0);
  };

  const totais = Object.fromEntries(UNIDADES.map(u => [u, calcTotal(u)]));
  const totalGeral = UNIDADES.reduce((acc, u) => acc + totais[u], 0);

  const handleSalvar = async () => {
    setSaving(true);
    const colabData = {};
    UNIDADES.forEach(u => {
      const dias = getDias(u);
      const estado = getEstado(u);
      colabData[u] = getColabs(u)
        .filter(c => selecionados[u].includes(String(c.id)))
        .map(c => {
          const diasFerias = calcDiasFeriasMes(c.id, ferias, ano, mes, estado);
          const diasEfetivos = Math.max(0, dias - diasFerias);
          const vr = getVrColaborador(u, c);
          return {
            id: c.id,
            nome: c.nome,
            tipo_contrato: c.tipo_vinculo || c.tipo_contrato || "CLT",
            valor_diario: vr,
            dias_ferias: diasFerias,
            dias_efetivos: diasEfetivos,
            total: vr * diasEfetivos,
          };
        });
    });

    const payload = {
      mes_referencia: mesRef,
      mes_label: formatMes(mesRef),
      dias_uteis_sp: diasUteisSP,
      dias_uteis_rj: diasUteisRJ,
      colaboradores_rj: JSON.stringify(colabData.RJ),
      colaboradores_sp: JSON.stringify(colabData.SP),
      colaboradores_carbon: JSON.stringify(colabData.Carbon),
      colaboradores_redd: JSON.stringify(colabData.REDD),
      total_rj: totais.RJ,
      total_sp: totais.SP,
      total_carbon: totais.Carbon,
      total_redd: totais.REDD,
      total_geral: totalGeral,
      status: editando ? (rateioExistente.status || "Rascunho") : "Rascunho",
    };
    if (editando) {
      await base44.entities.RateioCaju.update(rateioExistente.id, payload);
    } else {
      await base44.entities.RateioCaju.create(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition flex-shrink-0"
          >
            <ArrowLeft size={16} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#1A4731]">{editando ? "Editar Rateio" : "Novo Rateio"}</h1>
            <p className="text-sm text-slate-500 mt-0.5">Vale Refeição Caju — selecione o mês e confirme os colaboradores</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFeriasModal(true)}
            className="gap-1.5 text-xs border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <CalendarDays size={13} /> Férias Programadas
          </Button>
          <Button variant="outline" size="sm" onClick={onCancel} className="text-xs">
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSalvar}
            disabled={saving}
            className="bg-[#1A4731] hover:bg-[#1A4731]/90 text-white shadow-sm gap-1.5 text-xs"
          >
            {saving ? "Salvando..." : editando ? "Salvar Alterações" : "Salvar Rateio"}
          </Button>
        </div>
      </div>

      {/* ── Mês de referência + VR por unidade ─────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start gap-8 flex-wrap">

          {/* Seletor de mês */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
              Mês de Referência
            </label>
            <div className="flex items-center gap-3">
              <input
                type="month"
                value={mesRef}
                onChange={e => setMesRef(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:border-[#1A4731] focus:ring-2 focus:ring-[#1A4731]/10 bg-slate-50"
              />
              <span className="text-base font-semibold text-[#1A4731]">{formatMes(mesRef)}</span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Cards VR por unidade (clicáveis para editar) */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
              Valor VR Diário <span className="normal-case font-normal text-slate-400">(clique para editar)</span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {UNIDADES.map(u => {
                const cfg = UNIDADE_CONFIG[u];
                const dias = getDias(u);
                const temEst = u === "RJ" || u === "SP";
                return (
                  <div key={u} className="flex gap-1.5">
                    {/* Card CLT */}
                    <div
                      className={`flex flex-col items-center px-3 py-2.5 rounded-xl border-2 ${cfg.borderCls} bg-white min-w-[82px] cursor-pointer hover:shadow-sm transition group`}
                      onClick={() => editingVr !== u && startEditVr(u)}
                      title="Clique para editar o valor diário CLT"
                    >
                      <div className="flex items-center gap-1 mb-1.5">
                        <Badge className={`${cfg.badgeCls} text-xs font-bold px-1.5`}>{u}</Badge>
                        {temEst && <span className="text-[10px] text-slate-400 font-medium">CLT</span>}
                      </div>
                      {editingVr === u ? (
                        <input autoFocus
                          className="w-16 text-center text-sm font-bold border border-slate-300 rounded-lg px-1 py-0.5 focus:outline-none focus:border-[#1A4731]"
                          value={vrTemp}
                          onChange={e => setVrTemp(e.target.value)}
                          onBlur={() => confirmEditVr(u)}
                          onKeyDown={e => { if (e.key === "Enter") confirmEditVr(u); if (e.key === "Escape") setEditingVr(null); }}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className={`text-sm font-bold ${cfg.totalCls} group-hover:underline decoration-dotted`}>
                          {fmt(vrDiario[u])}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 mt-0.5">/dia · {dias}d úteis</span>
                    </div>

                    {/* Card Estagiário */}
                    {temEst && (
                      <div
                        className="flex flex-col items-center px-3 py-2.5 rounded-xl border-2 border-amber-200 bg-amber-50/60 min-w-[82px] cursor-pointer hover:shadow-sm transition group"
                        onClick={() => editingVr !== `${u}_est` && startEditVr(`${u}_est`)}
                        title="Clique para editar o valor diário Estagiário"
                      >
                        <div className="flex items-center gap-1 mb-1.5">
                          <Badge className="bg-amber-100 text-amber-800 text-xs font-bold px-1.5">{u}</Badge>
                          <span className="text-[10px] text-amber-600 font-medium">Est.</span>
                        </div>
                        {editingVr === `${u}_est` ? (
                          <input autoFocus
                            className="w-16 text-center text-sm font-bold border border-amber-300 rounded-lg px-1 py-0.5 focus:outline-none focus:border-amber-500"
                            value={vrTemp}
                            onChange={e => setVrTemp(e.target.value)}
                            onBlur={() => confirmEditVr(`${u}_est`)}
                            onKeyDown={e => { if (e.key === "Enter") confirmEditVr(`${u}_est`); if (e.key === "Escape") setEditingVr(null); }}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-sm font-bold text-amber-700 group-hover:underline decoration-dotted">
                            {fmt(vrEstagiario[u])}
                          </span>
                        )}
                        <span className="text-[10px] text-amber-500 mt-0.5">/dia · {dias}d úteis</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Seções por unidade ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {UNIDADES.map(u => (
          <UnidadeSection
            key={u}
            unidade={u}
            colaboradores={getColabs(u)}
            selecionados={selecionados[u]}
            onToggle={(id) => toggleUnidade(u, id)}
            diasUteis={getDias(u)}
            vrDiario={vrDiario[u]}
            vrEstagiario={vrEstagiario[u]}
            ferias={ferias}
            onFeriasChange={handleFeriasChange}
            ano={ano}
            mes={mes}
          />
        ))}
      </div>

      {/* ── Total geral + ações ────────────────────────────────────── */}
      <div className="bg-[#1A4731] rounded-2xl p-5 flex items-center justify-between shadow-sm">
        <div>
          <p className="text-sm font-medium text-white/70">Total Geral</p>
          <p className="text-3xl font-bold text-white mt-0.5">{fmt(totalGeral)}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="bg-transparent border-white/30 text-white hover:bg-white/10 text-xs"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSalvar}
            disabled={saving}
            className="bg-white text-[#1A4731] hover:bg-white/90 font-semibold shadow-sm text-xs"
          >
            {saving ? "Salvando..." : editando ? "Salvar Alterações" : "Salvar Rateio"}
          </Button>
        </div>
      </div>

      {/* ── Modal de férias ────────────────────────────────────────── */}
      <FeriasColaboradorModal
        open={showFeriasModal}
        onClose={() => setShowFeriasModal(false)}
        colaboradores={colaboradores}
        ferias={ferias}
        onFeriasChange={handleFeriasChange}
        ano={ano}
        mes={mes}
      />
    </div>
  );
}