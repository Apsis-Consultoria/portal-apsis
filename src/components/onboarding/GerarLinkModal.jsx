import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, Link2, Copy, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function GerarLinkModal({ onboarding, onClose, onSuccess }) {
  const [generating, setGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const gerarLink = async () => {
    setGenerating(true);
    try {
      // Invalidate old active links
      await supabase
        .from("onboarding_links")
        .update({ status: "substituido" })
        .eq("onboarding_id", onboarding.id)
        .eq("status", "ativo");

      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const { error } = await supabase.from("onboarding_links").insert({
        onboarding_id: onboarding.id,
        token,
        status: "ativo",
        data_expiracao: expiresAt.toISOString(),
        criado_em: new Date().toISOString(),
      });

      if (error) throw error;

      await supabase.from("employees_onboarding").update({
        overall_status: "link_enviado",
        updated_at: new Date().toISOString(),
      }).eq("id", onboarding.id);

      await supabase.from("onboarding_status_history").insert({
        onboarding_id: onboarding.id,
        status: "link_enviado",
        observacao: "Link público gerado pelo RH",
        criado_em: new Date().toISOString(),
      });

      const link = `${window.location.origin}/OnboardingForm?token=${token}`;
      setGeneratedLink(link);
      onSuccess?.();
    } catch (e) {
      toast.error("Erro ao gerar link: " + e.message);
    }
    setGenerating(false);
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    await navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A4731]/10 rounded-lg flex items-center justify-center">
              <Link2 className="w-4 h-4 text-[#1A4731]" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Gerar Link Público</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Candidate info */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-xs text-slate-400 font-medium mb-1">Colaborador</p>
            <p className="font-semibold text-slate-800">{onboarding.nome_completo || "Nome não preenchido"}</p>
            <p className="text-sm text-slate-500">{onboarding.cargo || "Cargo não definido"} {onboarding.area ? `— ${onboarding.area}` : ""}</p>
          </div>

          {!generatedLink ? (
            <>
              <div className="space-y-2">
                <p className="text-sm text-slate-700 font-medium">O que acontece ao gerar:</p>
                <ul className="space-y-1.5">
                  {[
                    "Um link único e seguro é criado",
                    "O link expira automaticamente em 30 dias",
                    "Links anteriores são invalidados",
                    "O status do onboarding é atualizado",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-[#1A4731] flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={gerarLink}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 bg-[#1A4731] hover:bg-[#245E40] text-white py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : <><Link2 className="w-4 h-4" /> Gerar Link Público</>}
              </button>
            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Link gerado com sucesso!</span>
                </div>
                <p className="text-xs text-green-600 break-all font-mono leading-relaxed">{generatedLink}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={copyLink}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    copied
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {copied ? <><CheckCircle2 className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar link</>}
                </button>
                <a
                  href={generatedLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-[#F47920] hover:bg-[#d96b1a] text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir página
                </a>
              </div>
              <p className="text-xs text-slate-400 text-center">
                Envie este link ao colaborador por e-mail ou WhatsApp. O link expira em 30 dias.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}