import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "./shared/PageHeader";
import {
  Users, Calendar, DollarSign, Clock, CheckCircle2, AlertTriangle,
  FileText, TrendingUp, Edit2, Save, X, AlertOctagon, Activity,
  BarChart3, FolderOpen, MessageSquare, ArrowUpRight, LayoutDashboard
} from "lucide-react";

const fmt = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

const STATUS_STYLE = {
  "Ativo":        { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  "Pausado":      { bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400"   },
  "Cancelado":    { bg: "bg-red-100",     text: "text-red-600",     dot: "bg-red-400"     },
  "Não iniciado": { bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400"   },
};

const IMPACTO_STYLE = {
  "Crítico": "bg-red-100 text-red-700 border border-red-200",
  "Alto":    "bg-orange-100 text-orange-700 border border-orange-200",
  "Médio":   "bg-yellow-100 text-yellow-700 border border-yellow-200",
  "Baixo":   "bg-slate-100 text-slate-600",
};

const TAREFA_STYLE = {
  "Concluída":    "bg-emerald-100 text-emerald-700",
  "Em andamento": "bg-blue-100 text-blue-700",
  "A fazer":      "bg-slate-100 text-slate-500",
  "Bloqueada":    "bg-red-100 text-red-700",
  "Em revisão":   "bg-amber-100 text-amber-700",
};

export default function ProjetoResumo({ projeto, onUpdate, osId }) {
  const [tarefas,      setTarefas]      = useState([]);
  const [parcelas,     setParcelas]     = useState([]);
  const [entradas,     setEntradas]     = useState([]);
  const [riscos,       setRiscos]       = useState([]);
  const [comunicacoes, setComunicacoes] = useState([]);
  const [documentos,   setDocumentos]   = useState([]);
  const [editando,     setEditando]     = useState(false);
  const [form,         setForm]         = useState({ ...projeto });
  const [saving,       setSaving]       = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Tarefa.filter({ os_id: osId }),
      base44.entities.Parcela.filter({ os_id: osId }),
      base44.entities.EntradaTempo.filter({ os_id: osId }),
      base44.entities.RiscoProjeto.filter({ os_id: osId }),
      base44.entities.ComunicacaoProjeto.filter({ os_id: osId }),
      base44.entities.DocumentoProjeto.filter({ os_id: osId }),
    ]).then(([t, p, e, r, c, d]) => {
      setTarefas(t); setParcelas(p); setEntradas(e);
      setRiscos(r);  setComunicacoes(c); setDocumentos(d);
    });
  }, [osId]);

  const salvar = async () => {
    setSaving(true);
    const atualizado = await base44.entities.OrdemServico.update(projeto.id, form);
    onUpdate(atualizado);
    setEditando(false);
    setSaving(false);
  };

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const tarefasConcluidas = tarefas.filter(t => t.status === "Concluída").length;
  const totalTarefas      = tarefas.length;
  const tarefasAndamento  = tarefas.filter(t => t.status === "Em andamento").length;

  const valorTotal    = parcelas.reduce((s, p) => s + (p.valor || 0), 0);
  const valorRecebido = parcelas.filter(p => p.status === "Recebida").reduce((s, p) => s + (p.valor || 0), 0);
  const valorFaturado = parcelas.filter(p => ["Faturada", "Recebida"].includes(p.status)).reduce((s, p) => s + (p.valor || 0), 0);
  const valorPendente = parcelas.filter(p => p.status === "Lançada").reduce((s, p) => s + (p.valor || 0), 0);
  const pctFaturado   = valorTotal > 0 ? Math.round((valorFaturado / valorTotal) * 100) : 0;

  const horasLancadas  = entradas.reduce((s, e) => s + (e.horas || 0), 0);
  const horasEstimadas = tarefas.reduce((s, t) => s + (t.horas_estimadas || 0), 0);
  const pctHoras       = horasEstimadas > 0 ? Math.min(100, Math.round((horasLancadas / horasEstimadas) * 100)) : 0;

  const riscosCriticos = riscos.filter(r => r.impacto === "Crítico" && r.status !== "Resolvido");
  const riscosAbertos  = riscos.filter(r => r.status === "Aberto").length;

  const atrasado    = projeto.prazo_previsto && new Date(projeto.prazo_previsto) < new Date() && (projeto.percentual_conclusao || 0) < 100;
  const percConc    = form.percentual_conclusao || 0;
  const s           = STATUS_STYLE[projeto.status] || STATUS_STYLE["Não iniciado"];

  // ── Atividades recentes (merge tarefas + comunicações ordenadas) ───────────
  const atividades = [
    ...tarefas.filter(t => t.updated_date).map(t => ({
      tipo: "tarefa", desc: t.titulo, sub: t.status, date: t.updated_date
    })),
    ...comunicacoes.map(c => ({
      tipo: "comunicacao", desc: c.titulo, sub: c.tipo, date: c.created_date
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      <PageHeader
        title="Visão Geral"
        subtitle={`${projeto.natureza || "Projeto"} · ${projeto.proposta_numero || ""}`}
        icon={LayoutDashboard}
        actions={editando ? (
          <>
            <Button size="sm" variant="outline" onClick={() => { setEditando(false); setForm({ ...projeto }); }} className="text-xs gap-1.5">
              <X size={12} /> Cancelar
            </Button>
            <Button size="sm" onClick={salvar} disabled={saving}
              className="bg-[#1A4731] hover:bg-[#245E40] text-white text-xs gap-1.5 shadow-sm hover:shadow-md transition-all">
              <Save size={12} /> {saving ? "Salvando..." : "Salvar"}
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditando(true)} className="gap-1.5 text-xs hover:bg-white hover:border-slate-400 transition-all">
            <Edit2 size={12} /> Editar Projeto
          </Button>
        )}
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-[#1A4731]/5 to-transparent border-b border-slate-100">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{projeto.status}
                </span>
                {atrasado && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-600">
                    <AlertTriangle size={10} /> Atrasado
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{projeto.cliente_nome || "—"}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{projeto.natureza || "—"}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-5">
          <InfoField label="Responsável Técnico" icon={Users} value={form.responsavel_tecnico}
            editando={editando} onChange={v => setForm(f => ({ ...f, responsavel_tecnico: v }))} />
          <InfoField label="Prazo Previsto" icon={Calendar} value={fmtDate(form.prazo_previsto)}
            editando={editando} type="date" rawValue={form.prazo_previsto}
            onChange={v => setForm(f => ({ ...f, prazo_previsto: v }))} atrasado={atrasado} />
          <InfoField label="Valor do Projeto" icon={DollarSign} value={fmt(form.valor_proporcional || projeto.valor_proporcional)}
            editando={editando} type="number" rawValue={form.valor_proporcional}
            onChange={v => setForm(f => ({ ...f, valor_proporcional: Number(v) }))} />
          <InfoField label="Nº Proposta" value={form.proposta_numero || "—"}
            editando={editando} onChange={v => setForm(f => ({ ...f, proposta_numero: v }))} />

          {/* Progresso */}
          <div className="col-span-2 md:col-span-4">
            <label className="text-xs font-medium text-slate-500 block mb-2">Progresso de Conclusão</label>
            {editando ? (
              <div className="flex items-center gap-3">
                <Input type="number" min={0} max={100} value={percConc}
                  onChange={e => setForm(f => ({ ...f, percentual_conclusao: Number(e.target.value) }))}
                  className="h-8 w-24 text-sm" />
                <span className="text-xs text-slate-400">%</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${atrasado ? "bg-red-400" : "bg-[#1A4731]"}`}
                    style={{ width: `${percConc}%` }} />
                </div>
                <span className={`text-sm font-bold w-10 text-right ${atrasado ? "text-red-500" : "text-slate-700"}`}>{percConc}%</span>
              </div>
            )}
          </div>

          {/* Status edit */}
          {editando && (
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 block mb-1.5">Status</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Ativo", "Pausado", "Cancelado", "Não iniciado"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={CheckCircle2} color="green"  label="Tarefas concluídas" value={`${tarefasConcluidas}/${totalTarefas}`}
          sub={`${tarefasAndamento} em andamento`} />
        <KPICard icon={Clock}        color="blue"   label="Horas lançadas"     value={`${horasLancadas.toFixed(1)}h`}
          sub={horasEstimadas > 0 ? `de ${horasEstimadas}h previstas` : "sem estimativa"} />
        <KPICard icon={DollarSign}   color="emerald" label="Valor faturado"    value={fmt(valorFaturado)}
          sub={`${pctFaturado}% do contrato`} />
        <KPICard icon={AlertOctagon} color={riscosCriticos.length > 0 ? "red" : "slate"}
          label="Riscos críticos" value={riscosCriticos.length}
          sub={`${riscosAbertos} risco${riscosAbertos !== 1 ? "s" : ""} aberto${riscosAbertos !== 1 ? "s" : ""}`} />
      </div>

      {/* ── RESUMO FINANCEIRO + HORAS ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Resumo Financeiro" icon={BarChart3} iconColor="text-emerald-600">
          <FinBar label="Valor Total"  value={valorTotal}    color="bg-slate-300" />
          <FinBar label="Faturado"     value={valorFaturado} color="bg-emerald-400" total={valorTotal} />
          <FinBar label="Recebido"     value={valorRecebido} color="bg-emerald-600" total={valorTotal} />
          <FinBar label="A receber"    value={valorPendente} color="bg-amber-400"   total={valorTotal} />
          <div className="mt-3 pt-3 border-t border-slate-50">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Progresso financeiro</span>
              <span className="font-semibold text-slate-700">{pctFaturado}%</span>
            </div>
            <div className="mt-1.5 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pctFaturado}%` }} />
            </div>
          </div>
        </Card>

        <Card title="Resumo de Horas" icon={Clock} iconColor="text-blue-500">
          <div className="space-y-3">
            <HoraRow label="Horas estimadas" value={horasEstimadas} unit="h" />
            <HoraRow label="Horas lançadas"  value={horasLancadas}  unit="h" highlight />
            <HoraRow label="Saldo"           value={horasEstimadas - horasLancadas} unit="h"
              color={horasEstimadas - horasLancadas < 0 ? "text-red-500" : "text-emerald-600"} />
          </div>
          <div className="mt-3 pt-3 border-t border-slate-50">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Consumo de horas</span>
              <span className="font-semibold text-slate-700">{pctHoras}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${pctHoras > 90 ? "bg-red-400" : "bg-blue-400"}`}
                style={{ width: `${pctHoras}%` }} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── DOCUMENTOS + RISCOS CRÍTICOS ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card title="Últimos Documentos" icon={FolderOpen} iconColor="text-violet-500">
          {documentos.length === 0 ? (
            <EmptyMsg text="Nenhum documento vinculado" />
          ) : (
            <div className="space-y-2">
              {documentos.slice(0, 5).map(d => (
                <div key={d.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={13} className="text-violet-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">{d.nome}</p>
                      <p className="text-[11px] text-slate-400">{d.tipo} · v{d.versao || "1.0"}</p>
                    </div>
                  </div>
                  <DocStatusBadge status={d.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Riscos Críticos" icon={AlertOctagon} iconColor="text-red-500">
          {riscosCriticos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <CheckCircle2 size={24} className="text-emerald-400" />
              <p className="text-sm text-slate-400">Nenhum risco crítico ativo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {riscosCriticos.slice(0, 5).map(r => (
                <div key={r.id} className="flex items-start gap-2.5 py-2 border-b border-slate-50 last:border-0">
                  <AlertOctagon size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 leading-snug">{r.descricao}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${IMPACTO_STYLE[r.impacto] || ""}`}>{r.impacto}</span>
                      <span className="text-[11px] text-slate-400">{r.categoria} · {r.responsavel || "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── ATIVIDADES RECENTES ──────────────────────────────────────────────── */}
      <Card title="Atividades Recentes" icon={Activity} iconColor="text-slate-500">
        {atividades.length === 0 ? (
          <EmptyMsg text="Nenhuma atividade registrada" />
        ) : (
          <div className="space-y-0">
            {atividades.map((a, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  a.tipo === "tarefa" ? "bg-blue-50" : "bg-purple-50"
                }`}>
                  {a.tipo === "tarefa"
                    ? <CheckCircle2 size={11} className="text-blue-500" />
                    : <MessageSquare size={11} className="text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium truncate">{a.desc}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      a.tipo === "tarefa" ? (TAREFA_STYLE[a.sub] || "bg-slate-100 text-slate-500") : "bg-purple-50 text-purple-600"
                    }`}>{a.sub}</span>
                    <span className="text-[11px] text-slate-400">
                      {a.date ? new Date(a.date).toLocaleDateString("pt-BR") : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Card({ title, icon: Icon, iconColor, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <Icon size={14} className={iconColor} />
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoField({ label, icon: Icon, value, editando, onChange, type = "text", rawValue, atrasado }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-medium text-slate-500 mb-1.5">
        {Icon && <Icon size={11} />} {label}
      </label>
      {editando && onChange ? (
        <Input type={type} value={rawValue !== undefined ? rawValue : (value || "")}
          onChange={e => onChange(e.target.value)} className="h-8 text-sm" />
      ) : (
        <p className={`text-sm font-semibold ${atrasado ? "text-red-500" : "text-slate-800"}`}>{value || "—"}</p>
      )}
    </div>
  );
}

function KPICard({ icon: Icon, color, label, value, sub }) {
  const c = {
    green:  { icon: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-100" },
    blue:   { icon: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-100"    },
    emerald:{ icon: "text-emerald-700", bg: "bg-emerald-50",  border: "border-emerald-100" },
    red:    { icon: "text-red-600",     bg: "bg-red-50",      border: "border-red-100"     },
    slate:  { icon: "text-slate-500",   bg: "bg-slate-50",    border: "border-slate-200"   },
  }[color] || { icon: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" };

  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={17} className={c.icon} />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold text-slate-900 leading-tight truncate">{value}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
          {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function FinBar({ label, value, color, total }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
        <span className="text-slate-600">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {total != null && <span className="text-slate-400">{pct}%</span>}
        <span className="font-semibold text-slate-800">{fmt(value)}</span>
      </div>
    </div>
  );
}

function HoraRow({ label, value, unit, highlight, color }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-slate-50 last:border-0 py-1">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`font-bold ${color || (highlight ? "text-blue-700" : "text-slate-700")}`}>
        {(value || 0).toFixed(1)}{unit}
      </span>
    </div>
  );
}

function DocStatusBadge({ status }) {
  const m = {
    "Aprovado":   "bg-emerald-100 text-emerald-700",
    "Entregue":   "bg-blue-100 text-blue-700",
    "Em revisão": "bg-amber-100 text-amber-700",
    "Rascunho":   "bg-slate-100 text-slate-500",
  };
  return <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${m[status] || "bg-slate-100 text-slate-500"}`}>{status}</span>;
}

function EmptyMsg({ text }) {
  return <p className="text-sm text-slate-400 text-center py-6 italic">{text}</p>;
}