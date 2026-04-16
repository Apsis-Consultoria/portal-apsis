import { useMemo } from "react";
import { calcKpiStatus } from "./peUtils";
import { CheckCircle2, Clock, AlertTriangle, XCircle, TrendingUp, Target, Layers, Users } from "lucide-react";
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

const STATUS_INICIATIVA_COLORS = {
  "Concluído":    { fill: "#134635", label: "Concluído" },
  "Em Andamento": { fill: "#F48126", label: "Em Andamento" },
  "Aguardando":   { fill: "#f59e0b", label: "Aguardando" },
  "Atrasado":     { fill: "#ef4444", label: "Atrasado" },
  "Não Iniciado": { fill: "#d1d5db", label: "Não Iniciado" },
};

function StatCard({ icon: Icon, label, value, sub, color = "#134635" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "18" }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-5 rounded-full bg-[#F48126]" />
      <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{children}</h2>
    </div>
  );
}

const CUSTOM_TOOLTIP = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-gray-500">{payload[0].value} item(s)</p>
      </div>
    );
  }
  return null;
};

export default function IndicadorGeralTab({ kpis, iniciativas, metas }) {
  // ── KPI stats ──
  const kpiStats = useMemo(() => {
    const total = kpis.length;
    const batidas = kpis.filter(k => calcKpiStatus(k) === "batida").length;
    const progresso = kpis.filter(k => calcKpiStatus(k) === "progresso").length;
    const fora = kpis.filter(k => calcKpiStatus(k) === "fora").length;
    const semDados = kpis.filter(k => calcKpiStatus(k) === "sem_dados").length;
    const pct = total ? Math.round((batidas / total) * 100) : 0;
    return { total, batidas, progresso, fora, semDados, pct };
  }, [kpis]);

  // ── KPI por perspectiva ──
  const kpiPorPerspectiva = useMemo(() => {
    const perspectivas = ["FINANCEIRO", "MERCADO/CLIENTES", "PROCESSOS INTERNOS", "APRENDIZADO/CRESCIMENTO"];
    return perspectivas.map(p => {
      const grupo = kpis.filter(k => k.perspectiva === p);
      const batidas = grupo.filter(k => calcKpiStatus(k) === "batida").length;
      return { name: p.split("/")[0], total: grupo.length, batidas, pendentes: grupo.length - batidas };
    }).filter(p => p.total > 0);
  }, [kpis]);

  // ── Iniciativas stats ──
  const iniciativaStats = useMemo(() => {
    const total = iniciativas.length;
    const countByStatus = {};
    iniciativas.forEach(i => { countByStatus[i.status || "Não Iniciado"] = (countByStatus[i.status || "Não Iniciado"] || 0) + 1; });
    const concluidas = countByStatus["Concluído"] || 0;
    const atrasadas = countByStatus["Atrasado"] || 0;
    const emAndamento = countByStatus["Em Andamento"] || 0;
    const pct = total ? Math.round((concluidas / total) * 100) : 0;
    const pieData = Object.entries(countByStatus).map(([status, count]) => ({
      name: STATUS_INICIATIVA_COLORS[status]?.label || status,
      value: count,
      fill: STATUS_INICIATIVA_COLORS[status]?.fill || "#d1d5db",
    }));
    return { total, concluidas, atrasadas, emAndamento, pct, pieData };
  }, [iniciativas]);

  // ── Metas Diretoria stats ──
  const metaStats = useMemo(() => {
    const total = metas.length;
    const concluidas = metas.filter(m => m.status === "Concluído").length;
    const atrasadas = metas.filter(m => m.status === "Atrasado").length;
    const pct = total ? Math.round((concluidas / total) * 100) : 0;

    const porDiretor = {};
    metas.forEach(m => {
      if (!porDiretor[m.diretor]) porDiretor[m.diretor] = { concluidas: 0, total: 0 };
      porDiretor[m.diretor].total++;
      if (m.status === "Concluído") porDiretor[m.diretor].concluidas++;
    });
    const diretorData = Object.entries(porDiretor).map(([d, v]) => ({
      name: d.split(" ")[0],
      Concluídas: v.concluidas,
      Pendentes: v.total - v.concluidas,
    }));

    return { total, concluidas, atrasadas, pct, diretorData };
  }, [metas]);

  // ── Donut KPI ──
  const kpiPieData = [
    { name: "Meta Batida", value: kpiStats.batidas, fill: "#134635" },
    { name: "Em Progresso", value: kpiStats.progresso, fill: "#f59e0b" },
    { name: "Fora da Meta", value: kpiStats.fora, fill: "#ef4444" },
    { name: "Sem Dados", value: kpiStats.semDados, fill: "#e5e7eb" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8">

      {/* ── Visão Geral Cards ── */}
      <div>
        <SectionTitle>Visão Geral</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Target} label="KPIs com Meta Batida" value={`${kpiStats.batidas}/${kpiStats.total}`} sub={`${kpiStats.pct}% alcançado`} color="#134635" />
          <StatCard icon={CheckCircle2} label="Iniciativas Concluídas" value={`${iniciativaStats.concluidas}/${iniciativaStats.total}`} sub={`${iniciativaStats.pct}% concluído`} color="#134635" />
          <StatCard icon={AlertTriangle} label="Iniciativas Atrasadas" value={iniciativaStats.atrasadas} sub="requerem atenção" color="#ef4444" />
          <StatCard icon={Layers} label="Metas Diretoria Concluídas" value={`${metaStats.concluidas}/${metaStats.total}`} sub={`${metaStats.pct}% alcançado`} color="#F48126" />
        </div>
      </div>

      {/* ── KPIs ── */}
      <div>
        <SectionTitle>KPIs 2026</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Donut */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Status dos KPIs</p>
            <div className="flex items-center gap-4">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={kpiPieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                      {kpiPieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {kpiPieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="text-xs text-gray-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{d.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Taxa de alcance</span>
                    <span className="font-bold text-[#134635]">{kpiStats.pct}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-[#134635] transition-all" style={{ width: `${kpiStats.pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Por perspectiva */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">KPIs por Perspectiva</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={kpiPorPerspectiva} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="batidas" name="Batidas" fill="#134635" radius={[0, 4, 4, 0]} />
                <Bar dataKey="pendentes" name="Pendentes" fill="#e5e7eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Iniciativas ── */}
      <div>
        <SectionTitle>Iniciativas 2026</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Donut Iniciativas */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Status das Iniciativas</p>
            <div className="flex items-center gap-4">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={iniciativaStats.pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={3} dataKey="value">
                      {iniciativaStats.pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<CUSTOM_TOOLTIP />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {iniciativaStats.pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="text-xs text-gray-600">{d.name}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800">{d.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Taxa de conclusão</span>
                    <span className="font-bold text-[#134635]">{iniciativaStats.pct}%</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 rounded-full bg-[#134635] transition-all" style={{ width: `${iniciativaStats.pct}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mini-stat cards iniciativas */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#134635]/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#134635]" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{iniciativaStats.concluidas}</p>
                <p className="text-sm text-gray-500">Concluídas</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#F48126]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#F48126]" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{iniciativaStats.emAndamento}</p>
                <p className="text-sm text-gray-500">Em Andamento</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{iniciativaStats.atrasadas}</p>
                <p className="text-sm text-gray-500">Atrasadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Metas Diretoria ── */}
      <div>
        <SectionTitle>Metas Diretoria</SectionTitle>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Concluídas vs. Pendentes por Diretor</p>
          {metaStats.diretorData.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">Nenhuma meta cadastrada.</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={metaStats.diretorData} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CUSTOM_TOOLTIP />} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Concluídas" fill="#134635" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pendentes" fill="#F48126" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

    </div>
  );
}