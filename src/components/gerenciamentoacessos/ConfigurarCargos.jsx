import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Check, X, Edit2, Save, RotateCcw } from "lucide-react";
import { MENU_GROUPS, CARGOS_DISPONIVEIS } from "./menuOptions";
import { colaboradoresService } from "@/lib/supabaseColaboradores";

export default function ConfigurarCargos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [grupoPermissoes, setGrupoPermissoes] = useState({});
  const [cargoAcessos, setCargoAcessos] = useState({});
  const [departamentoSelecionado, setDepartamentoSelecionado] = useState(null);
  const [expandidos, setExpandidos] = useState({});
  const [emEdicao, setEmEdicao] = useState({});
  const [backupAcessos, setBackupAcessos] = useState({});
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

  const iniciarEdicao = (cargo) => {
    const key = `${departamentoSelecionado}_${cargo}`;
    setEmEdicao(prev => ({ ...prev, [cargo]: true }));
    setBackupAcessos(prev => ({ ...prev, [key]: cargoAcessos[key] || [] }));
    setExpandidos(prev => ({ ...prev, [cargo]: true }));
  };

  const salvarEdicao = (cargo) => {
    setEmEdicao(prev => ({ ...prev, [cargo]: false }));
    localStorage.setItem("departamento_cargo_permissoes", JSON.stringify(cargoAcessos));
  };

  const descartarEdicao = (cargo) => {
    const key = `${departamentoSelecionado}_${cargo}`;
    setEmEdicao(prev => ({ ...prev, [cargo]: false }));
    if (backupAcessos[key]) {
      const updated = { ...cargoAcessos, [key]: backupAcessos[key] };
      setCargoAcessos(updated);
    }
  };

  const toggleGrupoParaCargo = (cargo, grupo) => {
    if (!emEdicao[cargo]) return;
    const key = `${departamentoSelecionado}_${cargo}`;
    const atual = cargoAcessos[key] || [];
    const updated = atual.includes(grupo)
      ? atual.filter(g => g !== grupo)
      : [...atual, grupo];

    const newCargoAcessos = { ...cargoAcessos, [key]: updated };
    setCargoAcessos(newCargoAcessos);
  };

  const toggleTudosParaCargo = (cargo, ativar) => {
    if (!emEdicao[cargo]) return;
    const key = `${departamentoSelecionado}_${cargo}`;
    const deptPerms = grupoPermissoes[departamentoSelecionado] || {};
    
    // Obter todas as páginas dos grupos ativos
    const todasAsPaginas = MENU_GROUPS
      .filter(g => deptPerms[g.group])
      .flatMap(g => (g.pages || []).map(p => p.page));

    const newCargoAcessos = {
      ...cargoAcessos,
      [key]: ativar ? todasAsPaginas : []
    };
    setCargoAcessos(newCargoAcessos);
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
          {(() => {
            const totalTelas = gruposDisponiveis.flatMap(g => g.pages || []).length;
            return <p className="text-xs text-slate-500">{totalTelas} tela{totalTelas !== 1 ? "s" : ""} disponível{totalTelas !== 1 ? "is" : ""}</p>;
          })()}

          {/* Cargos */}
          <div className="space-y-3">
            {CARGOS_DISPONIVEIS.map(cargo => {
              const key = `${departamentoSelecionado}_${cargo}`;
              const acessosCargo = cargoAcessos[key] || [];
              const isExpanded = expandidos[cargo];

              return (
                <div key={cargo} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  {/* Header */}
                  <div 
                    onClick={() => toggleExpand(cargo)}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition cursor-pointer ${
                      acessosCargo.length > 0
                        ? "bg-green-50 hover:bg-green-100"
                        : "bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <Badge className={acessosCargo.length > 0 ? "bg-green-600" : "bg-slate-600"}>
                      {cargo}
                    </Badge>
                    {(() => {
                      const totalTelas = gruposDisponiveis.flatMap(g => g.pages || []).length;
                      return (
                        <span className="text-xs text-slate-500">
                          {acessosCargo.length} de {totalTelas} tela{totalTelas !== 1 ? "s" : ""}
                        </span>
                      );
                    })()}
                    
                    {emEdicao[cargo] ? (
                      <div className="ml-auto flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            salvarEdicao(cargo);
                          }}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium"
                        >
                          <Save size={13} /> Salvar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            descartarEdicao(cargo);
                          }}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
                        >
                          <RotateCcw size={13} /> Descartar
                        </button>
                      </div>
                    ) : (
                      <div className="ml-auto flex gap-2 items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            iniciarEdicao(cargo);
                          }}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
                        >
                          <Edit2 size={13} /> Editar
                        </button>
                        <span className="text-slate-400">
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  {isExpanded && (
                    <div className={`p-4 border-t space-y-3 ${emEdicao[cargo] ? "bg-blue-50 border-blue-200" : acessosCargo.length > 0 ? "border-green-200 bg-green-50" : "border-slate-100 bg-slate-50"}`}>
                      {!emEdicao[cargo] && <p className="text-xs text-slate-500 italic">Clique em "Editar" para modificar as permissões</p>}
                      
                      {/* Botões de ativar/desativar tudo */}
                      <div className="flex gap-2 pb-3 border-b border-slate-200">
                        <button
                          onClick={() => toggleTudosParaCargo(cargo, true)}
                          disabled={!emEdicao[cargo]}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                            emEdicao[cargo]
                              ? "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                              : "opacity-40 cursor-not-allowed bg-green-100 text-green-700"
                          }`}
                        >
                          Ativar Tudo
                        </button>
                        <button
                          onClick={() => toggleTudosParaCargo(cargo, false)}
                          disabled={!emEdicao[cargo]}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                            emEdicao[cargo]
                              ? "bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
                              : "opacity-40 cursor-not-allowed bg-red-100 text-red-700"
                          }`}
                        >
                          Desativar Tudo
                        </button>
                      </div>

                      {/* Grid de telas baseado nos grupos disponíveis */}
                      <div className="space-y-4">
                        {gruposDisponiveis.map(grupo => {
                          const telasDoGrupo = grupo.pages || [];

                          return (
                            <div key={grupo.group}>
                              <p className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">{grupo.label}</p>
                              <div className="grid grid-cols-1 gap-2 pl-2 border-l-2 border-slate-300">
                                {telasDoGrupo.map(tela => {
                                  const temAcesso = acessosCargo.includes(tela.page);
                                  return (
                                    <button
                                      key={tela.page}
                                      onClick={() => {
                                        if (!emEdicao[cargo]) return;
                                        const key = `${departamentoSelecionado}_${cargo}`;
                                        const atual = cargoAcessos[key] || [];
                                        const updated = atual.includes(tela.page)
                                          ? atual.filter(p => p !== tela.page)
                                          : [...atual, tela.page];
                                        setCargoAcessos({ ...cargoAcessos, [key]: updated });
                                      }}
                                      disabled={!emEdicao[cargo]}
                                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition text-left text-xs border ${
                                        !emEdicao[cargo]
                                          ? "opacity-60 cursor-not-allowed"
                                          : temAcesso
                                          ? "bg-white border-green-300 hover:bg-green-50 cursor-pointer"
                                          : "bg-white border-slate-200 hover:bg-slate-50 cursor-pointer"
                                      }`}
                                    >
                                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition ${
                                        temAcesso
                                          ? "bg-green-500"
                                          : "bg-red-500"
                                      }`}>
                                        {temAcesso ? (
                                          <Check size={12} className="text-white" />
                                        ) : (
                                          <X size={12} className="text-white" />
                                        )}
                                      </div>
                                      <span className={`flex-1 font-medium ${
                                        temAcesso ? "text-green-700" : "text-slate-600"
                                      }`}>
                                        {tela.label}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
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