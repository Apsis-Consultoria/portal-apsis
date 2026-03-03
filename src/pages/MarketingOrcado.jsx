import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts";
import FiltersBar from "@/components/marketing/FiltersBar";
import { Download, ChevronDown, ChevronRight } from "lucide-react";

const fmt = v => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v || 0);
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function StatusBadge({ pct }) {
  if (pct >= 90) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">✓ {pct}%</span>;
  if (pct >= 60) return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">⚠ {pct}%</span>;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">✗ {pct}%</span>;
}

export default function MarketingOrcado() {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ano, setAno] = useState(2026);
  const [area, setArea] = useState("Todas");
  const [expandedArea, setExpandedArea] = useState(null);

  useEffect(() => {
    base44.entities.OrcamentoMarketing.list().then(data => {
      setOrcamentos(data);
      setLoading(false);
    });
  }, []);

  const filtrados = orcamentos.filter(o => {
    const matchAno = o.ano === ano;
    const matchArea = area === "Todas" || o.area === area;
    return matchAno && matchArea;
  });

  // KPIs totais
  const totalOrcado = filtrados.reduce((s, o) => s + (o.valor_orcado || 0), 0);
  const totalRealizado = filtrados.reduce((s, o) => s + (o.valor_realizado || 0), 0);
  const pctGeral = totalOrcado > 0 ? ((totalRealizado / totalOrcado) * 100).toFixed(1) : "0.0";
  const gap = totalOrcado - totalRealizado;

  // Por área
  const areaMap = {};
  filtrados.forEach(o => {
    const a = o.area || "Outros";
    if (!areaMap[a]) areaMap[a] = { orcado: 0, realizado: 0, grupos: {} };
    areaMap[a].orcado += o.valor_orcado || 0;
    areaMap[a].realizado += o.valor_realizado || 0;
    if (o.grupo_servico) {
      const g = o.grupo_servico;
      if (!areaMap[a].grupos[g]) areaMap[a].grupos[g] = { orcado: 0, realizado: 0 };
      areaMap[a].grupos[g].orcado += o.valor_orcado || 0;
      areaMap[a].grupos[g].realizado += o.valor_realizado || 0;
    }
  });
  const areaData = Object.entries(areaMap).map(([nome, d]) => ({
    nome,
    orcado: d.orcado,
    realizado: d.realizado,
    pct: d.orcado > 0 ? ((d.realizado / d.orcado) * 100).toFixed(1) : "0.0",
    gap: d.orcado - d.realizado,
    grupos: Object.entries(d.grupos).map(([g, gd]) => ({
      nome: g,
      orcado: gd.orcado,
      realizado: gd.realizado,
      pct: gd.orcado > 0 ? ((gd.realizado / gd.orcado) * 100).toFixed(1) : "0.0",
    })),
  }));

  // Histórico mensal
  const mesData = MESES.map((mes, i) => {
    const m = i + 1;
    const mItems = filtrados.filter(o => o.mes === m);
    const orcado = mItems.reduce((s, o) => s + (o.valor_orcado || 0), 0);
    const realizado = mItems.reduce((s, o) => s + (o.valor_realizado || 0), 0);
    return { mes, orcado, realizado };
  });

  // Acumulado
  let acum = 0;
  const mesDataAcum = mesData.map(m => {
    acum += m.realizado;
    return { ...m, acumulado: acum };
  });

  const exportCSV = () => {
    const rows = [["Área","Orçado","Realizado","%","Gap"]];
    areaData.forEach(r => rows.push([r.nome, r.orcado, r.realizado, r.pct + "%", r.gap]));
    const csv = rows.map(r => r.join(";")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = `orcado_realizado_${ano}.csv`;
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
          <h2 className="text-lg font-bold text-[#1A2B1F]">Dashboard Orçado vs Realizado</h2>
          <p className="text-xs text-[#5C7060]">Acompanhamento de metas e realizado acumulado</p>
        </div>
        <div className="flex items-center gap-3">
          <FiltersBar ano={ano} setAno={setAno} trimestre="" setTrimestre={() => {}} area={area} setArea={setArea} showTrimestre={false} />
          <button onClick={exportCSV} className="flex items-center gap-2 text-xs border border-[#DDE3DE] rounded-lg px-3 py-1.5 text-[#5C7060] hover:bg-[#F4F6F4] transition-colors">
            <Download size={13} /> CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A4731] rounded-2xl p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-white/60 mb-2">Orçado Anual</p>
          <p className="text-2xl font-bold">{fmt(totalOrcado)}</p>
          <p className="text-xs text-white/50 mt-1">Meta total {ano}</p>
        </div>
        <div className="bg-[#F47920] rounded-2xl p-5 text-white">
          <p className="text-xs font-medium uppercase tracking-wider text-white/60 mb-2">Realizado Acumulado</p>
          <p className="text-2xl font-bold">{fmt(totalRealizado)}</p>
          <p className="text-xs text-white/70 mt-1">{pctGeral}% da meta</p>
        </div>
        <div className={`rounded-2xl p-5 border ${parseFloat(pctGeral) >= 90 ? "bg-green-50 border-green-200" : parseFloat(pctGeral) >= 60 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200"}`}>
          <p className="text-xs font-medium uppercase tracking-wider text-[#5C7060] mb-2">% Atingido</p>
          <p className={`text-2xl font-bold ${parseFloat(pctGeral) >= 90 ? "text-green-700" : parseFloat(pctGeral) >= 60 ? "text-yellow-700" : "text-red-700"}`}>{pctGeral}%</p>
          <p className="text-xs text-[#5C7060] mt-1">Acumulado até hoje</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-[#5C7060] mb-2">Gap (Falta Realizar)</p>
          <p className="text-2xl font-bold text-[#1A2B1F]">{fmt(gap)}</p>
          <p className="text-xs text-[#5C7060] mt-1">Diferença absoluta</p>
        </div>
      </div>

      {/* Gráfico mensal */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
        <h3 className="font-semibold text-[#1A2B1F] mb-1">Orçado vs Realizado — Mensal</h3>
        <p className="text-xs text-[#5C7060] mb-4">{ano}</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={mesDataAcum} barSize={12} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F2F0" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#5C7060" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#5C7060" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => fmt(v)} contentStyle={{ borderRadius: 10, border: "1px solid #DDE3DE", fontSize: 12 }} />
            <Bar dataKey="orcado" name="Orçado" fill="#E8EDE9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="realizado" name="Realizado" fill="#F47920" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela por Área com drill-down */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
        <h3 className="font-semibold text-[#1A2B1F] mb-4">Orçado vs Realizado por Área</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3DE]">
                {["Área","Orçado","Realizado","% Atingido","Gap","Status"].map(h => (
                  <th key={h} className="text-left text-xs text-[#5C7060] font-medium pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {areaData.length > 0 ? areaData.map((row, i) => (
                <>
                  <tr key={i} className="border-b border-[#F4F6F4] hover:bg-[#F4F6F4] cursor-pointer transition-colors"
                    onClick={() => setExpandedArea(expandedArea === row.nome ? null : row.nome)}>
                    <td className="py-3 pr-4 font-medium text-[#1A2B1F] flex items-center gap-2">
                      {row.grupos.length > 0 ? (expandedArea === row.nome ? <ChevronDown size={13} /> : <ChevronRight size={13} />) : <span className="w-[13px]" />}
                      {row.nome}
                    </td>
                    <td className="py-3 pr-4 text-[#5C7060]">{fmt(row.orcado)}</td>
                    <td className="py-3 pr-4 text-[#5C7060]">{fmt(row.realizado)}</td>
                    <td className="py-3 pr-4"><StatusBadge pct={parseFloat(row.pct)} /></td>
                    <td className="py-3 pr-4 text-[#5C7060]">{fmt(row.gap)}</td>
                    <td className="py-3 pr-4">
                      <div className="w-full bg-[#F4F6F4] rounded-full h-1.5 w-24">
                        <div className="h-1.5 rounded-full bg-[#F47920]" style={{ width: `${Math.min(parseFloat(row.pct), 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                  {expandedArea === row.nome && row.grupos.map((g, j) => (
                    <tr key={`${i}-${j}`} className="border-b border-[#F4F6F4] bg-[#FAFBFA]">
                      <td className="py-2 pr-4 pl-10 text-xs text-[#5C7060]">↳ {g.nome}</td>
                      <td className="py-2 pr-4 text-xs text-[#5C7060]">{fmt(g.orcado)}</td>
                      <td className="py-2 pr-4 text-xs text-[#5C7060]">{fmt(g.realizado)}</td>
                      <td className="py-2 pr-4"><StatusBadge pct={parseFloat(g.pct)} /></td>
                      <td className="py-2 pr-4 text-xs text-[#5C7060]">{fmt(g.orcado - g.realizado)}</td>
                      <td className="py-2 pr-4" />
                    </tr>
                  ))}
                </>
              )) : (
                <tr><td colSpan={6} className="py-8 text-center text-sm text-[#5C7060]">Nenhum dado para os filtros selecionados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Histórico Mensal */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] p-6">
        <h3 className="font-semibold text-[#1A2B1F] mb-4">Histórico Mensal — {ano}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3DE]">
                {["Mês","Orçado Mensal","Realizado Mensal","Acumulado Anual"].map(h => (
                  <th key={h} className="text-left text-xs text-[#5C7060] font-medium pb-2 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mesDataAcum.map((m, i) => (
                <tr key={i} className="border-b border-[#F4F6F4] hover:bg-[#F4F6F4] transition-colors">
                  <td className="py-2.5 pr-4 font-medium text-[#1A2B1F]">{m.mes}</td>
                  <td className="py-2.5 pr-4 text-[#5C7060]">{fmt(m.orcado)}</td>
                  <td className="py-2.5 pr-4 text-[#5C7060]">{fmt(m.realizado)}</td>
                  <td className="py-2.5 pr-4 font-medium text-[#1A4731]">{fmt(m.acumulado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}