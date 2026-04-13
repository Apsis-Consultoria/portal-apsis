import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  CheckCircle2, ChevronRight, ChevronLeft, Shield, Clock, Save,
  Upload, X, AlertCircle, User, MapPin, Briefcase, Users, Bus,
  UtensilsCrossed, Landmark, Phone, FileText, Lock, Loader2
} from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/69a1fc4b60b4c477ea324579/32a8b27c7_Logohorizontal-Fundobranco1.png";

const SECTIONS = [
  { id: "boas_vindas", label: "Boas-Vindas", icon: Shield },
  { id: "dados_pessoais", label: "Dados Pessoais", icon: User },
  { id: "endereco", label: "Endereço", icon: MapPin },
  { id: "dados_profissionais", label: "Dados Profissionais", icon: Briefcase },
  { id: "dependentes", label: "Dependentes", icon: Users },
  { id: "transporte", label: "Transporte", icon: Bus },
  { id: "beneficios", label: "Benefícios", icon: UtensilsCrossed },
  { id: "dados_bancarios", label: "Dados Bancários", icon: Landmark },
  { id: "contato_emergencia", label: "Contato de Emergência", icon: Phone },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "declaracoes", label: "Declarações", icon: Lock },
];

const DOCUMENT_TYPES = [
  { id: "doc_foto", label: "Documento oficial com foto (RG ou CNH)", required: true },
  { id: "cpf_doc", label: "CPF", required: true },
  { id: "comprovante_residencia", label: "Comprovante de residência", required: true },
  { id: "certidao", label: "Certidão de nascimento ou casamento", required: true },
  { id: "ctps", label: "Carteira de trabalho digital / evidência", required: true },
  { id: "comprovante_bancario", label: "Comprovante bancário", required: true },
  { id: "comprovante_escolaridade", label: "Comprovante de escolaridade", required: false },
  { id: "foto_3x4", label: "Foto 3x4", required: false },
  { id: "documentos_dependentes", label: "Documentos de dependentes", required: false },
];

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

function InputField({ label, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/30 focus:border-[#1A4731] transition-all bg-white"
      {...props}
    />
  );
}

function SelectInput({ value, onChange, children, ...props }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/30 focus:border-[#1A4731] transition-all bg-white"
      {...props}
    >
      {children}
    </select>
  );
}

function RadioGroup({ value, onChange, options }) {
  return (
    <div className="flex gap-4">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-[#1A4731]"
          />
          <span className="text-sm text-slate-700">{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

export default function OnboardingPublico() {
  // Hide internal layout when accessed as public page (full-page override)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  // Inject style to hide the app sidebar/layout when this public page is shown
  if (typeof document !== "undefined") {
    document.title = "Formulário de Admissão — APSIS";
  }

  const [loading, setLoading] = useState(true);
  const [linkData, setLinkData] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState({});

  const [form, setForm] = useState({
    // Pessoal
    nome_completo: "", nome_social: "", cpf: "", rg: "", orgao_emissor: "",
    data_nascimento: "", estado_civil: "", nacionalidade: "Brasileiro(a)",
    naturalidade: "", sexo: "", email_pessoal: "", telefone: "", telefone_secundario: "",
    nome_mae: "", nome_pai: "", pis_nis: "", ctps: "", titulo_eleitor: "", reservista: "",
    // Endereço
    cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "",
    estado: "", pais: "Brasil", tipo_residencia: "", tempo_residencia: "",
    // Profissional
    cargo: "", area: "", unidade: "", gestor_nome: "", gestor_email: "",
    tipo_contratacao: "CLT", jornada: "44h semanais", data_admissao_prevista: "",
    outro_vinculo: "nao", necessita_equipamento: "nao", obs_admissao: "",
    // Dependentes
    dependentes: [],
    // Transporte
    necessita_vt: "nao", endereco_origem: "", modal_principal: "", qtd_conducoes: "",
    linhas_trajeto: "", custo_diario_vt: "", custo_mensal_vt: "", dias_presenciais: "",
    obs_transporte: "",
    // Benefícios
    necessita_alimentacao: "nao", necessita_refeicao: "nao",
    modelo_trabalho: "presencial", restricao_alimentar: "nao",
    descricao_restricao: "", cidade_atuacao: "", obs_beneficios: "",
    // Bancário
    banco: "", agencia: "", conta: "", tipo_conta: "corrente",
    chave_pix: "", nome_titular: "", cpf_titular: "", obs_banco: "",
    // Emergência
    emergencia_nome: "", emergencia_parentesco: "", emergencia_telefone: "",
    emergencia_email: "", emergencia_obs: "",
    // Documentos
    documentos_enviados: {},
    // Declarações
    declara_veracidade: false, autoriza_uso: false, consentimento_lgpd: false,
    nome_assinatura: "",
  });

  useEffect(() => {
    if (!token) { setLinkError("Link inválido ou expirado."); setLoading(false); return; }
    loadLink();
  }, [token]);

  const loadLink = async () => {
    try {
      const { data, error } = await supabase
        .from("onboarding_links")
        .select("*, employees_onboarding(*)")
        .eq("token", token)
        .single();
      if (error || !data) throw new Error("Link não encontrado");
      if (data.expirado || (data.data_expiracao && new Date(data.data_expiracao) < new Date())) {
        setLinkError("Este link expirou. Entre em contato com o RH da APSIS.");
        setLoading(false); return;
      }
      if (data.status === "concluido") { setSubmitted(true); setLoading(false); return; }
      setLinkData(data);
      if (data.employees_onboarding) {
        const d = data.employees_onboarding;
        setForm(prev => ({
          ...prev,
          cargo: d.cargo || "",
          area: d.area || "",
          unidade: d.unidade || "",
          gestor_nome: d.gestor_nome || "",
          gestor_email: d.gestor_email || "",
          data_admissao_prevista: d.data_admissao_prevista || "",
          ...d.form_data,
        }));
      }
    } catch (e) {
      setLinkError("Link inválido ou não encontrado.");
    }
    setLoading(false);
  };

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const buscarCep = async (cep) => {
    const c = cep.replace(/\D/g, "");
    if (c.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${c}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm(prev => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      }
    } catch {}
  };

  const handleFileUpload = async (docId, file) => {
    if (!file) return;
    setUploadingDoc(prev => ({ ...prev, [docId]: true }));
    try {
      const fileName = `onboarding/${token}/${docId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error } = await supabase.storage.from("onboarding-docs").upload(fileName, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("onboarding-docs").getPublicUrl(fileName);
      setForm(prev => ({
        ...prev,
        documentos_enviados: {
          ...prev.documentos_enviados,
          [docId]: { url: urlData.publicUrl, nome: file.name, enviado_em: new Date().toISOString() }
        }
      }));
    } catch (e) {
      alert("Erro ao enviar documento: " + e.message);
    }
    setUploadingDoc(prev => ({ ...prev, [docId]: false }));
  };

  const salvarRascunho = async () => {
    if (!linkData) return;
    setSaving(true);
    await supabase.from("employees_onboarding").upsert({
      id: linkData.onboarding_id,
      form_data: form,
      public_form_status: "em_andamento",
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
  };

  const handleSubmit = async () => {
    if (!form.declara_veracidade || !form.autoriza_uso || !form.consentimento_lgpd || !form.nome_assinatura) {
      alert("Por favor, aceite todas as declarações e informe seu nome completo para assinar.");
      return;
    }
    setSaving(true);
    try {
      await supabase.from("employees_onboarding").upsert({
        id: linkData?.onboarding_id,
        ...form,
        form_data: form,
        nome_completo: form.nome_completo,
        cpf: form.cpf,
        email_pessoal: form.email_pessoal,
        public_form_status: "enviado",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await supabase.from("onboarding_links").update({ status: "concluido" }).eq("token", token);
      await supabase.from("onboarding_status_history").insert({
        onboarding_id: linkData?.onboarding_id,
        status: "enviado",
        observacao: "Formulário enviado pelo colaborador",
        criado_em: new Date().toISOString(),
      });
      setSubmitted(true);
    } catch (e) {
      alert("Erro ao enviar formulário: " + e.message);
    }
    setSaving(false);
  };

  const addDependente = () => {
    setForm(prev => ({
      ...prev,
      dependentes: [...prev.dependentes, {
        nome: "", cpf: "", data_nascimento: "", parentesco: "",
        dep_ir: "nao", dep_beneficio: "nao", obs: ""
      }]
    }));
  };

  const updateDependente = (idx, field, value) => {
    setForm(prev => ({
      ...prev,
      dependentes: prev.dependentes.map((d, i) => i === idx ? { ...d, [field]: value } : d)
    }));
  };

  const removeDependente = (idx) => {
    setForm(prev => ({ ...prev, dependentes: prev.dependentes.filter((_, i) => i !== idx) }));
  };

  const completionPct = Math.round(((currentSection) / (SECTIONS.length - 1)) * 100);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A4731] to-[#245E40] flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" />
        <p className="text-white/80">Carregando formulário...</p>
      </div>
    </div>
  );

  if (linkError) return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A4731] to-[#245E40] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Link Inválido</h2>
        <p className="text-slate-500 text-sm">{linkError}</p>
        <p className="text-slate-400 text-xs mt-4">Em caso de dúvidas, entre em contato com o RH APSIS.</p>
      </div>
    </div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A4731] to-[#245E40] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <img src={LOGO_URL} alt="APSIS" className="h-8 object-contain mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Formulário enviado com sucesso!</h2>
        <p className="text-slate-500 text-sm leading-relaxed mb-2">
          Suas informações foram recebidas pela equipe de RH da APSIS. Em breve você receberá um retorno.
        </p>
        <p className="text-slate-400 text-xs">Guarde este link como comprovante de envio.</p>
      </div>
    </div>
  );

  const sec = SECTIONS[currentSection];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-[#1A4731] text-white py-4 px-6 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <img src={LOGO_URL} alt="APSIS" className="h-7 object-contain brightness-0 invert" />
        <div className="flex items-center gap-3 text-sm">
          <Shield className="w-4 h-4 text-white/60" />
          <span className="text-white/60 hidden sm:block">Ambiente seguro — seus dados são protegidos</span>
          <button
            onClick={salvarRascunho}
            disabled={saving}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs transition-colors"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Salvar
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500 font-medium">Progresso do formulário</span>
            <span className="text-xs font-bold text-[#1A4731]">{completionPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[#1A4731] to-[#F47920] h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
            {SECTIONS.map((s, i) => (
              <div
                key={s.id}
                className={`flex-shrink-0 h-1.5 rounded-full transition-all ${
                  i < currentSection ? "bg-[#1A4731]" : i === currentSection ? "bg-[#F47920]" : "bg-slate-200"
                }`}
                style={{ width: `${100 / SECTIONS.length}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Section header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#1A4731] flex items-center justify-center">
              {(() => { const Icon = sec.icon; return <Icon className="w-5 h-5 text-white" />; })()}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Etapa {currentSection + 1} de {SECTIONS.length}</p>
              <h2 className="text-xl font-bold text-slate-800">{sec.label}</h2>
            </div>
          </div>
        </div>

        {/* SECTION 0 — Boas-Vindas */}
        {currentSection === 0 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#1A4731] to-[#245E40] rounded-2xl p-8 text-white">
              <img src={LOGO_URL} alt="APSIS" className="h-8 object-contain brightness-0 invert mb-6" />
              <h1 className="text-2xl font-bold mb-3">Bem-vindo(a) à APSIS</h1>
              <p className="text-white/80 leading-relaxed text-sm">
                Este formulário é destinado ao seu processo de admissão. Preencha os dados com atenção e
                anexe os documentos solicitados. Todas as informações são tratadas com total sigilo e
                segurança, em conformidade com a LGPD.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Clock, title: "Tempo estimado", desc: "15 a 20 minutos" },
                { icon: Save, title: "Salvar progresso", desc: "Você pode continuar depois" },
                { icon: Shield, title: "Dados protegidos", desc: "Criptografados e seguros" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm text-center">
                  <Icon className="w-6 h-6 text-[#1A4731] mx-auto mb-2" />
                  <p className="font-semibold text-slate-800 text-sm">{title}</p>
                  <p className="text-xs text-slate-400 mt-1">{desc}</p>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-3">
              <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Aviso de Privacidade</p>
                <p className="text-xs text-blue-600 mt-1">
                  Os dados fornecidos serão utilizados exclusivamente para fins de admissão e cadastro
                  de benefícios, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
                  Ao continuar, você consente com o uso destas informações para as finalidades descritas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 1 — Dados Pessoais */}
        {currentSection === 1 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Nome completo" required>
                <TextInput value={form.nome_completo} onChange={e => set("nome_completo", e.target.value)} placeholder="Seu nome completo" />
              </InputField>
              <InputField label="Nome social" hint="Opcional — como prefere ser chamado(a)">
                <TextInput value={form.nome_social} onChange={e => set("nome_social", e.target.value)} />
              </InputField>
              <InputField label="CPF" required>
                <TextInput value={form.cpf} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" />
              </InputField>
              <InputField label="RG" required>
                <TextInput value={form.rg} onChange={e => set("rg", e.target.value)} />
              </InputField>
              <InputField label="Órgão emissor">
                <TextInput value={form.orgao_emissor} onChange={e => set("orgao_emissor", e.target.value)} placeholder="SSP/SP" />
              </InputField>
              <InputField label="Data de nascimento" required>
                <TextInput type="date" value={form.data_nascimento} onChange={e => set("data_nascimento", e.target.value)} />
              </InputField>
              <InputField label="Estado civil" required>
                <SelectInput value={form.estado_civil} onChange={e => set("estado_civil", e.target.value)}>
                  <option value="">Selecione</option>
                  {["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável", "Separado(a)"].map(o => <option key={o} value={o}>{o}</option>)}
                </SelectInput>
              </InputField>
              <InputField label="Sexo" required>
                <SelectInput value={form.sexo} onChange={e => set("sexo", e.target.value)}>
                  <option value="">Selecione</option>
                  {["Masculino", "Feminino", "Não-binário", "Prefiro não informar"].map(o => <option key={o} value={o}>{o}</option>)}
                </SelectInput>
              </InputField>
              <InputField label="Nacionalidade">
                <TextInput value={form.nacionalidade} onChange={e => set("nacionalidade", e.target.value)} />
              </InputField>
              <InputField label="Naturalidade">
                <TextInput value={form.naturalidade} onChange={e => set("naturalidade", e.target.value)} placeholder="Cidade/Estado" />
              </InputField>
              <InputField label="E-mail pessoal" required>
                <TextInput type="email" value={form.email_pessoal} onChange={e => set("email_pessoal", e.target.value)} />
              </InputField>
              <InputField label="Telefone celular" required>
                <TextInput value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 99999-0000" />
              </InputField>
              <InputField label="Telefone secundário">
                <TextInput value={form.telefone_secundario} onChange={e => set("telefone_secundario", e.target.value)} />
              </InputField>
              <InputField label="Nome da mãe" required>
                <TextInput value={form.nome_mae} onChange={e => set("nome_mae", e.target.value)} />
              </InputField>
              <InputField label="Nome do pai">
                <TextInput value={form.nome_pai} onChange={e => set("nome_pai", e.target.value)} />
              </InputField>
              <InputField label="PIS / NIS">
                <TextInput value={form.pis_nis} onChange={e => set("pis_nis", e.target.value)} />
              </InputField>
              <InputField label="CTPS Digital">
                <TextInput value={form.ctps} onChange={e => set("ctps", e.target.value)} placeholder="Número ou evidência" />
              </InputField>
              <InputField label="Título de eleitor">
                <TextInput value={form.titulo_eleitor} onChange={e => set("titulo_eleitor", e.target.value)} />
              </InputField>
              <InputField label="Certificado de reservista">
                <TextInput value={form.reservista} onChange={e => set("reservista", e.target.value)} placeholder="Se aplicável" />
              </InputField>
            </div>
          </div>
        )}

        {/* SECTION 2 — Endereço */}
        {currentSection === 2 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="CEP" required>
                <TextInput
                  value={form.cep}
                  onChange={e => { set("cep", e.target.value); buscarCep(e.target.value); }}
                  placeholder="00000-000"
                />
              </InputField>
              <InputField label="País">
                <TextInput value={form.pais} onChange={e => set("pais", e.target.value)} />
              </InputField>
              <div className="sm:col-span-2">
                <InputField label="Logradouro" required>
                  <TextInput value={form.logradouro} onChange={e => set("logradouro", e.target.value)} placeholder="Rua, Avenida..." />
                </InputField>
              </div>
              <InputField label="Número" required>
                <TextInput value={form.numero} onChange={e => set("numero", e.target.value)} />
              </InputField>
              <InputField label="Complemento">
                <TextInput value={form.complemento} onChange={e => set("complemento", e.target.value)} placeholder="Apto, bloco..." />
              </InputField>
              <InputField label="Bairro" required>
                <TextInput value={form.bairro} onChange={e => set("bairro", e.target.value)} />
              </InputField>
              <InputField label="Cidade" required>
                <TextInput value={form.cidade} onChange={e => set("cidade", e.target.value)} />
              </InputField>
              <InputField label="Estado" required>
                <SelectInput value={form.estado} onChange={e => set("estado", e.target.value)}>
                  <option value="">Selecione</option>
                  {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                </SelectInput>
              </InputField>
              <InputField label="Tipo de residência">
                <SelectInput value={form.tipo_residencia} onChange={e => set("tipo_residencia", e.target.value)}>
                  <option value="">Selecione</option>
                  {["Própria", "Alugada", "Cedida", "Financiada"].map(o => <option key={o} value={o}>{o}</option>)}
                </SelectInput>
              </InputField>
              <InputField label="Tempo de residência">
                <TextInput value={form.tempo_residencia} onChange={e => set("tempo_residencia", e.target.value)} placeholder="Ex: 2 anos" />
              </InputField>
            </div>
          </div>
        )}

        {/* SECTION 3 — Dados Profissionais */}
        {currentSection === 3 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Cargo">
                <TextInput value={form.cargo} onChange={e => set("cargo", e.target.value)} />
              </InputField>
              <InputField label="Área / Setor">
                <TextInput value={form.area} onChange={e => set("area", e.target.value)} />
              </InputField>
              <InputField label="Unidade / Localidade">
                <TextInput value={form.unidade} onChange={e => set("unidade", e.target.value)} />
              </InputField>
              <InputField label="Gestor responsável">
                <TextInput value={form.gestor_nome} onChange={e => set("gestor_nome", e.target.value)} />
              </InputField>
              <InputField label="Tipo de contratação">
                <SelectInput value={form.tipo_contratacao} onChange={e => set("tipo_contratacao", e.target.value)}>
                  {["CLT", "PJ", "Estágio", "Temporário", "Outro"].map(o => <option key={o} value={o}>{o}</option>)}
                </SelectInput>
              </InputField>
              <InputField label="Jornada">
                <SelectInput value={form.jornada} onChange={e => set("jornada", e.target.value)}>
                  {["44h semanais", "40h semanais", "30h semanais", "6h diárias", "Outra"].map(o => <option key={o} value={o}>{o}</option>)}
                </SelectInput>
              </InputField>
              <InputField label="Data prevista de admissão">
                <TextInput type="date" value={form.data_admissao_prevista} onChange={e => set("data_admissao_prevista", e.target.value)} />
              </InputField>
              <InputField label="Possui outro vínculo empregatício?">
                <RadioGroup value={form.outro_vinculo} onChange={v => set("outro_vinculo", v)}
                  options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
              </InputField>
              <InputField label="Necessita equipamento?">
                <RadioGroup value={form.necessita_equipamento} onChange={v => set("necessita_equipamento", v)}
                  options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
              </InputField>
              <div className="sm:col-span-2">
                <InputField label="Observações para admissão">
                  <textarea
                    value={form.obs_admissao}
                    onChange={e => set("obs_admissao", e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/30 focus:border-[#1A4731] transition-all bg-white resize-none"
                  />
                </InputField>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4 — Dependentes */}
        {currentSection === 4 && (
          <div className="space-y-4">
            {form.dependentes.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Nenhum dependente adicionado</p>
                <p className="text-slate-400 text-xs mt-1">Adicione dependentes para IR e/ou benefícios</p>
              </div>
            )}
            {form.dependentes.map((dep, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">Dependente {idx + 1}</h3>
                  <button onClick={() => removeDependente(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Nome completo" required>
                    <TextInput value={dep.nome} onChange={e => updateDependente(idx, "nome", e.target.value)} />
                  </InputField>
                  <InputField label="CPF">
                    <TextInput value={dep.cpf} onChange={e => updateDependente(idx, "cpf", e.target.value)} />
                  </InputField>
                  <InputField label="Data de nascimento">
                    <TextInput type="date" value={dep.data_nascimento} onChange={e => updateDependente(idx, "data_nascimento", e.target.value)} />
                  </InputField>
                  <InputField label="Grau de parentesco">
                    <SelectInput value={dep.parentesco} onChange={e => updateDependente(idx, "parentesco", e.target.value)}>
                      <option value="">Selecione</option>
                      {["Cônjuge", "Filho(a)", "Enteado(a)", "Pai/Mãe", "Irmão/Irmã", "Outro"].map(o => <option key={o} value={o}>{o}</option>)}
                    </SelectInput>
                  </InputField>
                  <InputField label="Dependente para IR?">
                    <RadioGroup value={dep.dep_ir} onChange={v => updateDependente(idx, "dep_ir", v)}
                      options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
                  </InputField>
                  <InputField label="Dependente para benefício?">
                    <RadioGroup value={dep.dep_beneficio} onChange={v => updateDependente(idx, "dep_beneficio", v)}
                      options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
                  </InputField>
                </div>
              </div>
            ))}
            <button
              onClick={addDependente}
              className="w-full border-2 border-dashed border-slate-200 hover:border-[#1A4731] rounded-2xl py-4 text-sm text-slate-400 hover:text-[#1A4731] transition-colors flex items-center justify-center gap-2"
            >
              + Adicionar dependente
            </button>
          </div>
        )}

        {/* SECTION 5 — Transporte */}
        {currentSection === 5 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <InputField label="Necessita de vale-transporte?">
              <RadioGroup value={form.necessita_vt} onChange={v => set("necessita_vt", v)}
                options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
            </InputField>
            {form.necessita_vt === "sim" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                <InputField label="Endereço de origem">
                  <TextInput value={form.endereco_origem} onChange={e => set("endereco_origem", e.target.value)} />
                </InputField>
                <InputField label="Modal principal">
                  <SelectInput value={form.modal_principal} onChange={e => set("modal_principal", e.target.value)}>
                    <option value="">Selecione</option>
                    {["Metrô", "Ônibus", "Trem", "Balsa", "Misto"].map(o => <option key={o} value={o}>{o}</option>)}
                  </SelectInput>
                </InputField>
                <InputField label="Quantidade de conduções por dia">
                  <TextInput type="number" value={form.qtd_conducoes} onChange={e => set("qtd_conducoes", e.target.value)} />
                </InputField>
                <InputField label="Custo diário estimado (R$)">
                  <TextInput type="number" step="0.01" value={form.custo_diario_vt} onChange={e => set("custo_diario_vt", e.target.value)} />
                </InputField>
                <InputField label="Custo mensal estimado (R$)">
                  <TextInput type="number" step="0.01" value={form.custo_mensal_vt} onChange={e => set("custo_mensal_vt", e.target.value)} />
                </InputField>
                <InputField label="Dias presenciais por semana">
                  <TextInput type="number" min="1" max="7" value={form.dias_presenciais} onChange={e => set("dias_presenciais", e.target.value)} />
                </InputField>
                <div className="sm:col-span-2">
                  <InputField label="Linhas / descrição do trajeto">
                    <textarea
                      value={form.linhas_trajeto} onChange={e => set("linhas_trajeto", e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/30 transition-all resize-none"
                    />
                  </InputField>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 6 — Benefícios */}
        {currentSection === 6 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Necessita benefício alimentação?">
                <RadioGroup value={form.necessita_alimentacao} onChange={v => set("necessita_alimentacao", v)}
                  options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
              </InputField>
              <InputField label="Necessita benefício refeição?">
                <RadioGroup value={form.necessita_refeicao} onChange={v => set("necessita_refeicao", v)}
                  options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
              </InputField>
              <InputField label="Modelo de trabalho">
                <SelectInput value={form.modelo_trabalho} onChange={e => set("modelo_trabalho", e.target.value)}>
                  {["presencial", "hibrido", "remoto"].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </SelectInput>
              </InputField>
              <InputField label="Cidade de atuação">
                <TextInput value={form.cidade_atuacao} onChange={e => set("cidade_atuacao", e.target.value)} />
              </InputField>
              <InputField label="Possui restrição alimentar?">
                <RadioGroup value={form.restricao_alimentar} onChange={v => set("restricao_alimentar", v)}
                  options={[{ value: "sim", label: "Sim" }, { value: "nao", label: "Não" }]} />
              </InputField>
              {form.restricao_alimentar === "sim" && (
                <InputField label="Descrição da restrição">
                  <TextInput value={form.descricao_restricao} onChange={e => set("descricao_restricao", e.target.value)} />
                </InputField>
              )}
              <div className="sm:col-span-2">
                <InputField label="Observações para RH">
                  <textarea
                    value={form.obs_beneficios} onChange={e => set("obs_beneficios", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/30 transition-all resize-none"
                  />
                </InputField>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 7 — Dados Bancários */}
        {currentSection === 7 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Banco" required>
                <TextInput value={form.banco} onChange={e => set("banco", e.target.value)} placeholder="Ex: Banco do Brasil, Itaú..." />
              </InputField>
              <InputField label="Tipo de conta" required>
                <SelectInput value={form.tipo_conta} onChange={e => set("tipo_conta", e.target.value)}>
                  {["corrente", "poupanca"].map(o => <option key={o} value={o}>{o === "corrente" ? "Conta Corrente" : "Poupança"}</option>)}
                </SelectInput>
              </InputField>
              <InputField label="Agência" required>
                <TextInput value={form.agencia} onChange={e => set("agencia", e.target.value)} />
              </InputField>
              <InputField label="Conta" required>
                <TextInput value={form.conta} onChange={e => set("conta", e.target.value)} />
              </InputField>
              <InputField label="Chave Pix">
                <TextInput value={form.chave_pix} onChange={e => set("chave_pix", e.target.value)} />
              </InputField>
              <InputField label="Nome do titular" required>
                <TextInput value={form.nome_titular} onChange={e => set("nome_titular", e.target.value)} />
              </InputField>
              <InputField label="CPF do titular" required>
                <TextInput value={form.cpf_titular} onChange={e => set("cpf_titular", e.target.value)} />
              </InputField>
            </div>
          </div>
        )}

        {/* SECTION 8 — Contato de Emergência */}
        {currentSection === 8 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Nome" required>
                <TextInput value={form.emergencia_nome} onChange={e => set("emergencia_nome", e.target.value)} />
              </InputField>
              <InputField label="Parentesco" required>
                <TextInput value={form.emergencia_parentesco} onChange={e => set("emergencia_parentesco", e.target.value)} />
              </InputField>
              <InputField label="Telefone" required>
                <TextInput value={form.emergencia_telefone} onChange={e => set("emergencia_telefone", e.target.value)} />
              </InputField>
              <InputField label="E-mail">
                <TextInput type="email" value={form.emergencia_email} onChange={e => set("emergencia_email", e.target.value)} />
              </InputField>
              <div className="sm:col-span-2">
                <InputField label="Observações">
                  <textarea
                    value={form.emergencia_obs} onChange={e => set("emergencia_obs", e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/30 transition-all resize-none"
                  />
                </InputField>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 9 — Documentos */}
        {currentSection === 9 && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Documentos obrigatórios</p>
                <p className="text-xs text-amber-600 mt-0.5">Envie documentos em PDF, JPG ou PNG. Tamanho máximo: 10MB por arquivo.</p>
              </div>
            </div>
            {DOCUMENT_TYPES.map(doc => {
              const uploaded = form.documentos_enviados[doc.id];
              const isUploading = uploadingDoc[doc.id];
              return (
                <div key={doc.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {uploaded ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${doc.required ? "border-red-300" : "border-slate-200"}`} />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-800">{doc.label}</p>
                      {uploaded ? (
                        <p className="text-xs text-green-600">{uploaded.nome}</p>
                      ) : (
                        <p className="text-xs text-slate-400">{doc.required ? "Obrigatório" : "Opcional"}</p>
                      )}
                    </div>
                  </div>
                  <label className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    uploaded
                      ? "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                      : "bg-[#1A4731] text-white hover:bg-[#245E40]"
                  }`}>
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isUploading ? "Enviando..." : uploaded ? "Substituir" : "Enviar"}
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                      onChange={e => handleFileUpload(doc.id, e.target.files[0])} disabled={isUploading} />
                  </label>
                </div>
              );
            })}
          </div>
        )}

        {/* SECTION 10 — Declarações */}
        {currentSection === 10 && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              {[
                { key: "declara_veracidade", text: "Declaro que todas as informações fornecidas neste formulário são verdadeiras e completas, sendo de minha inteira responsabilidade qualquer incorreção." },
                { key: "autoriza_uso", text: "Autorizo a APSIS a utilizar os dados fornecidos para fins de registro de admissão, processamento de benefícios e cumprimento de obrigações legais trabalhistas." },
                { key: "consentimento_lgpd", text: "Concordo com o tratamento dos meus dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018), para as finalidades descritas neste processo de admissão." },
              ].map(({ key, text }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={e => set(key, e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#1A4731] flex-shrink-0"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">{text}</span>
                </label>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <p className="text-sm font-semibold text-slate-800 mb-3">Assinatura digital</p>
              <p className="text-xs text-slate-400 mb-4">
                Digite seu nome completo abaixo como confirmação de que leu e concordou com todas as declarações acima.
              </p>
              <TextInput
                value={form.nome_assinatura}
                onChange={e => set("nome_assinatura", e.target.value)}
                placeholder="Seu nome completo"
              />
              {form.nome_assinatura && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-400">Assinado em: {new Date().toLocaleString("pt-BR")}</p>
                  <p className="text-base font-semibold text-[#1A4731] italic mt-1">{form.nome_assinatura}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => setCurrentSection(s => s - 1)}
            disabled={currentSection === 0}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-30 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>
          <span className="text-xs text-slate-400">{currentSection + 1} / {SECTIONS.length}</span>
          {currentSection < SECTIONS.length - 1 ? (
            <button
              onClick={async () => { await salvarRascunho(); setCurrentSection(s => s + 1); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1A4731] text-white rounded-xl hover:bg-[#245E40] transition-colors text-sm font-medium"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#F47920] text-white rounded-xl hover:bg-[#d96b1a] transition-colors text-sm font-medium"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Enviar Formulário
            </button>
          )}
        </div>
      </div>
    </div>
  );
}