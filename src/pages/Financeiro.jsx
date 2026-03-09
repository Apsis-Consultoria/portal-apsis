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


    </div>
  );
}