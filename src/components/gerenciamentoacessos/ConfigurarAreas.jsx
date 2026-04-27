import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";

const AREAS_DISPONIVEIS = [
  "Contábil",
  "Consultoria",
  "Tributária",
  "Societária",
  "M&A",
  "Projetos Especiais",
  "Outros"
];

export default function ConfigurarAreas() {
  const [areas, setAreas] = useState({});
  const [expandidos, setExpandidos] = useState({});
  const [novoModulo, setNovoModulo] = useState({});

  // Carregar áreas do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("areas_modulos");
    if (saved) {
      setAreas(JSON.parse(saved));
    } else {
      // Inicializar com valores padrão
      const defaults = {
        "Contábil": ["Dashboard", "Relatórios", "Auditoria", "Documentos"],
        "Consultoria": ["Projetos", "Propostas", "Faturamento", "Timeline"],
        "Tributária": ["Conformidade", "Planejamento", "Operações"],
        "Societária": ["Contratos", "Acionistas", "Governança"],
        "M&A": ["Due Diligence", "Integração", "Análise"],
        "Projetos Especiais": ["Gestão", "Timeline", "Budget"],
        "Outros": ["Painel", "Relatórios"]
      };
      setAreas(defaults);
      localStorage.setItem("areas_modulos", JSON.stringify(defaults));
    }
  }, []);

  const toggleExpand = (area) => {
    setExpandidos(prev => ({ ...prev, [area]: !prev[area] }));
  };

  const adicionarModulo = (area) => {
    const modulo = novoModulo[area]?.trim();
    if (!modulo) return;
    
    const updated = {
      ...areas,
      [area]: [...(areas[area] || []), modulo]
    };
    setAreas(updated);
    localStorage.setItem("areas_modulos", JSON.stringify(updated));
    setNovoModulo({ ...novoModulo, [area]: "" });
  };

  const removerModulo = (area, modulo) => {
    const updated = {
      ...areas,
      [area]: (areas[area] || []).filter(m => m !== modulo)
    };
    setAreas(updated);
    localStorage.setItem("areas_modulos", JSON.stringify(updated));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 mb-4">
        Defina os módulos/telas disponíveis para cada área.
      </p>

      {AREAS_DISPONIVEIS.map(area => {
        const modulos = areas[area] || [];
        const isExpanded = expandidos[area];

        return (
          <div key={area} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <button
              onClick={() => toggleExpand(area)}
              className="w-full px-4 py-3 flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition"
            >
              <Badge className="bg-[#1A4731] text-white font-bold">{area}</Badge>
              <span className="text-xs text-slate-500">{modulos.length} módulo{modulos.length !== 1 ? "s" : ""}</span>
              <span className="ml-auto text-slate-400">
                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </span>
            </button>

            {/* Conteúdo */}
            {isExpanded && (
              <div className="p-4 space-y-3 border-t border-slate-100">
                {/* Lista de módulos */}
                {modulos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {modulos.map(modulo => (
                      <div
                        key={modulo}
                        className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-sm text-blue-700"
                      >
                        {modulo}
                        <button
                          onClick={() => removerModulo(area, modulo)}
                          className="text-blue-500 hover:text-blue-700 ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input novo módulo */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={novoModulo[area] || ""}
                    onChange={e => setNovoModulo({ ...novoModulo, [area]: e.target.value })}
                    onKeyPress={e => {
                      if (e.key === "Enter") adicionarModulo(area);
                    }}
                    placeholder="Novo módulo..."
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1A4731] bg-slate-50"
                  />
                  <Button
                    onClick={() => adicionarModulo(area)}
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
                  >
                    <Plus size={14} /> Adicionar
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}