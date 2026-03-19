import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, Loader2, Shield } from 'lucide-react';
import { useClientAuth } from '@/lib/ClientAuthContext';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40af152e2_Design-sem-nome.png";

export default function ClientLogin() {
  const navigate = useNavigate();
  const { login } = useClientAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Chamar função de autenticação do backend
      const response = await base44.functions.invoke('clientAuth', {
        action: 'login',
        email,
        password,
      });

      if (response.data.success) {
        // Armazenar sessão
        login(response.data.user, response.data.sessionToken, response.data.expiresIn);
        navigate('/PortalClienteInicio');
      } else {
        setError(response.data.message || 'Falha na autenticação. Verifique seus dados.');
      }
    } catch (err) {
      setError('Erro ao processar login. Tente novamente.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A4731] via-[#245E40] to-[#1A4731] flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header com cor */}
          <div className="bg-gradient-to-r from-[#1A4731] to-[#245E40] px-8 py-12 text-center">
            <img src={LOGO_URL} alt="APSIS" className="w-14 h-14 mx-auto mb-4 rounded-lg" />
            <h1 className="text-2xl font-bold text-white mb-2">Portal APSIS</h1>
            <p className="text-white/80 text-sm">Acesso Seguro</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1A2B1F] mb-2">E-mail</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7060]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50 focus:border-[#F47920] text-sm"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-semibold text-[#1A2B1F] mb-2">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7060]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50 focus:border-[#F47920] text-sm"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Botão Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#F47920] to-[#F9A15A] text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
              {loading ? 'Entrando...' : 'Entrar com Segurança'}
            </button>

            {/* Links */}
            <div className="space-y-2 text-center">
              <Link
                to="/ClientForgotPassword"
                className="block text-sm text-[#F47920] hover:underline font-medium"
              >
                Esqueci minha senha
              </Link>
              <p className="text-xs text-[#5C7060]">
                Primeiro acesso?{' '}
                <Link to="/ClientFirstAccess" className="text-[#F47920] hover:underline font-medium">
                  Ative sua conta
                </Link>
              </p>
            </div>
          </form>

          {/* Segurança */}
          <div className="bg-[#F4F6F4] px-8 py-4 flex items-center gap-2 text-xs text-[#5C7060] border-t border-[#DDE3DE]">
            <Shield size={14} />
            <span>Conexão criptografada • Dados protegidos</span>
          </div>
        </div>

        {/* Info adicional */}
        <p className="text-center text-white/60 text-xs mt-6">
          © 2026 APSIS Consultoria. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}