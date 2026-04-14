import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  FolderKanban, DollarSign, TrendingUp, Users,
  FileText, Settings, Sparkles, ArrowRight,
  AlertTriangle, ChevronRight, Plus, Target,
  Zap, BarChart3, Clock, CheckCircle2, Activity,
  Lightbulb, Brain, Bell, Calendar
} from "lucide-react";
import SeuDiaBloco from "@/components/SeuDiaBloco";

// PRIMARY modules — large cards
const primaryModules = [
  {
    name: "Projetos",
    icon: FolderKanban,
    page: "Projetos",
    description: "Gestão de projetos e ordens de serviço",
    accent: "#1A4731",
    bg: "from-[#1A4731] to-[#245E40]",
    stat: "Projetos ativos",
  },
  {
    name: "Financeiro",
    icon: DollarSign,
    page: "Financeiro",
    description: "Contas, fluxo de caixa e parcelas",
    accent: "#2B5E47",
    bg: "from-[#2B5E47] to-[#3A7A5F]",
    stat: "Receita monitorada",
  },
  {
    name: "Vendas",
    icon: TrendingUp,
    page: "Vendas",
    description: "Pipeline comercial e oportunidades",
    accent: "#F47920",
    bg: "from-[#F47920] to-[#F9A15A]",
    stat: "Propostas abertas",
  },
  {
    name: "Capital Humano",
    icon: Users,
    page: "CapitalHumano",
    description: "Colaboradores, alocações e onboarding",
    accent: "#3A6B52",
    bg: "from-[#3A6B52] to-[#4D8A6A]",
    stat: "Colaboradores ativos",
  },
];

// SECONDARY modules — compact cards
const secondaryModules = [
  { name: "Relatórios", icon: FileText, page: "Relatorios", description: "Análises e exports" },
  { name: "AXON IA", icon: Sparkles, page: "AxonIA", description: "Inteligência artificial" },
  { name: "Configurações", icon: Settings, page: "Configuracoes", description: "Preferências e setup" },
];

// Quick actions
const quickActions = [
  { label: "Criar novo projeto", icon: Plus, page: "Projetos", color: "text-[#1A4731]", bg: "bg-[#1A4731]/5 hover:bg-[#1A4731]/10" },
  { label: "Registrar oportunidade", icon: Target, page: "Vendas", color: "text-[#F47920]", bg: "bg-[#F47920]/5 hover:bg-[#F47920]/10" },
  { label: "Iniciar análise IA", icon: Brain, page: "AxonIA", color: "text-purple-600", bg: "bg-purple-50 hover:bg-purple-100" },
  { label: "Solicitar automação", icon: Zap, page: "AxonIA", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100" },
  { label: "Gerar relatório executivo", icon: BarChart3, page: "Relatorios", color: "text-[#2B5E47]", bg: "bg-[#2B5E47]/5 hover:bg-[#2B5E47]/10" },
];

// Smart insights
const insights = [
  { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", text: "3 projetos com prazo vencendo esta semana — revise o cronograma.", cta: "Ver projetos", page: "Projetos" },
  { icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50", text: "Pipeline comercial com R$ 420k em propostas quentes — acompanhe o follow-up.", cta: "Abrir pipeline", page: "Vendas" },
  { icon: Lightbulb, color: "text-blue-500", bg: "bg-blue-50", text: "Relatório executivo mensal disponível para geração — dados consolidados prontos.", cta: "Gerar relatório", page: "Relatorios" },
];

export default function BoasVindas() {
  const [activeInsight, setActiveInsight] = useState(0);

  return (
    <div className="min-h-screen bg-[#F4F6F4]">
      <style>{`
        .card-lift { transition: transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s cubic-bezier(.4,0,.2,1); }
        .card-lift:hover { transform: translateY(-3px); box-shadow: 0 16px 32px rgba(26,71,49,0.13); }
        .action-btn { transition: background 0.15s, transform 0.15s; }
        .action-btn:hover { transform: translateX(2px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.55s ease both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.20s; }
        .fade-up-4 { animation-delay: 0.28s; }
        .fade-up-5 { animation-delay: 0.36s; }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">

        {/* ── HERO ── */}
        <div className="fade-up fade-up-1 bg-gradient-to-br from-[#1A4731] via-[#1F5238] to-[#2B5E47] rounded-2xl p-8 md:p-12 text-white overflow-hidden relative shadow-xl">
          {/* decorative circles */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 right-32 w-40 h-40 bg-[#F47920]/10 rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-white/80">
                <Activity size={12} /> Portal Corporativo
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                Portal APSIS
              </h1>
              <p className="text-lg text-white/75 leading-relaxed">
                Gestão integrada de operações, projetos e inteligência corporativa
              </p>

              {/* Dynamic insight ticker */}
              <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-3 mt-2">
                <Bell size={15} className="text-[#F9A15A] flex-shrink-0" />
                <p className="text-sm text-white/85 leading-snug">
                  <span className="font-semibold text-white">Insight do dia: </span>
                  3 projetos com entrega esta semana e 5 propostas aguardando follow-up
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 flex-shrink-0">
              <Link to={createPageUrl("Projetos")}
                className="flex items-center gap-2 bg-white text-[#1A4731] font-semibold px-6 py-3 rounded-xl text-sm hover:bg-[#F4F6F4] transition-colors shadow-md">
                <AlertTriangle size={15} className="text-amber-500" />
                Ver Pendências Críticas
              </Link>
              <Link to={createPageUrl("Dashboard")}
                className="flex items-center gap-2 bg-[#F47920] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-[#e86d15] transition-colors shadow-md">
                <BarChart3 size={15} />
                Abrir Dashboard Executivo
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── SEU DIA ── */}
        <div className="fade-up fade-up-2">
          <SeuDiaBloco />
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="fade-up fade-up-3 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-[#F47920]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#5C7060]">Ações Rápidas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <Link key={idx} to={createPageUrl(action.page)}
                  className={`action-btn group flex items-center gap-3 ${action.bg} border border-transparent hover:border-[#DDE3DE] rounded-xl px-4 py-3.5 cursor-pointer`}>
                  <div className={`w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0`}>
                    <Icon size={15} className={action.color} />
                  </div>
                  <span className="text-sm font-medium text-[#1A2B1F] leading-tight">{action.label}</span>
                  <ArrowRight size={13} className="ml-auto text-[#DDE3DE] group-hover:text-[#5C7060] transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── PRIMARY MODULES ── */}
        <div className="fade-up fade-up-3 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-[#1A4731]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#5C7060]">Módulos Principais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {primaryModules.map(({ name, icon: Icon, page, description, bg }) => (
              <Link key={page} to={createPageUrl(page)} className="group card-lift">
                <div className={`bg-gradient-to-br ${bg} rounded-2xl p-6 text-white shadow-md overflow-hidden relative h-full`}>
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/8 rounded-full" />
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent rounded-b-2xl" />
                  <div className="relative z-10 space-y-4">
                    <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Icon size={22} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">{name}</h3>
                      <p className="text-sm text-white/70 leading-snug">{description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-white/60 text-xs font-medium group-hover:text-white/90 transition-colors pt-1">
                      Acessar módulo <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── SECONDARY MODULES + INTELLIGENCE ── */}
        <div className="fade-up fade-up-4 grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Secondary modules */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-[#5C7060]" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#5C7060]">Suporte & Ferramentas</h2>
            </div>
            <div className="space-y-3">
              {secondaryModules.map(({ name, icon: Icon, page, description }) => (
                <Link key={page} to={createPageUrl(page)} className="group card-lift block">
                  <div className="bg-white border border-[#DDE3DE] rounded-xl px-5 py-4 flex items-center gap-4 hover:border-[#1A4731]/30">
                    <div className="w-10 h-10 bg-[#F4F6F4] rounded-xl flex items-center justify-center group-hover:bg-[#1A4731]/8 transition-colors flex-shrink-0">
                      <Icon size={18} className="text-[#1A4731]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1A2B1F] text-sm">{name}</p>
                      <p className="text-xs text-[#5C7060] mt-0.5">{description}</p>
                    </div>
                    <ChevronRight size={15} className="text-[#DDE3DE] group-hover:text-[#F47920] transition-colors flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Intelligence block */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-purple-500" />
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#5C7060]">Sugestões Inteligentes</h2>
            </div>
            <div className="bg-white border border-[#DDE3DE] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-5 border-b border-[#F4F6F4] flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <Brain size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1A2B1F] text-sm">AXON — Análise Contextual</h3>
                  <p className="text-xs text-[#5C7060]">Insights gerados com base no estado atual das operações</p>
                </div>
              </div>
              <div className="divide-y divide-[#F4F6F4]">
                {insights.map((ins, idx) => {
                  const Icon = ins.icon;
                  return (
                    <div key={idx} className="flex items-start gap-4 px-5 py-4 hover:bg-[#F4F6F4]/50 transition-colors">
                      <div className={`w-8 h-8 ${ins.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <Icon size={15} className={ins.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A2B1F] leading-snug">{ins.text}</p>
                      </div>
                      <Link to={createPageUrl(ins.page)}
                        className="flex-shrink-0 text-xs font-semibold text-[#F47920] hover:text-[#e86d15] flex items-center gap-1 whitespace-nowrap">
                        {ins.cta} <ArrowRight size={11} />
                      </Link>
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-4 bg-[#F4F6F4]/50 flex items-center justify-between">
                <p className="text-xs text-[#5C7060] flex items-center gap-1.5">
                  <Clock size={11} /> Atualizado agora
                </p>
                <Link to={createPageUrl("AxonIA")}
                  className="text-xs font-semibold text-[#1A4731] hover:text-[#F47920] flex items-center gap-1 transition-colors">
                  Ver análise completa <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}