import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Plus, X, Edit2, Trash2, DollarSign, Clock, AlertTriangle, CheckCircle, TrendingUp, Search } from "lucide-react";
import { format, isPast } from "date-fns";
import FinanceiroMetricasTable from "@/components/dashboards/FinanceiroMetricasTable";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const emptyParcela = {
  proposta_id:"", cliente_nome:"", valor:0, data_vencimento:"",
  data_recebimento:"", status:"Lançada", mes_referencia:"",
  ano_referencia: new Date().getFullYear(), nota_fiscal:"", observacoes:""
};

export default function Financeiro() {
  const [parcelas, setParcelas] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroMes, setFiltroMes] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([
    base44.entities.Parcela.list("-data_vencimento", 300),
    base44.entities.Proposta.list("-created_date", 200),
  ]).then(([pa, pr]) => { setParcelas(pa); setPropostas(pr); });

  useEffect(() => { load(); }, []);

  // Métricas
  const recebido  = parcelas.filter(p => p.status === "Recebida").reduce((s, p) => s + (p.valor || 0), 0);
  const faturado  = parcelas.filter(p => p.status === "Faturada").reduce((s, p) => s + (p.valor || 0), 0);
  const lancado   = parcelas.filter(p => p.status === "Lançada").reduce((s, p) => s + (p.valor || 0), 0);
  const atraso    = parcelas.filter(p => p.status === "Em atraso").reduce((s, p) => s + (p.valor || 0), 0);
  const totalCarteira = recebido + faturado + lancado + atraso;
  const pctRecebido = totalCarteira > 0 ? ((recebido / totalCarteira) * 100).toFixed(0) : 0;

  // Receita por mês (gráfico)
  const receitaMes = MESES.map((mes, i) => {
    const m = i + 1;
    const rec = parcelas.filter(p => {
      const d = p.data_recebimento ? new Date(p.data_recebimento) : null;
      return d && d.getMonth() + 1 === m && p.status === "Recebida";
    }).reduce((s, p) => s + (p.valor || 0), 0);
    const fat = parcelas.filter(p => {
      const d = p.data_vencimento ? new Date(p.data_vencimento) : null;
      return d && d.getMonth() + 1 === m;
    }).reduce((s, p) => s + (p.valor || 0), 0);
    return { mes, recebido: rec, faturado: fat };
  });

  const meses = [...new Set(parcelas.map(p => p.mes_referencia).filter(Boolean))].sort();

  const filtradas = parcelas.filter(p => {
    const s = filtroStatus === "Todos" || p.status === filtroStatus;
    const m = filtroMes === "Todos" || p.mes_referencia === filtroMes;
    const b = !busca || p.cliente_nome?.toLowerCase().includes(busca.toLowerCase()) || p.nota_fiscal?.toLowerCase().includes(busca.toLowerCase());
    return s && m && b;
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
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:"Recebido", value:fmt(recebido), sub:`${pctRecebido}% da carteira`, icon:CheckCircle, bg:"bg-emerald-50", ic:"text-emerald-600", bar:"bg-emerald-500", pct:Number(pctRecebido) },
          { label:"Faturado (aguardando)", value:fmt(faturado), sub:`${totalCarteira>0?((faturado/totalCarteira)*100).toFixed(0):0}% da carteira`, icon:DollarSign, bg:"bg-[#F47920]/10", ic:"text-[#F47920]", bar:"bg-[#F47920]", pct:totalCarteira>0?Number(((faturado/totalCarteira)*100).toFixed(0)):0 },
          { label:"A Lançar", value:fmt(lancado), sub:`${totalCarteira>0?((lancado/totalCarteira)*100).toFixed(0):0}% da carteira`, icon:Clock, bg:"bg-blue-50", ic:"text-blue-600", bar:"bg-blue-500", pct:totalCarteira>0?Number(((lancado/totalCarteira)*100).toFixed(0)):0 },
          { label:"Em Atraso", value:fmt(atraso), sub:`${totalCarteira>0?((atraso/totalCarteira)*100).toFixed(0):0}% da carteira`, icon:AlertTriangle, bg:"bg-red-50", ic:"text-red-500", bar:"bg-red-500", pct:totalCarteira>0?Number(((atraso/totalCarteira)*100).toFixed(0)):0 },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#DDE3DE] p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <p className="text-xs font-medium text-[#5C7060] uppercase tracking-wider">{k.label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${k.bg}`}>
                <k.icon size={15} className={k.ic} />
              </div>
            </div>
            <p className="text-xl font-bold text-[#1A2B1F]">{k.value}</p>
            <p className="text-xs text-[#5C7060] mt-1">{k.sub}</p>
            <div className="w-full bg-[#F4F6F4] rounded-full h-1.5 mt-3">
              <div className={`h-1.5 rounded-full ${k.bar}`} style={{ width:`${Math.min(k.pct,100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Carteira total */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
        <p className="text-xs font-medium text-[#5C7060] uppercase tracking-wider mb-2">Carteira Total</p>
        <p className="text-2xl font-bold text-[#1A2B1F]">{fmt(totalCarteira)}</p>
        <p className="text-xs text-[#5C7060] mt-1">{parcelas.length} parcelas cadastradas</p>
      </div>

      {/* Métricas Financeiras */}
      <FinanceiroMetricasTable />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7060]" />
          <input placeholder="Buscar cliente ou NF..." value={busca} onChange={e => setBusca(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#DDE3DE] rounded-xl text-sm focus:outline-none focus:border-[#F47920] bg-white" />
        </div>
        <select className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          {["Todos","Lançada","Faturada","Recebida","Em atraso"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
          <option value="Todos">Todos os meses</option>
          {meses.map(m => <option key={m}>{m}</option>)}
        </select>
        <button onClick={() => setModal({ data: { ...emptyParcela }, editing: null })}
          className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors">
          <Plus size={15} /> Nova Parcela
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
        <div className="p-4 border-b border-[#DDE3DE] flex items-center justify-between">
          <p className="text-sm font-medium text-[#1A2B1F]">{filtradas.length} parcelas · Total: <span className="text-[#F47920] font-bold">{fmt(filtradas.reduce((s,p)=>s+(p.valor||0),0))}</span></p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                {["Cliente","Valor","Vencimento","Recebimento","Mês Ref.","NF","Status",""].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F4]">
              {filtradas.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-[#5C7060]">Nenhuma parcela encontrada</td></tr>
              ) : filtradas.map(p => (
                <tr key={p.id} className={`hover:bg-[#F4F6F4] transition-colors ${p.status === "Em atraso" ? "bg-red-50/40" : ""}`}>
                  <td className="px-4 py-3 font-medium text-[#1A2B1F]">{p.cliente_nome || "—"}</td>
                  <td className="px-4 py-3 font-bold text-[#1A2B1F]">{fmt(p.valor)}</td>
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{p.data_vencimento ? format(new Date(p.data_vencimento), "dd/MM/yyyy") : "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{p.data_recebimento ? format(new Date(p.data_recebimento), "dd/MM/yyyy") : "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{p.mes_referencia || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{p.nota_fiscal || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setModal({ data: { ...p }, editing: p })}
                        className="p-1.5 hover:bg-[#E8EDE9] rounded-lg"><Edit2 size={13} className="text-[#5C7060]" /></button>
                      <button onClick={() => excluir(p.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={13} className="text-red-400" /></button>
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
            <div className="flex items-center justify-between p-6 border-b border-[#DDE3DE]">
              <h2 className="font-semibold text-[#1A2B1F]">{modal.editing ? "Editar Parcela" : "Nova Parcela"}</h2>
              <button onClick={() => setModal(null)}><X size={18} className="text-[#5C7060]" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <InputField label="Cliente" field="cliente_nome" />
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Proposta (AP)</label>
                <select className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
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
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Observações</label>
                <textarea rows={2} className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                  value={modal?.data?.observacoes || ""}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, observacoes: e.target.value } }))} />
              </div>
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