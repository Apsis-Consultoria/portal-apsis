import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MENU_GROUPS, AREAS_DISPONIVEIS, CARGOS_DISPONIVEIS } from "./menuOptions";

export default function ConfigurarCargos() {
  const [grupoPermissoes, setGrupoPermissoes] = useState({});
  const [cargoAcessos, setCargoAcessos] = useState({});
  const [areaSelecionada, setAreaSelecionada] = useState("Contábil");
  const [expandidos, setExpandidos] = useState({});

  // Carregar dados do localStorage
  useEffect(() => {
    const grupoData = localStorage.getItem("grupo_permissoes");
    if (grupoData) {
      setGrupoPermissoes(JSON.parse(grupoData));
    }

    const cargoData = localStorage.getItem("cargo_acessos");
    if (cargoData) {
      setCargoAcessos(JSON.parse(cargoData));
    }
  }, []);

  const toggleExpand = (cargo) => {
    setExpandidos(prev => ({ ...prev, [cargo]: !prev[cargo] }));
  };

  const toggleGrupoParaCargo = (cargo, grupo) => {
    const key = `${cargo}_${areaSelecionada}`;
    const atual = cargoAcessos[key] || [];
    const updated = atual.includes(grupo)
      ? atual.filter(g => g !== grupo)
      : [...atual, grupo];

    const newCargoAcessos = { ...cargoAcessos, [key]: updated };
    setCargoAcessos(newCargoAcessos);
    localStorage.setItem("cargo_acessos", JSON.stringify(newCargoAcessos));
  };

  const toggleTudosParaCargo = (cargo, ativar) => {
    const key = `${cargo}_${areaSelecionada}`;
    const gruposAtivos = MENU_GROUPS
      .filter(g => grupoPermissoes[g.group])
      .map(g => g.group);

    const newCargoAcessos = {
      ...cargoAcessos,
      [key]: ativar ? gruposAtivos : []
    };
    setCargoAcessos(newCargoAcessos);
    localStorage.setItem("cargo_acessos", JSON.stringify(newCargoAcessos));
  };

  // Grupos disponíveis (ativados na aba de áreas)
  const gruposDisponiveis = MENU_GROUPS.filter(g => grupoPermissoes[g.group]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 mb-4">
        Defina quais grupos de páginas cada cargo pode acessar por área.
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

      {/* Info */}
      {gruposDisponiveis.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          ⚠️ Nenhum grupo ativado. Configure os grupos na aba "Configurar Áreas" primeiro.
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">{gruposDisponiveis.length} grupo{gruposDisponiveis.length !== 1 ? "s" : ""} disponível{gruposDisponiveis.length !== 1 ? "is" : ""}</p>

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
                    className={`w-full px-4 py-3 flex items-center gap-3 transition ${
                      acessosCargo.length > 0
                        ? "bg-green-50 hover:bg-green-100"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <Badge className={acessosCargo.length > 0 ? "bg-green-600" : "bg-purple-600"}>
                      {cargo}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {acessosCargo.length} de {gruposDisponiveis.length} grupo{gruposDisponiveis.length !== 1 ? "s" : ""}
                    </span>
                    <span className={`ml-auto ${acessosCargo.length > 0 ? "text-green-600" : "text-slate-400"}`}>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </span>
                  </button>

                  {/* Conteúdo */}
                  {isExpanded && (
                    <div className={`p-4 border-t space-y-3 ${acessosCargo.length > 0 ? "border-green-200 bg-green-50" : "border-slate-100 bg-slate-50"}`}>
                      {/* Botões de ativar/desativar tudo */}
                      <div className="flex gap-2 pb-3 border-b border-slate-200">
                        <button
                          onClick={() => toggleTudosParaCargo(cargo, true)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium transition"
                        >
                          Ativar Tudo
                        </button>
                        <button
                          onClick={() => toggleTudosParaCargo(cargo, false)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium transition"
                        >
                          Desativar Tudo
                        </button>
                      </div>

                      {/* Grid de grupos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {gruposDisponiveis.map(grupo => {
                          const temAcesso = acessosCargo.includes(grupo.group);
                          return (
                            <button
                              key={grupo.group}
                              onClick={() => toggleGrupoParaCargo(cargo, grupo.group)}
                              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition text-left text-sm border ${
                                temAcesso
                                  ? "bg-white border-green-300 hover:bg-green-50"
                                  : "bg-white border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {/* Toggle */}
                              <div className={`w-4 h-4 rounded-full border-2 transition flex items-center justify-center flex-shrink-0 ${
                                temAcesso
                                  ? "bg-green-500 border-green-600"
                                  : "border-slate-300 bg-white"
                              }`}>
                                {temAcesso && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                              </div>

                              {/* Label */}
                              <span className={`flex-1 font-medium ${temAcesso ? "text-green-700" : "text-slate-600"}`}>
                                {grupo.label}
                              </span>

                              {/* Badge com contagem */}
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                temAcesso
                                  ? "bg-green-200 text-green-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}>
                                {grupo.pages.length}
                              </span>
                            </button>
                          );
                        })}
                      </div>
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