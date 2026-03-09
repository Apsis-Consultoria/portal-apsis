import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import KpiCard from "@/components/marketing/KpiCard";
import FiltersBar from "@/components/marketing/FiltersBar";
import AnalisisTipoVendaChart from "@/components/dashboards/AnalisisTipoVendaChart";
import AberturaVendaChart from "@/components/dashboards/AberturaVendaChart";
import { Download } from "lucide-react";

const COLORS = ["#F47920", "#1A4731", "#22C55E", "#6366F1", "#F59E0B", "#EF4444", "#8B5CF6"];
const fmt = v => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);
const fmtN = v => new Intl.NumberFormat("pt-BR").format(v || 0);

const TRIMESTRE_LABELS = { 1: "T1", 2: "T2", 3: "T3", 4: "T4" };

function getTrimestre(dateStr) {
  if (!dateStr) return null;
  const m = new Date(dateStr).getMonth() + 1;
  return Math.ceil(m / 3);
}

export default function MarketingComercial() {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(2026);
  const [trimestre, setTrimestre] = useState("");
  const [area, setArea] = useState("Todas");

  useEffect(() => {
    base44.entities.VendaMarketing.list().then(data => {
      setVendas(data);
      setLoading(false);
    });
  }, []);

  // Filtro base (por ano e área)
  const filtradas = vendas.filter(v => {
    const vAno = v.ano || (v.data_aceite_ou_perda ? new Date(v.data_aceite_ou_perda).getFullYear() : null);
    const vTrim = v.trimestre || getTrimestre(v.data_aceite_ou_perda);
    const matchAno = vAno === ano;
    const matchTrim = trimestre === "" || vTrim === trimestre;
    const matchArea = area === "Todas" || v.area === area;
    return matchAno && matchTrim && matchArea;
  });

  const ganhas = filtradas.filter(v => v.status === "Ganha");
  const finalizadas = filtradas.filter(v => ["Ganha", "Perdida"].includes(v.status));

  // KPIs
  const totalVendas = ganhas.reduce((s, v) => s + (v.valor || 0), 0);
  const totalClientes = new Set(ganhas.map(v => v.cliente_nome)).size;
  const totalPropostas = filtradas.filter(v => {
    const vAno = new Date(v.data_criacao_proposta || "").getFullYear();
    return vAno === ano;
  }).length;
  const taxaConversao = finalizadas.length > 0 ? ((ganhas.length / finalizadas.length) * 100).toFixed(1) : "0.0";
  const ticketMedio = ganhas.length > 0 ? totalVendas / ganhas.length : 0;

  // Vendas por trimestre
  const vendasTrimestre = [1, 2, 3, 4].map(t => {
    const tVendas = ganhas.filter(v => (v.trimestre || getTrimestre(v.data_aceite_ou_perda)) === t);
    const total = tVendas.reduce((s, v) => s + (v.valor || 0), 0);
    const ticket = tVendas.length > 0 ? total / tVendas.length : 0;
    return { name: `T${t}`, vendas: total, ticket };
  });

  // Tipo de venda
  const tipoMap = {};
  ganhas.forEach(v => {
    const t = v.tipo_venda || "Não informado";
    tipoMap[t] = (tipoMap[t] || 0) + 1;
  });
  const tipoData = Object.entries(tipoMap).map(([name, value]) => ({ name, value }));

  // Perfil do cliente
  const perfilMap = {};
  ganhas.forEach(v => {
    const p = v.perfil_cliente || "Não informado";
    perfilMap[p] = (perfilMap[p] || { count: 0, valor: 0 });
    perfilMap[p].count++;
    perfilMap[p].valor += v.valor || 0;
  });
  const perfilData = Object.entries(perfilMap).map(([name, d]) => ({ name, count: d.count, valor: d.valor }));

  // Por área
  const areaMap = {};
  ganhas.forEach(v => {
    const a = v.area || "Outros";
    if (!areaMap[a]) areaMap[a] = { vendas: 0, clientes: new Set(), propostas: 0, ganhas: 0, finalizadas: 0 };
    areaMap[a].vendas += v.valor || 0;
    areaMap[a].clientes.add(v.cliente_nome);
    areaMap[a].ganhas++;
  });
  filtradas.filter(v => ["Ganha","Perdida"].includes(v.status)).forEach(v => {
    const a = v.area || "Outros";
    if (!areaMap[a]) areaMap[a] = { vendas: 0, clientes: new Set(), propostas: 0, ganhas: 0, finalizadas: 0 };
    areaMap[a].finalizadas++;
  });
  const areaData = Object.entries(areaMap).map(([nome, d]) => ({
    nome,
    vendas: d.vendas,
    clientes: d.clientes.size,
    ticket: d.ganhas > 0 ? d.vendas / d.ganhas : 0,
    conversao: d.finalizadas > 0 ? ((d.ganhas / d.finalizadas) * 100).toFixed(1) : "0.0",
  }));

  const exportCSV = () => {
    const rows = [["Cliente","Área","Tipo Venda","Perfil","Status","Valor","Data Aceite"]];
    filtradas.forEach(v => rows.push([v.cliente_nome, v.area, v.tipo_venda, v.perfil_cliente, v.status, v.valor, v.data_aceite_ou_perda]));
    const csv = rows.map(r => r.join(";")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `comercial_${ano}.csv`;
    a.click();
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#F47920] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#1A2B1F]">Dashboard Comercial Estratégico</h2>
          <p className="text-xs text-[#5C7060]">Indicadores de vendas, conversão e perfil de cliente</p>
        </div>
        <div className="flex items-center gap-3">
          <FiltersBar ano={ano} setAno={setAno} trimestre={trimestre} setTrimestre={setTrimestre} area={area} setArea={setArea} />
          <button onClick={exportCSV} className="flex items-center gap-2 text-xs border border-[#DDE3DE] rounded-lg px-3 py-1.5 text-[#5C7060] hover:bg-[#F4F6F4] transition-colors">
            <Download size={13} /> CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Vendas" value={fmt(totalVendas)} color="green" />
        <KpiCard label="Ticket Médio" value={fmt(ticketMedio)} color="orange" />
        <KpiCard label="Clientes Únicos" value={fmtN(totalClientes)} color="blue" />
        <KpiCard label="Propostas Criadas" value={fmtN(totalPropostas)} color="gray" />
        <KpiCard label="Taxa de Conversão" value={`${taxaConversao}%`} color={parseFloat(taxaConversao) >= 50 ? "green" : "orange"} />
      </div>

      <AnalisisTipoVendaChart />

      <AberturaVendaChart />
    </div>
  );
}