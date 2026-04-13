import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CheckCircle2, ChevronRight, ChevronLeft, Upload, X, Loader2, Shield, Clock, User, MapPin, Briefcase, Users, Bus, Utensils, CreditCard, Phone, FileText, FileCheck, AlertCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const LOGO_URL = "https://media.base44.com/images/public/69a1fc4b60b4c477ea324579/32a8b27c7_Logohorizontal-Fundobranco1.png";

const SECTIONS = [
  { id: "intro", label: "Boas-vindas", icon: User },
  { id: "pessoal", label: "Dados Pessoais", icon: User },
  { id: "endereco", label: "Endereço", icon: MapPin },
  { id: "profissional", label: "Dados Profissionais", icon: Briefcase },
  { id: "dependentes", label: "Dependentes", icon: Users },
  { id: "transporte", label: "Transporte", icon: Bus },
  { id: "beneficios", label: "Benefícios", icon: Utensils },
  { id: "bancario", label: "Dados Bancários", icon: CreditCard },
  { id: "emergencia", label: "Contato de Emergência", icon: Phone },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "declaracoes", label: "Declarações", icon: FileCheck },
];

const DOCUMENT_TYPES = [
  { key: "doc_foto", label: "Documento oficial com foto (RG/CNH)", required: true },
  { key: "doc_cpf", label: "CPF", required: true },
  { key: "doc_comp_residencia", label: "Comprovante de residência", required: true },
  { key: "doc_certidao", label: "Certidão de nascimento ou casamento", required: true },
  { key: "doc_ctps", label: "Carteira de Trabalho Digital", required: true },
  { key: "doc_bancario", label: "Comprovante bancário", required: true },
  { key: "doc_escolaridade", label: "Comprovante de escolaridade", required: false },
  { key: "doc_foto_3x4", label: "Foto 3x4", required: false },
  { key: "doc_dependentes", label: "Documentos de dependentes", required: false },
  { key: "doc_outros", label: "Outros documentos", required: false },
];

export default function OnboardingPublico() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [linkData, setLinkData] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(0);
  const [uploadingDoc, setUploadingDoc] = useState({});

  const [form, setForm] = useState({
    nome_completo: "", nome_social: "", cpf: "", rg: "", orgao_emissor: "",
    data_nascimento: "", estado_civil: "", nacionalidade: "Brasileira",
    naturalidade: "", sexo: "", email_pessoal: "", telefone: "", telefone_sec: "",
    nome_mae: "", nome_pai: "", pis_nis: "", ctps: "", titulo_eleitor: "", reservista: "",
    cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", pais: "Brasil", tipo_residencia: "", tempo_residencia: "",
    cargo: "", area: "", unidade: "", gestor_nome: "", tipo_contratacao: "", jornada: "",
    data_admissao_prev: "", outro_vinculo: false, precisa_equipamento: false, obs_admissao: "",
    dependentes: [],
    precisa_vt: false, endereco_origem_vt: "", modal_transporte: "", qtd_conducoes: "",
    linhas_trajeto: "", custo_diario_vt: "", custo_mensal_vt: "", dias_presenciais: "", obs_transporte: "",
    beneficio_alimentacao: false, beneficio_refeicao: false, modelo_trabalho: "",
    restricao_alimentar: false, desc_restricao: "", cidade_atuacao: "", obs_beneficios: "",
    banco: "", agencia: "", conta: "", tipo_conta: "", chave_pix: "",
    titular_conta: "", cpf_titular: "", obs_bancario: "",
    emergencia_nome: "", emergencia_parentesco: "", emergencia_telefone: "", emergencia_email: "", emergencia_obs: "",
    documentos: {},
    decl_veracidade: false, decl_autorizacao: false, decl_lgpd: false, assinatura_nome: "",
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  useEffect(() => {
    if (!token) { setError("Link inválido ou expirado."); setLoading(false); return; }
    loadLink();
  }, [token]);

  const loadLink = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("onboarding_links")
        .select("*, onboarding:employees_onboarding(*)")
        .eq("token", token)
        .single();
      if (error || !data) throw new Error("Link não encontrado");
      if (data.status === "expirado") throw new Error("Este link expirou.");
      if (data.status === "concluido") { setSubmitted(true); setLoading(false); return; }
      setLinkData(data);
      if (data.onboarding) {
        setForm(f => ({ ...f, ...data.onboarding }));
        const savedDocs = data.onboarding.documentos || {};
        setForm(f => ({ ...f, documentos: savedDocs }));
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const saveDraft = async () => {
    if (!linkData) return;
    const payload = { ...form, documentos: JSON.stringify(form.documentos), dependentes: JSON.stringify(form.dependentes), status_formulario: "em_preenchimento", updated_at: new Date().toISOString() };
    await supabase.from("employees_onboarding").update(payload).eq("id", linkData.onboarding_id);
    toast.success("Progresso salvo!");
  };

  const handleCEP = async (cep) => {
    set("cep", cep);
    if (cep.replace(/\D/g, "").length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`);
        const d = await res.json();
        if (!d.erro) {
          setForm(f => ({ ...f, logradouro: d.logradouro, bairro: d.bairro, cidade: d.localidade, estado: d.uf }));
        }
      } catch {}
    }
  };

  const addDependente = () => {
    setForm(f => ({ ...f, dependentes: [...f.dependentes, { nome: "", cpf: "", nascimento: "", parentesco: "", dep_ir: false, dep_beneficio: false, obs: "" }] }));
  };

  const removeDependente = (i) => {
    setForm(f => ({ ...f, dependentes: f.dependentes.filter((_, idx) => idx !== i) }));
  };

  const updateDependente = (i, field, value) => {
    setForm(f => ({ ...f, dependentes: f.dependentes.map((d, idx) => idx === i ? { ...d, [field]: value } : d) }));
  };

  const handleDocUpload = async (docKey, file) => {
    if (!file) return;
    setUploadingDoc(u => ({ ...u, [docKey]: true }));
    try {
      const safeName = file.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `onboarding/${token}/${docKey}-${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("onboarding-docs").upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("onboarding-docs").getPublicUrl(fileName);
      setForm(f => ({ ...f, documentos: { ...f.documentos, [docKey]: { url: urlData.publicUrl, name: file.name, size: file.size, uploaded_at: new Date().toISOString() } } }));
      toast.success("Arquivo enviado!");
    } catch (err) {
      toast.error("Erro ao enviar arquivo: " + err.message);
    }
    setUploadingDoc(u => ({ ...u, [docKey]: false }));
  };

  const handleSubmit = async () => {
    if (!form.decl_veracidade || !form.decl_autorizacao || !form.decl_lgpd) {
      toast.error("Aceite todas as declarações para continuar"); return;
    }
    if (!form.assinatura_nome.trim()) {
      toast.error("Digite seu nome completo como assinatura"); return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        documentos: JSON.stringify(form.documentos),
        dependentes: JSON.stringify(form.dependentes),
        status_formulario: "enviado",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await supabase.from("employees_onboarding").update(payload).eq("id", linkData.onboarding_id);
      await supabase.from("onboarding_links").update({ status: "concluido" }).eq("token", token);
      await supabase.from("onboarding_status_history").insert({ onboarding_id: linkData.onboarding_id, status: "enviado", descricao: "Formulário enviado pelo colaborador", created_at: new Date().toISOString() });
      setSubmitted(true);
    } catch (err) {
      toast.error("Erro ao enviar formulário: " + err.message);
    }
    setSubmitting(false);
  };

  const progress = Math.round(((step) / (SECTIONS.length - 1)) * 100);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e2818] to-[#1A4731] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e2818] to-[#1A4731] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
        <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Link Inválido</h2>
        <p className="text-slate-500">{error}</p>
        <p className="text-slate-400 text-sm mt-3">Entre em contato com o RH da APSIS para solicitar um novo link.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-[#0e2818] to-[#1A4731] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <img src={LOGO_URL} alt="APSIS" className="w-36 mx-auto mb-6 object-contain" />
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Formulário Enviado!</h2>
        <p className="text-slate-600 mb-2">Seu formulário de admissão foi recebido com sucesso.</p>
        <p className="text-slate-500 text-sm mb-6">A equipe de RH da APSIS irá revisar seus dados e documentos. Você receberá um contato em breve.</p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
          <strong>Próximos passos:</strong> Aguarde o contato do RH para confirmação da sua admissão.
        </div>
      </div>
    </div>
  );

  const currentSection = SECTIONS[step];

  return (
    <div className="min-h-screen bg-[#f4f6f4]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <img src={LOGO_URL} alt="APSIS" className="h-8 object-contain" />
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-green-600" />
              Dados protegidos por criptografia
            </div>
            <button onClick={saveDraft} className="text-xs text-[#1A4731] font-medium hover:underline">Salvar progresso</button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-3xl mx-auto px-6 pb-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>{currentSection.label}</span>
            <span>{progress}% concluído</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-[#F47920] h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Step indicator */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button key={s.id} onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  i === step ? "bg-[#1A4731] text-white" :
                  i < step ? "bg-green-100 text-green-700" :
                  "bg-slate-100 text-slate-400"
                }`}>
                {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1A4731] to-[#245E40] px-6 py-5">
            <div className="flex items-center gap-3">
              {(() => { const Icon = currentSection.icon; return <Icon className="w-5 h-5 text-white/70" />; })()}
              <h2 className="text-white font-semibold text-lg">{currentSection.label}</h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* INTRO */}
            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Bem-vindo ao seu processo de admissão!</h3>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
                    Este formulário é destinado ao seu processo de admissão na APSIS. Preencha os dados com atenção e anexe todos os documentos solicitados.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">~20 min</p>
                    <p className="text-xs text-slate-500">Tempo estimado</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Dados seguros</p>
                    <p className="text-xs text-slate-500">Proteção LGPD</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4 text-center">
                    <FileCheck className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Salvar e retornar</p>
                    <p className="text-xs text-slate-500">Continue depois</p>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
                  <strong className="text-slate-700">🔒 Privacidade e Segurança:</strong> Seus dados serão utilizados exclusivamente para fins de admissão e cadastro de benefícios, conforme a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
                </div>
              </div>
            )}

            {/* PESSOAL */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome completo *" value={form.nome_completo} onChange={v => set("nome_completo", v)} />
                <Field label="Nome social" value={form.nome_social} onChange={v => set("nome_social", v)} />
                <Field label="CPF *" value={form.cpf} onChange={v => set("cpf", v)} placeholder="000.000.000-00" />
                <Field label="RG *" value={form.rg} onChange={v => set("rg", v)} />
                <Field label="Órgão emissor" value={form.orgao_emissor} onChange={v => set("orgao_emissor", v)} />
                <Field label="Data de nascimento *" value={form.data_nascimento} onChange={v => set("data_nascimento", v)} type="date" />
                <SelectField label="Estado civil *" value={form.estado_civil} onChange={v => set("estado_civil", v)} options={["Solteiro(a)","Casado(a)","Divorciado(a)","Viúvo(a)","União estável"]} />
                <Field label="Nacionalidade" value={form.nacionalidade} onChange={v => set("nacionalidade", v)} />
                <Field label="Naturalidade" value={form.naturalidade} onChange={v => set("naturalidade", v)} />
                <SelectField label="Sexo *" value={form.sexo} onChange={v => set("sexo", v)} options={["Masculino","Feminino","Não-binário","Prefiro não informar"]} />
                <Field label="E-mail pessoal *" value={form.email_pessoal} onChange={v => set("email_pessoal", v)} type="email" />
                <Field label="Telefone celular *" value={form.telefone} onChange={v => set("telefone", v)} placeholder="(00) 00000-0000" />
                <Field label="Telefone secundário" value={form.telefone_sec} onChange={v => set("telefone_sec", v)} />
                <Field label="Nome da mãe *" value={form.nome_mae} onChange={v => set("nome_mae", v)} />
                <Field label="Nome do pai" value={form.nome_pai} onChange={v => set("nome_pai", v)} />
                <Field label="PIS / NIS" value={form.pis_nis} onChange={v => set("pis_nis", v)} />
                <Field label="CTPS Digital" value={form.ctps} onChange={v => set("ctps", v)} />
                <Field label="Título de eleitor" value={form.titulo_eleitor} onChange={v => set("titulo_eleitor", v)} />
                <Field label="Certificado de reservista" value={form.reservista} onChange={v => set("reservista", v)} />
              </div>
            )}

            {/* ENDEREÇO */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="CEP *" value={form.cep} onChange={handleCEP} placeholder="00000-000" />
                <Field label="Logradouro *" value={form.logradouro} onChange={v => set("logradouro", v)} colSpan />
                <Field label="Número *" value={form.numero} onChange={v => set("numero", v)} />
                <Field label="Complemento" value={form.complemento} onChange={v => set("complemento", v)} />
                <Field label="Bairro *" value={form.bairro} onChange={v => set("bairro", v)} />
                <Field label="Cidade *" value={form.cidade} onChange={v => set("cidade", v)} />
                <Field label="Estado *" value={form.estado} onChange={v => set("estado", v)} />
                <Field label="País" value={form.pais} onChange={v => set("pais", v)} />
                <SelectField label="Tipo de residência" value={form.tipo_residencia} onChange={v => set("tipo_residencia", v)} options={["Própria","Alugada","Cedida","Financiada","Outros"]} />
                <Field label="Tempo de residência" value={form.tempo_residencia} onChange={v => set("tempo_residencia", v)} placeholder="Ex: 2 anos" />
              </div>
            )}

            {/* PROFISSIONAL */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Cargo" value={form.cargo} onChange={v => set("cargo", v)} />
                <Field label="Área / Setor" value={form.area} onChange={v => set("area", v)} />
                <Field label="Unidade / Localidade" value={form.unidade} onChange={v => set("unidade", v)} />
                <Field label="Gestor responsável" value={form.gestor_nome} onChange={v => set("gestor_nome", v)} />
                <SelectField label="Tipo de contratação" value={form.tipo_contratacao} onChange={v => set("tipo_contratacao", v)} options={["CLT","PJ","Estágio","Temporário","Apprentice"]} />
                <SelectField label="Jornada de trabalho" value={form.jornada} onChange={v => set("jornada", v)} options={["8h/dia – 44h/sem","6h/dia – 30h/sem","4h/dia – 20h/sem","Flexível"]} />
                <Field label="Data prevista de admissão" value={form.data_admissao_prev} onChange={v => set("data_admissao_prev", v)} type="date" />
                <div className="sm:col-span-2 space-y-3">
                  <CheckField label="Possui outro vínculo empregatício?" value={form.outro_vinculo} onChange={v => set("outro_vinculo", v)} />
                  <CheckField label="Necessita de equipamento de trabalho?" value={form.precisa_equipamento} onChange={v => set("precisa_equipamento", v)} />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-slate-700 font-medium">Observações para admissão</Label>
                  <Textarea value={form.obs_admissao} onChange={e => set("obs_admissao", e.target.value)} rows={3} className="resize-none" />
                </div>
              </div>
            )}

            {/* DEPENDENTES */}
            {step === 4 && (
              <div className="space-y-5">
                {form.dependentes.length === 0 && (
                  <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm mb-3">Nenhum dependente cadastrado</p>
                    <Button variant="outline" onClick={addDependente} className="gap-2">
                      <Plus className="w-4 h-4" /> Adicionar dependente
                    </Button>
                  </div>
                )}
                {form.dependentes.map((dep, i) => (
                  <div key={i} className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">Dependente {i + 1}</span>
                      <button onClick={() => removeDependente(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Nome completo *" value={dep.nome} onChange={v => updateDependente(i, "nome", v)} />
                      <Field label="CPF" value={dep.cpf} onChange={v => updateDependente(i, "cpf", v)} />
                      <Field label="Data de nascimento *" value={dep.nascimento} onChange={v => updateDependente(i, "nascimento", v)} type="date" />
                      <SelectField label="Grau de parentesco *" value={dep.parentesco} onChange={v => updateDependente(i, "parentesco", v)} options={["Cônjuge","Filho(a)","Pai","Mãe","Enteado(a)","Tutelado(a)"]} />
                      <CheckField label="Dependente para IR" value={dep.dep_ir} onChange={v => updateDependente(i, "dep_ir", v)} />
                      <CheckField label="Dependente para benefício" value={dep.dep_beneficio} onChange={v => updateDependente(i, "dep_beneficio", v)} />
                    </div>
                  </div>
                ))}
                {form.dependentes.length > 0 && (
                  <Button variant="outline" onClick={addDependente} className="gap-2 w-full">
                    <Plus className="w-4 h-4" /> Adicionar dependente
                  </Button>
                )}
              </div>
            )}

            {/* TRANSPORTE */}
            {step === 5 && (
              <div className="space-y-4">
                <CheckField label="Necessita de vale-transporte?" value={form.precisa_vt} onChange={v => set("precisa_vt", v)} />
                {form.precisa_vt && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <Field label="Endereço de origem" value={form.endereco_origem_vt} onChange={v => set("endereco_origem_vt", v)} />
                    <SelectField label="Modal principal" value={form.modal_transporte} onChange={v => set("modal_transporte", v)} options={["Ônibus","Metrô","Trem","Integrado","VLT","Outro"]} />
                    <Field label="Qtd. de conduções/dia" value={form.qtd_conducoes} onChange={v => set("qtd_conducoes", v)} type="number" />
                    <Field label="Dias presenciais/semana" value={form.dias_presenciais} onChange={v => set("dias_presenciais", v)} type="number" />
                    <Field label="Custo diário estimado (R$)" value={form.custo_diario_vt} onChange={v => set("custo_diario_vt", v)} />
                    <Field label="Custo mensal estimado (R$)" value={form.custo_mensal_vt} onChange={v => set("custo_mensal_vt", v)} />
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-slate-700 font-medium">Linhas / Descrição do trajeto</Label>
                      <Textarea value={form.linhas_trajeto} onChange={e => set("linhas_trajeto", e.target.value)} rows={2} placeholder="Ex: Linha 1 - Azul do Metrô + Ônibus 107..." className="resize-none" />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-slate-700 font-medium">Observações de deslocamento</Label>
                      <Textarea value={form.obs_transporte} onChange={e => set("obs_transporte", e.target.value)} rows={2} className="resize-none" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BENEFÍCIOS */}
            {step === 6 && (
              <div className="space-y-4">
                <CheckField label="Necessita benefício de alimentação?" value={form.beneficio_alimentacao} onChange={v => set("beneficio_alimentacao", v)} />
                <CheckField label="Necessita benefício de refeição?" value={form.beneficio_refeicao} onChange={v => set("beneficio_refeicao", v)} />
                <SelectField label="Modelo de trabalho" value={form.modelo_trabalho} onChange={v => set("modelo_trabalho", v)} options={["Presencial","Híbrido","Remoto"]} />
                <Field label="Cidade de atuação" value={form.cidade_atuacao} onChange={v => set("cidade_atuacao", v)} />
                <CheckField label="Possui restrição alimentar?" value={form.restricao_alimentar} onChange={v => set("restricao_alimentar", v)} />
                {form.restricao_alimentar && (
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 font-medium">Descrição da restrição</Label>
                    <Textarea value={form.desc_restricao} onChange={e => set("desc_restricao", e.target.value)} rows={2} className="resize-none" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-medium">Observações para o RH</Label>
                  <Textarea value={form.obs_beneficios} onChange={e => set("obs_beneficios", e.target.value)} rows={3} className="resize-none" />
                </div>
              </div>
            )}

            {/* BANCÁRIO */}
            {step === 7 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Banco *" value={form.banco} onChange={v => set("banco", v)} placeholder="Ex: Itaú, Bradesco, Nubank..." />
                <Field label="Agência" value={form.agencia} onChange={v => set("agencia", v)} />
                <Field label="Número da conta" value={form.conta} onChange={v => set("conta", v)} />
                <SelectField label="Tipo de conta" value={form.tipo_conta} onChange={v => set("tipo_conta", v)} options={["Corrente","Poupança","Salário","Pagamento"]} />
                <Field label="Chave Pix" value={form.chave_pix} onChange={v => set("chave_pix", v)} />
                <Field label="Nome do titular" value={form.titular_conta} onChange={v => set("titular_conta", v)} />
                <Field label="CPF do titular" value={form.cpf_titular} onChange={v => set("cpf_titular", v)} />
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-slate-700 font-medium">Observação</Label>
                  <Textarea value={form.obs_bancario} onChange={e => set("obs_bancario", e.target.value)} rows={2} className="resize-none" />
                </div>
              </div>
            )}

            {/* EMERGÊNCIA */}
            {step === 8 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nome completo *" value={form.emergencia_nome} onChange={v => set("emergencia_nome", v)} />
                <Field label="Grau de parentesco *" value={form.emergencia_parentesco} onChange={v => set("emergencia_parentesco", v)} />
                <Field label="Telefone *" value={form.emergencia_telefone} onChange={v => set("emergencia_telefone", v)} />
                <Field label="E-mail" value={form.emergencia_email} onChange={v => set("emergencia_email", v)} type="email" />
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-slate-700 font-medium">Observações</Label>
                  <Textarea value={form.emergencia_obs} onChange={e => set("emergencia_obs", e.target.value)} rows={2} className="resize-none" />
                </div>
              </div>
            )}

            {/* DOCUMENTOS */}
            {step === 9 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Faça upload de cada documento solicitado. Arquivos aceitos: PDF, JPG, PNG, DOCX (máx. 10MB cada).</p>
                {DOCUMENT_TYPES.map((doc) => {
                  const uploaded = form.documentos[doc.key];
                  return (
                    <div key={doc.key} className={`border rounded-xl p-4 flex items-center justify-between gap-4 ${uploaded ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        {uploaded ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" /> : <FileText className="w-5 h-5 text-slate-400 flex-shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{doc.label}</p>
                          {uploaded && <p className="text-xs text-slate-500 truncate">{uploaded.name}</p>}
                          {!uploaded && doc.required && <Badge variant="outline" className="text-xs border-red-200 text-red-500 mt-0.5">Obrigatório</Badge>}
                        </div>
                      </div>
                      <label className="flex-shrink-0 cursor-pointer">
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={e => handleDocUpload(doc.key, e.target.files[0])} />
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${uploaded ? "border-green-300 text-green-700 bg-white hover:bg-green-50" : "border-[#1A4731] text-[#1A4731] bg-white hover:bg-green-50"}`}>
                          {uploadingDoc[doc.key] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          {uploaded ? "Substituir" : "Enviar"}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            {/* DECLARAÇÕES */}
            {step === 10 && (
              <div className="space-y-5">
                <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                  Ao enviar este formulário, você confirma que todas as informações prestadas são verdadeiras e completas, sujeitas às sanções legais em caso de falsidade.
                </div>
                <div className="space-y-4">
                  <DeclCheckbox label="Declaro que todas as informações fornecidas neste formulário são verdadeiras e corretas." value={form.decl_veracidade} onChange={v => set("decl_veracidade", v)} />
                  <DeclCheckbox label="Autorizo a APSIS a utilizar meus dados para fins de admissão, cadastro em benefícios e demais procedimentos legais de contratação." value={form.decl_autorizacao} onChange={v => set("decl_autorizacao", v)} />
                  <DeclCheckbox label="Concordo com a Política de Privacidade e consinto com o tratamento dos meus dados pessoais conforme a LGPD (Lei 13.709/2018)." value={form.decl_lgpd} onChange={v => set("decl_lgpd", v)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 font-semibold">Assinatura digital — Digite seu nome completo *</Label>
                  <Input value={form.assinatura_nome} onChange={e => set("assinatura_nome", e.target.value)} placeholder="Seu nome completo como assinatura" className="font-medium text-slate-800" style={{ fontStyle: "italic" }} />
                  <p className="text-xs text-slate-400">Esta assinatura digital tem valor legal conforme MP 2.200-2/2001.</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
            <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="gap-2">
              <ChevronLeft className="w-4 h-4" /> Anterior
            </Button>
            {step < SECTIONS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} className="bg-[#1A4731] hover:bg-[#245E40] text-white gap-2">
                Próximo <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="bg-[#F47920] hover:bg-[#d96b1a] text-white gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {submitting ? "Enviando..." : "Enviar Formulário"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "", colSpan = false }) {
  return (
    <div className={`space-y-1.5 ${colSpan ? "sm:col-span-2" : ""}`}>
      <Label className="text-slate-700 font-medium text-sm">{label}</Label>
      <Input type={type} value={value || ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="bg-white" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-700 font-medium text-sm">{label}</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className="bg-white"><SelectValue placeholder="Selecione..." /></SelectTrigger>
        <SelectContent>{options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function CheckField({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50" onClick={() => onChange(!value)}>
      <Checkbox checked={!!value} onCheckedChange={onChange} />
      <span className="text-sm text-slate-700 font-medium">{label}</span>
    </div>
  );
}

function DeclCheckbox({ label, value, onChange }) {
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${value ? "border-green-300 bg-green-50" : "border-slate-200 bg-white hover:bg-slate-50"}`} onClick={() => onChange(!value)}>
      <Checkbox checked={!!value} onCheckedChange={onChange} className="mt-0.5" />
      <span className="text-sm text-slate-700 leading-relaxed">{label}</span>
    </div>
  );
}