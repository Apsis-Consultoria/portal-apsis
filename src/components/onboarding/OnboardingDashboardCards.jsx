import { Users, FileText, AlertCircle, CheckCircle2, Clock, Zap, XCircle } from "lucide-react";

export default function OnboardingDashboardCards({ onboardings }) {
  const total = onboardings.length;
  const pendentes = onboardings.filter(o => ["link_nao_enviado", "link_enviado"].includes(o.status_formulario)).length;
  const enviados = onboardings.filter(o => o.status_formulario === "enviado").length;
  const emValidacao = onboardings.filter(o => o.status_formulario === "em_validacao").length;
  const aprovados = onboardings.filter(o => o.status_formulario === "aprovado_rh").length;
  const integrados = onboardings.filter(o => o.status_formulario === "integrado").length;
  const erros = onboardings.filter(o => o.status_formulario === "erro_integracao").length;

  const cards = [
    { label: "Total Onboardings", value: total, icon: Users, color: "bg-slate-50 border-slate-200", iconColor: "text-slate-600 bg-slate-100" },
    { label: "Admissões Pendentes", value: pendentes, icon: Clock, color: "bg-blue-50 border-blue-200", iconColor: "text-blue-600 bg-blue-100" },
    { label: "Formulários Enviados", value: enviados, icon: FileText, color: "bg-purple-50 border-purple-200", iconColor: "text-purple-600 bg-purple-100" },
    { label: "Em Validação RH", value: emValidacao, icon: AlertCircle, color: "bg-yellow-50 border-yellow-200", iconColor: "text-yellow-600 bg-yellow-100" },
    { label: "Aprovados RH", value: aprovados, icon: CheckCircle2, color: "bg-green-50 border-green-200", iconColor: "text-green-600 bg-green-100" },
    { label: "Integrados Caju", value: integrados, icon: Zap, color: "bg-emerald-50 border-emerald-200", iconColor: "text-emerald-600 bg-emerald-100" },
    { label: "Erros Integração", value: erros, icon: XCircle, color: "bg-red-50 border-red-200", iconColor: "text-red-600 bg-red-100" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.label} className={`rounded-xl border p-4 ${c.color}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${c.iconColor}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold text-slate-800">{c.value}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{c.label}</p>
          </div>
        );
      })}
    </div>
  );
}