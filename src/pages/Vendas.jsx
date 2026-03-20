import { useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { id: "dashboard",    label: "Dashboard",     icon: LayoutDashboard },
  { id: "pipeline",     label: "Pipeline",       icon: GitBranch       },
  { id: "oportunidades",label: "Oportunidades",  icon: Briefcase       },
  { id: "clientes",     label: "Clientes",       icon: Users           },
  { id: "propostas",    label: "Propostas",      icon: FileText        },
  { id: "configuracoes",label: "Configurações",  icon: Settings        },
];

export default function Vendas() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = new URLSearchParams(location.search).get("tab") || "dashboard";

  return (
    <div className="space-y-0">
      {/* Sub-nav */}
      <div className="flex items-center gap-0 border-b border-slate-200 bg-white -mx-6 px-6 mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => navigate(`/Vendas?tab=${id}`)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? "border-[#F47920] text-[#F47920]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {activeTab === "dashboard"     && <VendasDashboard />}
      {activeTab === "pipeline"      && <PipelineTab />}
      {activeTab === "oportunidades" && <OportunidadesTab />}
      {activeTab === "clientes"      && <VendasClientes />}
      {activeTab === "propostas"     && <VendasPropostas />}
      {activeTab === "configuracoes" && <VendasConfiguracoes />}
    </div>
  );
}