import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import KPIsTab from "@/components/planejamento/KPIsTab";
import IniciativasTab from "@/components/planejamento/IniciativasTab";
import MetasDiretoriaTab from "@/components/planejamento/MetasDiretoriaTab";
import IndicadorGeralTab from "@/components/planejamento/IndicadorGeralTab";

const TABS = [
  { id: "indicador", label: "Indicador Geral", emoji: "📈" },
  { id: "kpis",      label: "KPIs 2026",        emoji: "📊" },
  { id: "iniciativas", label: "Iniciativas 2026", emoji: "🚀" },
  { id: "metas",    label: "Metas Diretoria",   emoji: "🎯" },
];

export default function PlanejamentoEstrategico() {
  const [activeTab, setActiveTab] = useState("indicador");

  // Dados para o Indicador Geral
  const [kpis, setKpis] = useState([]);
  const [iniciativas, setIniciativas] = useState([]);
  const [metas, setMetas] = useState([]);
  const [loadingGeral, setLoadingGeral] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.KPI2026.filter({}, "-created_date", 300),
      base44.entities.Iniciativa2026.filter({}, "-created_date", 300),
      base44.entities.MetaDiretoria2026.filter({}, "-created_date", 300),
    ]).then(([k, i, m]) => {
      setKpis(k);
      setIniciativas(i);
      setMetas(m);
      setLoadingGeral(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .pe-root { font-family: 'DM Sans', sans-serif; }
        .pe-root h1, .pe-root h2, .pe-root h3 { font-family: 'Sora', sans-serif; }
        .pe-input:focus { border-color: #134635 !important; box-shadow: 0 0 0 2px rgba(19,70,53,0.12) !important; outline: none; }
        .pe-select-trigger:focus-within { border-color: #134635 !important; box-shadow: 0 0 0 2px rgba(19,70,53,0.12) !important; }
      `}</style>
      <div className="pe-root">
        {/* Header */}
        <div className="bg-[#134635] px-6 py-5 shadow-lg">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">Planejamento Estratégico 2026</h1>
              <p className="text-white/60 text-sm mt-0.5 font-light">Gestão de KPIs, Iniciativas e Metas da Diretoria</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 rounded-full bg-[#F48126]" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-screen-2xl mx-auto px-6">
            <div className="flex gap-0">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? "border-[#F48126] text-[#134635]"
                      : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-1.5">{tab.emoji}</span>{tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          {activeTab === "indicador" && (
            loadingGeral
              ? <div className="text-center py-20 text-gray-400">Carregando indicadores...</div>
              : <IndicadorGeralTab kpis={kpis} iniciativas={iniciativas} metas={metas} />
          )}
          {activeTab === "kpis" && <KPIsTab />}
          {activeTab === "iniciativas" && <IniciativasTab />}
          {activeTab === "metas" && <MetasDiretoriaTab />}
        </div>
      </div>
    </div>
  );
}