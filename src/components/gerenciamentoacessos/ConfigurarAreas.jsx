import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MENU_PAGES, AREAS_DISPONIVEIS } from "./menuOptions";

export default function ConfigurarAreas() {
  const [areaPermissoes, setAreaPermissoes] = useState({});
  const [expandidos, setExpandidos] = useState({});

  // Carregar permissões do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("area_permissoes");
    if (saved) {
      setAreaPermissoes(JSON.parse(saved));
    } else {
      // Inicializar com todas as páginas ativadas por padrão
      const defaults = {};
      AREAS_DISPONIVEIS.forEach(area => {
        defaults[area] = {};
        MENU_PAGES.forEach(page => {
          defaults[area][page.page] = true;
        });
      });
      setAreaPermissoes(defaults);
      localStorage.setItem("area_permissoes", JSON.stringify(defaults));
    }
  }, []);

  const toggleExpand = (area) => {
    setExpandidos(prev => ({ ...prev, [area]: !prev[area] }));
  };

  const togglePaginaParaArea = (area, pagina) => {
    const updated = {
      ...areaPermissoes,
      [area]: {
        ...(areaPermissoes[area] || {}),
        [pagina]: !areaPermissoes[area]?.[pagina]
      }
    };
    setAreaPermissoes(updated);
    localStorage.setItem("area_permissoes", JSON.stringify(updated));
  };

  const toggleTodasParaArea = (area, ativar) => {
    const updated = {
      ...areaPermissoes,
      [area]: {}
    };
    MENU_PAGES.forEach(page => {
      updated[area][page.page] = ativar;
    });
    setAreaPermissoes(updated);
    localStorage.setItem("area_permissoes", JSON.stringify(updated));
  };

  // Agrupar páginas por categoria
  const paginasPorCategoria = {};
  MENU_PAGES.forEach(page => {
    if (!paginasPorCategoria[page.categoria]) {
      paginasPorCategoria[page.categoria] = [];
    }
    paginasPorCategoria[page.categoria].push(page);
  });

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 mb-4">
        Selecione quais páginas do menu estarão disponíveis em cada área.
      </p>

      {AREAS_DISPONIVEIS.map(area => {
        const isExpanded = expandidos[area];
        const permsArea = areaPermissoes[area] || {};
        const totalAtivas = Object.values(permsArea).filter(Boolean).length;
        const totalPaginas = MENU_PAGES.length;

        return (
          <div key={area} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <button
              onClick={() => toggleExpand(area)}
              className="w-full px-4 py-3 flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition"
            >
              <Badge className="bg-[#1A4731] text-white font-bold">{area}</Badge>
              <span className="text-xs text-slate-500">
                {totalAtivas} de {totalPaginas} páginas ativadas
              </span>
              <span className="ml-auto text-slate-400">
                {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </span>
            </button>

            {/* Conteúdo */}
            {isExpanded && (
              <div className="p-4 space-y-3 border-t border-slate-100">
                {/* Botões de ativar/desativar tudo */}
                <div className="flex gap-2 pb-3 border-b border-slate-100">
                  <button
                    onClick={() => toggleTodasParaArea(area, true)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium transition"
                  >
                    Ativar Tudo
                  </button>
                  <button
                    onClick={() => toggleTodasParaArea(area, false)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition"
                  >
                    Desativar Tudo
                  </button>
                </div>

                {/* Páginas agrupadas por categoria */}
                {Object.entries(paginasPorCategoria).map(([categoria, paginas]) => (
                  <div key={categoria} className="space-y-2">
                    <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{categoria}</h4>
                    <div className="space-y-1.5 ml-2">
                      {paginas.map(page => {
                        const ativo = permsArea[page.page] || false;
                        return (
                          <button
                            key={page.page}
                            onClick={() => togglePaginaParaArea(area, page.page)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left text-sm ${
                              ativo
                                ? "bg-green-50 border border-green-200"
                                : "bg-slate-50 border border-slate-200"
                            }`}
                          >
                            {/* Toggle visual */}
                            <div className={`w-4 h-4 rounded-full border-2 transition flex items-center justify-center ${
                              ativo
                                ? "bg-green-500 border-green-600"
                                : "border-slate-300 bg-white"
                            }`}>
                              {ativo && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>

                            {/* Label */}
                            <span className={`flex-1 font-medium ${ativo ? "text-green-700" : "text-slate-600"}`}>
                              {page.label}
                            </span>

                            {/* Status badge */}
                            <Badge className={ativo ? "bg-green-600" : "bg-slate-300"}>
                              {ativo ? "Ativo" : "Inativo"}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}