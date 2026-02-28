import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import { Download, FileText, Search, Filter } from "lucide-react";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);
const fmtPct = (v) => `${v >= 0 ? "+" : ""}${Number(v).toFixed(1)}%`;
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const COLORS = ["#F47920","#1A4731","#22C55E","#6366F1","#F59E0B","#EF4444","#8B5CF6","#EC4899"];

// Budget 2026 estático
const BUDGET_MES = MESES.map((mes, i) => ({
  mes,
  orcado: 725000,
  laudoOrcado: 516666.67,
  consultoriaOrcado: 208333.33,
}));
const REAL_2026 = [
  { mes:"Jan", real:75862.07, contabil:0, consultoria:75862.07 },
  { mes:"Fev", real:85320.20, contabil:47290.64, consultoria:38029.56 },
  ...MESES.slice(2).map(mes => ({ mes, real:0, contabil:0, consultoria:0 })),
];

export default function Relatorios() {
  const [propostas, setPropostas] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [oss, setOss] = useState([]);

  // Filtros
  const [filtroAnalista, setFiltroAnalista] = useState("Todos");
  const [filtroProjeto, setFiltroProjeto] = useState("");
  const [filtroValorMin, setFiltroValorMin] = useState("");
  const [filtroValorMax, setFiltroValorMax] = useState("");
  const [filtroAno, setFiltroAno] = useState(2026);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposta.list(),
      base44.entities.Parcela.list(),
      base44.entities.OrdemServico.list(),
    ]).then(([p, pa, os]) => { setPropostas(p); setParcelas(pa); setOss(os); });
  }, []);

  // Analistas disponíveis
  const analistas = ["Todos", ...new Set([
    ...propostas.map(p => p.responsavel),
    ...oss.map(o => o.responsavel_tecnico),
    "Evelyne Ferrari","Amanda Sobral","Eduardo Calazans","Patrick Gomes","Thiago Bastos","Renata","Angela"
  ].filter(Boolean))];

  // Propostas filtradas
  const propostasFiltradas = propostas.filter(p => {
    const analista = filtroAnalista === "Todos" || p.responsavel === filtroAnalista;
    const projeto = !filtroProjeto || p.cliente_nome?.toLowerCase().includes(filtroProjeto.toLowerCase()) || p.numero_ap?.toLowerCase().includes(filtroProjeto.toLowerCase());
    const vmin = !filtroValorMin || (p.valor_total || 0) >= Number(filtroValorMin);
    const vmax = !filtroValorMax || (p.valor_total || 0) <= Number(filtroValorMax);
    return analista && projeto && vmin && vmax;
  });

  // Métricas
  const total = propostasFiltradas.length;
  const ganhas = propostasFiltradas.filter(p => p.status === "Ganha").length;
  const perdidas = propostasFiltradas.filter(p => p.status === "Perdida").length;
  const txConversao = total > 0 ? ((ganhas / total) * 100).toFixed(1) : 0;
  const valorTotal = propostasFiltradas.reduce((s, p) => s + (p.valor_total || 0), 0);
  const valorGanho = propostasFiltradas.filter(p => p.status === "Ganha").reduce((s, p) => s + (p.valor_total || 0), 0);

  // Real vs Orçado 2026
  const realOrcadoData = MESES.map((mes, i) => ({
    mes,
    orcado: BUDGET_MES[i].orcado,
    real: REAL_2026[i].real,
    gap: REAL_2026[i].real - BUDGET_MES[i].orcado,
  }));

  // Receita por mês (dinâmico)
  const receitaMes = MESES.map((mes, i) => {
    const m = i + 1;
    const rec = parcelas.filter(p => {
      const d = p.data_recebimento ? new Date(p.data_recebimento) : null;
      return d && d.getFullYear() === filtroAno && d.getMonth() + 1 === m && p.status === "Recebida";
    }).reduce((s, p) => s + (p.valor || 0), 0);
    return { mes, receita: rec };
  });

  // Top clientes
  const recCliente = {};
  propostasFiltradas.filter(p => p.status === "Ganha").forEach(p => {
    recCliente[p.cliente_nome || "—"] = (recCliente[p.cliente_nome || "—"] || 0) + (p.valor_total || 0);
  });
  const topClientes = Object.entries(recCliente).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([name,value])=>({name,value}));

  // Por analista
  const porAnalista = {};
  propostasFiltradas.filter(p => p.status === "Ganha").forEach(p => {
    const k = p.responsavel || "—";
    porAnalista[k] = (porAnalista[k] || 0) + (p.valor_total || 0);
  });
  const analistaData = Object.entries(porAnalista).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));

  // Status distribuição
  const statusDist = {};
  propostasFiltradas.forEach(p => { statusDist[p.status] = (statusDist[p.status] || 0) + 1; });
  const statusData = Object.entries(statusDist).map(([name,value])=>({name,value}));

  // Exportar CSV
  const exportCSV = () => {
    const headers = ["Cliente","AP","Natureza","Valor","Status","Responsável","Data Envio"];
    const rows = propostasFiltradas.map(p => [
      p.cliente_nome || "", p.numero_ap || "", p.natureza || "",
      p.valor_total || 0, p.status || "", p.responsavel || "",
      p.data_envio || ""
    ]);
    const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "relatorio_apsis.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Exportar PDF simples via print
  const exportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={14} className="text-[#5C7060]" />
          <p className="text-sm font-semibold text-[#1A2B1F]">Filtros</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-[#5C7060] mb-1">Analista</label>
            <select className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
              value={filtroAnalista} onChange={e => setFiltroAnalista(e.target.value)}>
              {analistas.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#5C7060] mb-1">Projeto / Cliente</label>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5C7060]" />
              <input placeholder="Buscar..." value={filtroProjeto} onChange={e => setFiltroProjeto(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-[#DDE3DE] rounded-lg text-sm focus:outline-none focus:border-[#F47920]" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#5C7060] mb-1">Valor mínimo (R$)</label>
            <input type="number" placeholder="0" value={filtroValorMin} onChange={e => setFiltroValorMin(e.target.value)}
              className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
          </div>
          <div>
            <label className="block text-xs text-[#5C7060] mb-1">Valor máximo (R$)</label>
            <input type="number" placeholder="∞" value={filtroValorMax} onChange={e => setFiltroValorMax(e.target.value)}
              className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
          </div>
        </div>
      </div>

      {/* Ações exportação */}
      <div className="flex flex-wrap items-center gap-3">
        <select className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroAno} onChange={e => setFiltroAno(Number(e.target.value))}>
          {[2024,2025,2026].map(a => <option key={a}>{a}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={exportCSV}
          className="flex items-center gap-2 border border-[#1A4731] text-[#1A4731] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1A4731]/5 transition-colors">
          <Download size={14} /> Exportar Excel (CSV)
        </button>
        <button onClick={exportPDF}
          className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors">
          <FileText size={14} /> Exportar PDF
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label:"Total Propostas", value:total, color:"text-[#1A2B1F]" },
          { label:"Ganhas", value:ganhas, color:"text-emerald-600" },
          { label:"Perdidas", value:perdidas, color:"text-red-500" },
          { label:"Taxa Conversão", value:`${txConversao}%`, color:"text-[#F47920]" },
          { label:"Valor Ganho", value:fmt(valorGanho), color:"text-[#1A4731]" },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-[#DDE3DE] p-4">
            <p className="text-xs font-medium text-[#5C7060] uppercase tracking-wider mb-2">{m.label}</p>
            <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Real vs Orçado 2026 */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-[#1A2B1F]">Real vs Orçado — Budget 2026</h2>
            <p className="text-xs text-[#5C7060] mt-0.5">Meta mensal R$ 725k · Realizado acumulado: {fmt(161182.27)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#5C7060]">Gap acumulado</p>
            <p className="text-sm font-bold text-red-500">{fmtPct(((161182.27 - 1450000) / 1450000) * 100)}</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={realOrcadoData} barSize={14} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F0" />
            <XAxis dataKey="mes" tick={{ fontSize:11, fill:"#5C7060" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize:11, fill:"#5C7060" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius:10, border:"1px solid #DDE3DE", fontSize:12 }} />
            <Legend wrapperStyle={{ fontSize:11 }} />
            <Bar dataKey="orcado" name="Orçado" fill="#E8EDE9" radius={[4,4,0,0]} />
            <Bar dataKey="real" name="Realizado" fill="#F47920" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Receita mensal */}
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
          <h2 className="font-semibold text-[#1A2B1F] mb-1">Evolução da Receita Mensal</h2>
          <p className="text-xs text-[#5C7060] mb-4">Valores recebidos em {filtroAno}</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={receitaMes}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F0" />
              <XAxis dataKey="mes" tick={{ fontSize:10, fill:"#5C7060" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize:10, fill:"#5C7060" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius:10, fontSize:12 }} />
              <Line type="monotone" dataKey="receita" name="Receita" stroke="#F47920" strokeWidth={2.5} dot={{ r:3, fill:"#F47920" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição status */}
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
          <h2 className="font-semibold text-[#1A2B1F] mb-1">Pipeline por Status</h2>
          <p className="text-xs text-[#5C7060] mb-4">Distribuição das propostas filtradas</p>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius:10, fontSize:12 }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize:11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-[#5C7060]">Sem dados</div>
          )}
        </div>

        {/* Top clientes */}
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
          <h2 className="font-semibold text-[#1A2B1F] mb-1">Top Clientes (Propostas Ganhas)</h2>
          <p className="text-xs text-[#5C7060] mb-4">Valor por cliente</p>
          {topClientes.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={topClientes} layout="vertical" barSize={11}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F0F2F0" />
                <XAxis type="number" tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize:9, fill:"#5C7060" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:9, fill:"#5C7060" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius:10, fontSize:12 }} />
                <Bar dataKey="value" name="Valor" fill="#1A4731" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-[#5C7060] text-center py-10">Cadastre propostas ganhas para visualizar</p>}
        </div>

        {/* Por analista */}
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
          <h2 className="font-semibold text-[#1A2B1F] mb-1">Valor por Analista</h2>
          <p className="text-xs text-[#5C7060] mb-4">Propostas ganhas por responsável</p>
          {analistaData.length > 0 ? (
            <div className="space-y-3">
              {analistaData.map((item, i) => {
                const max = Math.max(...analistaData.map(d => d.value));
                const pct = max > 0 ? (item.value / max) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#1A2B1F] font-medium">{item.name}</span>
                      <span className="text-[#5C7060]">{fmt(item.value)}</span>
                    </div>
                    <div className="w-full bg-[#F4F6F4] rounded-full h-2">
                      <div className="h-2 bg-[#F47920] rounded-full" style={{ width:`${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Dados da planilha 2026 como fallback
            <div className="space-y-3">
              {[
                { name:"Evelyne Ferrari", value:39749 },
                { name:"Patrick Gomes", value:13655 },
                { name:"Amanda Sobral", value:11408 },
                { name:"Thiago Bastos", value:996 },
              ].map((item, i) => {
                const max = 39749;
                const pct = (item.value / max) * 100;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#1A2B1F] font-medium">{item.name}</span>
                      <span className="text-[#5C7060]">{fmt(item.value)}</span>
                    </div>
                    <div className="w-full bg-[#F4F6F4] rounded-full h-2">
                      <div className="h-2 bg-[#1A4731] rounded-full" style={{ width:`${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tabela detalhada */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
        <div className="p-4 border-b border-[#DDE3DE]">
          <h2 className="font-semibold text-[#1A2B1F]">Detalhamento de Propostas</h2>
          <p className="text-xs text-[#5C7060] mt-0.5">{propostasFiltradas.length} registros · {fmt(valorTotal)} total</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                {["AP","Cliente","Natureza","Valor","Status","Responsável"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F4]">
              {propostasFiltradas.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#5C7060]">Nenhuma proposta encontrada com os filtros selecionados</td></tr>
              ) : propostasFiltradas.slice(0,20).map(p => (
                <tr key={p.id} className="hover:bg-[#F4F6F4] transition-colors">
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{p.numero_ap || "—"}</td>
                  <td className="px-4 py-3 font-medium text-[#1A2B1F]">{p.cliente_nome}</td>
                  <td className="px-4 py-3 text-xs text-[#5C7060] max-w-[140px] truncate">{p.natureza}</td>
                  <td className="px-4 py-3 font-bold text-[#1A2B1F]">{fmt(p.valor_total)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${p.status==="Ganha"?"bg-emerald-50 text-emerald-700":p.status==="Perdida"?"bg-red-50 text-red-600":"bg-[#F4F6F4] text-[#5C7060]"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{p.responsavel || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}