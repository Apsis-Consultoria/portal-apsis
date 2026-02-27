import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import StatusBadge from "@/components/ui/StatusBadge";
import { Plus, Search, Flame, Thermometer, Snowflake, ChevronRight, Bell, X, Edit2, Trash2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const fmt = (v) => v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "—";
const TempIcon = ({ t }) => t === "Quente" ? <Flame size={13} className="text-red-500" /> : t === "Morna" ? <Thermometer size={13} className="text-amber-500" /> : <Snowflake size={13} className="text-blue-400" />;

const emptyProposta = { cliente_nome:"", natureza:"Contábil - Laudo", quantidade_horas:0, taxa_media:0, desconto_percentual:0, valor_total:0, status:"Em elaboração", temperatura:"Morna", chance_conversao:50, responsavel:"", observacoes:"", nivel_followup:"N1" };
const emptyOAP = { cliente_nome:"", natureza:"Contábil", responsavel:"", status:"Aberta", observacoes:"" };

export default function Pipeline() {
  const [tab, setTab] = useState("ap");
  const [propostas, setPropostas] = useState([]);
  const [oaps, setOaps] = useState([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [modal, setModal] = useState(null); // null | {type:"proposta"|"oap", data, editing}
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([
    base44.entities.Proposta.list("-created_date", 200),
    base44.entities.OAP.list("-created_date", 200),
  ]).then(([p, o]) => { setPropostas(p); setOaps(o); });

  useEffect(() => { load(); }, []);

  // Follow-up alerts
  const alertas = propostas.filter(p => {
    if (!p.ultimo_followup || !["Enviada","Em elaboração"].includes(p.status)) return false;
    return differenceInDays(new Date(), new Date(p.ultimo_followup)) >= 7;
  });

  const filtrarPropostas = () => propostas.filter(p => {
    const matchBusca = p.cliente_nome?.toLowerCase().includes(busca.toLowerCase()) || p.numero_ap?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = statusFiltro === "Todos" || p.status === statusFiltro;
    return matchBusca && matchStatus;
  });

  const filtrarOAPs = () => oaps.filter(o =>
    o.cliente_nome?.toLowerCase().includes(busca.toLowerCase())
  );

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
      <label className="block text-xs font-medium text-[#6B7A99] mb-1">{label}</label>
      {options ? (
        <select className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
          value={modal?.data?.[field] || ""}
          onChange={e => setModal(m => ({ ...m, data: { ...m.data, [field]: e.target.value } }))}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type}
          className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
          value={modal?.data?.[field] || ""}
          onChange={e => setModal(m => ({ ...m, data: { ...m.data, [field]: type === "number" ? Number(e.target.value) : e.target.value } }))} />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Alertas follow-up */}
      {alertas.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Bell size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{alertas.length} proposta(s) aguardando follow-up</p>
            <p className="text-xs text-amber-600 mt-0.5">{alertas.map(a => a.cliente_nome).join(", ")}</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex bg-white border border-[#E8ECF0] rounded-xl p-1 gap-1">
          {[{k:"ap",l:"Propostas (AP)"},{k:"oap",l:"Oportunidades (OAP)"}].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab===t.k ? "bg-[#0F1B35] text-white" : "text-[#6B7A99] hover:text-[#0F1B35]"}`}>
              {t.l}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7A99]" />
          <input placeholder="Buscar cliente ou número AP..." value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E8ECF0] rounded-xl text-sm focus:outline-none focus:border-[#C9A84C] bg-white" />
        </div>
        {tab === "ap" && (
          <select className="border border-[#E8ECF0] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
            value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)}>
            {["Todos","Em elaboração","Enviada","Ganha","Perdida","Caducada"].map(s => <option key={s}>{s}</option>)}
          </select>
        )}
        <button onClick={() => setModal({ type: tab==="ap"?"proposta":"oap", data: tab==="ap"?{...emptyProposta}:{...emptyOAP}, editing: null })}
          className="flex items-center gap-2 bg-[#0F1B35] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1A2D52] transition-colors">
          <Plus size={15} /> Nova {tab==="ap"?"Proposta":"OAP"}
        </button>
      </div>

      {/* Tabela AP */}
      {tab === "ap" && (
        <div className="bg-white rounded-2xl border border-[#E8ECF0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8ECF0] bg-[#F7F8FA]">
                  {["AP","Cliente","Natureza","Valor","Conversão","Follow-up","Status",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F8FA]">
                {filtrarPropostas().length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-[#6B7A99] text-sm">Nenhuma proposta encontrada</td></tr>
                ) : filtrarPropostas().map(p => {
                  const diasSemFollowup = p.ultimo_followup ? differenceInDays(new Date(), new Date(p.ultimo_followup)) : null;
                  const atrasado = diasSemFollowup !== null && diasSemFollowup >= 7 && ["Enviada","Em elaboração"].includes(p.status);
                  return (
                    <tr key={p.id} className="hover:bg-[#F7F8FA] transition-colors">
                      <td className="px-4 py-3 font-medium text-[#0F1B35]">{p.numero_ap || "—"}</td>
                      <td className="px-4 py-3 text-[#0F1B35]">{p.cliente_nome}</td>
                      <td className="px-4 py-3 text-[#6B7A99] max-w-[150px] truncate">{p.natureza}</td>
                      <td className="px-4 py-3 font-semibold text-[#0F1B35]">{fmt(p.valor_total)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <TempIcon t={p.temperatura} />
                          <span className="text-[#6B7A99]">{p.chance_conversao || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {p.ultimo_followup ? (
                          <span className={`text-xs font-medium ${atrasado ? "text-red-500" : "text-[#6B7A99]"}`}>
                            {atrasado && "⚠ "}{p.nivel_followup} · {format(new Date(p.ultimo_followup), "dd/MM/yy")}
                          </span>
                        ) : <span className="text-[#6B7A99]">—</span>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setModal({ type:"proposta", data:{...p}, editing:p })}
                            className="p-1.5 hover:bg-[#E8ECF0] rounded-lg transition-colors">
                            <Edit2 size={13} className="text-[#6B7A99]" />
                          </button>
                          <button onClick={() => excluir("proposta", p.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={13} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OAP tab */}
      {tab === "oap" && (
        <div className="bg-white rounded-2xl border border-[#E8ECF0] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8ECF0] bg-[#F7F8FA]">
                  {["Cliente","Natureza","Responsável","Status","Data",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F8FA]">
                {filtrarOAPs().length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-[#6B7A99] text-sm">Nenhuma oportunidade encontrada</td></tr>
                ) : filtrarOAPs().map(o => (
                  <tr key={o.id} className="hover:bg-[#F7F8FA] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0F1B35]">{o.cliente_nome}</td>
                    <td className="px-4 py-3 text-[#6B7A99]">{o.natureza}</td>
                    <td className="px-4 py-3 text-[#6B7A99]">{o.responsavel || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-xs text-[#6B7A99]">{o.created_date ? format(new Date(o.created_date), "dd/MM/yy") : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setModal({ type:"oap", data:{...o}, editing:o })}
                          className="p-1.5 hover:bg-[#E8ECF0] rounded-lg transition-colors">
                          <Edit2 size={13} className="text-[#6B7A99]" />
                        </button>
                        <button onClick={() => excluir("oap", o.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={13} className="text-red-400" />
                        </button>
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
            <div className="flex items-center justify-between p-6 border-b border-[#E8ECF0]">
              <h2 className="font-semibold text-[#0F1B35]">
                {modal.editing ? "Editar" : "Nova"} {modal.type === "proposta" ? "Proposta (AP)" : "Oportunidade (OAP)"}
              </h2>
              <button onClick={() => setModal(null)}><X size={18} className="text-[#6B7A99]" /></button>
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
                    <label className="block text-xs font-medium text-[#6B7A99] mb-1">Observações</label>
                    <textarea rows={3} className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
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
                    <label className="block text-xs font-medium text-[#6B7A99] mb-1">Observações</label>
                    <textarea rows={3} className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
                      value={modal?.data?.observacoes || ""}
                      onChange={e => setModal(m => ({ ...m, data: { ...m.data, observacoes: e.target.value } }))} />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-[#E8ECF0] rounded-xl text-sm text-[#6B7A99] hover:bg-[#F7F8FA]">Cancelar</button>
              <button onClick={salvar} disabled={saving}
                className="px-5 py-2 bg-[#0F1B35] text-white rounded-xl text-sm font-medium hover:bg-[#1A2D52] disabled:opacity-60 transition-colors">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}