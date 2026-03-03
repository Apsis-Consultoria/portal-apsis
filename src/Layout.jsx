import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard, GitBranch, FolderKanban,
  DollarSign, BarChart3, FileText, ChevronLeft,
  ChevronRight, Bell, User, Menu, X, Megaphone, TrendingUp, PieChart, Settings
} from "lucide-react";
import AssistantWidget from "@/components/AssistantWidget";

const navItems = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "Pipeline", page: "Pipeline", icon: GitBranch },
  { label: "Projetos", page: "Projetos", icon: FolderKanban },
  { label: "Financeiro", page: "Financeiro", icon: DollarSign },
  { label: "Budget", page: "Budget", icon: BarChart3 },
  { label: "Relatórios", page: "Relatorios", icon: FileText },
  {
    label: "Marketing", page: "Marketing", icon: Megaphone,
    children: [
      { label: "Comercial", page: "MarketingComercial", icon: TrendingUp },
      { label: "Orçado vs Real", page: "MarketingOrcado", icon: PieChart },
    ]
  },
  { label: "Configurações", page: "Configuracoes", icon: Settings },
];

// Cores APSIS: verde escuro #1A4731, laranja #F47920, cinza claro #E8EDE9
const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40af152e2_Design-sem-nome.png";

export default function Layout({ children, currentPageName }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDepartamento, setUserDepartamento] = useState(null);
  const [openSubmenus, setOpenSubmenus] = useState({});

  const toggleSubmenu = (label) => setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));

  const isMarketingPage = ["Marketing","MarketingComercial","MarketingOrcado"].includes(currentPageName);

  useEffect(() => {
    base44.auth.me().then(async (user) => {
      if (!user) return;
      // Busca colaborador pelo email do usuário logado
      const cols = await base44.entities.Colaborador.filter({ email: user.email });
      if (cols && cols.length > 0 && cols[0].departamento) {
        setUserDepartamento(cols[0].departamento);
      }
    }).catch(() => {});
  }, []);

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
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? "justify-center px-2" : ""}`}>
          <img src={LOGO_URL} alt="APSIS" className="w-9 h-9 object-contain flex-shrink-0 rounded" />
          {!collapsed && (
            <div>
              <div className="text-white font-bold text-base leading-tight tracking-wide">Portal APSIS</div>
              {userDepartamento && (
                <div className="text-white/40 text-[10px] font-medium tracking-wider uppercase truncate max-w-[160px]">{userDepartamento}</div>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map(({ label, page, icon: Icon, children: subItems }) => {
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
                  {!collapsed && submenuOpen && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                      {subItems.map(({ label: subLabel, page: subPage, icon: SubIcon }) => {
                        const subActive = currentPageName === subPage;
                        return (
                          <Link key={subPage} to={createPageUrl(subPage)}
                            className={`nav-item flex items-center gap-2 px-2 py-2 rounded-l-lg ${subActive ? "active" : ""}`}>
                            <SubIcon size={14} className={subActive ? "text-[var(--apsis-orange)]" : "text-white/40"} />
                            <span className={`text-xs font-medium ${subActive ? "text-white" : "text-white/50"}`}>{subLabel}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={page}
                to={createPageUrl(page)}
                className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-l-lg cursor-pointer ${isActive ? "active" : ""}`}
              >
                <Icon size={18} className={isActive ? "text-[var(--apsis-orange)]" : "text-white/50"} />
                {!collapsed && (
                  <span className={`text-sm font-medium ${isActive ? "text-white" : "text-white/60"}`}>{label}</span>
                )}
              </Link>
            );
          })}
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
            <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="APSIS" className="w-8 h-8 object-contain rounded" />
                <div>
                  <div className="text-white font-bold text-sm">Portal APSIS</div>
                  {userDepartamento && (
                    <div className="text-white/40 text-[10px] uppercase tracking-wider truncate max-w-[150px]">{userDepartamento}</div>
                  )}
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)}><X size={18} className="text-white/50" /></button>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-0.5">
              {navItems.map(({ label, page, icon: Icon, children: subItems }) => {
                const isActive = currentPageName === page;
                const hasChildren = subItems && subItems.length > 0;
                const isGroupActive = hasChildren && subItems.some(s => s.page === currentPageName);
                const submenuOpen = openSubmenus[label] ?? isGroupActive;

                if (hasChildren) {
                  return (
                    <div key={label}>
                      <button onClick={() => toggleSubmenu(label)}
                        className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-l-lg ${isGroupActive ? "active" : ""}`}>
                        <Icon size={18} className={isGroupActive ? "text-[var(--apsis-orange)]" : "text-white/50"} />
                        <span className={`flex-1 text-left text-sm font-medium ${isGroupActive ? "text-white" : "text-white/60"}`}>{label}</span>
                        <ChevronRight size={13} className={`text-white/30 transition-transform ${submenuOpen ? "rotate-90" : ""}`} />
                      </button>
                      {submenuOpen && (
                        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                          {subItems.map(({ label: subLabel, page: subPage, icon: SubIcon }) => {
                            const subActive = currentPageName === subPage;
                            return (
                              <Link key={subPage} to={createPageUrl(subPage)} onClick={() => setMobileOpen(false)}
                                className={`nav-item flex items-center gap-2 px-2 py-2 rounded-l-lg ${subActive ? "active" : ""}`}>
                                <SubIcon size={14} className={subActive ? "text-[var(--apsis-orange)]" : "text-white/40"} />
                                <span className={`text-xs font-medium ${subActive ? "text-white" : "text-white/50"}`}>{subLabel}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link key={page} to={createPageUrl(page)} onClick={() => setMobileOpen(false)}
                    className={`nav-item flex items-center gap-3 px-3 py-2.5 rounded-l-lg ${isActive ? "active" : ""}`}>
                    <Icon size={18} className={isActive ? "text-[var(--apsis-orange)]" : "text-white/50"} />
                    <span className={`text-sm font-medium ${isActive ? "text-white" : "text-white/60"}`}>{label}</span>
                  </Link>
                );
              })}
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
            <div className="w-8 h-8 rounded-full bg-[var(--apsis-green)] flex items-center justify-center">
              <User size={14} className="text-white" />
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