import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageHeader from "./shared/PageHeader";
import {
  Clock, Plus, Check, X, Trash2, Users, BarChart3, Download,
  CheckCircle2, AlertTriangle, DollarSign, Timer, Loader2, FileText
} from "lucide-react";

const fmt1 = (v) => (v || 0).toFixed(1);
const fmtDate = (d) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR") : "—";

export default function ProjetoTimesheet({ osId, projeto }) {
  const [entradas,   setEntradas]   = useState([]);
  const [alocacoes,  setAlocacoes]  = useState([]);
  const [tarefas,    setTarefas]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showEntry,  setShowEntry]  = useState(false);
  const [showAlloc,  setShowAlloc]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [aprovando,  setAprovando]  = useState(null);
  const [activeTab,  setActiveTab]  = useState("entradas");

  const [entryForm, setEntryForm] = useState({
    colaborador: "", data: new Date().toISOString().slice(0, 10),
    horas: "", descricao: "", tarefa_id: "", faturavel: true,
  });
  const [allocForm, setAllocForm] = useState({
    colaborador: "", horas_previstas: "", horas_executadas: "0",
    data_inicio: "", data_fim: "", status: "Planejada",
  });

  useEffect(() => {
    Promise.all([
      base44.entities.EntradaTempo.filter({ os_id: osId }),
      base44.entities.AlocacaoHoras.filter({ projeto_id: osId }),
      base44.entities.Tarefa.filter({ os_id: osId }),
    ]).then(([e, a, t]) => {
      setEntradas(e.sort((a, b) => b.data?.localeCompare(a.data)));
      setAlocacoes(a);
      setTarefas(t);
      setLoading(false);
    });
  }, [osId]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const horasPrevistas  = alocacoes.reduce((s, a) => s + (a.horas_previstas || 0), 0);
  const horasExecutadas = entradas.reduce((s, e) => s + (e.horas || 0), 0);
  const horasRestantes  = Math.max(0, horasPrevistas - horasExecutadas);
  const colaboradores   = [...new Set(entradas.map(e => e.colaborador).filter(Boolean))];
  const horasFaturaveis = entradas.filter(e => e.faturavel).reduce((s, e) => s + (e.horas || 0), 0);
  const horasAprovadas  = entradas.filter(e => e.aprovado).reduce((s, e) => s + (e.horas || 0), 0);

  // ── Ranking ───────────────────────────────────────────────────────────────
  const ranking = useMemo(() => {
    const map = {};
    entradas.forEach(e => {
      if (!e.colaborador) return;
      if (!map[e.colaborador]) map[e.colaborador] = { horas: 0, fat: 0, apr: 0 };
      map[e.colaborador].horas += e.horas || 0;
      if (e.faturavel) map[e.colaborador].fat += e.horas || 0;
      if (e.aprovado)  map[e.colaborador].apr += e.horas || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].horas - a[1].horas);
  }, [entradas]);

  const maxHorasRanking = ranking[0]?.[1]?.horas || 1;

  // ── Actions ───────────────────────────────────────────────────────────────
  const salvarEntry = async () => {
    if (!entryForm.colaborador || !entryForm.horas) return;
    setSaving(true);
    const nova = await base44.entities.EntradaTempo.create({
      ...entryForm, os_id: osId,
      cliente_nome: projeto?.cliente_nome || "",
      horas: Number(entryForm.horas),
    });
    setEntradas(prev => [nova, ...prev]);
    setShowEntry(false);
    setEntryForm({ colaborador: "", data: new Date().toISOString().slice(0, 10), horas: "", descricao: "", tarefa_id: "", faturavel: true });
    setSaving(false);
  };

  const salvarAlloc = async () => {
    if (!allocForm.colaborador || !allocForm.horas_previstas) return;
    setSaving(true);
    const nova = await base44.entities.AlocacaoHoras.create({
      ...allocForm, projeto_id: osId,
      horas_previstas:  Number(allocForm.horas_previstas),
      horas_executadas: Number(allocForm.horas_executadas) || 0,
    });
    setAlocacoes(prev => [...prev, nova]);
    setShowAlloc(false);
    setAllocForm({ colaborador: "", horas_previstas: "", horas_executadas: "0", data_inicio: "", data_fim: "", status: "Planejada" });
    setSaving(false);
  };

  const excluirEntry = async (id) => {
    await base44.entities.EntradaTempo.delete(id);
    setEntradas(prev => prev.filter(e => e.id !== id));
  };

  const aprovar = async (id, val) => {
    setAprovando(id);
    await base44.entities.EntradaTempo.update(id, { aprovado: val });
    setEntradas(prev => prev.map(e => e.id === id ? { ...e, aprovado: val } : e));
    setAprovando(null);
  };

  const aprovarTodas = async () => {
    const pendentes = entradas.filter(e => !e.aprovado);
    for (const e of pendentes) await base44.entities.EntradaTempo.update(e.id, { aprovado: true });
    setEntradas(prev => prev.map(e => ({ ...e, aprovado: true })));
  };

  const exportCSV = () => {
    const header = "Colaborador,Data,Horas,Faturável,Aprovado,Descrição\n";
    const rows = entradas.map(e =>
      `"${e.colaborador}","${e.data}",${e.horas},${e.faturavel ? "Sim" : "Não"},${e.aprovado ? "Sim" : "Não"},"${e.descricao || ""}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `horas_${osId}.csv`; a.click();
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">

      <PageHeader
        title="Equipe e Horas"
        subtitle="Alocações, entradas de tempo e controle de aprovação"
        icon={Users}
        actions={(
          <>
            <Button size="sm" onClick={() => { setShowAlloc(!showAlloc); setShowEntry(false); }}
              variant="outline" className="gap-1.5 text-xs border-slate-300 hover:bg-white hover:border-slate-400 transition-all">
              <Plus size={12} /> Nova Alocação
            </Button>
            <Button size="sm" onClick={() => { setShowEntry(!showEntry); setShowAlloc(false); }}
              className="bg-[#1A4731] hover:bg-[#245E40] active:bg-[#15372a] text-white gap-1.5 text-xs shadow-sm hover:shadow-md transition-all">
              <Plus size={12} /> Nova Entrada
            </Button>
            <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5 text-xs border-slate-200 text-slate-500 hover:bg-white transition-all">
              <Download size={12} /> CSV
            </Button>
          </>
        )}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={Timer}        color="blue"   label="Horas previstas"   value={`${fmt1(horasPrevistas)}h`}   sub="alocadas ao projeto" />
        <KPICard icon={Clock}        color="indigo" label="Horas executadas"  value={`${fmt1(horasExecutadas)}h`} sub={`${Math.round(horasPrevistas > 0 ? (horasExecutadas/horasPrevistas)*100 : 0)}% do previsto`} />
        <KPICard icon={AlertTriangle} color={horasRestantes === 0 && horasPrevistas > 0 ? "red" : "amber"} label="Horas restantes" value={`${fmt1(horasRestantes)}h`} sub="saldo de horas" />
        <KPICard icon={Users}        color="green"  label="Colaboradores"     value={colaboradores.length}         sub="envolvidos no projeto" />
      </div>



      {/* ── Form: Nova Alocação ──────────────────────────────────────── */}
      {showAlloc && (
        <FormCard title="Nova Alocação de Colaborador" onClose={() => setShowAlloc(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Colaborador *">
              <Input className="h-9 text-sm" placeholder="Nome do colaborador"
                value={allocForm.colaborador} onChange={e => setAllocForm(f => ({ ...f, colaborador: e.target.value }))} />
            </Field>
            <Field label="Horas previstas *">
              <Input type="number" className="h-9 text-sm" value={allocForm.horas_previstas}
                onChange={e => setAllocForm(f => ({ ...f, horas_previstas: e.target.value }))} />
            </Field>
            <Field label="Status">
              <Select value={allocForm.status} onValueChange={v => setAllocForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Planejada","Em andamento","Concluída","Suspensa"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Início">
              <Input type="date" className="h-9 text-sm" value={allocForm.data_inicio}
                onChange={e => setAllocForm(f => ({ ...f, data_inicio: e.target.value }))} />
            </Field>
            <Field label="Término">
              <Input type="date" className="h-9 text-sm" value={allocForm.data_fim}
                onChange={e => setAllocForm(f => ({ ...f, data_fim: e.target.value }))} />
            </Field>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button size="sm" variant="outline" onClick={() => setShowAlloc(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={salvarAlloc} disabled={saving}
              className="bg-[#1A4731] hover:bg-[#245E40] text-white text-xs gap-1.5">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Salvar
            </Button>
          </div>
        </FormCard>
      )}

      {/* ── Form: Nova Entrada ───────────────────────────────────────── */}
      {showEntry && (
        <FormCard title="Nova Entrada de Tempo" onClose={() => setShowEntry(false)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <Field label="Colaborador *">
              <Input className="h-9 text-sm" placeholder="Nome"
                value={entryForm.colaborador} onChange={e => setEntryForm(f => ({ ...f, colaborador: e.target.value }))} />
            </Field>
            <Field label="Data *">
              <Input type="date" className="h-9 text-sm" value={entryForm.data}
                onChange={e => setEntryForm(f => ({ ...f, data: e.target.value }))} />
            </Field>
            <Field label="Horas *">
              <Input type="number" step="0.5" min="0" className="h-9 text-sm"
                value={entryForm.horas} onChange={e => setEntryForm(f => ({ ...f, horas: e.target.value }))} />
            </Field>
            <Field label="Tarefa vinculada" span={2}>
              <Select value={entryForm.tarefa_id || "none"} onValueChange={v => setEntryForm(f => ({ ...f, tarefa_id: v === "none" ? "" : v }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Sem tarefa específica" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem tarefa específica</SelectItem>
                  {tarefas.map(t => <SelectItem key={t.id} value={t.id}>{t.titulo}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Faturável">
              <div className="flex items-center h-9">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={entryForm.faturavel}
                    onChange={e => setEntryForm(f => ({ ...f, faturavel: e.target.checked }))}
                    className="w-4 h-4 accent-[#1A4731]" />
                  Marcar como faturável
                </label>
              </div>
            </Field>
            <Field label="Descrição" span={3}>
              <Input className="h-9 text-sm" placeholder="O que foi realizado?"
                value={entryForm.descricao} onChange={e => setEntryForm(f => ({ ...f, descricao: e.target.value }))} />
            </Field>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button size="sm" variant="outline" onClick={() => setShowEntry(false)} className="text-xs">Cancelar</Button>
            <Button size="sm" onClick={salvarEntry} disabled={saving}
              className="bg-[#1A4731] hover:bg-[#245E40] text-white text-xs gap-1.5">
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Salvar entrada
            </Button>
          </div>
        </FormCard>
      )}

      {/* ── Ranking + Alocações ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Ranking de carga */}
        <Section title="Ranking de Carga" icon={BarChart3} iconColor="text-violet-500">
          {ranking.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 italic">Nenhuma entrada lançada</p>
          ) : ranking.map(([nome, d], i) => (
            <div key={nome} className="space-y-1 py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-slate-100 text-slate-600" : "bg-slate-50 text-slate-400"
                  }`}>{i + 1}</span>
                  <span className="font-medium text-slate-700 truncate max-w-[120px]">{nome}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-slate-400">{fmt1(d.fat)}h fat.</span>
                  <span className="font-bold text-slate-800">{fmt1(d.horas)}h</span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-violet-400 rounded-full" style={{ width: `${(d.horas / maxHorasRanking) * 100}%` }} />
              </div>
            </div>
          ))}
        </Section>

        {/* Alocações */}
        <Section title="Alocação por Colaborador" icon={Users} iconColor="text-[#1A4731]">
          {alocacoes.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6 italic">Nenhuma alocação cadastrada</p>
          ) : alocacoes.map(a => {
            const pct = a.horas_previstas > 0 ? Math.min(100, Math.round((a.horas_executadas / a.horas_previstas) * 100)) : 0;
            const stColor = {
              "Planejada": "bg-slate-100 text-slate-500",
              "Em andamento": "bg-blue-100 text-blue-700",
              "Concluída": "bg-emerald-100 text-emerald-700",
              "Suspensa": "bg-red-100 text-red-500",
            }[a.status] || "bg-slate-100 text-slate-500";
            return (
              <div key={a.id} className="py-2.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-xs font-semibold text-slate-700">{a.colaborador}</span>
                    {(a.data_inicio || a.data_fim) && (
                      <span className="text-[10px] text-slate-400 ml-2">{fmtDate(a.data_inicio)} – {fmtDate(a.data_fim)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${stColor}`}>{a.status}</span>
                    <span className="text-xs font-bold text-slate-800">{pct}%</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${pct >= 100 ? "bg-red-400" : "bg-[#1A4731]"}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>{fmt1(a.horas_executadas)}h realizadas</span>
                  <span>{fmt1(a.horas_previstas)}h previstas</span>
                </div>
              </div>
            );
          })}
        </Section>
      </div>

      {/* ── Entradas de Tempo ─────────────────────────────────────────── */}
      <Section title="Entradas de Tempo" icon={Clock} iconColor="text-blue-500">
        {entradas.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 italic">Nenhuma entrada lançada</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-2 text-slate-500 font-semibold">Colaborador</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-semibold">Data</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-semibold">Horas</th>
                  <th className="text-left py-2 px-2 text-slate-500 font-semibold hidden md:table-cell">Descrição</th>
                  <th className="text-center py-2 px-2 text-slate-500 font-semibold">Fat.</th>
                  <th className="text-center py-2 px-2 text-slate-500 font-semibold">Aprovado</th>
                  <th className="py-2 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {entradas.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/60 group">
                    <td className="py-2.5 px-2 font-medium text-slate-700">{e.colaborador}</td>
                    <td className="py-2.5 px-2 text-slate-500">{fmtDate(e.data)}</td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-800">{e.horas}h</td>
                    <td className="py-2.5 px-2 text-slate-400 truncate max-w-[180px] hidden md:table-cell">{e.descricao || "—"}</td>
                    <td className="py-2.5 px-2 text-center">
                      {e.faturavel
                        ? <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Sim</span>
                        : <span className="text-[10px] text-slate-300">—</span>}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {aprovando === e.id ? (
                        <Loader2 size={12} className="animate-spin mx-auto text-slate-400" />
                      ) : e.aprovado ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">Aprovado</span>
                      ) : (
                        <button onClick={() => aprovar(e.id, true)}
                          className="text-[10px] border border-slate-200 rounded px-2 py-0.5 text-slate-400 hover:border-[#1A4731] hover:text-[#1A4731] transition-colors">
                          Aprovar
                        </button>
                      )}
                    </td>
                    <td className="py-2.5 px-2">
                      <button onClick={() => excluirEntry(e.id)}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all">
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function KPICard({ icon: Icon, color, label, value, sub }) {
  const c = {
    blue:   { icon: "text-blue-600",    bg: "bg-blue-50",     border: "border-blue-100"    },
    indigo: { icon: "text-indigo-600",  bg: "bg-indigo-50",   border: "border-indigo-100"  },
    amber:  { icon: "text-amber-600",   bg: "bg-amber-50",    border: "border-amber-100"   },
    green:  { icon: "text-emerald-600", bg: "bg-emerald-50",  border: "border-emerald-100" },
    red:    { icon: "text-red-600",     bg: "bg-red-50",      border: "border-red-100"     },
  }[color] || { icon: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" };

  return (
    <div className={`bg-white rounded-2xl border ${c.border} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={17} className={c.icon} />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold text-slate-900 leading-tight">{value}</div>
          <div className="text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
          {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, iconColor, children }) {
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

function Field({ label, span, children }) {
  return (
    <div className={span === 2 ? "sm:col-span-2" : span === 3 ? "md:col-span-3 sm:col-span-2" : ""}>
      <label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}