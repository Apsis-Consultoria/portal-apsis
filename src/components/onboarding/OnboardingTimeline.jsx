import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const TIMELINE_STEPS = [
  { key: "link_gerado", label: "Link gerado" },
  { key: "link_enviado", label: "Link enviado" },
  { key: "formulario_iniciado", label: "Primeiro acesso" },
  { key: "formulario_enviado", label: "Formulário concluído" },
  { key: "documentos_enviados", label: "Documentos anexados" },
  { key: "em_validacao_rh", label: "Revisão RH" },
  { key: "aprovado_rh", label: "Aprovado RH" },
  { key: "aguardando_integracao", label: "Integração enviada" },
  { key: "admissao_concluida", label: "Admissão concluída" },
];

export default function OnboardingTimeline({ onboardingId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!onboardingId) return;
    supabase
      .from("onboarding_status_history")
      .select("*")
      .eq("onboarding_id", onboardingId)
      .order("criado_em", { ascending: true })
      .then(({ data }) => { setHistory(data || []); setLoading(false); });
  }, [onboardingId]);

  const completedStatuses = history.map(h => h.status);

  if (loading) return <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>;

  return (
    <div className="space-y-0">
      {TIMELINE_STEPS.map((step, idx) => {
        const done = completedStatuses.includes(step.key);
        const histItem = history.find(h => h.status === step.key);
        const isLast = idx === TIMELINE_STEPS.length - 1;
        return (
          <div key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                done ? "bg-[#1A4731] text-white" : "bg-slate-100 text-slate-300"
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </div>
              {!isLast && <div className={`w-0.5 flex-1 my-1 ${done ? "bg-[#1A4731]/30" : "bg-slate-100"}`} style={{ minHeight: "24px" }} />}
            </div>
            <div className={`pb-5 ${isLast ? "" : ""}`}>
              <p className={`text-sm font-medium ${done ? "text-slate-800" : "text-slate-400"}`}>{step.label}</p>
              {histItem && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(histItem.criado_em).toLocaleString("pt-BR")}
                  {histItem.observacao && ` — ${histItem.observacao}`}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}