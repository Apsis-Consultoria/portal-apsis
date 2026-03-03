import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Eye, EyeOff, Shield, CheckCircle, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/19aad65cc_Logohorizontal-Fundobranco.png";

const POLICY = [
  { label: "Mínimo 10 caracteres", test: (p) => p.length >= 10 },
  { label: "Letra maiúscula (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "Letra minúscula (a-z)", test: (p) => /[a-z]/.test(p) },
  { label: "Número (0-9)", test: (p) => /[0-9]/.test(p) },
  { label: "Caractere especial (!@#$...)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const COMMON_PASSWORDS = ["12345678", "password", "senha123", "123456789", "qwerty123", "apsis2024", "apsis2025", "apsis2026"];

export default function ResetPassword() {
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [showNova, setShowNova] = useState(false);
  const [showConfirma, setShowConfirma] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const allPassed = POLICY.every(r => r.test(nova));
  const isCommon = COMMON_PASSWORDS.includes(nova.toLowerCase());
  const matched = nova === confirma;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allPassed) { setError("A senha não atende a todos os requisitos."); return; }
    if (isCommon) { setError("Esta senha é muito comum. Escolha uma senha mais segura."); return; }
    if (!matched) { setError("As senhas não coincidem."); return; }

    setLoading(true);

    // Aviso: em ambiente SSO-only, não há senha local. Registra auditoria e informa.
    try {
      const user = await base44.auth.me();
      await base44.entities.AuditLog.create({
        usuario: user?.full_name,
        email: user?.email,
        acao: "RESET_REQUEST",
        resultado: "Sucesso",
        modulo: "Auth",
        detalhes: "Solicitação de redefinição de senha via portal (SSO: redirecionado para Microsoft)"
      });

      // SSO-only: não há senha local, envia instrução via Microsoft
      if (user?.email) {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: "Portal APSIS — Redefinição de Senha",
          body: `Olá ${user.full_name || ""},\n\nDetectamos uma solicitação de redefinição de senha no Portal APSIS.\n\nComo o acesso é controlado pelo Microsoft Entra ID, a senha deve ser redefinida em:\nhttps://account.activedirectory.windowsazure.com\n\nSe não reconhece esta ação, contate imediatamente: ti@apsis.com.br\n\n— Equipe APSIS`
        });
      }
    } catch {}

    setLoading(false);
    setDone(true);
  };

  const strength = POLICY.filter(r => r.test(nova)).length;
  const strengthColor = strength <= 2 ? "bg-red-400" : strength <= 3 ? "bg-amber-400" : strength <= 4 ? "bg-yellow-400" : "bg-emerald-500";
  const strengthLabel = ["", "Muito fraca", "Fraca", "Moderada", "Forte", "Muito forte"][strength];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d2016 0%, #1A4731 40%, #0f2a1c 70%, #162a1a 100%)" }}>

      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <svg className="w-full h-full"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.5)" }}>

          <div className="h-1 bg-gradient-to-r from-[#1A4731] via-[#F47920] to-[#1A4731]" />

          <div className="px-10 py-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-xl p-3 shadow border border-gray-100">
                <img src={LOGO} alt="APSIS" className="h-10 object-contain" />
              </div>
            </div>

            {!done ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-lg font-bold text-[#1A2B1F]">Redefinir Senha</h1>
                  <p className="text-xs text-[#5C7060] mt-1">Crie uma nova senha segura para sua conta</p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-xl mb-4">
                    <AlertCircle size={13} /> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Nova senha */}
                  <div>
                    <label className="block text-xs font-medium text-[#5C7060] mb-1">Nova Senha</label>
                    <div className="relative">
                      <input type={showNova ? "text" : "password"} required value={nova} onChange={e => setNova(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-[#F47920] focus:ring-1 focus:ring-[#F47920]/20" />
                      <button type="button" onClick={() => setShowNova(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showNova ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Força da senha */}
                    {nova.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1,2,3,4,5].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-[#5C7060]">{strengthLabel}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirmar senha */}
                  <div>
                    <label className="block text-xs font-medium text-[#5C7060] mb-1">Confirmar Senha</label>
                    <div className="relative">
                      <input type={showConfirma ? "text" : "password"} required value={confirma} onChange={e => setConfirma(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-1 ${confirma && !matched ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[#F47920] focus:ring-[#F47920]/20"}`} />
                      <button type="button" onClick={() => setShowConfirma(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showConfirma ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirma && !matched && <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>}
                  </div>

                  {/* Checklist política */}
                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                    {POLICY.map(rule => (
                      <div key={rule.label} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${rule.test(nova) ? "bg-emerald-500" : "bg-gray-200"}`}>
                          {rule.test(nova) && <CheckCircle size={9} className="text-white" />}
                        </div>
                        <span className={`text-xs ${rule.test(nova) ? "text-emerald-700" : "text-[#5C7060]"}`}>{rule.label}</span>
                      </div>
                    ))}
                  </div>

                  <button type="submit" disabled={loading || !allPassed || !matched}
                    className="w-full bg-[#1A4731] hover:bg-[#245E40] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    Redefinir Senha
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={26} className="text-emerald-600" />
                </div>
                <h2 className="font-bold text-[#1A2B1F] mb-2">Solicitação Registrada</h2>
                <p className="text-sm text-[#5C7060] mb-5">
                  Como o Portal APSIS utiliza autenticação Microsoft (SSO), você receberá no e-mail corporativo as instruções para redefinição de senha via portal Microsoft.
                </p>
                <a href={createPageUrl("Dashboard")}
                  className="inline-flex items-center gap-2 bg-[#1A4731] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors">
                  Voltar ao Portal
                </a>
              </div>
            )}

            {!done && (
              <div className="mt-5 text-center">
                <a href={createPageUrl("Dashboard")}
                  className="inline-flex items-center gap-1.5 text-sm text-[#5C7060] hover:text-[#1A4731] transition-colors">
                  <ArrowLeft size={13} /> Voltar ao portal
                </a>
              </div>
            )}
          </div>

          <div className="px-10 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2">
            <Shield size={11} className="text-[#5C7060]" />
            <p className="text-[10px] text-[#5C7060]">Dados protegidos · APSIS © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}