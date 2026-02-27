import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import StatCard from "@/components/ui/StatCard";
import { TrendingUp, DollarSign, GitBranch, FolderKanban, AlertTriangle, Target } from "lucide-react";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const COLORS = ["#C9A84C","#0F1B35","#22C55E","#6366F1","#F59E0B","#EF4444"];

export default function Dashboard() {
  const [propostas, setPropostas] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [oaps, setOaps] = useState([]);
  const [oss, setOss] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([
      base44.entities.Proposta.list(),
      base44.entities.Parcela.list(),
      base44.entities.Budget.list(),
      base44.entities.OAP.list(),
      base44.entities.OrdemServico.list(),
    ]).then(([p, pa, b, o, os]) => {
      setPropostas(p); setParcelas(pa); setBudgets(b); setOaps(o); setOss(os);
      setLoading(false);
    });
  }, []);

  // Calculos
  const propostasGanhas = propostas.filter(p => p.status === "Ganha");
  const valorPipeline = propostas
    .filter(p => ["Em elaboração","Enviada"].includes(p.status))
    .reduce((s, p) => s + (p.valor_total || 0), 0);
  const receitaReal = parcelas.filter(p => p.status === "Recebida").reduce((s, p) => s + (p.valor || 0), 0);
  const aFaturar = parcelas.filter(p => ["Lançada","Faturada"].includes(p.status)).reduce((s, p) => s + (p.valor || 0), 0);

  // Real vs Orçado por mês
  const budgetData = MESES.map((mes, i) => {
    const mes1 = i + 1;
    const orcado = budgets.filter(b => b.ano === anoSel && b.mes === mes1 && b.natureza === "Total")
      .reduce((s, b) => s + (b.valor_orcado || 0), 0);
    const real = parcelas.filter(p => {
      const d = p.data_recebimento ? new Date(p.data_recebimento) : null;
      return d && d.getFullYear() === anoSel && d.getMonth() + 1 === mes1 && p.status === "Recebida";
    }).reduce((s, p) => s + (p.valor || 0), 0);
    return { mes, orcado, real };
  });

  // Receita por natureza
  const naturezaMap = {};
  parcelas.filter(p => p.status === "Recebida").forEach(p => {
    const prop = propostas.find(pr => pr.id === p.proposta_id);
    const nat = prop?.natureza?.startsWith("Contábil") ? "Contábil" : "Consultoria";
    naturezaMap[nat] = (naturezaMap[nat] || 0) + (p.valor || 0);
  });
  const naturezaData = Object.entries(naturezaMap).map(([name, value]) => ({ name, value }));

  // Pipeline por status
  const statusMap = {};
  propostas.forEach(p => { statusMap[p.status] = (statusMap[p.status] || 0) + 1; });
  const pipelineData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Alocação por colaborador
  const alocMap = {};
  oss.filter(os => os.status === "Ativo").forEach(os => {
    const nome = os.responsavel_tecnico || "Sem responsável";
    const peso = (os.valor_proporcional || 0) * ((100 - (os.percentual_conclusao || 0)) / 100);
    alocMap[nome] = (alocMap[nome] || 0) + peso;
  });
  const alocData = Object.entries(alocMap).map(([name, value]) => ({ name, value: Math.round(value) }));

  const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Receita Realizada" value={fmt(receitaReal)} icon={DollarSign} color="green" />
        <StatCard label="A Faturar" value={fmt(aFaturar)} icon={Target} color="gold" />
        <StatCard label="Pipeline Ativo" value={fmt(valorPipeline)} icon={GitBranch} color="blue" />
        <StatCard label="Propostas Ganhas" value={propostasGanhas.length} sub="no período" icon={TrendingUp} color="purple" />
      </div>

      {/* Real vs Orçado */}
      <div className="bg-white rounded-2xl border border-[#E8ECF0] p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-[#0F1B35]">Real vs Orçado</h2>
            <p className="text-xs text-[#6B7A99] mt-0.5">Faturamento mensal comparado ao budget</p>
          </div>
          <select
            className="text-xs border border-[#E8ECF0] rounded-lg px-3 py-1.5 text-[#6B7A99] focus:outline-none"
            value={anoSel} onChange={e => setAnoSel(Number(e.target.value))}>
            {[2023,2024,2025,2026].map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={budgetData} barSize={14} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F5" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6B7A99" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#6B7A99" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 10, border: "1px solid #E8ECF0", fontSize: 12 }} />
            <Bar dataKey="orcado" name="Orçado" fill="#E8ECF0" radius={[4,4,0,0]} />
            <Bar dataKey="real" name="Realizado" fill="#C9A84C" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Natureza */}
        <div className="bg-white rounded-2xl border border-[#E8ECF0] p-6">
          <h2 className="font-semibold text-[#0F1B35] mb-1">Receita por Natureza</h2>
          <p className="text-xs text-[#6B7A99] mb-4">Contábil vs Consultoria</p>
          {naturezaData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={naturezaData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {naturezaData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center text-sm text-[#6B7A99]">Sem dados</div>
          )}
        </div>

        {/* Pipeline status */}
        <div className="bg-white rounded-2xl border border-[#E8ECF0] p-6">
          <h2 className="font-semibold text-[#0F1B35] mb-1">Pipeline por Status</h2>
          <p className="text-xs text-[#6B7A99] mb-4">Distribuição das propostas</p>
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
            <div className="h-[180px] flex items-center justify-center text-sm text-[#6B7A99]">Sem dados</div>
          )}
        </div>

        {/* Alocação */}
        <div className="bg-white rounded-2xl border border-[#E8ECF0] p-6">
          <h2 className="font-semibold text-[#0F1B35] mb-1">Carga por Colaborador</h2>
          <p className="text-xs text-[#6B7A99] mb-4">Valor em projetos ativos</p>
          {alocData.length > 0 ? (
            <div className="space-y-3">
              {alocData.slice(0,5).map((item, i) => {
                const max = Math.max(...alocData.map(d => d.value));
                const pct = max > 0 ? (item.value / max) * 100 : 0;
                const alto = pct > 80;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#0F1B35] font-medium truncate max-w-[120px]">{item.name}</span>
                      <span className={alto ? "text-red-500 font-semibold" : "text-[#6B7A99]"}>
                        {alto && <AlertTriangle size={10} className="inline mr-1" />}
                        {fmt(item.value)}
                      </span>
                    </div>
                    <div className="w-full bg-[#F7F8FA] rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full transition-all ${alto ? "bg-red-400" : "bg-[#C9A84C]"}`}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-sm text-[#6B7A99]">Sem dados</div>
          )}
        </div>
      </div>
    </div>
  );
}