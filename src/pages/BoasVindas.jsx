import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, FolderKanban, DollarSign, Megaphone,
  FileText, Settings, TrendingUp, Users, BarChart3, GitBranch, Sparkles,
  ArrowRight, Lock, Zap, Eye, Share2, Lightbulb
} from "lucide-react";
import SeuDiaBloco from "@/components/SeuDiaBloco";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40af152e2_Design-sem-nome.png";

// Módulos principais
const mainModules = [
  { name: "Dashboard", icon: LayoutDashboard, color: "bg-gradient-to-br from-[#F47920] to-[#F9A15A]", page: "Dashboard", description: "Visão executiva" },
  { name: "Projetos", icon: FolderKanban, color: "bg-gradient-to-br from-[#1A4731] to-[#245E40]", page: "Projetos", description: "Gestão de projetos" },
  { name: "Vendas", icon: TrendingUp, color: "bg-gradient-to-br from-[#F47920] to-[#F9A15A]", page: "Vendas", description: "Pipeline e oportunidades" },
  { name: "Financeiro", icon: DollarSign, color: "bg-gradient-to-br from-[#2B5E47] to-[#3A7A5F]", page: "Financeiro", description: "Gestão financeira" },
];

// Módulos secundários
const secondaryModules = [
  { name: "APSIS Nexus", icon: Share2, color: "bg-gradient-to-br from-[#1A4731] to-[#245E40]", page: "NexusInicio", description: "Portal do cliente" },
  { name: "Relatórios", icon: FileText, color: "bg-gradient-to-br from-[#2B5E47] to-[#3A7A5F]", page: "Relatorios", description: "Análises e relatórios" },
  { name: "AXON IA", icon: Sparkles, color: "bg-gradient-to-br from-[#F47920] to-[#F9A15A]", page: "AxonIA", description: "Inteligência artificial" },
  { name: "Configurações", icon: Settings, color: "bg-gradient-to-br from-[#5C7060] to-[#7A8E7F]", page: "Configuracoes", description: "Preferências e setup" },
];

// Atalhos rápidos
const quickActions = [
  { label: "Abrir Projetos", icon: FolderKanban, page: "Projetos" },
  { label: "Pipeline de Vendas", icon: GitBranch, page: "Vendas" },
  { label: "APSIS Nexus", icon: Share2, page: "NexusInicio" },
  { label: "Configurações", icon: Settings, page: "Configuracoes" },
];

// Indicadores institucionais
const badges = [
  { icon: Lock, label: "Seguro", color: "text-green-700" },
  { icon: Zap, label: "Integrado", color: "text-blue-700" },
  { icon: Eye, label: "Auditável", color: "text-purple-700" },
  { icon: Share2, label: "Colaborativo", color: "text-orange-700" },
];

export default function BoasVindas() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F6F4] via-white to-[#E8EDE9]">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.6s ease-out; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .card-hover { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(26, 71, 49, 0.1); }
      `}</style>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-16">
        {/* HERO PRINCIPAL */}
        <div className="animate-fade-in-up space-y-6">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-[#1A4731] leading-tight mb-3">
              Bem-vindo(a) ao Portal APSIS
            </h1>
            <p className="text-xl text-[#5C7060] font-medium mb-3">
              Seu workspace corporativo para gestão, colaboração, projetos, documentos e inteligência operacional.
            </p>
            <p className="text-sm text-[#5C7060] leading-relaxed max-w-2xl">
              Acesso centralizado a todas as ferramentas necessárias para gerenciar operações, projetos, financeiro e relacionamento com clientes.
            </p>
          </div>

          {/* Badges Institucionais */}
          <div className="flex flex-wrap gap-4 pt-4">
            {badges.map((badge, idx) => {
              const Icon = badge.icon;
              return (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#DDE3DE] shadow-sm animate-fade-in-up" 
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <Icon size={16} className={badge.color} />
                  <span className="text-sm font-medium text-[#1A4731]">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* SEU DIA - PENDÊNCIAS */}
        <SeuDiaBloco />

        {/* ATALHOS RÁPIDOS */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-sm uppercase font-bold text-[#5C7060] tracking-widest mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link
                  key={idx}
                  to={createPageUrl(action.page)}
                  className="group card-hover"
                >
                  <div className="bg-white border border-[#DDE3DE] rounded-lg px-4 py-3 flex items-center gap-3 cursor-pointer hover:border-[#F47920]">
                    <Icon size={18} className="text-[#F47920] flex-shrink-0" />
                    <span className="text-sm font-medium text-[#1A4731]">{action.label}</span>
                    <ArrowRight size={14} className="text-[#DDE3DE] group-hover:text-[#F47920] ml-auto transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* MÓDULOS PRINCIPAIS */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-sm uppercase font-bold text-[#5C7060] tracking-widest mb-6">Módulos Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainModules.map(({ name, icon: Icon, color, page, description }) => (
              <Link key={page} to={createPageUrl(page)} className="group">
                <div className={`${color} card-hover rounded-xl p-6 text-white cursor-pointer shadow-md hover:shadow-lg overflow-hidden relative`}>
                  {/* Gradiente de fundo decorativo */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                  <div className="relative z-10 space-y-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{name}</h3>
                      <p className="text-sm text-white/80 mt-0.5">{description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* MÓDULOS SECUNDÁRIOS */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-sm uppercase font-bold text-[#5C7060] tracking-widest mb-6">Outros Módulos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {secondaryModules.map(({ name, icon: Icon, color, page, description }) => (
              <Link key={page} to={createPageUrl(page)} className="group">
                <div className={`${color} card-hover rounded-lg p-5 text-white cursor-pointer shadow-sm hover:shadow-md overflow-hidden relative`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mt-10" />
                  <div className="relative z-10 space-y-2">
                    <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold">{name}</h3>
                      <p className="text-xs text-white/75 mt-0.5">{description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* BLOCO DE ORIENTAÇÃO */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="bg-white rounded-xl shadow-sm border border-[#DDE3DE] p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#F47920] to-[#F9A15A] flex items-center justify-center flex-shrink-0">
                <Lightbulb size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[#1A4731] mb-2">Como Navegar no Portal APSIS</h3>
                <p className="text-sm text-[#5C7060] leading-relaxed">
                  Utilize os módulos principais para acessar rapidamente suas áreas de trabalho. O Portal APSIS centraliza operações, projetos, dados financeiros, relacionamento com clientes e inteligência corporativa em uma única experiência integrada. Use o menu lateral para navegação completa ou os atalhos rápidos acima para acesso imediato.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}