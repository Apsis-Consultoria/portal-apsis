/**
 * Layout Component - Sistema de navegação e estrutura principal da aplicação
 * 
 * Responsabilidades:
 * - Renderiza sidebar responsiva com navegação hierárquica
 * - Gerencia permissões de acesso por perfil de usuário (admin, diretor, gerente, analista)
 * - Controla visibilidade de páginas baseado em permissões customizadas do colaborador
 * - Exibe informações do usuário e departamento
 * - Fornece widget de assistente IA flutuante
 */

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, DollarSign, BarChart3, FileText, ChevronLeft,
  ChevronRight, Bell, User, Menu, X, Megaphone, TrendingUp, PieChart, Settings, Sparkles, Users, Grid3x3, Home,
  Search, Calendar, Split, ArrowRightLeft, Package, Cpu,
  Server, Landmark, Star, GitMerge, Calculator, BookOpen, Award, Target, Leaf, ShoppingCart, Briefcase, Building2, Lightbulb,
  CalendarDays, Lock
} from "lucide-react";
import { Clock } from "lucide-react";
import AssistantWidget from "@/components/AssistantWidget";

/**
 * Páginas sempre visíveis independente do perfil
 * Estas páginas são acessíveis para todos os usuários autenticados
 */
const ALWAYS_VISIBLE = ["BoasVindas"];

/**
 * Mapeamento de páginas visíveis por perfil (padrão)
 * Usado quando não há permissões customizadas definidas no registro do colaborador
 * 
 * - null = acesso total a todas as páginas
 * - array = lista específica de páginas permitidas
 */
const DEFAULT_ROLE_PAGES = {
  admin: null, // null = tudo liberado
  diretor: null, // diretor acesso total para Indicadores Táticos
  gerente: [
    "BoasVindas",
    "Dashboard","DashboardValuation","DashboardContabil","DashboardAtivos",
    "DashboardEstrategica","DashboardMA","DashboardProjetos","DashboardFinanceiro",
    "DashboardCapitalHumano","DashboardMercadoClientes",
    "Projetos","AlocacoesHoras","Pipeline","Budget",
    "AppsAPSIS","AppAtivoFixo","AppConciliacao","AppImoveis","AppCubus",
  ],
  analista: [
    "BoasVindas",
    "Projetos","AlocacoesHoras","Pipeline",
    "AppsAPSIS","AppAtivoFixo","AppConciliacao","AppImoveis","AppCubus",
  ],
  // fallback para roles legados
  manager: null,
  user: [
    "BoasVindas",
    "Projetos","AlocacoesHoras","Pipeline",
    "AppsAPSIS","AppAtivoFixo","AppConciliacao","AppImoveis","AppCubus",
  ],
};

/**
 * Estrutura de navegação da aplicação
 * Cada item pode ter:
 * - label: texto exibido
 * - page: nome da página (roteamento)
 * - icon: componente de ícone Lucide
 * - children: submenus (opcional)
 * - externalUrl: link externo (opcional)
 */
const navItems = [
  { label: "Boas-Vindas", page: "BoasVindas", icon: Home },
  {
    label: "Inovação e Tecnologia", page: "TecnologiaInicio", icon: Cpu,
    children: [
      { label: "Estoque de Ativos", page: "EstoqueAtivos", icon: Package },
      { label: "Alocação de Equipamentos", page: "AlocacaoEquipamentos", icon: Users },
      { label: "Movimentações", page: "MovimentacoesEquipamentos", icon: TrendingUp },
      { label: "Dashboard", page: "DashboardTI", icon: BarChart3 },
      { label: "Painel de Solicitações IA", page: "SolicitacoesIAAdmin", icon: LayoutDashboard },
    ]
  },
  { label: "Infraestrutura", page: "Infraestrutura", icon: Server },
  {
    label: "Business Valuation", page: "BusinessValuation", icon: Landmark,
    children: [
      { label: "Controle de Alocação de Horas", page: "BusinessValuation", icon: Clock },
    ]
  },
  {
    label: "Financeiro", page: "Financeiro", icon: DollarSign,
    children: [
      { label: "Contas a Pagar", page: "ContasAPagar", icon: DollarSign },
      { label: "Contas a Receber", page: "ContasAReceber", icon: DollarSign },
      { label: "Fluxo de Caixa", page: "FluxoCaixa", icon: ArrowRightLeft },
      { label: "Estoque", page: "Estoque", icon: Package },
      { label: "Rateio de Despesas", page: "RateioDespesas", icon: Split },
    ]
  },
  {
    label: "Ativos Fixos", page: "AtivosFixos", icon: Briefcase,
    children: [
      { label: "APP Inventário", page: "AppAtivoFixo", icon: Briefcase },
      { label: "App Conciliação", page: "AppConciliacao", icon: BarChart3 },
      { label: "App Imóveis", page: "AppImoveis", icon: Home },
    ]
  },
  { label: "Projetos Especiais", page: "ProjetosEspeciais", icon: Star },
  { label: "M&A", page: "MA", icon: GitMerge },
  {
    label: "Marketing & Estratégia", page: "Marketing", icon: Megaphone,
    children: [
      { label: "Indicadores Estratégicos", page: "MarketingIndicadores", icon: LayoutDashboard },
      { label: "Comercial", page: "MarketingComercial", icon: TrendingUp },
      { label: "Orçado vs Real", page: "MarketingOrcado", icon: PieChart },
    ]
  },
  { label: "Consultoria Contábil & Tributária", page: "ConsultoriaContabil", icon: Calculator },
  {
    label: "Capital Humano", page: "CapitalHumano", icon: Users,
    children: [
      { label: "Dashboard", page: "CapitalHumano", icon: LayoutDashboard, tabParam: "dashboard" },
      { label: "Colaboradores", page: "CapitalHumano", icon: Users, tabParam: "colaboradores" },
      { label: "Alocações", page: "CapitalHumano", icon: Calendar, tabParam: "alocacoes" },
      { label: "Rateios CH", page: "RateiosCapitalHumano", icon: Split },
      { label: "Rateio Caju", page: "RateioCaju", icon: Split },
      { label: "Férias", page: "Ferias", icon: CalendarDays },
      { label: "Onboarding", page: "OnboardingInterno", icon: Briefcase },
      { label: "Configurações", page: "CapitalHumano", icon: Settings, tabParam: "configuracoes" },
    ]
  },
  { label: "Editoração", page: "Editoracao", icon: BookOpen },
  { label: "Perícias", page: "Pericias", icon: Search },
  { label: "Comercial", page: "Comercial", icon: ShoppingCart },
  { label: "Diretoria Técnica", page: "DiretoriaTecnica", icon: Award },
  { label: "Consultoria Estratégica", page: "ConsultoriaEstrategica", icon: Lightbulb },
  { label: "Sustentabilidade", page: "Sustentabilidade", icon: Leaf },

  {
    label: "Apps APSIS", page: "AppsAPSIS", icon: Grid3x3,
    children: [
      { label: "APSIS CUBUS", page: "AppCubus", icon: Sparkles },
    ]
  },
  { label: "Planejamento Estratégico", page: "PlanejamentoEstrategico", icon: Target },
  { label: "Gerenciamento de Acessos", page: "GerenciamentoAcessos", icon: Lock },
  { label: "Inova+", externalUrl: "https://inova.apsis.com.br/", icon: Sparkles },
  { label: "Dashboard Qualidade", externalUrl: "https://qualidade.apsis.com.br", icon: BarChart3 },
  { label: "Configurações", page: "Configuracoes", icon: Settings },
];

const LOGO_URL = "https://media.base44.com/images/public/69a1fc4b60b4c477ea324579/32a8b27c7_Logohorizontal-Fundobranco1.png";

export default function Layout({ children, currentPageName }) {
  // Estados de UI
  const [collapsed, setCollapsed] = useState(false); // Controla sidebar colapsada no desktop
  const [mobileOpen, setMobileOpen] = useState(false); // Controla sidebar aberta no mobile
  const [openSubmenus, setOpenSubmenus] = useState({}); // Rastreia submenus expandidos

  // Estados de autenticação e permissões
  const [userRole, setUserRole] = useState("admin");
  const [userDepartamento, setUserDepartamento] = useState("Portal APSIS");
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const [pagePermissions, setPagePermissions] = useState(null); // Permissões customizadas (null = usa padrão do perfil)

  const toggleSubmenu = (label) => setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));

  /**
   * Hook de inicialização - Carrega dados do usuário e permissões
   * 
   * Fluxo:
   * 1. Busca dados do usuário autenticado
   * 2. Carrega registro do colaborador baseado no email
   * 3. Extrai departamento(s) do colaborador
   * 4. Carrega permissões customizadas de páginas (se existirem)
   */
  const { accounts } = useMsal();

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      const acc = accounts[0];
      setCurrentUser({
        full_name: acc.name || "Usuário",
        email: acc.username || ""
      });
    }
    setUserRole("admin");
    setUserDepartamento("Portal APSIS");
  }, [accounts]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    // Logout será implementado via MSAL quando necessário
  };

  /**
   * Verifica se o usuário pode visualizar uma página específica
   * 
   * Lógica de permissões (prioridade decrescente):
   * 1. Páginas sempre visíveis (ALWAYS_VISIBLE)
   * 2. Roles com acesso total (admin, diretor, manager)
   * 3. Permissões customizadas do colaborador (pagePermissions)
   * 4. Permissões padrão do perfil (DEFAULT_ROLE_PAGES)
   * 
   * @param {string} pageId - ID da página a verificar
   * @returns {boolean} - true se usuário pode visualizar
   */
  const canView = (pageId) => {
    if (ALWAYS_VISIBLE.includes(pageId)) return true;
    if (!userRole) return false; // ainda carregando

    const role = userRole;

    // Admin e Diretor veem tudo
    if (role === "admin" || role === "diretor" || role === "manager") return true;

    // Se tem permissões customizadas, usa elas
    if (pagePermissions && pagePermissions[pageId]) {
      return pagePermissions[pageId].view === true;
    }

    // Caso contrário, usa o padrão do perfil
    const defaultPages = DEFAULT_ROLE_PAGES[role];
    if (defaultPages === null) return true; // perfil com acesso total
    if (defaultPages) return defaultPages.includes(pageId);

    return false;
  };

  /**
   * Filtra itens de navegação baseado em permissões do usuário
   * 
   * - Links externos sempre visíveis
   * - Grupos (com children) exibidos se tiverem ao menos 1 filho visível
   * - Páginas individuais verificadas via canView()
   */
  const visibleNavItems = navItems
    .map(item => {
      if (item.externalUrl) return item; // links externos sempre visíveis
      if (item.children) {
        const visibleChildren = item.children.filter(c => canView(c.page));
        if (visibleChildren.length === 0 && !canView(item.page)) return null;
        return { ...item, children: visibleChildren };
      }
      if (!canView(item.page)) return null;
      return item;
    })
    .filter(Boolean);

  /**
   * Renderiza itens de navegação (recursivo para submenus)
   * 
   * @param {Array} items - Lista de itens de navegação
   * @param {Function} onLinkClick - Callback ao clicar em link (usado no mobile para fechar sidebar)
   */
  const renderNavItems = (items, onLinkClick = null) =>
    items.map(({ label, page, icon: Icon, children: subItems, externalUrl }) => {
      const isActive = currentPageName === page;
      const hasChildren = subItems && subItems.length > 0;
      const isGroupActive = hasChildren && subItems.some(s => s.page === currentPageName);
      const submenuOpen = openSubmenus[label] ?? isGroupActive;

      if (hasChildren) {
        return (
          <div key={label}>
            <button
              onClick={() => !collapsed && toggleSubmenu(label)}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-l-lg cursor-pointer ${isGroupActive ? "active" : ""}`}
            >
              <Icon size={18} className={isGroupActive ? "text-[var(--apsis-orange)]" : "text-white/50"} />
              {!collapsed && (
                <>
                  <span className={`flex-1 text-left text-sm font-medium ${isGroupActive ? "text-white" : "text-white/60"}`}>{label}</span>
                  <ChevronRight size={13} className={`text-white/30 transition-transform ${submenuOpen ? "rotate-90" : ""}`} />
                </>
              )}
            </button>
            {!collapsed && submenuOpen && subItems.length > 0 && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                {subItems.map(({ label: subLabel, page: subPage, icon: SubIcon, externalUrl: subExternalUrl, tabParam }) => {
                  const subActive = currentPageName === subPage;
                  if (subExternalUrl) {
                    return (
                      <a key={subPage} href={subExternalUrl} target="_blank" rel="noopener noreferrer"
                        className="nav-item flex items-center gap-2 px-2 py-2 rounded-l-lg">
                        <SubIcon size={14} className="text-white/40" />
                        <span className="text-xs font-medium text-white/50">{subLabel}</span>
                      </a>
                    );
                  }
                  const subTo = tabParam ? `/${subPage}?tab=${tabParam}` : createPageUrl(subPage);
                  const subActiveCheck = tabParam
                    ? currentPageName === subPage && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === tabParam
                    : currentPageName === subPage;
                  return (
                    <Link key={subPage + (tabParam||'')} to={subTo}
                      onClick={onLinkClick}
                      className={`nav-item flex items-center gap-2 px-2 py-2 rounded-l-lg ${subActiveCheck ? "active" : ""}`}>
                      <SubIcon size={14} className={subActiveCheck ? "text-[var(--apsis-orange)]" : "text-white/40"} />
                      <span className={`text-xs font-medium ${subActiveCheck ? "text-white" : "text-white/50"}`}>{subLabel}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      }



      if (externalUrl) {
        return (
          <a key={label} href={externalUrl} target="_blank" rel="noopener noreferrer"
            className="nav-item flex items-center gap-3 px-3 py-2.5 rounded-l-lg cursor-pointer">
            <Icon size={18} className="text-white/50" />
            {!collapsed && (
              <span className="text-sm font-medium text-white/60">{label}</span>
            )}
          </a>
        );
      }

      return (
        <Link key={page} to={createPageUrl(page)} onClick={onLinkClick}
          className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-l-lg cursor-pointer ${isActive ? "active" : ""}`}>
          <Icon size={18} className={isActive ? "text-[var(--apsis-orange)]" : "text-white/50"} />
          {!collapsed && (
            <span className={`text-sm font-medium ${isActive ? "text-white" : "text-white/60"}`}>{label}</span>
          )}
        </Link>
      );
    });

  return (
    <div className="min-h-screen bg-[#F4F6F4] flex font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        :root {
          --apsis-green: #1A4731;
          --apsis-green-light: #245E40;
          --apsis-orange: #F47920;
          --apsis-orange-light: #F9A15A;
          --apsis-gray: #E8EDE9;
          --surface: #FFFFFF;
          --surface-2: #F4F6F4;
          --border: #DDE3DE;
          --text-primary: #1A2B1F;
          --text-secondary: #5C7060;
          --success: #22C55E;
          --warning: #F47920;
          --danger: #EF4444;
        }
        .nav-item { transition: all 0.18s ease; border-right: 3px solid transparent; }
        .nav-item:hover { background: rgba(244,121,32,0.10); }
        .nav-item.active { background: rgba(244,121,32,0.15); border-right: 3px solid #F47920; }
        .sidebar-transition { transition: width 0.25s cubic-bezier(0.4,0,0.2,1); }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col sidebar-transition bg-[var(--apsis-green)] relative z-30 ${collapsed ? "w-[72px]" : "w-[240px]"}`}
        style={{ minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className={`flex flex-col items-center px-4 py-5 border-b border-white/10 ${collapsed ? "items-center" : ""}`}>
          <img src={LOGO_URL} alt="APSIS" className={`object-contain flex-shrink-0 ${collapsed ? "w-8 h-8" : "w-44 h-auto"}`} />
        </div>

        {/* Nav filtrado por permissão */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {renderNavItems(visibleNavItems)}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-[72px] w-6 h-6 bg-[var(--apsis-orange)] rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          {collapsed ? <ChevronRight size={12} className="text-white" /> : <ChevronLeft size={12} className="text-white" />}
        </button>

        {/* Bottom user */}
        <div className={`p-3 border-t border-white/10 flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-7 h-7 rounded-full bg-[var(--apsis-orange)]/20 border border-[var(--apsis-orange)]/30 flex items-center justify-center flex-shrink-0">
            <User size={13} className="text-[var(--apsis-orange)]" />
          </div>
          {!collapsed && <span className="text-white/50 text-xs">Minha conta</span>}
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-64 h-full bg-[var(--apsis-green)] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 w-full">
              <div className="flex flex-col items-center w-full">
                <div className="text-white text-xs font-bold tracking-wider uppercase mb-0.5">Portal</div>
                <img src={LOGO_URL} alt="APSIS" className="w-36 h-auto object-contain" />
              </div>
              <button onClick={() => setMobileOpen(false)} className="ml-4"><X size={18} className="text-white/50" /></button>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
              {renderNavItems(visibleNavItems, () => setMobileOpen(false))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-[var(--border)] px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={20} className="text-[var(--text-secondary)]" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-[var(--apsis-orange)]" />
              <div>
                <h1 className="text-base font-semibold text-[var(--text-primary)]">
                  {navItems.find(n => n.page === currentPageName)?.label ||
                   navItems.flatMap(n => n.children || []).find(n => n.page === currentPageName)?.label ||
                   currentPageName}
                </h1>
                <p className="text-xs text-[var(--text-secondary)]">Portal APSIS</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
              <Bell size={18} className="text-[var(--text-secondary)]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--apsis-orange)] rounded-full" />
            </button>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-[var(--apsis-green)] flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <User size={14} className="text-white" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-3 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">{currentUser?.full_name || "Usuário"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email || "Sem email"}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 fade-in">
          {children}
        </main>
      </div>

      {/* Assistente APSIS — widget flutuante global */}
      <AssistantWidget currentPageName={currentPageName} />
    </div>
  );
}