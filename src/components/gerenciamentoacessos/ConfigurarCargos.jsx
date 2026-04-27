import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Check, X } from "lucide-react";
import { MENU_GROUPS, CARGOS_DISPONIVEIS } from "./menuOptions";
import { colaboradoresService } from "@/lib/supabaseColaboradores";

export default function ConfigurarCargos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [grupoPermissoes, setGrupoPermissoes] = useState({});
  const [cargoAcessos, setCargoAcessos] = useState({});
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState(null);
  const [expandidos, setExpandidos] = useState({});
  const [loading, setLoading] = useState(true);

  // Carregar departamentos e permissões
  useEffect(() => {
    setLoading(true);
    colaboradoresService.list().then(data => {
      const depts = [...new Set((data || [])
        .filter(c => c.departamento || c.departamentos)
        .flatMap(c => {
          if (c.departamentos) {
            try {
              return JSON.parse(c.departamentos);
            } catch {
              return c.departamento ? [c.departamento] : [];
            }
          }
          return c.departamento ? [c.departamento] : [];
        })
        .filter(Boolean)
      )].sort();

      setDepartamentos(depts);
      if (depts.length > 0) {
        setDepartamentoSelecionado(depts[0]);
      }

      // Carregar permissões de grupos por departamento
      const grupoData = localStorage.getItem("departamento_grupo_permissoes");
      if (grupoData) {
        setGrupoPermissoes(JSON.parse(grupoData));
      }

      // Carregar permissões de cargos
      const cargoData = localStorage.getItem("departamento_cargo_permissoes");
      if (cargoData) {
        setCargoAcessos(JSON.parse(cargoData));
      }

      setLoading(false);
    });
  }, []);

  const toggleExpand = (cargo) => {
    setExpandidos(prev => ({ ...prev, [cargo]: !prev[cargo] }));
  };

  const toggleGrupoParaCargo = (cargo, grupo) => {
    const key = `${departamentoSelecionado}_${cargo}`;
    const atual = cargoAcessos[key] || [];
    const updated = atual.includes(grupo)
      ? atual.filter(g => g !== grupo)
      : [...atual, grupo];

    const newCargoAcessos = { ...cargoAcessos, [key]: updated };
    setCargoAcessos(newCargoAcessos);
    localStorage.setItem("departamento_cargo_permissoes", JSON.stringify(newCargoAcessos));
  };

  const toggleTudosParaCargo = (cargo, ativar) => {
    const key = `${departamentoSelecionado}_${cargo}`;
    const deptPerms = grupoPermissoes[departamentoSelecionado] || {};
    const gruposAtivos = Object.keys(deptPerms).filter(g => deptPerms[g]);

    const newCargoAcessos = {
      ...cargoAcessos,
      [key]: ativar ? gruposAtivos : []
    };
    setCargoAcessos(newCargoAcessos);
    localStorage.setItem("departamento_cargo_permissoes", JSON.stringify(newCargoAcessos));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
        <span className="text-sm">Carregando dados...</span>
      </div>
    );
  }

  const deptPerms = grupoPermissoes[departamentoSelecionado] || {};
  const gruposDisponiveis = MENU_GROUPS.filter(g => deptPerms[g.group]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 mb-4">
        Para cada cargo, escolha quais grupos ele poderá acessar no departamento selecionado.
      </p>

      {/* Seletor de departamento */}
      {departamentos.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Departamento</p>
          <div className="flex flex-wrap gap-2">
            {departamentos.map(dept => (
              <button
                key={dept}
                onClick={() => setDepartamentoSelecionado(dept)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  departamentoSelecionado === dept
                    ? "bg-[#1A4731] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      {gruposDisponiveis.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
          ⚠️ Nenhum grupo ativado para este departamento. Configure na aba "Configurar Áreas" primeiro.
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500">{gruposDisponiveis.length} grupo{gruposDisponiveis.length !== 1 ? "s" : ""} disponível{gruposDisponiveis.length !== 1 ? "is" : ""}</p>

          {/* Cargos */}
          <div className="space-y-3">
            {CARGOS_DISPONIVEIS.map(cargo => {
              const key = `${departamentoSelecionado}_${cargo}`;
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
                    <Badge className={acessosCargo.length > 0 ? "bg-green-600" : "bg-slate-600"}>
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
                      <div className="grid grid-cols-2 gap-2">
                        {gruposDisponiveis.map(grupo => {
                          const temAcesso = acessosCargo.includes(grupo.group);
                          return (
                            <button
                              key={grupo.group}
                              onClick={() => toggleGrupoParaCargo(cargo, grupo.group)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition text-left text-sm border ${
                                temAcesso
                                  ? "bg-white border-green-300 hover:bg-green-50"
                                  : "bg-white border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {/* Toggle visual com check/x */}
                              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition ${
                                temAcesso
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}>
                                {temAcesso ? (
                                  <Check size={14} className="text-white" />
                                ) : (
                                  <X size={14} className="text-white" />
                                )}
                              </div>

                              {/* Label */}
                              <span className={`flex-1 font-medium text-xs ${
                                temAcesso ? "text-green-700" : "text-slate-600"
                              }`}>
                                {grupo.label}
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