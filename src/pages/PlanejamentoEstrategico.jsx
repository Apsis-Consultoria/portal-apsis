import { useState } from "react";
import KPIsTab from "@/components/planejamento/KPIsTab";
import IniciativasTab from "@/components/planejamento/IniciativasTab";
import MetasDiretoriaTab from "@/components/planejamento/MetasDiretoriaTab";

const TABS = [
  { id: "kpis", label: "KPIs 2026", emoji: "📊" },
  { id: "iniciativas", label: "Iniciativas 2026", emoji: "🚀" },
  { id: "metas", label: "Metas Diretoria", emoji: "🎯" },
];

export default function PlanejamentoEstrategico() {
  const [activeTab, setActiveTab] = useState("kpis");

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .pe-root { font-family: 'Inter', sans-serif; }
      `}</style>
      <div className="pe-root">
        {/* Header */}
        <div className="bg-[#003366] px-6 py-5 shadow-lg">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-white text-2xl font-bold tracking-tight">Planejamento Estratégico 2026</h1>
              <p className="text-blue-200 text-sm mt-0.5">Gestão de KPIs, Iniciativas e Metas da Diretoria</p>
            </div>
            <div className="w-2 h-10 rounded-full bg-[#E87722]" />
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
                      ? "border-[#E87722] text-[#003366]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.emoji} {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-screen-2xl mx-auto px-6 py-6">
          {activeTab === "kpis" && <KPIsTab />}
          {activeTab === "iniciativas" && <IniciativasTab />}
          {activeTab === "metas" && <MetasDiretoriaTab />}
        </div>
      </div>
    </div>
  );
}