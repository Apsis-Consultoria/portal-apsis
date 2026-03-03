import { createPageUrl } from "@/utils";
import { ShieldOff } from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/19aad65cc_Logohorizontal-Fundobranco.png";

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-[#DDE3DE] shadow-xl p-10 max-w-md w-full text-center">
        <img src={LOGO} alt="APSIS" className="h-10 object-contain mx-auto mb-8" />
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <ShieldOff size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-[#1A2B1F] mb-2">Acesso Negado</h1>
        <p className="text-sm text-[#5C7060] mb-6">
          Você não tem permissão para acessar este recurso.<br />
          Entre em contato com o administrador do sistema.
        </p>
        <div className="flex flex-col gap-3">
          <a href={createPageUrl("Dashboard")}
            className="block bg-[#1A4731] text-white rounded-xl py-2.5 text-sm font-medium hover:bg-[#245E40] transition-colors">
            Ir para o Dashboard
          </a>
          <a href="mailto:ti@apsis.com.br"
            className="block border border-[#DDE3DE] text-[#5C7060] rounded-xl py-2.5 text-sm hover:bg-[#F4F6F4] transition-colors">
            Solicitar acesso
          </a>
        </div>
      </div>
    </div>
  );
}