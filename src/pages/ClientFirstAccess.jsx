import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40af152e2_Design-sem-nome.png";

export default function ClientFirstAccess() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: validação, 3: senha
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[!@#$%^&*]/.test(pwd);
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('clientAuth', {
        action: 'request_activation_code',
        email,
      });

      if (response.data.success) {
        setStep(2);
      } else {
        setError(response.data.message || 'E-mail não encontrado ou já ativado.');
      }
    } catch (err) {
      setError('Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('clientAuth', {
        action: 'verify_activation_code',
        email,
        code,
      });

      if (response.data.success) {
        setStep(3);
      } else {
        setError('Código inválido ou expirado.');
      }
    } catch (err) {
      setError('Erro ao verificar código.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e) => {
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
        action: 'activate_account',
        email,
        code,
        password,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/ClientLogin'), 2000);
      } else {
        setError('Erro ao ativar conta.');
      }
    } catch (err) {
      setError('Erro ao processar ativação.');
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
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1A4731] to-[#245E40] px-8 py-12 text-center">
            <img src={LOGO_URL} alt="APSIS" className="w-14 h-14 mx-auto mb-4 rounded-lg" />
            <h1 className="text-2xl font-bold text-white mb-2">Ativar Conta</h1>
            <p className="text-white/80 text-sm">Bem-vindo ao Portal APSIS</p>
          </div>

          <form onSubmit={step === 1 ? handleRequestCode : step === 2 ? handleVerifyCode : handleSetPassword} className="p-8 space-y-6">
            {/* Step 1: Email */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-[#1A2B1F] mb-2">E-mail Corporativo</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7060]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@empresa.com"
                      className="w-full pl-10 pr-4 py-2.5 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-[#5C7060] mt-2">Digite o e-mail associado à sua conta.</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#F47920] to-[#F9A15A] text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </button>
              </>
            )}

            {/* Step 2: Código */}
            {step === 2 && (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-blue-900">Enviamos um código para <strong>{email}</strong></p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2B1F] mb-2">Código de Ativação</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    className="w-full px-4 py-2.5 border border-[#DDE3DE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F47920]/50 text-center text-lg tracking-widest"
                    required
                    disabled={loading}
                    maxLength="6"
                  />
                  <p className="text-xs text-[#5C7060] mt-2">Digite o código enviado por e-mail.</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#F47920] to-[#F9A15A] text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {loading ? 'Verificando...' : 'Verificar Código'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-[#F47920] text-sm font-medium hover:underline"
                >
                  Voltar
                </button>
              </>
            )}

            {/* Step 3: Senha */}
            {step === 3 && (
              <>
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
                      disabled={loading}
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
                      disabled={loading}
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
                    <p className="text-sm text-green-700">Conta ativada! Redirecionando...</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-gradient-to-r from-[#F47920] to-[#F9A15A] text-white font-semibold py-2.5 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {loading ? 'Ativando...' : 'Ativar Conta'}
                </button>
              </>
            )}
          </form>

          {/* Footer */}
          <div className="bg-[#F4F6F4] px-8 py-4 border-t border-[#DDE3DE] text-center text-xs text-[#5C7060]">
            Já tem acesso? <Link to="/ClientLogin" className="text-[#F47920] hover:underline font-medium">Faça login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}