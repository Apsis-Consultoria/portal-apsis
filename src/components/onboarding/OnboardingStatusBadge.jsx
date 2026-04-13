const STATUS_CONFIG = {
  // Overall status
  link_nao_enviado: { label: "Link não enviado", bg: "bg-slate-100", text: "text-slate-600" },
  link_enviado: { label: "Link enviado", bg: "bg-blue-100", text: "text-blue-700" },
  formulario_iniciado: { label: "Iniciado", bg: "bg-indigo-100", text: "text-indigo-700" },
  formulario_enviado: { label: "Formulário enviado", bg: "bg-violet-100", text: "text-violet-700" },
  documentacao_pendente: { label: "Doc. pendente", bg: "bg-amber-100", text: "text-amber-700" },
  em_validacao_rh: { label: "Em validação", bg: "bg-orange-100", text: "text-orange-700" },
  aprovado_rh: { label: "Aprovado RH", bg: "bg-teal-100", text: "text-teal-700" },
  aguardando_integracao: { label: "Ag. integração", bg: "bg-cyan-100", text: "text-cyan-700" },
  integrado_sucesso: { label: "Integrado", bg: "bg-green-100", text: "text-green-700" },
  erro_integracao: { label: "Erro integração", bg: "bg-red-100", text: "text-red-700" },
  admissao_concluida: { label: "Concluído", bg: "bg-emerald-100", text: "text-emerald-700" },
  // Doc status
  nao_enviado: { label: "Não enviado", bg: "bg-slate-100", text: "text-slate-500" },
  enviado: { label: "Enviado", bg: "bg-blue-100", text: "text-blue-700" },
  em_analise: { label: "Em análise", bg: "bg-amber-100", text: "text-amber-700" },
  aprovado: { label: "Aprovado", bg: "bg-green-100", text: "text-green-700" },
  rejeitado: { label: "Rejeitado", bg: "bg-red-100", text: "text-red-700" },
  // Integration status
  nao_enviado_int: { label: "Não enviado", bg: "bg-slate-100", text: "text-slate-500" },
  em_fila: { label: "Em fila", bg: "bg-blue-100", text: "text-blue-600" },
  erro_temporario: { label: "Erro temporário", bg: "bg-orange-100", text: "text-orange-600" },
  erro_definitivo: { label: "Erro definitivo", bg: "bg-red-100", text: "text-red-700" },
};

export default function OnboardingStatusBadge({ status, type }) {
  if (!status) return <span className="text-xs text-slate-300">—</span>;
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "bg-slate-100", text: "text-slate-600" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}