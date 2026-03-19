import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Search, Columns, Clock, GitBranch,
  BarChart3, Calendar, Timer, CreditCard, FileText,
  MessageSquare, AlertTriangle, ChevronRight, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NovoProjetoModal from "@/components/projetos/NovoProjetoModal";
import ProjetosDashboard from "@/components/projetos/hub/ProjetosDashboard";
import ProjetosBusca from "@/components/projetos/hub/ProjetosBusca";
import ProjetosKanban from "@/components/projetos/hub/ProjetosKanban";
import ProjetosHoras from "@/components/projetos/hub/ProjetosHoras";
import ProjetosPipeline from "@/components/projetos/hub/ProjetosPipeline";
import ProjetosBudget from "@/components/projetos/hub/ProjetosBudget";
import ProjetosGantt from "@/components/projetos/hub/ProjetosGantt";
import ProjetosTimesheet from "@/components/projetos/hub/ProjetosTimesheet";
import ProjetosParcelas from "@/components/projetos/hub/ProjetosParcelas";
import ProjetosDocumentos from "@/components/projetos/hub/ProjetosDocumentos";
import ProjetosComunicacao from "@/components/projetos/hub/ProjetosComunicacao";
import ProjetosRiscos from "@/components/projetos/hub/ProjetosRiscos";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "busca", label: "Busca", icon: Search },
  { id: "kanban", label: "Kanban", icon: Columns },
  { id: "horas", label: "Horas e Alocações", icon: Clock },
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "budget", label: "Budget", icon: BarChart3 },
  { id: "gantt", label: "Gantt", icon: Calendar },
  { id: "timesheet", label: "Entradas de Tempo", icon: Timer },
  { id: "parcelas", label: "Parcelas", icon: CreditCard },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "comunicacao", label: "Comunicação", icon: MessageSquare },
  { id: "riscos", label: "Riscos", icon: AlertTriangle },
];

export default function Projetos() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get("tab") || "dashboard";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNovo, setShowNovo] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dados globais compartilhados entre todos os submodulos
  const [data, setData] = useState({
    projetos: [],
    parcelas: [],
    tarefas: [],
    entradas: [],
    alocacoes: [],
    propostas: [],
    comunicacoes: [],
    documentos: [],
    riscos: [],
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [projetos, parcelas, tarefas, entradas, alocacoes, propostas, comunicacoes, documentos, riscos] = await Promise.all([
      base44.entities.OrdemServico.list("-created_date", 500),
      base44.entities.Parcela.list("-created_date", 1000),
      base44.entities.Tarefa.list("-created_date", 1000),
      base44.entities.EntradaTempo.list("-data", 2000),
      base44.entities.AlocacaoHoras.list("-created_date", 500),
      base44.entities.Proposta.list("-created_date", 500),
      base44.entities.ComunicacaoProjeto.list("-data", 1000),
      base44.entities.DocumentoProjeto.list("-created_date", 500),
      base44.entities.RiscoProjeto.list("-created_date", 500),
    ]);
    setData({ projetos, parcelas, tarefas, entradas, alocacoes, propostas, comunicacoes, documentos, riscos });
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

  const renderContent = () => {
    const props = { data, onRefresh: loadAll, loading };
    switch (activeTab) {
      case "dashboard": return <ProjetosDashboard {...props} />;
      case "busca": return <ProjetosBusca {...props} />;
      case "kanban": return <ProjetosKanban {...props} />;
      case "horas": return <ProjetosHoras {...props} />;
      case "pipeline": return <ProjetosPipeline {...props} />;
      case "budget": return <ProjetosBudget {...props} />;
      case "gantt": return <ProjetosGantt {...props} />;
      case "timesheet": return <ProjetosTimesheet {...props} />;
      case "parcelas": return <ProjetosParcelas {...props} />;
      case "documentos": return <ProjetosDocumentos {...props} />;
      case "comunicacao": return <ProjetosComunicacao {...props} />;
      case "riscos": return <ProjetosRiscos {...props} />;
      default: return <ProjetosDashboard {...props} />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-73px)] overflow-hidden bg-[#F4F6F4]">
      {/* Top nav bar */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center px-4 gap-1 overflow-x-auto">
          <div className="flex items-center gap-2 pr-3 mr-2 border-r border-slate-200 flex-shrink-0">
            <Button
              size="sm"
              className="gap-1.5 bg-[#F47920] hover:bg-[#d96a18] text-white text-xs h-8 my-2"
              onClick={() => setShowNovo(true)}
            >
              <Plus size={13} /> Novo Projeto
            </Button>
          </div>
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = id === activeTab;
            return (
              <Link
                key={id}
                to={`/Projetos?tab=${id}`}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${
                  isActive
                    ? "border-[#F47920] text-[#1A4731] font-semibold"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon size={13} className={isActive ? "text-[#F47920]" : "text-slate-400"} />
                {label}
              </Link>
            );
          })}
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