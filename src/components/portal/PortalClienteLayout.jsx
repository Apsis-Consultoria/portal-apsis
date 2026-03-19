import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquare, FileText, ClipboardList, FolderKanban, User, LogOut, Menu, X, Bell } from 'lucide-react';
import { useClientAuth } from '@/lib/ClientAuthContext';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40af152e2_Design-sem-nome.png";

export default function PortalClienteLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useClientAuth();

  const handleLogout = () => {
    logout();
    navigate('/ClientLogin');
  };

  const navItems = [
    { label: 'Início', path: '/PortalClienteInicio', icon: Home },
    { label: 'Comunicação', path: '/PortalClienteComunicacao', icon: MessageSquare },
    { label: 'Documentos', path: '/PortalClienteDocumentos', icon: FileText },
    { label: 'Solicitações', path: '/PortalClienteSolicitacoes', icon: ClipboardList },
    { label: 'Projetos', path: '/PortalClienteProjetos', icon: FolderKanban },
    { label: 'Perfil e Segurança', path: '/PortalClientePerfil', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#FAFBFA] flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        :root {
          --apsis-green: #1A4731;
          --apsis-green-light: #245E40;
          --apsis-orange: #F47920;
          --border: #DDE3DE;
          --text-primary: #1A2B1F;
          --text-secondary: #5C7060;
          --surface: #FFFFFF;
          --surface-2: #F4F6F4;
        }
        .portal-nav-item {
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }
        .portal-nav-item.active {
          background: rgba(244, 121, 32, 0.1);
          border-left: 3px solid #F47920;
          color: #F47920;
        }
        .portal-nav-item:hover {
          background: rgba(244, 121, 32, 0.05);
        }
      `}</style>

      {/* Header Premium */}
      <header className="bg-white border-b border-[var(--border)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/PortalClienteInicio" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={LOGO_URL} alt="APSIS" className="w-10 h-10 object-contain rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">Portal APSIS</h1>
              <p className="text-xs text-[var(--text-secondary)]">Seu Workspace Seguro</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-[var(--surface-2)] rounded-lg transition-colors relative">
              <Bell size={20} className="text-[var(--text-secondary)]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--apsis-orange)] rounded-full" />
            </button>

            <div className="hidden md:flex items-center gap-3 pl-4 border-l border-[var(--border)]">
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--text-primary)]">{user?.nome_cliente || 'Cliente'}</p>
                <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[var(--apsis-orange)] flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-white" />
              </div>
            </div>

            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex w-64 bg-white border-r border-[var(--border)] flex-col">
          <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`portal-nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer ${
                    active ? 'active text-[var(--apsis-orange)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-6 border-t border-[var(--border)]">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={18} />
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <aside className="absolute left-0 top-0 w-64 h-full bg-white flex flex-col z-50">
              <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`portal-nav-item flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer ${
                        active ? 'active text-[var(--apsis-orange)]' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="p-6 border-t border-[var(--border)]">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}