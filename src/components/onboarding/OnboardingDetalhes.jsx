import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { X, User, MapPin, Briefcase, Users, Bus, Utensils, CreditCard, Phone, FileText, CheckCircle2, Clock, Loader2, ChevronRight, Download, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const SECTIONS_MAP = [
  { key: "pessoal", label: "Dados Pessoais", icon: User, fields: [["nome_completo","Nome completo"],["cpf","CPF"],["rg","RG"],["data_nascimento","Nascimento"],["estado_civil","Estado civil"],["sexo","Sexo"],["email_pessoal","E-mail pessoal"],["telefone","Telefone"],["pis_nis","PIS/NIS"]] },
  { key: "endereco", label: "Endereço", icon: MapPin, fields: [["logradouro","Logradouro"],["numero","Número"],["bairro","Bairro"],["cidade","Cidade"],["estado","UF"],["cep","CEP"]] },
  { key: "profissional", label: "Profissional", icon: Briefcase, fields: [["cargo","Cargo"],["area","Área"],["unidade","Unidade"],["gestor_nome","Gestor"],["tipo_contratacao","Contratação"],["data_admissao_prev","Admissão prevista"]] },
  { key: "bancario", label: "Dados Bancários", icon: CreditCard, fields: [["banco","Banco"],["agencia","Agência"],["conta","Conta"],["tipo_conta","Tipo de conta"],["chave_pix","Chave PIX"]] },
  { key: "emergencia", label: "Contato de Emergência", icon: Phone, fields: [["emergencia_nome","Nome"],["emergencia_parentesco","Parentesco"],["emergencia_telefone","Telefone"]] },
];

const STATUS_FLOW = ["link_nao_enviado","link_enviado","em_preenchimento","enviado","doc_pendente","em_validacao","aprovado_rh","aguardando_integracao","integrado","concluido"];

export default function OnboardingDetalhes({ item, onClose, onRefresh, statusConfig }) {
  const [activeSection, setActiveSection] = useState("pessoal");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [novoStatus, setNovoStatus] = useState(item.status_formulario || "");

  const updateStatus = async () => {
    if (!novoStatus || novoStatus === item.status_formulario) return;
    setUpdatingStatus(true);
    try {
      await supabase.from("employees_onboarding").update({ status_formulario: novoStatus, updated_at: new Date().toISOString() }).eq("id", item.id);
      await supabase.from("onboarding_status_history").insert({ onboarding_id: item.id, status: novoStatus, descricao: `Status atualizado para: ${statusConfig[novoStatus]?.label}`, created_at: new Date().toISOString() });
      toast.success("Status atualizado!");
      onRefresh();
      onClose();
    } catch (err) { toast.error(err.message); }
    setUpdatingStatus(false);
  };

  const docs = (() => { try { return typeof item.documentos === "string" ? JSON.parse(item.documentos || "{}") : (item.documentos || {}); } catch { return {}; } })();
  const deps = (() => { try { return typeof item.dependentes === "string" ? JSON.parse(item.dependentes || "[]") : (item.dependentes || []); } catch { return []; } })();

  const currentStatus = statusConfig[item.status_formulario];
  const currentStep = STATUS_FLOW.indexOf(item.status_formulario);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-end overflow-hidden">
      <div className="w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1A4731] to-[#245E40] px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-white font-bold text-xl">{item.nome_completo || "—"}</h2>
              <p className="text-white/70 text-sm mt-0.5">{item.cargo || "Cargo não definido"} · {item.area || "—"}</p>
              {currentStatus && (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${currentStatus.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                  {currentStatus.label}
                </span>
              )}
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white flex-shrink-0 mt-1"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-slate-900 px-6 py-3 flex-shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {STATUS_FLOW.map((s, i) => {
              const done = i <= currentStep;
              const current = i === currentStep;
              return (
                <div key={s} className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${current ? "bg-[#F47920] ring-2 ring-[#F47920]/30" : done ? "bg-green-400" : "bg-slate-700"}`} />
                  {i < STATUS_FLOW.length - 1 && <div className={`h-px w-6 ${done && i < currentStep ? "bg-green-400" : "bg-slate-700"}`} />}
                </div>
              );
            })}
          </div>
          <p className="text-slate-400 text-xs mt-1">Progresso: etapa {currentStep + 1} de {STATUS_FLOW.length}</p>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-44 flex-shrink-0 border-r border-slate-200 bg-slate-50 overflow-y-auto">
            <nav className="py-2">
              {SECTIONS_MAP.map(s => {
                const Icon = s.icon;
                return (
                  <button key={s.key} onClick={() => setActiveSection(s.key)}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-medium transition-colors ${
                      activeSection === s.key ? "bg-white text-[#1A4731] border-r-2 border-[#1A4731]" : "text-slate-500 hover:text-slate-700 hover:bg-white"
                    }`}>
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {s.label}
                  </button>
                );
              })}
              <button onClick={() => setActiveSection("dependentes")}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-medium transition-colors ${activeSection === "dependentes" ? "bg-white text-[#1A4731] border-r-2 border-[#1A4731]" : "text-slate-500 hover:text-slate-700 hover:bg-white"}`}>
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                Dependentes
              </button>
              <button onClick={() => setActiveSection("documentos")}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-medium transition-colors ${activeSection === "documentos" ? "bg-white text-[#1A4731] border-r-2 border-[#1A4731]" : "text-slate-500 hover:text-slate-700 hover:bg-white"}`}>
                <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                Documentos
              </button>
              <button onClick={() => setActiveSection("acoes")}
                className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs font-medium transition-colors ${activeSection === "acoes" ? "bg-white text-[#1A4731] border-r-2 border-[#1A4731]" : "text-slate-500 hover:text-slate-700 hover:bg-white"}`}>
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Ações / Status
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Seções de dados */}
            {SECTIONS_MAP.find(s => s.key === activeSection) && (() => {
              const section = SECTIONS_MAP.find(s => s.key === activeSection);
              return (
                <div className="space-y-3">
                  {section.fields.map(([field, label]) => (
                    <div key={field} className="flex gap-3 py-2 border-b border-slate-100">
                      <span className="text-xs text-slate-400 w-32 flex-shrink-0 pt-0.5">{label}</span>
                      <span className="text-sm text-slate-700 font-medium">{item[field] || <span className="text-slate-300">—</span>}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Dependentes */}
            {activeSection === "dependentes" && (
              <div className="space-y-3">
                {deps.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Nenhum dependente cadastrado</p>
                ) : deps.map((d, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-4">
                    <p className="font-medium text-slate-800 mb-2">{d.nome} <span className="text-xs text-slate-400 font-normal">· {d.parentesco}</span></p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-slate-400">CPF: </span><span>{d.cpf || "—"}</span></div>
                      <div><span className="text-slate-400">Nascimento: </span><span>{d.nascimento || "—"}</span></div>
                      <div><span className="text-slate-400">Dep. IR: </span><span>{d.dep_ir ? "Sim" : "Não"}</span></div>
                      <div><span className="text-slate-400">Dep. benefício: </span><span>{d.dep_beneficio ? "Sim" : "Não"}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Documentos */}
            {activeSection === "documentos" && (
              <div className="space-y-3">
                {Object.keys(docs).length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Nenhum documento enviado</p>
                ) : Object.entries(docs).map(([key, doc]) => (
                  <a key={key} href={doc.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 border border-slate-200 rounded-xl p-3 hover:bg-slate-50 transition-colors">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">{doc.name}</p>
                      <p className="text-xs text-slate-400">{new Date(doc.uploaded_at).toLocaleString("pt-BR")}</p>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}

            {/* Ações */}
            {activeSection === "acoes" && (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3">Atualizar Status</p>
                  <div className="flex gap-3">
                    <Select value={novoStatus} onValueChange={setNovoStatus}>
                      <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button onClick={updateStatus} disabled={updatingStatus || novoStatus === item.status_formulario} className="bg-[#1A4731] hover:bg-[#245E40] text-white">
                      {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar"}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="ID do Onboarding" value={item.id} />
                  <InfoRow label="Criado em" value={item.created_at ? new Date(item.created_at).toLocaleDateString("pt-BR") : "—"} />
                  <InfoRow label="Enviado em" value={item.submitted_at ? new Date(item.submitted_at).toLocaleString("pt-BR") : "Não enviado"} />
                  <InfoRow label="Atualizado em" value={item.updated_at ? new Date(item.updated_at).toLocaleString("pt-BR") : "—"} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-3">
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-700 break-all">{value}</p>
    </div>
  );
}