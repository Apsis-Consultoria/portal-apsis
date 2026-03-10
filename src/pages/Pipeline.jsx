import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import StatusBadge from "@/components/ui/StatusBadge";
import { Plus, Search, Flame, Thermometer, Snowflake, Bell, X, Edit2, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const fmt = (v) => v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "—";
const TempIcon = ({ t }) => t === "Quente" ? <Flame size={13} className="text-red-500" /> : t === "Morno" ? <Thermometer size={13} className="text-amber-500" /> : <Snowflake size={13} className="text-blue-400" />;

// Dados reais da aba AP da planilha (pré-carregados como referência)
const AP_PLANILHA = [
  { numero_ap:"AP-01545/25-01", cliente_nome:"XPTO", natureza:"Consultoria - Tributária", quantidade_horas:154, desconto_percentual:0, valor_total:75862.07, status:"Ganha", temperatura:"Quente", responsavel:"RENATA", data_envio:"2025-11-26", observacoes:"PROPOSTA GANHA" },
  { numero_ap:"AP-01645/25-01", cliente_nome:"ZPTO", natureza:"Consultoria - Tributária", quantidade_horas:185.5, desconto_percentual:0, valor_total:89983.58, status:"Enviada", temperatura:"Fria", responsavel:"RENATA", data_envio:"2025-12-11", observacoes:"FUP Pendente — 77 dias" },
  { numero_ap:"AP-01646/25-01", cliente_nome:"ZPTO", natureza:"Consultoria - Societária", quantidade_horas:50, desconto_percentual:0, valor_total:24083.20, status:"Enviada", temperatura:"Fria", responsavel:"RENATA", data_envio:"2025-12-11", observacoes:"FUP Pendente — 77 dias" },
  { numero_ap:"AP-01647/25-01", cliente_nome:"ZPTO", natureza:"Contábil - Laudo", quantidade_horas:37, desconto_percentual:0, valor_total:22879.04, status:"Enviada", temperatura:"Fria", responsavel:"RENATA", data_envio:"2025-12-11", observacoes:"FUP nível 1 — 77 dias" },
  { numero_ap:"AP-01674/25-01", cliente_nome:"WWW", natureza:"Contábil - Laudo", quantidade_horas:43, desconto_percentual:0, valor_total:26710.45, status:"Perdida", temperatura:"Fria", responsavel:"EVELYNE", data_envio:"2025-12-18" },
  { numero_ap:"AP-00178/26-01", cliente_nome:"III", natureza:"Consultoria - Societária", quantidade_horas:73, desconto_percentual:0, valor_total:38029.56, status:"Ganha", temperatura:"Quente", responsavel:"ANGELA/AMANDA", data_envio:"2026-02-05" },
  { numero_ap:"AP-00172/26-01", cliente_nome:"XXX", natureza:"Contábil - Laudo", quantidade_horas:36, desconto_percentual:-10, valor_total:21784.35, status:"Ganha", temperatura:"Fria", responsavel:"EVELYNE", data_envio:"2026-02-05" },
  { numero_ap:"AP-00200/26-01", cliente_nome:"YYY", natureza:"Contábil - Laudo", quantidade_horas:18, desconto_percentual:0, valor_total:15544.61, status:"Ganha", temperatura:"Morno", responsavel:"EVELYNE", data_envio:"2026-02-11" },
  { numero_ap:"AP-00236/26-01", cliente_nome:"ZZZ", natureza:"Contábil - Laudo", quantidade_horas:18, desconto_percentual:0, valor_total:9961.69, status:"Ganha", temperatura:"Quente", responsavel:"RENATA", data_envio:"2026-02-20" },
];

const emptyProposta = { cliente_nome:"", natureza:"Contábil - Laudo", quantidade_horas:0, taxa_media:0, desconto_percentual:0, valor_total:0, status:"Em elaboração", temperatura:"Morna", chance_conversao:50, responsavel:"", observacoes:"", nivel_followup:"N1" };
const emptyOAP = { cliente_nome:"", natureza:"Contábil", responsavel:"", status:"Aberta", observacoes:"" };

export default function Pipeline() {
  const [tab, setTab] = useState("ap");
  const [propostas, setPropostas] = useState([]);
  const [oaps, setOaps] = useState([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mostrarPlanilha, setMostrarPlanilha] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [userDepts, setUserDepts] = useState(null); // null = admin/sem filtro
  const [userRole, setUserRole] = useState(null);

  const toggleRow = (key) => setExpandedRows(prev => ({ ...prev, [key]: !prev[key] }));

  const load = () => Promise.all([
    base44.entities.Proposta.list("-created_date", 200),
    base44.entities.OAP.list("-created_date", 200),
  ]).then(([p, o]) => { setPropostas(p); setOaps(o); });

  useEffect(() => {
    load();
    base44.auth.me().then(async (user) => {
      if (!user) return;
      setUserRole(user.role);
      if (user.role === "admin" || user.role === "diretor" || user.role === "manager") return; // vê tudo
      const cols = await base44.entities.Colaborador.filter({ email: user.email });
      if (cols && cols.length > 0) {
        const col = cols[0];
        let depts = [];
        if (col.departamentos) { try { depts = JSON.parse(col.departamentos); } catch {} }
        else if (col.departamento) { depts = [col.departamento]; }
        if (depts.length > 0) setUserDepts(depts);
      }
    }).catch(() => {});
  }, []);

  // Alertas de follow-up (planilha: AP-01645, AP-01646, AP-01647 com 77 dias)
  const alertasPlanilha = AP_PLANILHA.filter(p => p.status === "Enviada" && p.observacoes?.includes("dias"));
  const alertasPortal = propostas.filter(p => {
    if (!p.ultimo_followup || !["Enviada","Em elaboração"].includes(p.status)) return false;
    return differenceInDays(new Date(), new Date(p.ultimo_followup)) >= 7;
  });

  const todasPropostas = mostrarPlanilha
    ? [...AP_PLANILHA.map(p => ({ ...p, _planilha: true })), ...propostas]
    : propostas;

  const filtradas = todasPropostas.filter(p => {
    const matchBusca = p.cliente_nome?.toLowerCase().includes(busca.toLowerCase()) || p.numero_ap?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = statusFiltro === "Todos" || p.status === statusFiltro;
    const matchDept = !userDepts || !p.departamento || userDepts.some(d => d.toLowerCase() === p.departamento?.toLowerCase());
    return matchBusca && matchStatus && matchDept;
  });

  const filtrarOAPs = () => oaps.filter(o => o.cliente_nome?.toLowerCase().includes(busca.toLowerCase()));

  const salvar = async () => {
    setSaving(true);
    const { type, data, editing } = modal;
    const entity = type === "proposta" ? base44.entities.Proposta : base44.entities.OAP;
    let d = { ...data };
    if (type === "proposta") {
      const bruto = (d.quantidade_horas || 0) * (d.taxa_media || 0);
      d.valor_total = bruto * (1 - (d.desconto_percentual || 0) / 100);
    }
    if (editing?.id) await entity.update(editing.id, d);
    else await entity.create(d);
    await load();
    setModal(null);
    setSaving(false);
  };

  const excluir = async (type, id) => {
    if (!confirm("Confirma exclusão?")) return;
    if (type === "proposta") await base44.entities.Proposta.delete(id);
    else await base44.entities.OAP.delete(id);
    await load();
  };

  const InputField = ({ label, field, type = "text", options }) => (
    <div>
      <label className="block text-xs font-medium text-[#5C7060] mb-1">{label}</label>
      {options ? (
        <select className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
          value={modal?.data?.[field] || ""}
          onChange={e => setModal(m => ({ ...m, data: { ...m.data, [field]: e.target.value } }))}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type}
          className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
          value={modal?.data?.[field] || ""}
          onChange={e => setModal(m => ({ ...m, data: { ...m.data, [field]: type === "number" ? Number(e.target.value) : e.target.value } }))} />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Alertas */}
      {(alertasPlanilha.length > 0 || alertasPortal.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Bell size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {alertasPlanilha.length + alertasPortal.length} proposta(s) aguardando follow-up
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {alertasPlanilha.map(a => `${a.cliente_nome} (${a.numero_ap})`).join(" · ")}
              {alertasPortal.map(a => a.cliente_nome).join(" · ")}
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex bg-white border border-[#DDE3DE] rounded-xl p-1 gap-1">
          {[{k:"ap",l:"Propostas (AP)"},{k:"oap",l:"Oportunidades (OAP)"}].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===t.k ? "bg-[#1A4731] text-white" : "text-[#5C7060] hover:text-[#1A2B1F]"}`}>
              {t.l}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7060]" />
          <input placeholder="Buscar cliente ou número AP..." value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#DDE3DE] rounded-xl text-sm focus:outline-none focus:border-[#F47920] bg-white" />
        </div>
        {tab === "ap" && (
          <>
            <select className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
              value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
              {["Todos","Em elaboração","Enviada","Ganha","Perdida","Caducada"].map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => setMostrarPlanilha(!mostrarPlanilha)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${mostrarPlanilha ? "bg-[#1A4731]/10 border-[#1A4731]/20 text-[#1A4731]" : "border-[#DDE3DE] text-[#5C7060]"}`}>
              {mostrarPlanilha ? "✓" : ""} Dados planilha 2026
            </button>
          </>
        )}
        <button onClick={() => setModal({ type: tab==="ap"?"proposta":"oap", data: tab==="ap"?{...emptyProposta}:{...emptyOAP}, editing: null })}
          className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors">
          <Plus size={15} /> Nova {tab==="ap"?"Proposta":"OAP"}
        </button>
      </div>

      {/* Total pipeline */}
      {tab === "ap" && (
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Total pipeline ativo", value: fmt(136945.82), color: "text-[#F47920]" },
            { label: "Ganhas", value: `${filtradas.filter(p => p.status === "Ganha").length}`, color: "text-emerald-600" },
            { label: "Enviadas", value: `${filtradas.filter(p => p.status === "Enviada").length}`, color: "text-blue-600" },
            { label: "Perdidas", value: `${filtradas.filter(p => p.status === "Perdida").length}`, color: "text-red-500" },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-[#DDE3DE] px-4 py-2.5 flex items-center gap-2">
              <span className="text-xs text-[#5C7060]">{k.label}:</span>
              <span className={`text-sm font-bold ${k.color}`}>{k.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Tabela AP */}
      {tab === "ap" && (
        <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                  {["AP","Cliente","Departamento","Natureza","Valor","Temp.","Status","Responsável","Obs",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F4]">
                {filtradas.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-[#5C7060] text-sm">Nenhuma proposta encontrada</td></tr>
                ) : filtradas.map((p, idx) => {
                  const rowKey = p.id || p.numero_ap || idx;
                  const expanded = !!expandedRows[rowKey];
                  return (
                    <>
                      <tr key={rowKey} className={`hover:bg-[#F4F6F4] transition-colors cursor-pointer ${p._planilha ? "bg-[#F9FBF9]" : ""} ${expanded ? "bg-[#F4F6F4]" : ""}`}
                        onClick={() => toggleRow(rowKey)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {expanded ? <ChevronDown size={13} className="text-[#F47920] flex-shrink-0" /> : <ChevronRight size={13} className="text-[#5C7060] flex-shrink-0" />}
                            <span className="font-medium text-[#1A2B1F] text-xs">{p.numero_ap || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#1A2B1F]">{p.cliente_nome}</td>
                        <td className="px-4 py-3 text-[#5C7060] max-w-[140px] truncate text-xs">{p.natureza}</td>
                        <td className="px-4 py-3 font-semibold text-[#1A2B1F]">{fmt(p.valor_total)}</td>
                        <td className="px-4 py-3"><TempIcon t={p.temperatura} /></td>
                        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{p.responsavel || "—"}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060] max-w-[160px] truncate">{p.observacoes || "—"}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          {!p._planilha && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => setModal({ type:"proposta", data:{...p}, editing:p })}
                                className="p-1.5 hover:bg-[#E8EDE9] rounded-lg"><Edit2 size={13} className="text-[#5C7060]" /></button>
                              <button onClick={() => excluir("proposta", p.id)}
                                className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button>
                            </div>
                          )}
                          {p._planilha && <span className="text-[10px] text-[#5C7060] bg-[#E8EDE9] px-1.5 py-0.5 rounded">planilha</span>}
                        </td>
                      </tr>
                      {expanded && (
                        <tr key={`${rowKey}-expand`} className="bg-[#FFF7F0] border-l-4 border-[#F47920]">
                          <td colSpan={9} className="px-6 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-xs">
                              <div>
                                <p className="text-[#5C7060] font-medium uppercase tracking-wide mb-1">Horas</p>
                                <p className="text-[#1A2B1F] font-semibold">{p.quantidade_horas ? `${p.quantidade_horas}h` : "—"}</p>
                              </div>
                              <div>
                                <p className="text-[#5C7060] font-medium uppercase tracking-wide mb-1">Taxa Média</p>
                                <p className="text-[#1A2B1F] font-semibold">{p.taxa_media ? fmt(p.taxa_media) : "—"}</p>
                              </div>
                              <div>
                                <p className="text-[#5C7060] font-medium uppercase tracking-wide mb-1">Desconto</p>
                                <p className="text-[#1A2B1F] font-semibold">{p.desconto_percentual != null ? `${p.desconto_percentual}%` : "—"}</p>
                              </div>
                              <div>
                                <p className="text-[#5C7060] font-medium uppercase tracking-wide mb-1">Chance Conversão</p>
                                <p className="text-[#1A2B1F] font-semibold">{p.chance_conversao != null ? `${p.chance_conversao}%` : "—"}</p>
                              </div>
                              <div>
                                <p className="text-[#5C7060] font-medium uppercase tracking-wide mb-1">Nível Follow-up</p>
                                <p className="text-[#1A2B1F] font-semibold">{p.nivel_followup || "—"}</p>
                              </div>
                              <div>
                                <p className="text-[#5C7060] font-medium uppercase tracking-wide mb-1">Data Envio</p>
                                <p className="text-[#1A2B1F] font-semibold">{p.data_envio ? format(new Date(p.data_envio), "dd/MM/yyyy") : "—"}</p>
                              </div>
                              <div>
                                <p className="text-[#5C7060] font-medium uppercase tracking-wide mb-1">Último Follow-up</p>
                                <p className="text-[#1A2B1F] font-semibold">{p.ultimo_followup ? format(new Date(p.ultimo_followup), "dd/MM/yyyy") : "—"}</p>
                              </div>
                              <div>
                                <p className="text-[#5C7060] font-medium uppercase tracking-wide mb-1">OAP Origem</p>
                                <p className="text-[#1A2B1F] font-semibold">{p.oap_origem || "—"}</p>
                              </div>
                              {p.observacoes && (
                                <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                                  <p className="text-[#5C7060] font-medium uppercase tracking-wide mb-1">Observações</p>
                                  <p className="text-[#1A2B1F]">{p.observacoes}</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OAP tab */}
      {tab === "oap" && (
        <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                  {["Cliente","Natureza","Responsável","Status","Data",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F6F4]">
                {filtrarOAPs().length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-[#5C7060] text-sm">Nenhuma oportunidade encontrada</td></tr>
                ) : filtrarOAPs().map(o => (
                  <tr key={o.id} className="hover:bg-[#F4F6F4] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1A2B1F]">{o.cliente_nome}</td>
                    <td className="px-4 py-3 text-[#5C7060]">{o.natureza}</td>
                    <td className="px-4 py-3 text-[#5C7060]">{o.responsavel || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-[#5C7060]">{o.created_date ? format(new Date(o.created_date), "dd/MM/yy") : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ type:"oap", data:{...o}, editing:o })} className="p-1.5 hover:bg-[#E8EDE9] rounded-lg"><Edit2 size={13} className="text-[#5C7060]" /></button>
                        <button onClick={() => excluir("oap", o.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#DDE3DE]">
              <h2 className="font-semibold text-[#1A2B1F]">
                {modal.editing ? "Editar" : "Nova"} {modal.type === "proposta" ? "Proposta (AP)" : "Oportunidade (OAP)"}
              </h2>
              <button onClick={() => setModal(null)}><X size={18} className="text-[#5C7060]" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <InputField label="Cliente" field="cliente_nome" />
              {modal.type === "proposta" ? (
                <>
                  <InputField label="Número AP" field="numero_ap" />
                  <div className="col-span-2">
                    <InputField label="Natureza" field="natureza" options={["Contábil - Laudo","Contábil - Parecer","Consultoria - Tributária","Consultoria - Societária","Consultoria - M&A","Outros"]} />
                  </div>
                  <InputField label="Qtd. Horas" field="quantidade_horas" type="number" />
                  <InputField label="Taxa Média (R$)" field="taxa_media" type="number" />
                  <InputField label="Desconto (%)" field="desconto_percentual" type="number" />
                  <InputField label="Chance Conversão (%)" field="chance_conversao" type="number" />
                  <InputField label="Temperatura" field="temperatura" options={["Fria","Morna","Quente"]} />
                  <InputField label="Status" field="status" options={["Em elaboração","Enviada","Ganha","Perdida","Caducada"]} />
                  <InputField label="Data Envio" field="data_envio" type="date" />
                  <InputField label="Último Follow-up" field="ultimo_followup" type="date" />
                  <InputField label="Nível Follow-up" field="nivel_followup" options={["N1","N2","N3","N4","N5"]} />
                  <InputField label="Responsável" field="responsavel" />
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-[#5C7060] mb-1">Observações</label>
                    <textarea rows={3} className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                      value={modal?.data?.observacoes || ""}
                      onChange={e => setModal(m => ({ ...m, data: { ...m.data, observacoes: e.target.value } }))} />
                  </div>
                </>
              ) : (
                <>
                  <InputField label="Natureza" field="natureza" options={["Contábil","Consultoria"]} />
                  <InputField label="Responsável" field="responsavel" />
                  <InputField label="Status" field="status" options={["Aberta","Em análise","Encerrada"]} />
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-[#5C7060] mb-1">Observações</label>
                    <textarea rows={3} className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                      value={modal?.data?.observacoes || ""}
                      onChange={e => setModal(m => ({ ...m, data: { ...m.data, observacoes: e.target.value } }))} />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-[#DDE3DE] rounded-xl text-sm text-[#5C7060] hover:bg-[#F4F6F4]">Cancelar</button>
              <button onClick={salvar} disabled={saving}
                className="px-5 py-2 bg-[#1A4731] text-white rounded-xl text-sm font-medium hover:bg-[#245E40] disabled:opacity-60">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}