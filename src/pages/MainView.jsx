import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, FolderKanban, DollarSign, Megaphone,
  FileText, Settings, Users, BarChart3, Sparkles
} from "lucide-react";

const modules = [
  { name: "Dashboard", icon: LayoutDashboard, color: "from-[#F47920] to-[#F9A15A]", page: "Dashboard" },
  { name: "Projetos", icon: FolderKanban, color: "from-[#1A4731] to-[#245E40]", page: "Projetos" },
  { name: "Financeiro", icon: DollarSign, color: "from-[#2B5E47] to-[#3A7A5F]", page: "Financeiro" },
  { name: "Marketing", icon: Megaphone, color: "from-[#F47920] to-[#F9A15A]", page: "Marketing" },
  { name: "Qualidade", icon: Users, color: "from-[#F47920] to-[#F9A15A]", page: "DashboardQualidade" },
  { name: "Apps APSIS", icon: BarChart3, color: "from-[#1A4731] to-[#245E40]", page: "AppsAPSIS" },
  { name: "Relatórios", icon: FileText, color: "from-[#2B5E47] to-[#3A7A5F]", page: "Relatorios" },
  { name: "AXON IA", icon: Sparkles, color: "from-[#F47920] to-[#F9A15A]", page: "AxonIA" },
];

export default function MainView() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F4] via-white to-[#E8EDE9] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-[#1A4731] mb-4">Bem-vindo(a) Apsiano!</h1>
          <p className="text-lg"><span className="text-[#5C7060]">Explore os módulos do </span><span className="bg-gradient-to-r from-[#1A4731] via-[#F47920] to-[#245E40] bg-clip-text text-transparent font-bold">Portal APSIS</span><span className="text-[#5C7060]"> abaixo</span></p>
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-2xl font-bold text-[#1A4731] mb-6">Navegação Principal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map(({ name, icon: Icon, color, page }) => (
              <Link key={page} to={createPageUrl(page)} className="group">
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