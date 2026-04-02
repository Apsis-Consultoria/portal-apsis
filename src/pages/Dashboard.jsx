import { useState } from "react";
import ModernBarChart from "@/components/charts/ModernBarChart";
import ModernPieChart from "@/components/charts/ModernPieChart";
import ModernLineChart from "@/components/charts/ModernLineChart";
import KPICard from "@/components/ui/KPICard";
import LoadingState from "@/components/ui/LoadingState";
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
  const [anoSel, setAnoSel] = useState(2026);

  const propostas = [];
  const parcelas = [];
  const budgets = [];
  const oss = [];

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

  // Alocação colaboradores — dados planilha 2026
  const alocData = [
    { name: "Evelyne Ferrari", value: 39749 },
    { name: "Patrick Gomes", value: 13655 },
    { name: "Amanda Sobral", value: 11408 },
    { name: "Thiago Bastos", value: 996 },
    { name: "Eduardo Calazans", value: 0 },
  ].filter(d => d.value > 0);

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



  return (
    <div className="space-y-6">
      {/* KPIs Budget 2026 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          label="Orçado 2026" 
          value={fmt(ORCADO_TOTAL_2026)} 
          icon={Target} 
          color="green" 
          subtitle="Meta anual total"
          variant="highlight"
        />
        <KPICard 
          label="Realizado 2026" 
          value={fmt(REALIZADO_2026)} 
          icon={DollarSign} 
          color="orange" 
          subtitle={`${PCT_ATINGIDO}% da meta`}
          progress={parseFloat(PCT_ATINGIDO)}
          variant="highlight"
        />
        <KPICard 
          label="Propostas Ativas" 
          value={propostasAtivas.length} 
          icon={GitBranch} 
          color="blue" 
          subtitle={`${pipelineEmElaboracao} em elaboração`}
        />
        <KPICard 
          label="Taxa Conversão" 
          value={`${((propostasGanhas / propostas.length) * 100 || 0).toFixed(1)}%`}
          icon={TrendingUp} 
          color="green" 
          subtitle={`${propostasGanhas} propostas ganhas`}
        />
      </div>

      {/* Indicadores de Receita por Natureza */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Laudos Contábeis", value: fmt(laudosRealizados), sub: `${((laudosRealizados / laudosOrcado) * 100).toFixed(2)}% do orçado`, pct: (laudosRealizados / laudosOrcado) * 100 },
          { label: "Consultoria", value: fmt(consultoriaRealizada), sub: `${((consultoriaRealizada / consultoriaOrcado) * 100).toFixed(2)}% do orçado`, pct: (consultoriaRealizada / consultoriaOrcado) * 100 },
          { label: "Utilização Colaboradores", value: `${utilizacaoMedia}%`, sub: `Carga média distribuída`, pct: Math.min(utilizacaoMedia, 100) },
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
        <ModernBarChart
          data={budgetData}
          dataKeys={[
            { dataKey: "orcado", name: "Orçado" },
            { dataKey: "real", name: "Realizado" }
          ]}
          colors={["#E8EDE9", "#F47920"]}
          formatter={fmt}
          height={260}
        />
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Natureza */}
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
          <h2 className="font-semibold text-[#1A2B1F] mb-1">Receita por Natureza</h2>
          <p className="text-xs text-[#5C7060] mb-4">Contábil vs Consultoria (2026)</p>
          <ModernPieChart
            data={naturezaData}
            colors={["#F47920", "#1A4731"]}
            formatter={fmt}
            height={200}
            innerRadius={50}
            outerRadius={80}
          />
        </div>

        {/* Pipeline status */}
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
          <h2 className="font-semibold text-[#1A2B1F] mb-1">Pipeline por Status</h2>
          <p className="text-xs text-[#5C7060] mb-4">Distribuição das propostas (AP)</p>
          {pipelineData.length > 0 ? (
            <ModernPieChart
              data={pipelineData}
              height={200}
              innerRadius={50}
              outerRadius={80}
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-sm text-[#5C7060]">Sem dados no pipeline</div>
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