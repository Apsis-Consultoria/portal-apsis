import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { colaboradoresService } from "@/lib/supabaseColaboradores";
import { Button } from "@/components/ui/button";
import { Plus, Settings, TrendingUp, MapPin, CalendarDays, Download, Wallet, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";

import ColaboradoresCLTModal from "@/components/rateiocaju/ColaboradoresCLTModal";
import NovoRateioForm from "@/components/rateiocaju/NovoRateioForm";
import FeriadosModal from "@/components/rateiocaju/FeriadosModal";
import FeriasProgramadasModal, { loadFeriasProgramadas } from "@/components/rateiocaju/FeriasProgramadasModal";
import { formatMes } from "@/components/rateiocaju/feriadosUtils";

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS_CONFIG = {
  Finalizado: { cls: "bg-emerald-100 text-emerald-800 border border-emerald-200", dot: "bg-emerald-500" },
  Rascunho:   { cls: "bg-amber-100 text-amber-800 border border-amber-200",       dot: "bg-amber-400"  },
};

const UNIDADES_CONFIG = [
  { key: "SP",     field: "colaboradores_sp",     total: "total_sp",     label: "São Paulo",  badgeCls: "bg-blue-100 text-blue-800",     borderCls: "border-blue-200",   headerCls: "bg-blue-50",   totalCls: "text-blue-700"   },
  { key: "RJ",     field: "colaboradores_rj",     total: "total_rj",     label: "Rio de Janeiro", badgeCls: "bg-emerald-100 text-emerald-800", borderCls: "border-emerald-200", headerCls: "bg-emerald-50", totalCls: "text-emerald-700" },
  { key: "Carbon", field: "colaboradores_carbon", total: "total_carbon", label: "Carbon",     badgeCls: "bg-teal-100 text-teal-800",     borderCls: "border-teal-200",   headerCls: "bg-teal-50",   totalCls: "text-teal-700"   },
  { key: "REDD",   field: "colaboradores_redd",   total: "total_redd",   label: "REDD",       badgeCls: "bg-purple-100 text-purple-800", borderCls: "border-purple-200", headerCls: "bg-purple-50", totalCls: "text-purple-700" },
];

// ── Tela principal ────────────────────────────────────────────────────────────
export default function RateioCaju() {
  const [rateios, setRateios] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCLTModal, setShowCLTModal] = useState(false);
  const [showFeriados, setShowFeriados] = useState(false);
  const [showFerias, setShowFerias] = useState(false);
  const [criandoRateio, setCriandoRateio] = useState(false);
  const [rateioSelecionado, setRateioSelecionado] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const [r, c] = await Promise.all([
      base44.entities.RateioCaju.list("-created_date"),
      colaboradoresService.list(),
    ]);
    setRateios(r);
    setColaboradores(c.filter(col => col.ativo !== false));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const VINCULOS_CAJU = ["CLT", "Estagiário"];
  const cajuColabs  = colaboradores.filter(c => VINCULOS_CAJU.includes((c.tipo_vinculo || c.tipo_contrato || "").trim()));
  const totalSP     = cajuColabs.filter(c => c.unidade === "SP").length;
  const totalRJ     = cajuColabs.filter(c => c.unidade === "RJ").length;
  const totalCarbon = cajuColabs.filter(c => c.unidade === "Carbon").length;
  const totalREDD   = cajuColabs.filter(c => c.unidade === "REDD").length;
  const totalCLT    = cajuColabs.length;

  const valoresMensais = rateios.map(r => r.total_geral || 0);
  const mediaMensal    = valoresMensais.length > 0 ? valoresMensais.reduce((a, b) => a + b, 0) / valoresMensais.length : 0;
  const ultimoRateio   = rateios[0];

  const vrMedioMensal = (valoresMensais.length > 0 && cajuColabs.length > 0)
    ? (valoresMensais.reduce((a, b) => a + b, 0) / valoresMensais.length) / cajuColabs.length
    : 0;

  const handleDeletarRateio = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir este rascunho?")) return;
    await base44.entities.RateioCaju.delete(id);
    fetchData();
  };

  const handleExportarRateio = (rateio) => {
    const workbook = XLSX.utils.book_new();
    UNIDADES_CONFIG.forEach(u => {
      const colabs = rateio[u.field] ? JSON.parse(rateio[u.field]) : [];
      const data = colabs.map(c => ({
        Nome: c.nome || "",
        "Tipo de Contrato": c.tipo_contrato || "CLT",
        "VR Diário": c.valor_diario || 0,
        "Dias Férias": c.dias_ferias || 0,
        "Dias Efetivos": c.dias_efetivos || 0,
        Total: c.total || 0,
      }));
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(data), u.key);
    });
    XLSX.writeFile(workbook, `Rateio_Caju_${rateio.mes_label || rateio.mes_referencia}.xlsx`);
  };

  // ── Tela: criando novo rateio
  if (criandoRateio) {
    return (
      <NovoRateioForm
        onCancel={() => setCriandoRateio(false)}
        onSaved={() => { setCriandoRateio(false); fetchData(); }}
        feriasProgramadas={loadFeriasProgramadas()}
      />
    );
  }

  // ── Tela: editando rateio selecionado
  if (rateioSelecionado) {
    return (
      <NovoRateioForm
        rateioExistente={rateioSelecionado}
        onCancel={() => setRateioSelecionado(null)}
        onSaved={() => { setRateioSelecionado(null); fetchData(); }}
        feriasProgramadas={loadFeriasProgramadas()}
      />
    );
  }

  // ── Tela: lista principal
  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#1A4731]">Rateio Caju</h1>
          <p className="text-sm text-slate-500 mt-0.5">Vale Refeição — distribuição mensal por unidade</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFerias(true)}
            className="gap-1.5 text-xs border-slate-200 text-slate-600 hover:bg-slate-50">
            <CalendarDays size={13} /> Férias
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowFeriados(true)}
            className="gap-1.5 text-xs border-slate-200 text-slate-600 hover:bg-slate-50">
            <CalendarDays size={13} /> Feriados SP/RJ
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowCLTModal(true)}
            className="gap-1.5 text-xs border-slate-200 text-slate-600 hover:bg-slate-50">
            <Settings size={13} /> Colaboradores CLT
          </Button>
          <Button size="sm" onClick={() => setCriandoRateio(true)}
            className="gap-1.5 bg-[#1A4731] hover:bg-[#1A4731]/90 text-white shadow-sm">
            <Plus size={14} /> Novo Rateio
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Média Mensal</span>
            <div className="w-8 h-8 rounded-lg bg-[#1A4731]/10 flex items-center justify-center">
              <TrendingUp size={15} className="text-[#1A4731]" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 leading-none">{fmt(mediaMensal)}</p>
          <p className="text-xs text-slate-400 mt-2">{rateios.length} rateios realizados</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Último Rateio</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Wallet size={15} className="text-orange-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 leading-none">
            {ultimoRateio ? fmt(ultimoRateio.total_geral) : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {ultimoRateio ? (ultimoRateio.mes_label || formatMes(ultimoRateio.mes_referencia)) : "Nenhum ainda"}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">VR Médio/mês</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <CalendarDays size={15} className="text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 leading-none">{fmt(vrMedioMensal)}</p>
          <p className="text-xs text-slate-400 mt-2">por colaborador/mês</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Por Unidade</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <MapPin size={15} className="text-purple-600" />
            </div>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            {[
              { label: "SP",     total: totalSP,     cls: "text-blue-700" },
              { label: "RJ",     total: totalRJ,     cls: "text-emerald-700" },
              { label: "Carbon", total: totalCarbon, cls: "text-teal-700" },
              { label: "REDD",   total: totalREDD,   cls: "text-purple-700" },
            ].map(({ label, total, cls }) => (
              <div key={label} className="text-center">
                <p className={`text-xl font-bold leading-none ${cls}`}>{total}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">{totalCLT} total CLT</p>
        </div>

      </div>

      {/* ── Histórico de Rateios ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Histórico de Rateios</h2>
          <span className="text-xs text-slate-400">{rateios.length} registro{rateios.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : rateios.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <CalendarDays size={22} className="text-slate-400" />
            </div>
            <p className="text-slate-500 text-sm font-medium">Nenhum rateio criado</p>
            <p className="text-slate-400 text-xs mt-1">Clique em "Novo Rateio" para começar.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rateios.map(r => {
              const status = STATUS_CONFIG[r.status] || STATUS_CONFIG["Rascunho"];
              return (
                <div
                  key={r.id}
                  onClick={() => setRateioSelecionado(r)}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition group cursor-pointer"
                >
                  {/* Ícone */}
                  <div className="w-10 h-10 rounded-xl bg-[#1A4731]/10 flex items-center justify-center flex-shrink-0">
                    <CalendarDays size={18} className="text-[#1A4731]" />
                  </div>

                  {/* Mês + dias úteis */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {r.mes_label || formatMes(r.mes_referencia)}
                    </p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md font-medium">SP {r.dias_uteis_sp}d</span>
                      <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md font-medium">RJ {r.dias_uteis_rj}d</span>
                    </div>
                  </div>

                  {/* Totais por unidade */}
                  <div className="hidden md:flex gap-4 text-xs text-slate-500">
                    {[
                      { k: "SP",     v: r.total_sp,     cls: "text-blue-700" },
                      { k: "RJ",     v: r.total_rj,     cls: "text-emerald-700" },
                      { k: "Carbon", v: r.total_carbon, cls: "text-teal-700" },
                      { k: "REDD",   v: r.total_redd,   cls: "text-purple-700" },
                    ].map(({ k, v, cls }) => v > 0 ? (
                      <div key={k} className="text-center">
                        <p className={`font-semibold ${cls}`}>{fmt(v)}</p>
                        <p className="text-slate-400">{k}</p>
                      </div>
                    ) : null)}
                  </div>

                  {/* Total geral */}
                  <div className="text-right">
                    <p className="text-base font-bold text-[#1A4731]">{fmt(r.total_geral)}</p>
                    <p className="text-xs text-slate-400">total geral</p>
                  </div>

                  {/* Status */}
                  <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                    {r.status || "Rascunho"}
                  </span>

                  {/* Exportar — isolado para não propagar o click */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={e => { e.stopPropagation(); handleExportarRateio(r); }}
                    className="gap-1.5 text-xs opacity-0 group-hover:opacity-100 transition border-slate-200"
                  >
                    <Download size={13} /> Exportar
                  </Button>

                  {/* Excluir — apenas para Rascunho */}
                  {(r.status === "Rascunho" || !r.status) && (
                    <button
                      onClick={e => handleDeletarRateio(e, r.id)}
                      title="Excluir rateio"
                      className="opacity-0 group-hover:opacity-100 transition p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modais ─────────────────────────────────────────────────── */}
      <ColaboradoresCLTModal open={showCLTModal} onClose={() => setShowCLTModal(false)} />
      <FeriadosModal open={showFeriados} onClose={() => setShowFeriados(false)} />
      <FeriasProgramadasModal open={showFerias} onClose={() => setShowFerias(false)} />
    </div>
  );
}