import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/40af152e2_Design-sem-nome.png";

export default function ClientForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await base44.functions.invoke('clientAuth', {
        action: 'request_password_reset',
        email,
      });

      if (response.data.success) {
        setSent(true);
      } else {
        setError(response.data.message || 'E-mail não encontrado.');
      }
    } catch (err) {
      setError('Erro ao processar solicitação.');
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
            <h1 className="text-2xl font-bold text-white mb-2">Recuperar Senha</h1>
            <p className="text-white/80 text-sm">Redefina seu acesso com segurança</p>
          </div>

          <div className="p-8">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
                  Insira seu e-mail cadastrado. Enviaremos um link para redefinir sua senha.
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A2B1F] mb-2">E-mail</label>
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
                  {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
              </form>
            ) : (
              <div className="space-y-6 text-center py-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
                  <CheckCircle2 size={24} className="text-green-600 mx-auto" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-[#1A2B1F] mb-2">Link Enviado</h2>
                  <p className="text-sm text-[#5C7060] mb-4">
                    Verifique seu e-mail para o link de recuperação. Ele expira em 2 horas.
                  </p>
                  <p className="text-xs text-[#5C7060] bg-[#F4F6F4] rounded-lg p-3 mb-4">
                    Se não receber, verifique a pasta de spam.
                  </p>
                </div>

                <button
                  onClick={() => setSent(false)}
                  className="w-full text-[#F47920] font-medium hover:underline text-sm"
                >
                  Tentar outro e-mail
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#F4F6F4] px-8 py-4 border-t border-[#DDE3DE] text-center text-xs text-[#5C7060] space-y-2">
            <Link to="/ClientLogin" className="block text-[#F47920] hover:underline font-medium">
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}