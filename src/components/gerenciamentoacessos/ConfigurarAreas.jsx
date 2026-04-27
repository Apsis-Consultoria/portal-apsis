import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MENU_GROUPS } from "./menuOptions";

export default function ConfigurarAreas() {
  const [grupoPermissoes, setGrupoPermissoes] = useState({});
  const [expandidos, setExpandidos] = useState({});

  // Carregar permissões do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("grupo_permissoes");
    if (saved) {
      setGrupoPermissoes(JSON.parse(saved));
    } else {
      // Inicializar com todos os grupos desativados
      const defaults = {};
      MENU_GROUPS.forEach(grupo => {
        defaults[grupo.group] = false;
      });
      setGrupoPermissoes(defaults);
      localStorage.setItem("grupo_permissoes", JSON.stringify(defaults));
    }
  }, []);

  const toggleExpand = (group) => {
    setExpandidos(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleGrupo = (group) => {
    const updated = {
      ...grupoPermissoes,
      [group]: !grupoPermissoes[group]
    };
    setGrupoPermissoes(updated);
    localStorage.setItem("grupo_permissoes", JSON.stringify(updated));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 mb-4">
        Ative ou desative os grupos de páginas que estarão disponíveis para as áreas.
      </p>

      {MENU_GROUPS.map(grupo => {
        const isExpanded = expandidos[grupo.group];
        const ativo = grupoPermissoes[grupo.group] || false;

        return (
          <div key={grupo.group} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <button
              onClick={() => toggleExpand(grupo.group)}
              className={`w-full px-4 py-3 flex items-center gap-3 transition ${
                ativo
                  ? "bg-green-50 hover:bg-green-100"
                  : "bg-slate-50 hover:bg-slate-100"
              }`}
            >
              {/* Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleGrupo(grupo.group);
                }}
                className={`w-5 h-5 rounded-full border-2 transition flex items-center justify-center flex-shrink-0 ${
                  ativo
                    ? "bg-green-500 border-green-600"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
              >
                {ativo && <div className="w-2 h-2 bg-white rounded-full" />}
              </button>

              <Badge className={ativo ? "bg-green-600" : "bg-slate-600"}>{grupo.label}</Badge>
              <span className="text-xs text-slate-500">{grupo.pages.length} página{grupo.pages.length !== 1 ? "s" : ""}</span>

              <span className={`ml-auto text-slate-400 ${ativo ? "text-green-600" : ""}`}>
                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </span>
            </button>

            {/* Conteúdo - Lista de páginas */}
            {isExpanded && (
              <div className={`p-4 border-t ${ativo ? "border-green-200 bg-green-50" : "border-slate-100 bg-slate-50"}`}>
                <div className="space-y-1.5">
                  {grupo.pages.map(page => (
                    <div
                      key={page.page}
                      className={`text-sm px-3 py-2 rounded-lg ${
                        ativo
                          ? "bg-white border border-green-200 text-green-700"
                          : "bg-white border border-slate-200 text-slate-500"
                      }`}
                    >
                      • {page.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}