import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import NovoProjetoModal from "@/components/projetos/NovoProjetoModal";
import ProjetosDashboard from "@/components/projetos/hub/ProjetosDashboard";
import ProjetosLista from "@/components/projetos/hub/ProjetosLista";
import ProjetosKanban from "@/components/projetos/hub/ProjetosKanban";
import ProjetosDocumentos from "@/components/projetos/hub/ProjetosDocumentos";
import ProjetosRiscos from "@/components/projetos/hub/ProjetosRiscos";
import ProjetosConfiguracoes from "@/components/projetos/hub/ProjetosConfiguracoes";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "lista", label: "Lista de Projetos" },
  { id: "kanban", label: "Kanban" },
  { id: "documentos", label: "Documentos" },
  { id: "riscos", label: "Riscos" },
  { id: "configuracoes", label: "Configurações" },
];

export default function Projetos() {
  const location = useLocation();
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get("tab") || "dashboard";

  const [showNovo, setShowNovo] = useState(false);
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    projetos: [],
    parcelas: [],
    tarefas: [],
    entradas: [],
    alocacoes: [],
    propostas: [],
    documentos: [],
    riscos: [],
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [projetos, parcelas, tarefas, entradas, alocacoes, propostas, documentos, riscos] = await Promise.all([
      base44.entities.OrdemServico.list("-created_date", 500),
      base44.entities.Parcela.list("-created_date", 1000),
      base44.entities.Tarefa.list("-created_date", 1000),
      base44.entities.EntradaTempo.list("-data", 2000),
      base44.entities.AlocacaoHoras.list("-created_date", 500),
      base44.entities.Proposta.list("-created_date", 500),
      base44.entities.DocumentoProjeto.list("-created_date", 500),
      base44.entities.RiscoProjeto.list("-created_date", 500),
    ]);
    setData({ projetos, parcelas, tarefas, entradas, alocacoes, propostas, documentos, riscos });
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

  const renderContent = () => {
    const props = { data, onRefresh: loadAll, loading };
    switch (activeTab) {
      case "dashboard": return <ProjetosDashboard {...props} />;
      case "lista": return <ProjetosLista {...props} />;
      case "kanban": return <ProjetosKanban {...props} />;
      case "documentos": return <ProjetosDocumentos {...props} />;
      case "riscos": return <ProjetosRiscos {...props} />;
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
              })}
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