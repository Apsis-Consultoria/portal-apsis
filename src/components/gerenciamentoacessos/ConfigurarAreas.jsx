import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Check, X, Edit2, Save, RotateCcw } from "lucide-react";
import { MENU_GROUPS } from "./menuOptions";
import { colaboradoresService } from "@/lib/supabaseColaboradores";

export default function ConfigurarAreas() {
  const [departamentos, setDepartamentos] = useState([]);
  const [grupoPermissoes, setGrupoPermissoes] = useState({});
  const [expandidos, setExpandidos] = useState({});
  const [emEdicao, setEmEdicao] = useState({});
  const [backupPermissoes, setBackupPermissoes] = useState({});
  const [loading, setLoading] = useState(true);

  // Carregar departamentos dos colaboradores e permissões
  useEffect(() => {
    setLoading(true);
    colaboradoresService.list().then(data => {
      // Extrair departamentos únicos
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

      // Carregar permissões do localStorage
      const saved = localStorage.getItem("departamento_grupo_permissoes");
      if (saved) {
        setGrupoPermissoes(JSON.parse(saved));
      } else {
        // Inicializar todos os grupos como desativados para todos os departamentos
        const defaults = {};
        depts.forEach(dept => {
          defaults[dept] = {};
          MENU_GROUPS.forEach(grupo => {
            defaults[dept][grupo.group] = false;
          });
        });
        setGrupoPermissoes(defaults);
        localStorage.setItem("departamento_grupo_permissoes", JSON.stringify(defaults));
      }

      setLoading(false);
    });
  }, []);

  const toggleExpand = (dept) => {
    setExpandidos(prev => ({ ...prev, [dept]: !prev[dept] }));
  };

  const iniciarEdicao = (dept) => {
    setEmEdicao(prev => ({ ...prev, [dept]: true }));
    setBackupPermissoes(prev => ({ ...prev, [dept]: grupoPermissoes[dept] }));
    setExpandidos(prev => ({ ...prev, [dept]: true }));
  };

  const salvarEdicao = (dept) => {
    setEmEdicao(prev => ({ ...prev, [dept]: false }));
    localStorage.setItem("departamento_grupo_permissoes", JSON.stringify(grupoPermissoes));
  };

  const descartarEdicao = (dept) => {
    setEmEdicao(prev => ({ ...prev, [dept]: false }));
    if (backupPermissoes[dept]) {
      const updated = { ...grupoPermissoes, [dept]: backupPermissoes[dept] };
      setGrupoPermissoes(updated);
    }
  };

  const toggleGrupo = (dept, grupo) => {
    if (!emEdicao[dept]) return;
    const updated = {
      ...grupoPermissoes,
      [dept]: {
        ...(grupoPermissoes[dept] || {}),
        [grupo]: !grupoPermissoes[dept]?.[grupo]
      }
    };
    setGrupoPermissoes(updated);
  };

  const ativarTodosGrupos = (dept) => {
    const updated = { ...grupoPermissoes };
    MENU_GROUPS.forEach(g => {
      updated[dept] = { ...updated[dept], [g.group]: true };
    });
    setGrupoPermissoes(updated);
  };

  const desativarTodosGrupos = (dept) => {
    const updated = { ...grupoPermissoes };
    MENU_GROUPS.forEach(g => {
      updated[dept] = { ...updated[dept], [g.group]: false };
    });
    setGrupoPermissoes(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
        <span className="text-sm">Carregando departamentos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 mb-4">
        Para cada departamento, selecione quais grupos de páginas estarão disponíveis.
      </p>

      {departamentos.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Nenhum departamento encontrado. Certifique-se de que os colaboradores têm departamentos configurados.
        </div>
      ) : (
        departamentos.map(dept => {
          const isExpanded = expandidos[dept];
          const permsGrupos = grupoPermissoes[dept] || {};
          const totalAtivos = Object.values(permsGrupos).filter(Boolean).length;

          return (
            <div key={dept} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="w-full px-4 py-3 flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition">
                <Badge className="bg-[#1A4731] text-white font-bold">{dept}</Badge>
                <span className="text-xs text-slate-500">{totalAtivos} de {MENU_GROUPS.length} grupos</span>
                
                {emEdicao[dept] ? (
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => salvarEdicao(dept)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium"
                    >
                      <Save size={13} /> Salvar
                    </button>
                    <button
                      onClick={() => descartarEdicao(dept)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
                    >
                      <RotateCcw size={13} /> Descartar
                    </button>
                  </div>
                ) : (
                  <div className="ml-auto flex gap-2 items-center">
                    <button
                      onClick={() => iniciarEdicao(dept)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium"
                    >
                      <Edit2 size={13} /> Editar
                    </button>
                    <button
                      onClick={() => toggleExpand(dept)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Conteúdo - Grid de grupos */}
              {isExpanded && (
                <div className={`p-4 border-t border-slate-100 ${emEdicao[dept] ? "bg-blue-50" : ""}`}>
                  {!emEdicao[dept] && <p className="text-xs text-slate-500 mb-3 italic">Clique em "Editar" para modificar as permissões</p>}
                  {emEdicao[dept] && (
                    <div className="flex gap-2 mb-3 pb-3 border-b border-slate-200">
                      <button
                        onClick={() => ativarTodosGrupos(dept)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium transition"
                      >
                        Selecionar Todos
                      </button>
                      <button
                        onClick={() => desativarTodosGrupos(dept)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition"
                      >
                        Deselecionar Todos
                      </button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    {MENU_GROUPS.map(grupo => {
                      const ativo = permsGrupos[grupo.group] || false;
                      return (
                        <button
                          key={grupo.group}
                          onClick={() => toggleGrupo(dept, grupo.group)}
                          disabled={!emEdicao[dept]}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition text-left text-sm border ${
                            !emEdicao[dept]
                              ? "opacity-60 cursor-not-allowed"
                              : ativo
                              ? "bg-green-50 border-green-300 hover:bg-green-100 cursor-pointer"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100 cursor-pointer"
                          }`}
                        >
                          {/* Toggle visual com check/x */}
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition ${
                            ativo
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}>
                            {ativo ? (
                              <Check size={14} className="text-white" />
                            ) : (
                              <X size={14} className="text-white" />
                            )}
                          </div>

                          {/* Label */}
                          <span className={`flex-1 font-medium text-xs ${
                            ativo ? "text-green-700" : "text-slate-600"
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
        })
      )}
    </div>
  );
}