import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, CheckCircle2, XCircle, AlertCircle, Download, ExternalLink, Loader2, Send } from "lucide-react";
import OnboardingTimeline from "./OnboardingTimeline";
import OnboardingStatusBadge from "./OnboardingStatusBadge";
import { toast } from "sonner";

const DOCUMENT_LABELS = {
  doc_foto: "Documento com foto",
  cpf_doc: "CPF",
  comprovante_residencia: "Comprovante de residência",
  certidao: "Certidão de nascimento/casamento",
  ctps: "CTPS",
  comprovante_bancario: "Comprovante bancário",
  comprovante_escolaridade: "Comprovante de escolaridade",
  foto_3x4: "Foto 3x4",
  documentos_dependentes: "Docs de dependentes",
};

const TABS = ["Resumo", "Formulário", "Documentos", "Timeline", "Integração Caju"];

export default function OnboardingDetalheModal({ onboarding, onClose, onRefresh }) {
  const [tab, setTab] = useState("Resumo");
  const [novaObs, setNovaObs] = useState("");
  const [salvando, setSalvando] = useState(false);
  const formData = onboarding.form_data || {};
  const docs = formData.documentos_enviados || {};

  const aprovar = async () => {
    setSalvando(true);
    await supabase.from("employees_onboarding").update({
      overall_status: "aprovado_rh", updated_at: new Date().toISOString()
    }).eq("id", onboarding.id);
    await supabase.from("onboarding_status_history").insert({
      onboarding_id: onboarding.id, status: "aprovado_rh",
      observacao: novaObs || "Aprovado pelo RH", criado_em: new Date().toISOString()
    });
    toast.success("Onboarding aprovado!");
    onRefresh();
    onClose();
  };

  const solicitarCorrecao = async () => {
    if (!novaObs) { toast.error("Informe o motivo da correção"); return; }
    setSalvando(true);
    await supabase.from("employees_onboarding").update({
      overall_status: "documentacao_pendente", updated_at: new Date().toISOString()
    }).eq("id", onboarding.id);
    await supabase.from("onboarding_status_history").insert({
      onboarding_id: onboarding.id, status: "documentacao_pendente",
      observacao: novaObs, criado_em: new Date().toISOString()
    });
    toast.success("Solicitação de correção registrada");
    onRefresh();
    onClose();
  };

  const enviarCaju = async () => {
    setSalvando(true);
    await supabase.from("employees_onboarding").update({
      overall_status: "aguardando_integracao",
      integration_status: "em_fila",
      updated_at: new Date().toISOString()
    }).eq("id", onboarding.id);
    await supabase.from("onboarding_status_history").insert({
      onboarding_id: onboarding.id, status: "aguardando_integracao",
      observacao: "Enviado para fila de integração Caju", criado_em: new Date().toISOString()
    });
    toast.success("Enviado para integração Caju (modo fallback ativo)");
    onRefresh();
    onClose();
  };

  const exportarDados = () => {
    const data = { ...onboarding, form_data: formData };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `onboarding-${onboarding.nome_completo?.replace(/ /g, "_") || onboarding.id}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{onboarding.nome_completo || "Novo colaborador"}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">{onboarding.cargo}</span>
              {onboarding.area && <span className="text-xs text-slate-300">•</span>}
              <span className="text-xs text-slate-400">{onboarding.area}</span>
              <OnboardingStatusBadge status={onboarding.overall_status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportarDados} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="Exportar dados">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? "text-[#1A4731] border-[#1A4731]" : "text-slate-400 border-transparent hover:text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* RESUMO */}
          {tab === "Resumo" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "E-mail", value: onboarding.email_pessoal },
                  { label: "CPF", value: onboarding.cpf ? `***.***.${onboarding.cpf.slice(-6)}` : "—" },
                  { label: "Admissão prevista", value: onboarding.data_admissao_prevista ? new Date(onboarding.data_admissao_prevista).toLocaleDateString("pt-BR") : "—" },
                  { label: "Contratação", value: onboarding.tipo_contratacao },
                  { label: "Gestor", value: onboarding.gestor_nome },
                  { label: "Unidade", value: onboarding.unidade },
                  { label: "Status formulário", value: <OnboardingStatusBadge status={onboarding.public_form_status} /> },
                  { label: "Status documentos", value: <OnboardingStatusBadge status={onboarding.document_status} type="doc" /> },
                  { label: "Status integração", value: <OnboardingStatusBadge status={onboarding.integration_status} type="integration" /> },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{value || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Observação / Justificativa</label>
                  <textarea
                    value={novaObs}
                    onChange={e => setNovaObs(e.target.value)}
                    rows={2}
                    placeholder="Observação para o histórico..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20"
                  />
                </div>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={aprovar}
                    disabled={salvando}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Aprovar Onboarding
                  </button>
                  <button
                    onClick={solicitarCorrecao}
                    disabled={salvando}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                  >
                    <AlertCircle className="w-4 h-4" /> Solicitar Correção
                  </button>
                  <button
                    onClick={enviarCaju}
                    disabled={salvando}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1A4731] text-white rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" /> Enviar para Caju
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FORMULÁRIO */}
          {tab === "Formulário" && (
            <div className="space-y-5">
              {[
                {
                  title: "Dados Pessoais",
                  fields: [
                    ["Nome completo", formData.nome_completo],
                    ["Nome social", formData.nome_social],
                    ["CPF", formData.cpf ? `***.***.${formData.cpf.slice(-6)}` : "—"],
                    ["RG", formData.rg],
                    ["Data de nascimento", formData.data_nascimento ? new Date(formData.data_nascimento).toLocaleDateString("pt-BR") : "—"],
                    ["Estado civil", formData.estado_civil],
                    ["E-mail pessoal", formData.email_pessoal],
                    ["Telefone", formData.telefone],
                    ["Nome da mãe", formData.nome_mae],
                    ["PIS/NIS", formData.pis_nis],
                  ]
                },
                {
                  title: "Endereço",
                  fields: [
                    ["CEP", formData.cep],
                    ["Logradouro", `${formData.logradouro || ""} ${formData.numero || ""} ${formData.complemento || ""}`],
                    ["Bairro", formData.bairro],
                    ["Cidade / Estado", `${formData.cidade || ""} / ${formData.estado || ""}`],
                  ]
                },
                {
                  title: "Dados Bancários",
                  fields: [
                    ["Banco", formData.banco],
                    ["Agência / Conta", `${formData.agencia || ""}  /  ${formData.conta || ""}`],
                    ["Tipo", formData.tipo_conta],
                    ["Pix", formData.chave_pix],
                  ]
                },
              ].map(section => (
                <div key={section.title} className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                  <h4 className="font-semibold text-slate-700 text-sm mb-3">{section.title}</h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {section.fields.map(([label, value]) => value ? (
                      <div key={label}>
                        <p className="text-xs text-slate-400">{label}</p>
                        <p className="text-sm text-slate-700">{value}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              ))}

              {formData.dependentes?.length > 0 && (
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-5">
                  <h4 className="font-semibold text-slate-700 text-sm mb-3">Dependentes ({formData.dependentes.length})</h4>
                  {formData.dependentes.map((dep, i) => (
                    <div key={i} className="text-sm text-slate-700 border-b border-slate-200 py-2 last:border-0">
                      <strong>{dep.nome}</strong> — {dep.parentesco} — IR: {dep.dep_ir === "sim" ? "Sim" : "Não"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTOS */}
          {tab === "Documentos" && (
            <div className="space-y-3">
              {Object.keys(DOCUMENT_LABELS).map(docId => {
                const doc = docs[docId];
                return (
                  <div key={docId} className="flex items-center justify-between bg-slate-50 rounded-xl border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                      {doc ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-800">{DOCUMENT_LABELS[docId]}</p>
                        {doc && <p className="text-xs text-slate-400">{doc.nome} • {new Date(doc.enviado_em).toLocaleDateString("pt-BR")}</p>}
                      </div>
                    </div>
                    {doc && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Abrir
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TIMELINE */}
          {tab === "Timeline" && (
            <OnboardingTimeline onboardingId={onboarding.id} />
          )}

          {/* INTEGRAÇÃO CAJU */}
          {tab === "Integração Caju" && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-sm font-semibold text-amber-800">Modo Fallback Ativo</p>
                <p className="text-xs text-amber-600 mt-1">
                  A integração direta com a API Caju ainda não está configurada. O sistema gera exportações estruturadas
                  para processamento manual. Configure as credenciais nas Configurações do módulo.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-700">Payload para Caju</p>
                <pre className="bg-slate-900 text-green-400 rounded-xl p-4 text-xs overflow-x-auto">
{JSON.stringify({
  full_name: formData.nome_completo,
  cpf: formData.cpf,
  personal_email: formData.email_pessoal,
  phone: formData.telefone,
  admission_date: onboarding.data_admissao_prevista,
  address: {
    zip: formData.cep,
    street: formData.logradouro,
    number: formData.numero,
    city: formData.cidade,
    state: formData.estado,
  },
  work_model: formData.modelo_trabalho,
  food_benefit: formData.necessita_alimentacao === "sim",
  meal_benefit: formData.necessita_refeicao === "sim",
  transportation_benefit: formData.necessita_vt === "sim",
  transportation_cost: parseFloat(formData.custo_mensal_vt) || 0,
  manager: formData.gestor_nome,
  unit: onboarding.unidade,
  contract_type: onboarding.tipo_contratacao,
  dependents_count: formData.dependentes?.length || 0,
}, null, 2)}
                </pre>
                <button
                  onClick={() => {
                    const payload = JSON.stringify({ full_name: formData.nome_completo, cpf: formData.cpf }, null, 2);
                    navigator.clipboard.writeText(payload);
                    toast.success("Payload copiado!");
                  }}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> Exportar payload JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}