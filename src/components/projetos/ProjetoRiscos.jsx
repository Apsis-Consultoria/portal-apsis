import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertOctagon, Plus, Check, Trash2, ShieldCheck, X,
  Loader2, Shield, AlertTriangle, Edit2, Save, ChevronDown, ChevronUp
} from "lucide-react";

const IMPACTO_STYLE = {
  "Baixo":   { badge: "bg-slate-100 text-slate-500",    border: "border-l-slate-300",   icon: "text-slate-400"   },
  "Médio":   { badge: "bg-yellow-100 text-yellow-700",  border: "border-l-yellow-400",  icon: "text-yellow-500"  },
  "Alto":    { badge: "bg-orange-100 text-orange-700",  border: "border-l-orange-400",  icon: "text-orange-500"  },
  "Crítico": { badge: "bg-red-100 text-red-700",        border: "border-l-red-500",     icon: "text-red-500"     },
};

const STATUS_STYLE = {
  "Aberto":       { badge: "bg-red-100 text-red-700",     dot: "bg-red-500"     },
  "Em mitigação": { badge: "bg-amber-100 text-amber-700", dot: "bg-amber-400"   },
  "Resolvido":    { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  "Aceito":       { badge: "bg-slate-100 text-slate-500", dot: "bg-slate-400"   },
};

const EMPTY_FORM = {
  descricao: "", categoria: "Prazo", probabilidade: "Média",
  impacto: "Médio", status: "Aberto", plano_mitigacao: "", responsavel: "", prazo_resolucao: ""
};

export default function ProjetoRiscos({ osId }) {
  const [riscos,   setRiscos]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null); // id being edited
  const [saving,   setSaving]   = useState(false);
  const [expanded, setExpanded] = useState({});
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    base44.entities.RiscoProjeto.filter({ os_id: osId }).then(r => {
      setRiscos(r);
      setLoading(false);
    });
  }, [osId]);

  const salvar = async () => {
    if (!form.descricao || !form.categoria) return;
    setSaving(true);
    const novo = await base44.entities.RiscoProjeto.create({ ...form, os_id: osId });
    setRiscos(prev => [novo, ...prev]);
    setShowForm(false);
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const startEdit = (r) => {
    setEditing(r.id);
    setEditForm({ ...r });
  };

  const saveEdit = async () => {
    setSaving(true);
    await base44.entities.RiscoProjeto.update(editing, editForm);
    setRiscos(prev => prev.map(r => r.id === editing ? { ...r, ...editForm } : r));
    setEditing(null);
    setSaving(false);
  };

  const atualizarStatus = async (id, status) => {
    await base44.entities.RiscoProjeto.update(id, { status });
    setRiscos(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const excluir = async (id) => {
    await base44.entities.RiscoProjeto.delete(id);
    setRiscos(prev => prev.filter(r => r.id !== id));
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
    </div>
  );

  const abertos    = riscos.filter(r => r.status === "Aberto").length;
  const mitigando  = riscos.filter(r => r.status === "Em mitigação").length;
  const resolvidos = riscos.filter(r => r.status === "Resolvido").length;
  const criticos   = riscos.filter(r => r.impacto === "Crítico" && r.status !== "Resolvido").length;

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">

      {/* ── KPIs ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={AlertOctagon} color="red"     label="Abertos"      value={abertos} />
        <KPICard icon={Shield}       color="amber"   label="Em mitigação" value={mitigando} />
        <KPICard icon={ShieldCheck}  color="emerald" label="Resolvidos"   value={resolvidos} />
        <KPICard icon={AlertTriangle} color={criticos > 0 ? "red" : "slate"} label="Impacto crítico" value={criticos} />
      </div>

      {/* ── Parabéns banner ──────────────────────────────────────────── */}
      {abertos === 0 && riscos.length > 0 && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
          <ShieldCheck size={15} className="flex-shrink-0" />
          <span>Nenhum risco aberto. Projeto está seguro! ✓</span>
        </div>
      )}

      {/* ── Ação ─────────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setShowForm(!showForm)}
          variant="outline" className="gap-1.5 text-xs border-slate-300">
          <Plus size={12} /> Novo Risco
        </Button>
      </div>

      {/* ── Form novo risco ──────────────────────────────────────────── */}
      {showForm && (
        <FormCard title="Novo Risco" onClose={() => setShowForm(false)}>
          <RiscoForm form={form} setForm={setForm} />
          <div className="flex gap-2 justify-end mt-3">
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={salvar} disabled={saving}
              className="bg-[#1A4731] hover:bg-[#245E40] text-white text-xs gap-1.5">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Salvar
            </Button>
          </div>
        </FormCard>
      )}

      {/* ── Lista ─────────────────────────────────────────────────────── */}
      {riscos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center py-14 gap-2">
          <ShieldCheck size={32} className="text-slate-200" />
          <p className="text-sm text-slate-400 italic">Nenhum risco identificado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {riscos.map(r => {
            const imp = IMPACTO_STYLE[r.impacto] || IMPACTO_STYLE["Médio"];
            const st  = STATUS_STYLE[r.status]   || STATUS_STYLE["Aberto"];
            const isExpanded = expanded[r.id];
            const isEditing  = editing === r.id;

            return (
              <div key={r.id} className={`bg-white rounded-2xl border border-l-4 ${imp.border} border-slate-200 shadow-sm overflow-hidden`}>
                {isEditing ? (
                  <div className="p-5 space-y-3">
                    <RiscoForm form={editForm} setForm={setEditForm} />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="text-xs">Cancelar</Button>
                      <Button size="sm" onClick={saveEdit} disabled={saving}
                        className="bg-[#1A4731] hover:bg-[#245E40] text-white text-xs gap-1.5">
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="px-5 py-4 flex items-start gap-3">
                      <AlertOctagon size={14} className={`${imp.icon} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{r.descricao}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${imp.badge}`}>{r.impacto}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${st.badge}`}>
                            <span className={`w-1 h-1 rounded-full ${st.dot}`} />{r.status}
                          </span>
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{r.categoria}</span>
                          {r.responsavel && <span className="text-[10px] text-slate-400">Resp: {r.responsavel}</span>}
                          {r.prazo_resolucao && (
                            <span className="text-[10px] text-slate-400">
                              Até: {new Date(r.prazo_resolucao + "T00:00:00").toLocaleDateString("pt-BR")}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">Prob: {r.probabilidade}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {r.plano_mitigacao && (
                          <button onClick={() => setExpanded(e => ({ ...e, [r.id]: !e[r.id] }))}
                            className="w-6 h-6 flex items-center justify-center rounded text-slate-400 hover:text-slate-600">
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        )}
                        <button onClick={() => startEdit(r)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                          <Edit2 size={11} />
                        </button>
                        <button onClick={() => excluir(r.id)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-200 hover:text-red-400 hover:bg-red-50 transition-colors">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>

                    {/* Ações de status */}
                    {r.status !== "Resolvido" && (
                      <div className="px-5 pb-3 flex gap-1.5 flex-wrap border-t border-slate-50 pt-3">
                        {r.status === "Aberto" && (
                          <button onClick={() => atualizarStatus(r.id, "Em mitigação")}
                            className="text-[10px] border border-amber-200 text-amber-600 rounded px-2 py-0.5 hover:bg-amber-50 transition-colors">
                            Iniciar mitigação
                          </button>
                        )}
                        <button onClick={() => atualizarStatus(r.id, "Aceito")}
                          className="text-[10px] border border-slate-200 text-slate-500 rounded px-2 py-0.5 hover:bg-slate-50 transition-colors">
                          Aceitar risco
                        </button>
                        <button onClick={() => atualizarStatus(r.id, "Resolvido")}
                          className="text-[10px] border border-emerald-200 text-emerald-600 rounded px-2 py-0.5 hover:bg-emerald-50 transition-colors">
                          Marcar resolvido
                        </button>
                      </div>
                    )}

                    {/* Plano de mitigação expandido */}
                    {isExpanded && r.plano_mitigacao && (
                      <div className="mx-5 mb-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                        <span className="font-semibold text-slate-700">Plano de mitigação:</span>{" "}{r.plano_mitigacao}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RiscoForm({ form, setForm }) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-slate-600 mb-1.5 block">Descrição do risco *</label>
        <Input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
          placeholder="Descreva o risco identificado" className="h-9 text-sm" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Categoria", key: "categoria", opts: ["Prazo","Escopo","Financeiro","Técnico","Comunicação","Recurso"] },
          { label: "Probabilidade", key: "probabilidade", opts: ["Baixa","Média","Alta"] },
          { label: "Impacto", key: "impacto", opts: ["Baixo","Médio","Alto","Crítico"] },
          { label: "Status", key: "status", opts: ["Aberto","Em mitigação","Resolvido","Aceito"] },
        ].map(({ label, key, opts }) => (
          <div key={key}>
            <label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</label>
            <Select value={form[key]} onValueChange={v => setForm(f => ({ ...f, [key]: v }))}>
              <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>{opts.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Responsável</label>
          <Input value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} className="h-9 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Prazo resolução</label>
          <Input type="date" value={form.prazo_resolucao} onChange={e => setForm(f => ({ ...f, prazo_resolucao: e.target.value }))} className="h-9 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-slate-600 mb-1.5 block">Plano de mitigação</label>
        <Input value={form.plano_mitigacao} onChange={e => setForm(f => ({ ...f, plano_mitigacao: e.target.value }))}
          placeholder="Como reduzir ou eliminar este risco?" className="h-9 text-sm" />
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, color, label, value }) {
  const c = {
    red:    { icon: "text-red-600",     bg: "bg-red-50",     border: "border-red-100"     },
    amber:  { icon: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100"   },
    emerald:{ icon: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    slate:  { icon: "text-slate-500",   bg: "bg-slate-50",   border: "border-slate-200"   },
  }[color] || { icon: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" };
  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-4`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={17} className={c.icon} />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 leading-none">{value}</div>
          <div className="text-xs text-slate-500 mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

function FormCard({ title, onClose, children }) {
  return (
    <div className="bg-white rounded-2xl border border-[#1A4731]/20 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-[#1A4731]/5">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}