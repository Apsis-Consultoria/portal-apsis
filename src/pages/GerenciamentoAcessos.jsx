import { useState } from "react";
import AbasAcessos from "@/components/gerenciamentoacessos/AbasAcessos";
import ConfigurarAreas from "@/components/gerenciamentoacessos/ConfigurarAreas";
import ConfigurarCargos from "@/components/gerenciamentoacessos/ConfigurarCargos";

export default function GerenciamentoAcessos() {
  const [activeTab, setActiveTab] = useState("areas");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A4731]">Gerenciamento de Acessos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure os módulos por área e defina quais cargos têm acesso a cada módulo.
        </p>
      </div>

      {/* Container com abas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <AbasAcessos activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Conteúdo das abas */}
        <div className="p-6">
          {activeTab === "areas" && <ConfigurarAreas />}
          {activeTab === "cargos" && <ConfigurarCargos />}
        </div>
      </div>
    </div>
  );
}