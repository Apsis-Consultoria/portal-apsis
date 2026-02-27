import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import StatusBadge from "@/components/ui/StatusBadge";
import { Plus, X, Edit2, Trash2, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const fmt = (v) => v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "—";
const emptyOS = { proposta_id:"", proposta_numero:"", cliente_nome:"", responsavel_tecnico:"", status:"Não iniciado", percentual_conclusao:0, prazo_previsto:"", valor_proporcional:0, descricao:"", observacoes:"" };

export default function Projetos() {
  const [oss, setOss] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [filtroResp, setFiltroResp] = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([
    base44.entities.OrdemServico.list("-created_date", 200),
    base44.entities.Proposta.list("-created_date", 200),
  ]).then(([os, p]) => { setOss(os); setPropostas(p); });

  useEffect(() => { load(); }, []);

  const responsaveis = [...new Set(oss.map(o => o.responsavel_tecnico).filter(Boolean))];

  const filtrados = oss.filter(o => {
    const r = filtroResp === "Todos" || o.responsavel_tecnico === filtroResp;
    const s = filtroStatus === "Todos" || o.status === filtroStatus;
    return r && s;
  });

  // Alocação por colaborador
  const alocacao = {};
  oss.filter(o => o.status === "Ativo").forEach(o => {
    const resp = o.responsavel_tecnico || "—";
    const peso = (o.valor_proporcional || 0) * ((100 - (o.percentual_conclusao || 0)) / 100);
    alocacao[resp] = (alocacao[resp] || 0) + peso;
  });

  const salvar = async () => {
    setSaving(true);
    const { data, editing } = modal;
    if (editing?.id) await base44.entities.OrdemServico.update(editing.id, data);
    else await base44.entities.OrdemServico.create(data);
    await load();
    setModal(null);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Confirmar exclusão?")) return;
    await base44.entities.OrdemServico.delete(id);
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

  const maxAloc = Math.max(...Object.values(alocacao), 1);

  return (
    <div className="space-y-5">
      {/* Alocação visual */}
      {Object.keys(alocacao).length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8ECF0] p-5">
          <h2 className="font-semibold text-[#0F1B35] mb-4 text-sm">Carga de Trabalho — Projetos Ativos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(alocacao).map(([resp, val]) => {
              const pct = (val / maxAloc) * 100;
              const alto = pct > 80;
              return (
                <div key={resp} className={`p-4 rounded-xl border ${alto ? "border-red-200 bg-red-50" : "border-[#E8ECF0] bg-[#F7F8FA]"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#0F1B35] truncate">{resp}</span>
                    {alto && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                  </div>
                  <div className="w-full bg-white rounded-full h-2 mb-2">
                    <div className={`h-2 rounded-full ${alto ? "bg-red-400" : "bg-[#C9A84C]"}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-[#6B7A99]">{fmt(val)} em carteira</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select className="border border-[#E8ECF0] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          {["Todos","Ativo","Pausado","Cancelado","Não iniciado"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="border border-[#E8ECF0] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroResp} onChange={e => setFiltroResp(e.target.value)}>
          <option value="Todos">Todos responsáveis</option>
          {responsaveis.map(r => <option key={r}>{r}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => setModal({ data: { ...emptyOS }, editing: null })}
          className="flex items-center gap-2 bg-[#0F1B35] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1A2D52] transition-colors">
          <Plus size={15} /> Nova OS
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtrados.length === 0 ? (
          <div className="col-span-3 text-center py-16 text-[#6B7A99]">Nenhum projeto encontrado</div>
        ) : filtrados.map(os => {
          const prop = propostas.find(p => p.id === os.proposta_id);
          return (
            <div key={os.id} className="bg-white rounded-2xl border border-[#E8ECF0] p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-[#0F1B35] text-sm">{os.cliente_nome || prop?.cliente_nome || "Cliente"}</p>
                  <p className="text-xs text-[#6B7A99] mt-0.5">{os.descricao || prop?.natureza || "OS sem descrição"}</p>
                </div>
                <StatusBadge status={os.status} />
              </div>

              {/* Progress */}
              {os.status === "Ativo" && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#6B7A99]">Conclusão</span>
                    <span className="font-semibold text-[#0F1B35]">{os.percentual_conclusao || 0}%</span>
                  </div>
                  <div className="w-full bg-[#F7F8FA] rounded-full h-2">
                    <div className="h-2 bg-[#C9A84C] rounded-full transition-all" style={{ width: `${os.percentual_conclusao || 0}%` }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div>
                  <p className="text-[#6B7A99]">Responsável</p>
                  <p className="font-medium text-[#0F1B35]">{os.responsavel_tecnico || "—"}</p>
                </div>
                <div>
                  <p className="text-[#6B7A99]">Valor</p>
                  <p className="font-medium text-[#0F1B35]">{fmt(os.valor_proporcional)}</p>
                </div>
                {os.prazo_previsto && (
                  <div className="col-span-2">
                    <p className="text-[#6B7A99]">Prazo previsto</p>
                    <p className="font-medium text-[#0F1B35]">{format(new Date(os.prazo_previsto), "dd/MM/yyyy")}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-1 pt-2 border-t border-[#F7F8FA]">
                <button onClick={() => setModal({ data: { ...os }, editing: os })}
                  className="p-1.5 hover:bg-[#F7F8FA] rounded-lg transition-colors">
                  <Edit2 size={13} className="text-[#6B7A99]" />
                </button>
                <button onClick={() => excluir(os.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E8ECF0]">
              <h2 className="font-semibold text-[#0F1B35]">{modal.editing ? "Editar OS" : "Nova Ordem de Serviço"}</h2>
              <button onClick={() => setModal(null)}><X size={18} className="text-[#6B7A99]" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <InputField label="Cliente" field="cliente_nome" />
              <div>
                <label className="block text-xs font-medium text-[#6B7A99] mb-1">Proposta (AP)</label>
                <select className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
                  value={modal?.data?.proposta_id || ""}
                  onChange={e => {
                    const p = propostas.find(p => p.id === e.target.value);
                    setModal(m => ({ ...m, data: { ...m.data, proposta_id: e.target.value, proposta_numero: p?.numero_ap || "", cliente_nome: p?.cliente_nome || m.data.cliente_nome } }));
                  }}>
                  <option value="">Selecionar proposta</option>
                  {propostas.filter(p => p.status === "Ganha").map(p => (
                    <option key={p.id} value={p.id}>{p.numero_ap || p.cliente_nome} — {p.cliente_nome}</option>
                  ))}
                </select>
              </div>
              <InputField label="Responsável Técnico" field="responsavel_tecnico" />
              <InputField label="Status" field="status" options={["Não iniciado","Ativo","Pausado","Cancelado"]} />
              <InputField label="% Conclusão" field="percentual_conclusao" type="number" />
              <InputField label="Prazo Previsto" field="prazo_previsto" type="date" />
              <InputField label="Valor Proporcional (R$)" field="valor_proporcional" type="number" />
              <InputField label="Descrição" field="descricao" />
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#6B7A99] mb-1">Observações</label>
                <textarea rows={3} className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
                  value={modal?.data?.observacoes || ""}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, observacoes: e.target.value } }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-[#E8ECF0] rounded-xl text-sm text-[#6B7A99] hover:bg-[#F7F8FA]">Cancelar</button>
              <button onClick={salvar} disabled={saving}
                className="px-5 py-2 bg-[#0F1B35] text-white rounded-xl text-sm font-medium hover:bg-[#1A2D52] disabled:opacity-60">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}