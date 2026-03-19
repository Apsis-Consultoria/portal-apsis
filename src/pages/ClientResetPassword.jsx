import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40af152e2_Design-sem-nome.png";

export default function ClientResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Link inválido ou expirado.');
      setValidating(false);
    } else {
      setValidating(false);
    }
  }, [token]);

  const validatePassword = (pwd) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*]/.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(password)) {
      setError('Senha fraca. Use 8+ caracteres, maiúscula, número e símbolo (!@#$%^&*)');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const response = await base44.functions.invoke('clientAuth', {
        action: 'reset_password',
        token,
        password,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/ClientLogin'), 2000);
      } else {
        setError(response.data.message || 'Erro ao redefinir senha.');
      }
    } catch (err) {
      setError('Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A4731] via-[#245E40] to-[#1A4731] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#F47920] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Validando link...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1A4731] via-[#245E40] to-[#1A4731] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-[#1A2B1F] mb-2">Link Inválido</h1>
          <p className="text-[#5C7060] mb-6">Este link de recuperação é inválido ou expirou.</p>
          <Link
            to="/ClientForgotPassword"
            className="inline-block bg-[#F47920] text-white font-semibold px-6 py-2.5 rounded-lg hover:shadow-lg transition-all"
          >
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A4731] via-[#245E40] to-[#1A4731] flex items-center justify-center p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1A4731] to-[#245E40] px-8 py-12 text-center">
            <img src={LOGO_URL} alt="APSIS" className="w-14 h-14 mx-auto mb-4 rounded-lg" />
            <h1 className="text-2xl font-bold text-white mb-2">Nova Senha</h1>
            <p className="text-white/80 text-sm">Crie uma senha forte</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900 space-y-2">
              <p className="font-semibold">Requisitos de senha:</p>
              <ul className="text-xs space-y-1 ml-4">
                <li>✓ Mínimo 8 caracteres</li>
                <li>✓ Pelo menos 1 letra maiúscula</li>
                <li>✓ Pelo menos 1 número</li>
                <li>✓ Pelo menos 1 símbolo (!@#$%^&*)</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A2B1F] mb-2">Nova Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7060]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1A2B1F] mb-2">Confirmar Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7060]" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
                <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Senha alterada! Redirecionando...</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-[#F47920] to-[#F9A15A] text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>

          {/* Footer */}
          <div className="bg-[#F4F6F4] px-8 py-4 border-t border-[#DDE3DE] text-center text-xs text-[#5C7060]">
            <Link to="/ClientLogin" className="text-[#F47920] hover:underline font-medium">
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}