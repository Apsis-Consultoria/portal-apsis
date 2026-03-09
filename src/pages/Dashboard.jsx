import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import StatCard from "@/components/ui/StatCard";
import { TrendingUp, DollarSign, GitBranch, FolderKanban, AlertTriangle, Target } from "lucide-react";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const COLORS = ["#F47920","#1A4731","#22C55E","#6366F1","#F59E0B","#EF4444"];

// Dados reais BUDGET 2026 da planilha
const BUDGET2026_MES = [
  { mes:"Jan", orcado:725000, real:75862.07 },
  { mes:"Fev", orcado:725000, real:85320.20 },
  { mes:"Mar", orcado:725000, real:0 },
  { mes:"Abr", orcado:725000, real:0 },
  { mes:"Mai", orcado:725000, real:0 },
  { mes:"Jun", orcado:725000, real:0 },
  { mes:"Jul", orcado:725000, real:0 },
  { mes:"Ago", orcado:725000, real:0 },
  { mes:"Set", orcado:725000, real:0 },
  { mes:"Out", orcado:725000, real:0 },
  { mes:"Nov", orcado:725000, real:0 },
  { mes:"Dez", orcado:725000, real:0 },
];

export default function Dashboard() {
  const [propostas, setPropostas] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [oss, setOss] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoSel, setAnoSel] = useState(2026);

  useEffect(() => {
    Promise.all([
      base44.entities.Proposta.list(),
      base44.entities.Parcela.list(),
      base44.entities.Budget.list(),
      base44.entities.OrdemServico.list(),
    ]).then(([p, pa, b, os]) => {
      setPropostas(p); setParcelas(pa); setBudgets(b); setOss(os);
      setLoading(false);
    });
  }, []);

  const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);

  // KPIs — Budget 2026 estático + dados dinâmicos do portal
  const ORCADO_TOTAL_2026 = 8700000;
  const REALIZADO_2026 = 161182.27;
  const FALTA_REALIZAR = ORCADO_TOTAL_2026 - REALIZADO_2026;
  const PCT_ATINGIDO = ((REALIZADO_2026 / ORCADO_TOTAL_2026) * 100).toFixed(1);

  // Pipeline dinâmico
  const propostasAtivas = propostas.filter(p => ["Em elaboração","Enviada"].includes(p.status));
  const valorPipeline = propostasAtivas.reduce((s, p) => s + (p.valor_total || 0), 0);
  const propostasGanhas = propostas.filter(p => p.status === "Ganha").length;
  
  // Métricas extraídas dos gráficos
  const laudosRealizados = 47290.64;
  const consultoriaRealizada = 113891.63;
  const totalRealizado = laudosRealizados + consultoriaRealizada;
  const laudosOrcado = 6200000;
  const consultoriaOrcado = 2500000;
  const totalOrcado = laudosOrcado + consultoriaOrcado;
  
  // Pipeline status
  const pipelineEmElaboracao = propostas.filter(p => p.status === "Em elaboração").length;
  const pipelineEnviada = propostas.filter(p => p.status === "Enviada").length;
  
  // Alocação máxima de colaboradores
  const maxAlocacao = 39749;
  const utilizacaoMedia = ((alocData.reduce((s, d) => s + d.value, 0) / (alocData.length * maxAlocacao)) * 100).toFixed(1);

  // Real vs Orçado — usa dados planilha 2026 se ano=2026
  const budgetData = anoSel === 2026
    ? BUDGET2026_MES
    : MESES.map((mes, i) => {
        const m = i + 1;
        const orcado = budgets.filter(b => b.ano === anoSel && b.mes === m).reduce((s, b) => s + (b.valor_orcado || 0), 0);
        const real = parcelas.filter(p => {
          const d = p.data_recebimento ? new Date(p.data_recebimento) : null;
          return d && d.getFullYear() === anoSel && d.getMonth() + 1 === m && p.status === "Recebida";
        }).reduce((s, p) => s + (p.valor || 0), 0);
        return { mes, orcado, real };
      });

  // Receita por natureza — Budget 2026
  const naturezaData = [
    { name: "Laudo Contábil", value: 47290.64 },
    { name: "Consultoria", value: 113891.63 },
  ];

  // Pipeline por status
  const statusMap = {};
  propostas.forEach(p => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });
  const pipelineData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Alocação colaboradores — dados planilha 2026
  const alocData = [
    { name: "Evelyne Ferrari", value: 39749 },
    { name: "Patrick Gomes", value: 13655 },
    { name: "Amanda Sobral", value: 11408 },
    { name: "Thiago Bastos", value: 996 },
    { name: "Eduardo Calazans", value: 0 },
  ].filter(d => d.value > 0);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40a49a962_Design-sem-nome.png"
        alt="APSIS"
        className="w-16 h-16 object-contain"
        style={{ animation: "apsisFloat 1.4s ease-in-out infinite" }}
      />
      <p className="text-sm text-[#5C7060] font-medium tracking-wide" style={{ animation: "apsisFade 1.4s ease-in-out infinite" }}>
        Pensando...
      </p>
      <style>{`
        @keyframes apsisFloat {
          0%, 100% { transform: translateY(0px); opacity: 1; }
          50% { transform: translateY(-8px); opacity: 0.7; }
        }
        @keyframes apsisFade {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPIs Budget 2026 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Orçado 2026" value={fmt(ORCADO_TOTAL_2026)} icon={Target} color="green" sub="Meta anual total" />
        <StatCard label="Realizado 2026" value={fmt(REALIZADO_2026)} icon={DollarSign} color="gold" sub={`${PCT_ATINGIDO}% da meta`} />
        <StatCard label="Falta Realizar" value={fmt(FALTA_REALIZAR)} icon={AlertTriangle} color="red" sub="Restante do ano" />
        <StatCard label="Pipeline Ativo" value={fmt(valorPipeline || 136946)} icon={GitBranch} color="blue" sub={`${propostasAtivas.length || 8} propostas`} />
      </div>

      {/* Indicadores Budget 2026 da planilha */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Laudos Realizados", value: fmt(47290.64), sub: "de " + fmt(6200000) + " orçados", pct: 0.76 },
          { label: "Consultoria Realizada", value: fmt(113891.63), sub: "de " + fmt(2500000) + " orçados", pct: 4.56 },
          { label: "% Budget Vendas Acumulado", value: "1,85%", sub: "Jan–Fev/26 atingidos", pct: 1.85 },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
            <p className="text-xs font-medium text-[#5C7060] uppercase tracking-wider mb-2">{k.label}</p>
            <p className="text-xl font-bold text-[#1A2B1F]">{k.value}</p>
            <p className="text-xs text-[#5C7060] mt-1">{k.sub}</p>
            <div className="w-full bg-[#F4F6F4] rounded-full h-1.5 mt-3">
              <div className="h-1.5 bg-[#F47920] rounded-full" style={{ width: `${Math.min(k.pct, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Real vs Orçado */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-[#1A2B1F]">Real vs Orçado — Vendas Mensais</h2>
            <p className="text-xs text-[#5C7060] mt-0.5">Meta mensal: R$ 725.000 | Fonte: BUDGET 2026</p>
          </div>
          <select className="text-xs border border-[#DDE3DE] rounded-lg px-3 py-1.5 text-[#5C7060] focus:outline-none"
            value={anoSel} onChange={e => setAnoSel(Number(e.target.value))}>
            {[2025,2026].map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={budgetData} barSize={14} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#5C7060" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#5C7060" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: "1px solid #DDE3DE", fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="orcado" name="Orçado" fill="#E8EDE9" radius={[4,4,0,0]} />
            <Bar dataKey="real" name="Realizado" fill="#F47920" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Natureza */}
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
          <h2 className="font-semibold text-[#1A2B1F] mb-1">Receita por Natureza</h2>
          <p className="text-xs text-[#5C7060] mb-4">Contábil vs Consultoria (2026)</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={naturezaData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {naturezaData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline status */}
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
          <h2 className="font-semibold text-[#1A2B1F] mb-1">Pipeline por Status</h2>
          <p className="text-xs text-[#5C7060] mb-4">Distribuição das propostas (AP)</p>
          {pipelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pipelineData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {pipelineData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-[#5C7060]">Sem dados no pipeline</div>
          )}
        </div>

        {/* Alocação colaboradores */}
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
          <h2 className="font-semibold text-[#1A2B1F] mb-1">Carga por Colaborador</h2>
          <p className="text-xs text-[#5C7060] mb-4">Em andamento (Laudos 2026)</p>
          <div className="space-y-3">
            {alocData.map((item, i) => {
              const max = Math.max(...alocData.map(d => d.value));
              const pct = max > 0 ? (item.value / max) * 100 : 0;
              const alto = pct > 80;
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#1A2B1F] font-medium truncate max-w-[140px]">{item.name}</span>
                    <span className={alto ? "text-red-500 font-semibold" : "text-[#5C7060]"}>
                      {alto && <AlertTriangle size={10} className="inline mr-1" />}
                      {fmt(item.value)}
                    </span>
                  </div>
                  <div className="w-full bg-[#F4F6F4] rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${alto ? "bg-red-400" : "bg-[#F47920]"}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}