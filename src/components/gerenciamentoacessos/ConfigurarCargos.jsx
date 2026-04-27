import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MENU_PAGES, AREAS_DISPONIVEIS, CARGOS_DISPONIVEIS } from "./menuOptions";

export default function ConfigurarCargos() {
  const [areaPermissoes, setAreaPermissoes] = useState({});
  const [cargoAcessos, setCargoAcessos] = useState({});
  const [areaSelecionada, setAreaSelecionada] = useState("Contábil");
  const [expandidos, setExpandidos] = useState({});

  // Carregar dados do localStorage
  useEffect(() => {
    const areasData = localStorage.getItem("area_permissoes");
    if (areasData) {
      setAreaPermissoes(JSON.parse(areasData));
    }

    const cargoData = localStorage.getItem("cargo_acessos");
    if (cargoData) {
      setCargoAcessos(JSON.parse(cargoData));
    }
  }, []);

  const toggleExpand = (cargo) => {
    setExpandidos(prev => ({ ...prev, [cargo]: !prev[cargo] }));
  };

  const togglePaginaParaCargo = (cargo, pagina) => {
    const key = `${cargo}_${areaSelecionada}`;
    const atual = cargoAcessos[key] || [];
    const updated = atual.includes(pagina)
      ? atual.filter(p => p !== pagina)
      : [...atual, pagina];

    const newCargoAcessos = { ...cargoAcessos, [key]: updated };
    setCargoAcessos(newCargoAcessos);
    localStorage.setItem("cargo_acessos", JSON.stringify(newCargoAcessos));
  };

  const toggleTodasParaCargo = (cargo, ativar) => {
    const key = `${cargo}_${areaSelecionada}`;
    const paginasDisponiveis = (areaPermissoes[areaSelecionada] || {});
    const paginasAtivas = Object.keys(paginasDisponiveis).filter(p => paginasDisponiveis[p]);

    const newCargoAcessos = {
      ...cargoAcessos,
      [key]: ativar ? paginasAtivas : []
    };
    setCargoAcessos(newCargoAcessos);
    localStorage.setItem("cargo_acessos", JSON.stringify(newCargoAcessos));
  };

  // Páginas disponíveis na área selecionada
  const paginasDisponiveisArea = Object.keys(areaPermissoes[areaSelecionada] || {})
    .filter(p => areaPermissoes[areaSelecionada][p])
    .map(p => MENU_PAGES.find(mp => mp.page === p))
    .filter(Boolean);

  // Agrupar por categoria
  const paginasPorCategoria = {};
  paginasDisponiveisArea.forEach(page => {
    if (!paginasPorCategoria[page.categoria]) {
      paginasPorCategoria[page.categoria] = [];
    }
    paginasPorCategoria[page.categoria].push(page);
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 mb-4">
        Defina quais páginas cada cargo pode acessar dentro da área selecionada.
      </p>

      {/* Seletor de área */}
      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Área</p>
        <div className="flex flex-wrap gap-2">
          {AREAS_DISPONIVEIS.map(area => (
            <button
              key={area}
              onClick={() => setAreaSelecionada(area)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                areaSelecionada === area
                  ? "bg-[#1A4731] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </div>

      {/* Info da área */}
      {paginasDisponiveisArea.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          ⚠️ Nenhuma página ativada para esta área. Configure as páginas na aba "Configurar Áreas" primeiro.
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">{paginasDisponiveisArea.length} página{paginasDisponiveisArea.length !== 1 ? "s" : ""} disponível{paginasDisponiveisArea.length !== 1 ? "is" : ""} nesta área</p>

          {/* Cargos */}
          <div className="space-y-3">
            {CARGOS_DISPONIVEIS.map(cargo => {
              const key = `${cargo}_${areaSelecionada}`;
              const acessosCargo = cargoAcessos[key] || [];
              const isExpanded = expandidos[cargo];

              return (
                <div key={cargo} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {/* Header */}
                  <button
                    onClick={() => toggleExpand(cargo)}
                    className="w-full px-4 py-3 flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition"
                  >
                    <Badge className="bg-purple-600 text-white font-bold">{cargo}</Badge>
                    <span className="text-xs text-slate-500">
                      {acessosCargo.length} de {paginasDisponiveisArea.length} páginas
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
                          onClick={() => toggleTodasParaCargo(cargo, true)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium transition"
                        >
                          Ativar Tudo
                        </button>
                        <button
                          onClick={() => toggleTodasParaCargo(cargo, false)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition"
                        >
                          Desativar Tudo
                        </button>
                      </div>

                      {/* Páginas por categoria */}
                      {Object.entries(paginasPorCategoria).map(([categoria, paginas]) => (
                        <div key={categoria} className="space-y-2">
                          <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{categoria}</h4>
                          <div className="space-y-1.5 ml-2">
                            {paginas.map(page => {
                              const temAcesso = acessosCargo.includes(page.page);
                              return (
                                <button
                                  key={page.page}
                                  onClick={() => togglePaginaParaCargo(cargo, page.page)}
                                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition text-left text-sm ${
                                    temAcesso
                                      ? "bg-green-50 border border-green-200"
                                      : "bg-slate-50 border border-slate-200"
                                  }`}
                                >
                                  {/* Toggle visual */}
                                  <div className={`w-4 h-4 rounded-full border-2 transition flex items-center justify-center ${
                                    temAcesso
                                      ? "bg-green-500 border-green-600"
                                      : "border-slate-300 bg-white"
                                  }`}>
                                    {temAcesso && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                  </div>

                                  {/* Label */}
                                  <span className={`flex-1 font-medium ${temAcesso ? "text-green-700" : "text-slate-600"}`}>
                                    {page.label}
                                  </span>

                                  {/* Status badge */}
                                  <Badge className={temAcesso ? "bg-green-600" : "bg-slate-300"}>
                                    {temAcesso ? "Ativo" : "Inativo"}
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
        </>
      )}
    </div>
  );
}