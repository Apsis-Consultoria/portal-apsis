import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { AlertCircle, Loader2, Shield, ArrowLeft, CheckCircle } from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/19aad65cc_Logohorizontal-Fundobranco.png";
const CORPORATE_DOMAINS = ["apsis.com.br", "apsis.com"];
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 min

function validateCPF(cpf) {
  const c = cpf.replace(/\D/g, "");
  if (c.length !== 11 || /^(.)\1+$/.test(c)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(c[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(c[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
}

export default function Recover() {
  const [form, setForm] = useState({ nome: "", cpf: "", email: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const attemptsRef = useRef(0);
  const lockoutRef = useRef(null);

  const validate = () => {
    const e = {};
    if (!form.nome.trim() || form.nome.trim().split(" ").length < 2)
      e.nome = "Informe o nome completo (nome e sobrenome).";
    if (!validateCPF(form.cpf))
      e.cpf = "CPF inválido.";
    const domain = form.email.split("@")[1]?.toLowerCase();
    if (!CORPORATE_DOMAINS.includes(domain))
      e.email = "Utilize seu e-mail corporativo APSIS.";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Rate limit / lockout
    if (lockoutRef.current && Date.now() < lockoutRef.current) {
      const mins = Math.ceil((lockoutRef.current - Date.now()) / 60000);
      setErrors({ global: `Muitas tentativas. Aguarde ${mins} minuto(s) e tente novamente.` });
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    attemptsRef.current += 1;
    if (attemptsRef.current >= MAX_ATTEMPTS) {
      lockoutRef.current = Date.now() + LOCKOUT_MS;
      attemptsRef.current = 0;
    }

    try {
      // Registra auditoria (sem CPF em claro)
      await base44.entities.AuditLog.create({
        email: form.email,
        acao: "RECOVERY_REQUEST",
        resultado: "Sucesso",
        modulo: "Auth",
        detalhes: `Solicitação de recuperação para e-mail ${form.email}`
      });

      // Envia e-mail com instruções (SSO-only: instrução Microsoft)
      await base44.integrations.Core.SendEmail({
        to: form.email,
        subject: "Portal APSIS — Recuperação de Acesso",
        body: `Olá ${form.nome.trim()},\n\nRecebemos uma solicitação de recuperação de acesso ao Portal APSIS.\n\nComo o acesso é gerenciado pelo Microsoft Entra ID (SSO corporativo), a redefinição de senha deve ser realizada diretamente pelo portal Microsoft:\n\nhttps://account.activedirectory.windowsazure.com\n\nSe precisar de suporte adicional, entre em contato com a TI APSIS: ti@apsis.com.br\n\nSe você não solicitou esta recuperação, ignore este e-mail.\n\n— Equipe APSIS · Segurança de TI`
      });
    } catch {
      // Intencionalmente silencioso para não revelar se e-mail existe
      await base44.entities.AuditLog.create({
        email: form.email,
        acao: "RECOVERY_REQUEST",
        resultado: "Falha",
        modulo: "Auth",
        detalhes: "Falha ao enviar e-mail de recuperação"
      });
    }

    setLoading(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d2016 0%, #1A4731 40%, #0f2a1c 70%, #162a1a 100%)" }}>

      {/* Background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <svg className="w-full h-full"><defs><pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>
      </div>
      <div className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-72 h-72 rounded-full border border-white/5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 25px 80px rgba(0,0,0,0.5)" }}>

          <div className="h-1 bg-gradient-to-r from-[#1A4731] via-[#F47920] to-[#1A4731]" />

          <div className="px-10 py-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-xl p-3 shadow border border-gray-100">
                <img src={LOGO} alt="APSIS" className="h-10 object-contain" />
              </div>
            </div>

            {!done ? (
              <>
                <div className="text-center mb-6">
                  <h1 className="text-lg font-bold text-[#1A2B1F]">Recuperação de Acesso</h1>
                  <p className="text-xs text-[#5C7060] mt-1">Informe seus dados cadastrais para solicitar a recuperação</p>
                </div>

                {errors.global && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2.5 rounded-xl mb-4">
                    <AlertCircle size={13} /> {errors.global}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { label: "Nome Completo", field: "nome", type: "text", placeholder: "Seu nome completo" },
                    { label: "CPF", field: "cpf", type: "text", placeholder: "000.000.000-00" },
                    { label: "E-mail Corporativo APSIS", field: "email", type: "email", placeholder: "nome@apsis.com.br" },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-xs font-medium text-[#5C7060] mb-1">{f.label}</label>
                      <input type={f.type} placeholder={f.placeholder} required
                        value={form[f.field]}
                        onChange={ev => setForm(d => ({ ...d, [f.field]: ev.target.value }))}
                        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 ${errors[f.field] ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[#F47920] focus:ring-[#F47920]/20"}`} />
                      {errors[f.field] && <p className="text-xs text-red-500 mt-1">{errors[f.field]}</p>}
                    </div>
                  ))}

                  <button type="submit" disabled={loading}
                    className="w-full bg-[#F47920] hover:bg-[#d96a1a] text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    Solicitar Recuperação
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={26} className="text-emerald-600" />
                </div>
                <h2 className="font-bold text-[#1A2B1F] mb-2">Solicitação Enviada</h2>
                <p className="text-sm text-[#5C7060]">
                  Se os dados informados estiverem corretos, você receberá um e-mail com as instruções de recuperação no endereço corporativo informado.
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <a href={createPageUrl("Dashboard")}
                className="inline-flex items-center gap-1.5 text-sm text-[#5C7060] hover:text-[#1A4731] transition-colors">
                <ArrowLeft size={13} /> Voltar ao portal
              </a>
            </div>
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