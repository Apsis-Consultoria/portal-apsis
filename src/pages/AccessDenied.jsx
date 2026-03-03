import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ShieldOff, ArrowLeft, Mail, Phone } from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/19aad65cc_Logohorizontal-Fundobranco.png";

export default function AccessDenied() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        base44.entities.AuditLog.create({
          usuario: u.full_name,
          email: u.email,
          acao: "ACCESS_DENIED",
          resultado: "Bloqueado",
          modulo: "Auth",
          detalhes: `Acesso negado para ${u.email} (role: ${u.role || "user"})`
        }).catch(() => {});
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-[#DDE3DE] shadow-xl p-10 max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={LOGO} alt="APSIS" className="h-10 object-contain" />
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center">
            <ShieldOff size={36} className="text-red-400" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-[#1A2B1F] mb-2">Acesso Negado</h1>
          <p className="text-sm text-[#5C7060] leading-relaxed">
            Você não possui permissão para acessar este recurso.
            {user && <><br /><span className="font-medium text-[#1A2B1F]">{user.full_name}</span> ({user.role || "user"})</>}
          </p>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          <a href={createPageUrl("Dashboard")}
            className="flex items-center justify-center gap-2 bg-[#1A4731] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#245E40] transition-colors">
            <ArrowLeft size={15} /> Ir para o Dashboard
          </a>
          <a href="mailto:ti@apsis.com.br"
            className="flex items-center justify-center gap-2 border border-[#DDE3DE] text-[#5C7060] rounded-xl py-3 text-sm hover:bg-[#F4F6F4] transition-colors">
            <Mail size={14} /> Solicitar acesso — ti@apsis.com.br
          </a>
        </div>

        <div className="mt-6 pt-4 border-t border-[#DDE3DE] flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#F47920]" />
          <p className="text-[10px] text-[#5C7060]">Portal APSIS · Tax & Accounting Advisory</p>
        </div>
      </div>
    </div>
  );
}