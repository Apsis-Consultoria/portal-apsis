import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";

const CARGOS_DISPONIVEIS = [
  "Analista",
  "Coordenador",
  "Gerente",
  "Diretor",
  "Partner",
  "Estagiário"
];

const AREAS_DISPONIVEIS = [
  "Contábil",
  "Consultoria",
  "Tributária",
  "Societária",
  "M&A",
  "Projetos Especiais",
  "Outros"
];

export default function ConfigurarCargos() {
  const [areasSelecionada, setAreaSelecionada] = useState("Contábil");
  const [areaModulos, setAreaModulos] = useState({});
  const [cargoAcessos, setCargoAcessos] = useState({});
  const [expandidos, setExpandidos] = useState({});

  // Carregar dados do localStorage
  useEffect(() => {
    const areasData = localStorage.getItem("areas_modulos");
    if (areasData) {
      setAreaModulos(JSON.parse(areasData));
    }

    const cargoData = localStorage.getItem("cargo_acessos");
    if (cargoData) {
      setCargoAcessos(JSON.parse(cargoData));
    }
  }, []);

  const toggleExpand = (cargo) => {
    setExpandidos(prev => ({ ...prev, [cargo]: !prev[cargo] }));
  };

  const toggleModuloParaCargo = (cargo, area, modulo) => {
    const key = `${cargo}_${area}`;
    const atual = cargoAcessos[key] || [];
    const updated = atual.includes(modulo)
      ? atual.filter(m => m !== modulo)
      : [...atual, modulo];

    const newCargoAcessos = { ...cargoAcessos, [key]: updated };
    setCargoAcessos(newCargoAcessos);
    localStorage.setItem("cargo_acessos", JSON.stringify(newCargoAcessos));
  };

  const modulosDaArea = areaModulos[areasSelecionada] || [];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 mb-4">
        Defina quais módulos cada cargo pode visualizar por área.
      </p>

      {/* Seletor de área */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-200">
        {AREAS_DISPONIVEIS.map(area => (
          <button
            key={area}
            onClick={() => setAreaSelecionada(area)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              areasSelecionada === area
                ? "bg-[#1A4731] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {area}
          </button>
        ))}
      </div>

      {/* Cargos com acesso aos módulos */}
      <div className="space-y-3">
        {CARGOS_DISPONIVEIS.map(cargo => {
          const isExpanded = expandidos[cargo];
          const acessosChave = `${cargo}_${areasSelecionada}`;
          const acessosCargo = cargoAcessos[acessosChave] || [];

          return (
            <div key={cargo} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Header do cargo */}
              <button
                onClick={() => toggleExpand(cargo)}
                className="w-full px-4 py-3 flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition"
              >
                <Badge className="bg-purple-600 text-white font-bold">{cargo}</Badge>
                <span className="text-xs text-slate-500">
                  {acessosCargo.length} de {modulosDaArea.length} módulos
                </span>
                <span className="ml-auto text-slate-400">
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </button>

              {/* Lista de módulos */}
              {isExpanded && (
                <div className="p-4 space-y-2 border-t border-slate-100">
                  {modulosDaArea.length === 0 ? (
                    <p className="text-xs text-slate-400">Nenhum módulo configurado para esta área.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {modulosDaArea.map(modulo => {
                        const temAcesso = acessosCargo.includes(modulo);
                        return (
                          <button
                            key={modulo}
                            onClick={() => toggleModuloParaCargo(cargo, areasSelecionada, modulo)}
                            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                              temAcesso
                                ? "bg-green-100 text-green-700 border border-green-300"
                                : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            <span className={`w-3 h-3 rounded border ${temAcesso ? "bg-green-500 border-green-600" : "border-slate-300"}`} />
                            {modulo}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}