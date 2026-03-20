import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { projectService } from "@/services/projectService";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "lista", label: "Lista de Projetos" },
  { id: "kanban", label: "Kanban" },
  { id: "documentos", label: "Documentos" },
  { id: "riscos", label: "Riscos" },
  { id: "parcelas", label: "Parcelas" },
  { id: "configuracoes", label: "Configurações" },
];

export default function Projetos() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get("tab") || "dashboard";

  const [showNovo, setShowNovo] = useState(false);

  // Dados do padrão novo
  const { data: projetos, loading, error, refetch } = useApi(() => projectService.list(), { autoFetch: true });

  // Manter compatibilidade com sub-componentes por enquanto
  const data = {
    projetos: projetos || [],
    parcelas: [],
    tarefas: [],
    entradas: [],
    alocacoes: [],
    propostas: [],
    documentos: [],
    riscos: [],
  };

  const loadAll = useCallback(() => refetch(), [refetch]);

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

  const renderContent = () => {
    const props = { data, onRefresh: loadAll, loading };
    switch (activeTab) {
      case "dashboard": return <ProjetosDashboard {...props} />;
      case "lista": return <ProjetosLista {...props} />;
      case "kanban": return <ProjetosKanban {...props} />;
      case "documentos": return <ProjetosDocumentos {...props} />;
      case "riscos": return <ProjetosRiscos {...props} />;
      case "parcelas": return <ProjetosParcelas {...props} />;
      case "configuracoes": return <ProjetosConfiguracoes />;
      default: return <ProjetosDashboard {...props} />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] overflow-hidden bg-[#F4F6F4]">

      {/* ── Top nav bar para o módulo ──────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="px-6">
          <div className="flex items-center justify-between h-12">
            {/* Tabs */}
            <div className="flex items-center h-full overflow-x-auto scrollbar-hide">
              {TABS.map(({ id, label }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => navigate(`/Projetos?tab=${id}`)}
                    className={`flex items-center h-full px-4 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                      isActive
                        ? "border-[#F47920] text-[#F47920]"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                );
                })
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 pl-4">
              <span className="text-xs text-slate-400">
                {loading ? "Carregando..." : `${data.projetos.length} projeto${data.projetos.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>

      {showNovo && (
        <NovoProjetoModal
          onClose={() => setShowNovo(false)}
          onSaved={() => { setShowNovo(false); loadAll(); }}
        />
      )}
    </div>
  );
}