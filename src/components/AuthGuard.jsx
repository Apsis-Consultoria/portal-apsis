import { useEffect, useState } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "@/lib/msalConfig";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40af152e2_Design-sem-nome.png";

export default function AuthGuard({ children }) {
  const { instance, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [loading, setLoading] = useState(false);

  // Limpa estado travado do MSAL no carregamento
  useEffect(() => {
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.includes('interaction.status') || k.includes('msal.interaction')) {
        localStorage.removeItem(k);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (loading || inProgress !== InteractionStatus.None) return;
    setLoading(true);
    try {
      await instance.loginRedirect(loginRequest);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="min-h-screen bg-[#1A4731] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white/30 border-t-[#F47920] rounded-full animate-spin" />
          <p className="text-white font-medium">Autenticando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1A4731] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
          <img src={LOGO_URL} alt="APSIS" className="w-16 h-16 object-contain mx-auto mb-6 rounded" />
          <h1 className="text-2xl font-bold text-[#1A4731] mb-1">Portal APSIS</h1>
          <p className="text-gray-500 text-sm mb-8">Faça login com sua conta corporativa</p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#F47920] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#d96910] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
              <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
            </svg>
            Entrar com Microsoft
          </button>

          <p className="text-xs text-gray-400 mt-6">
            Acesso restrito a colaboradores APSIS.<br />
            Use sua conta <span className="font-medium">@apsis.com.br</span>
          </p>
        </div>
      </div>
    );
  }

  return children;
}