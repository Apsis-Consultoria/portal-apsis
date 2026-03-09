import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, DollarSign, Megaphone,
  FileText, Settings, TrendingUp, Users, BarChart3, GitBranch, Sparkles
} from "lucide-react";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40af152e2_Design-sem-nome.png";

const modules = [
  { name: "Dashboard", icon: LayoutDashboard, color: "from-[#F47920] to-[#F9A15A]", page: "Dashboard" },
  { name: "Projetos", icon: FolderKanban, color: "from-[#1A4731] to-[#245E40]", page: "Projetos" },
  { name: "Financeiro", icon: DollarSign, color: "from-[#2B5E47] to-[#3A7A5F]", page: "Financeiro" },
  { name: "Marketing", icon: Megaphone, color: "from-[#F47920] to-[#F9A15A]", page: "Marketing" },
  { name: "Pipeline", icon: TrendingUp, color: "from-[#1A4731] to-[#245E40]", page: "Pipeline" },
  { name: "Budget", icon: BarChart3, color: "from-[#2B5E47] to-[#3A7A5F]", page: "Budget" },
  { name: "Qualidade", icon: Users, color: "from-[#F47920] to-[#F9A15A]", page: "DashboardQualidade" },
  { name: "Configurações", icon: Settings, color: "from-[#1A4731] to-[#245E40]", page: "Configuracoes" },
];

export default function BoasVindas() {
  const [user, setUser] = useState(null);
  const [colaborador, setColaborador] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (currentUser?.email) {
          const cols = await base44.entities.Colaborador.filter({ email: currentUser.email });
          if (cols && cols.length > 0) {
            setColaborador(cols[0]);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const displayName = colaborador?.nome || user?.full_name || "Usuário";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F4] via-white to-[#E8EDE9] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-[#1A4731] mb-6">Bem-vindo Apsiano!</h1>
            <p className="text-2xl text-[#245E40] font-semibold mb-2">{displayName}</p>
            <p className="text-[#5C7060] text-lg">Explore os módulos do Portal APSIS abaixo</p>
          </div>
        </div>

        {/* Info Cards */}
        {!loading && user && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl shadow-sm border border-[#DDE3DE] p-6">
              <p className="text-[#5C7060] text-sm font-medium mb-2">Email</p>
              <p className="text-[#1A2B1F] font-semibold">{user.email}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-[#DDE3DE] p-6">
              <p className="text-[#5C7060] text-sm font-medium mb-2">Cargo</p>
              <p className="text-[#1A2B1F] font-semibold">{colaborador?.cargo || "—"}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-[#DDE3DE] p-6">
              <p className="text-[#5C7060] text-sm font-medium mb-2">Departamento</p>
              <p className="text-[#1A2B1F] font-semibold">{colaborador?.departamento || "—"}</p>
            </div>
          </div>
        )}

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-[#1A4731] mb-6">Navegação Principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map(({ name, icon: Icon, color, page }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                className="group"
              >
                <div className={`bg-gradient-to-br ${color} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 p-8 cursor-pointer h-full flex flex-col items-center justify-center text-center`}>
                  <div className="mb-4 p-4 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-[#DDE3DE] p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 rounded-full bg-[#F47920]" />
            <h3 className="text-lg font-bold text-[#1A4731]">Dica de Navegação</h3>
          </div>
          <p className="text-[#5C7060] leading-relaxed">
            Use o menu lateral para acessar rapidamente os módulos principais. Cada dashboard oferece visualizações em tempo real de métricas operacionais, financeiras e comerciais. Acesse a seção "Configurações" para personalizações e preferências de usuário.
          </p>
        </div>
      </div>
    </div>
  );
}