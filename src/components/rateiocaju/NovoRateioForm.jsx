import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMes, getDiasUteisNoIntervalo } from "./feriadosUtils";
import { getDiasUteisParaMes } from "./FeriadosModal";
import { CalendarDays, ArrowLeft } from "lucide-react";
import FeriasColaboradorModal from "./FeriasColaboradorModal";

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Valor VR diário padrão por unidade
const VR_DIARIO_DEFAULT = { RJ: 29.0, SP: 31.5, Carbon: 29.0, REDD: 29.0 };

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

function UnidadeSection({ unidade, colaboradores, selecionados, onToggle, diasUteis, vrDiario, ferias, ano, mes }) {
  const cfg = UNIDADE_CONFIG[unidade];
  const estado = unidade === "SP" ? "SP" : "RJ";

  const getDiasEfetivos = (id) => {
    const diasFerias = calcDiasFeriasMes(id, ferias, ano, mes, estado);
    return Math.max(0, diasUteis - diasFerias);
  };

  const total = colaboradores
    .filter(c => selecionados.includes(c.id))
    .reduce((acc, c) => acc + vrDiario * getDiasEfetivos(c.id), 0);

  return (
    <div className={`bg-white border ${cfg.borderCls} rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge className={`${cfg.badgeCls} text-sm font-bold px-3`}>{unidade}</Badge>
          <span className="text-xs text-gray-400 ml-1">{fmt(vrDiario)}/dia</span>
        </div>
        <div className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full ${cfg.infoCls}`}>
          <CalendarDays size={12} />
          <span>{diasUteis} dias úteis</span>
        </div>
      </div>
      <div className="space-y-1 mb-4">
        {colaboradores.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Nenhum colaborador cadastrado</p>
        )}
        {colaboradores.map(c => {
          const selecionado = selecionados.includes(c.id);
          const diasFerias = calcDiasFeriasMes(c.id, ferias, ano, mes, estado);
          const diasEfetivos = getDiasEfetivos(c.id);
          const valor = vrDiario * diasEfetivos;
          const periodos = ferias[c.id] || [];

          return (
            <div key={c.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${cfg.hoverCls} transition`}>
              <input
                type="checkbox"
                checked={selecionado}
                onChange={() => onToggle(c.id)}
                className="w-4 h-4 cursor-pointer flex-shrink-0"
              />
              <span className="text-sm flex-1 text-gray-800 cursor-pointer" onClick={() => onToggle(c.id)}>
                {c.nome}
              </span>
              {/* Indicador de férias (se houver) */}
              {diasFerias > 0 && (
                <span className="flex items-center gap-1 text-xs text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5">
                  <CalendarDays size={11} />
                  {diasFerias}d férias → {diasEfetivos}d úteis
                </span>
              )}
              {/* Área à direita */}
              {c.area && <span className="text-xs text-gray-400">{c.area}</span>}
              <span className="text-sm font-medium text-gray-700 w-20 text-right">{fmt(valor)}</span>
            </div>
          );
        })}
      </div>
      <div className="border-t pt-3 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {selecionados.length} de {colaboradores.length} selecionados
        </span>
        <span className={`text-base font-bold ${cfg.totalCls}`}>{fmt(total)}</span>
      </div>
    </div>
  );
}

export default function NovoRateioForm({ onCancel, onSaved }) {
  const [mesRef, setMesRef] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [selecionados, setSelecionados] = useState({ RJ: [], SP: [], Carbon: [], REDD: [] });
  const [saving, setSaving] = useState(false);
  const [showFeriasModal, setShowFeriasModal] = useState(false);

  const [vrDiario, setVrDiario] = useState({ ...VR_DIARIO_DEFAULT });
  const [editingVr, setEditingVr] = useState(null);
  const [vrTemp, setVrTemp] = useState("");

  // ferias: { [colaboradorId]: [{inicio: "YYYY-MM-DD", fim: "YYYY-MM-DD"}] }
  const [ferias, setFerias] = useState({});

  const [ano, mes] = mesRef.split("-").map(Number);
  const diasUteisSP = getDiasUteisParaMes(ano, mes, "SP");
  const diasUteisRJ = getDiasUteisParaMes(ano, mes, "RJ");

  const getDias = (unidade) => USA_DIAS_RJ.includes(unidade) ? diasUteisRJ : diasUteisSP;
  const getEstado = (unidade) => unidade === "SP" ? "SP" : "RJ";

  const startEditVr = (u) => { setEditingVr(u); setVrTemp(String(vrDiario[u])); };
  const confirmEditVr = (u) => {
    const val = parseFloat(vrTemp.replace(",", "."));
    if (!isNaN(val) && val >= 0) setVrDiario(prev => ({ ...prev, [u]: val }));
    setEditingVr(null);
  };

  useEffect(() => {
    base44.entities.ColaboradorCLT.list().then(data => {
      const ativos = data.filter(c => c.ativo !== false);
      setColaboradores(ativos);
      const init = { RJ: [], SP: [], Carbon: [], REDD: [] };
      UNIDADES.forEach(u => {
        init[u] = ativos.filter(c => c.unidade === u).map(c => c.id);
      });
      setSelecionados(init);
    });
  }, []);

  const toggleUnidade = (unidade, id) => {
    setSelecionados(prev => ({
      ...prev,
      [unidade]: prev[unidade].includes(id)
        ? prev[unidade].filter(x => x !== id)
        : [...prev[unidade], id],
    }));
  };

  const getColabs = (unidade) => colaboradores.filter(c => c.unidade === unidade);

  const handleFeriasChange = (colaboradorId, periodos) => {
    setFerias(prev => ({ ...prev, [colaboradorId]: periodos }));
  };

  const calcTotal = (unidade) => {
    const dias = getDias(unidade);
    const estado = getEstado(unidade);
    return getColabs(unidade)
      .filter(c => selecionados[unidade].includes(c.id))
      .reduce((acc, c) => {
        const diasFerias = calcDiasFeriasMes(c.id, ferias, ano, mes, estado);
        const diasEfetivos = Math.max(0, dias - diasFerias);
        return acc + vrDiario[unidade] * diasEfetivos;
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
        .filter(c => selecionados[u].includes(c.id))
        .map(c => {
          const diasFerias = calcDiasFeriasMes(c.id, ferias, ano, mes, estado);
          const diasEfetivos = Math.max(0, dias - diasFerias);
          return {
            id: c.id,
            nome: c.nome,
            valor_diario: vrDiario[u],
            dias_ferias: diasFerias,
            dias_efetivos: diasEfetivos,
            total: vrDiario[u] * diasEfetivos,
          };
        });
    });

    await base44.entities.RateioCaju.create({
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
      status: "Rascunho",
    });
    setSaving(false);
    onSaved();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1A4731]">Novo Rateio — Vale Refeição Caju</h1>
            <p className="text-sm text-gray-500 mt-0.5">Selecione o mês e confirme os colaboradores por unidade</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFeriasModal(true)} className="gap-2 text-sm">
            <CalendarDays size={15} />
            Férias Programadas
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={saving} className="bg-[#1A4731] hover:bg-[#1A4731]/90">
            {saving ? "Salvando..." : "Salvar Rateio"}
          </Button>
        </div>
      </div>

      {/* Mês de referência + card de valores */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Mês de Referência</label>
            <input
              type="month"
              value={mesRef}
              onChange={e => setMesRef(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4731]"
            />
          </div>
          <div className="text-base font-semibold text-gray-700 mt-4">{formatMes(mesRef)}</div>

          <div className="flex-1" />

          {/* Valores VR por unidade */}
          <div className="flex gap-3 flex-wrap">
            {UNIDADES.map(u => {
              const cfg = UNIDADE_CONFIG[u];
              const dias = getDias(u);
              return (
                <div key={u} className={`flex flex-col items-center px-4 py-2 rounded-xl border ${cfg.borderCls} bg-white min-w-[90px] cursor-pointer group`}
                  onClick={() => editingVr !== u && startEditVr(u)}
                  title="Clique para editar o valor diário"
                >
                  <Badge className={`${cfg.badgeCls} text-xs font-bold mb-1`}>{u}</Badge>
                  {editingVr === u ? (
                    <input
                      autoFocus
                      className="w-20 text-center text-base font-bold border border-gray-300 rounded px-1 py-0.5 focus:outline-none focus:border-[#1A4731]"
                      value={vrTemp}
                      onChange={e => setVrTemp(e.target.value)}
                      onBlur={() => confirmEditVr(u)}
                      onKeyDown={e => { if (e.key === "Enter") confirmEditVr(u); if (e.key === "Escape") setEditingVr(null); }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span className="text-base font-bold text-gray-800 group-hover:text-[#1A4731] transition-colors">{fmt(vrDiario[u])}</span>
                  )}
                  <span className="text-xs text-gray-400">por dia</span>
                  <span className={`text-xs mt-1 font-medium ${cfg.totalCls}`}>{dias} dias úteis</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seções por unidade */}
      {UNIDADES.map(u => (
        <UnidadeSection
          key={u}
          unidade={u}
          colaboradores={getColabs(u)}
          selecionados={selecionados[u]}
          onToggle={(id) => toggleUnidade(u, id)}
          diasUteis={getDias(u)}
          vrDiario={vrDiario[u]}
          ferias={ferias}
          ano={ano}
          mes={mes}
        />
      ))}

      {/* Total geral */}
      <div className="bg-[#1A4731]/5 border border-[#1A4731]/20 rounded-xl p-4 flex items-center justify-end">
        <span className="text-sm font-semibold text-[#1A4731] mr-4">Total Geral</span>
        <span className="text-xl font-bold text-[#1A4731]">{fmt(totalGeral)}</span>
      </div>

      {/* Botões rodapé */}
      <div className="flex justify-end gap-2 pb-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSalvar} disabled={saving} className="bg-[#1A4731] hover:bg-[#1A4731]/90">
          {saving ? "Salvando..." : "Salvar Rateio"}
        </Button>
      </div>

      {/* Modal de férias */}
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