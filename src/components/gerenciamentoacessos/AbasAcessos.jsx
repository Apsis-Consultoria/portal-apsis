import { useState } from "react";
import { Settings, Lock } from "lucide-react";

const tabs = [
  { id: "areas", label: "Configurar Áreas", icon: Settings },
  { id: "cargos", label: "Configurar Cargos", icon: Lock },
];

export default function AbasAcessos({ activeTab, onTabChange }) {
  return (
    <div className="flex gap-2 border-b border-slate-200 bg-white rounded-t-2xl px-5 py-3">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === tab.id
              ? "bg-[#1A4731] text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <tab.icon size={16} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}