import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import StatusBadge from "@/components/ui/StatusBadge";
import StatCard from "@/components/ui/StatCard";
import { Plus, X, Edit2, Trash2, DollarSign, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { format, isPast } from "date-fns";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);
const emptyParcela = { proposta_id:"", cliente_nome:"", valor:0, data_vencimento:"", data_recebimento:"", status:"Lançada", mes_referencia:"", ano_referencia: new Date().getFullYear(), nota_fiscal:"", observacoes:"" };

export default function Financeiro() {
  const [parcelas, setParcelas] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroMes, setFiltroMes] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([
    base44.entities.Parcela.list("-data_vencimento", 300),
    base44.entities.Proposta.list("-created_date", 200),
  ]).then(([pa, pr]) => { setParcelas(pa); setPropostas(pr); });

  useEffect(() => { load(); }, []);

  // Verificar e marcar em atraso
  useEffect(() => {
    parcelas.forEach(p => {
      if (p.status === "Lançada" && p.data_vencimento && isPast(new Date(p.data_vencimento))) {
        base44.entities.Parcela.update(p.id, { status: "Em atraso" });
      }
    });
  }, [parcelas]);

  const recebido = parcelas.filter(p => p.status === "Recebida").reduce((s, p) => s + (p.valor || 0), 0);
  const faturado = parcelas.filter(p => p.status === "Faturada").reduce((s, p) => s + (p.valor || 0), 0);
  const lancado = parcelas.filter(p => p.status === "Lançada").reduce((s, p) => s + (p.valor || 0), 0);
  const atraso = parcelas.filter(p => p.status === "Em atraso").reduce((s, p) => s + (p.valor || 0), 0);

  const meses = [...new Set(parcelas.map(p => p.mes_referencia).filter(Boolean))].sort();

  const filtradas = parcelas.filter(p => {
    const s = filtroStatus === "Todos" || p.status === filtroStatus;
    const m = filtroMes === "Todos" || p.mes_referencia === filtroMes;
    return s && m;
  });

  const salvar = async () => {
    setSaving(true);
    const { data, editing } = modal;
    if (editing?.id) await base44.entities.Parcela.update(editing.id, data);
    else await base44.entities.Parcela.create(data);
    await load();
    setModal(null);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Confirmar exclusão?")) return;
    await base44.entities.Parcela.delete(id);
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
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Recebido" value={fmt(recebido)} icon={CheckCircle} color="green" />
        <StatCard label="Faturado (aguardando)" value={fmt(faturado)} icon={DollarSign} color="gold" />
        <StatCard label="A Lançar" value={fmt(lancado)} icon={Clock} color="blue" />
        <StatCard label="Em Atraso" value={fmt(atraso)} icon={AlertTriangle} color="red" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select className="border border-[#E8ECF0] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          {["Todos","Lançada","Faturada","Recebida","Em atraso"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="border border-[#E8ECF0] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
          <option value="Todos">Todos os meses</option>
          {meses.map(m => <option key={m}>{m}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => setModal({ data: { ...emptyParcela }, editing: null })}
          className="flex items-center gap-2 bg-[#0F1B35] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1A2D52] transition-colors">
          <Plus size={15} /> Nova Parcela
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-[#E8ECF0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8ECF0] bg-[#F7F8FA]">
                {["Cliente","Valor","Vencimento","Recebimento","Mês Ref.","NF","Status",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#6B7A99] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F7F8FA]">
              {filtradas.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-[#6B7A99]">Nenhuma parcela encontrada</td></tr>
              ) : filtradas.map(p => (
                <tr key={p.id} className={`hover:bg-[#F7F8FA] transition-colors ${p.status === "Em atraso" ? "bg-red-50/30" : ""}`}>
                  <td className="px-4 py-3 font-medium text-[#0F1B35]">{p.cliente_nome || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-[#0F1B35]">{fmt(p.valor)}</td>
                  <td className="px-4 py-3 text-xs text-[#6B7A99]">
                    {p.data_vencimento ? format(new Date(p.data_vencimento), "dd/MM/yyyy") : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7A99]">
                    {p.data_recebimento ? format(new Date(p.data_recebimento), "dd/MM/yyyy") : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7A99]">{p.mes_referencia || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#6B7A99]">{p.nota_fiscal || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ data: { ...p }, editing: p })}
                        className="p-1.5 hover:bg-[#E8ECF0] rounded-lg transition-colors">
                        <Edit2 size={13} className="text-[#6B7A99]" />
                      </button>
                      <button onClick={() => excluir(p.id)}
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#E8ECF0]">
              <h2 className="font-semibold text-[#0F1B35]">{modal.editing ? "Editar Parcela" : "Nova Parcela"}</h2>
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
                    setModal(m => ({ ...m, data: { ...m.data, proposta_id: e.target.value, cliente_nome: p?.cliente_nome || m.data.cliente_nome } }));
                  }}>
                  <option value="">Selecionar proposta</option>
                  {propostas.filter(p => p.status === "Ganha").map(p => (
                    <option key={p.id} value={p.id}>{p.numero_ap || ""} — {p.cliente_nome}</option>
                  ))}
                </select>
              </div>
              <InputField label="Valor (R$)" field="valor" type="number" />
              <InputField label="Status" field="status" options={["Lançada","Faturada","Recebida","Em atraso"]} />
              <InputField label="Data Vencimento" field="data_vencimento" type="date" />
              <InputField label="Data Recebimento" field="data_recebimento" type="date" />
              <InputField label="Mês Referência" field="mes_referencia" />
              <InputField label="Ano Referência" field="ano_referencia" type="number" />
              <InputField label="Nota Fiscal" field="nota_fiscal" />
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#6B7A99] mb-1">Observações</label>
                <textarea rows={2} className="w-full border border-[#E8ECF0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A84C]"
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