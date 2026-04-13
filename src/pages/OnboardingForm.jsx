import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  CheckCircle2, ChevronRight, ChevronLeft, Shield, Clock, Save,
  Upload, X, AlertCircle, User, MapPin, Briefcase, Users, Bus,
  UtensilsCrossed, Landmark, Phone, FileText, Lock, Loader2, CloudUpload
} from "lucide-react";

const LOGO_URL = "https://media.base44.com/images/public/69a1fc4b60b4c477ea324579/32a8b27c7_Logohorizontal-Fundobranco1.png";

const STEPS = [
  { id: "boas_vindas",        label: "Boas-Vindas",          icon: Shield },
  { id: "dados_pessoais",     label: "Dados Pessoais",        icon: User },
  { id: "endereco",           label: "Endereço",              icon: MapPin },
  { id: "dados_profissionais",label: "Dados Profissionais",   icon: Briefcase },
  { id: "dependentes",        label: "Dependentes",           icon: Users },
  { id: "transporte",         label: "Transporte",            icon: Bus },
  { id: "beneficios",         label: "Benefícios",            icon: UtensilsCrossed },
  { id: "dados_bancarios",    label: "Dados Bancários",       icon: Landmark },
  { id: "emergencia",         label: "Contato de Emergência", icon: Phone },
  { id: "documentos",         label: "Documentos",            icon: FileText },
  { id: "confirmacao",        label: "Confirmação",           icon: Lock },
];

const DOCUMENT_TYPES = [
  { id: "doc_foto",              label: "Documento oficial com foto (RG ou CNH)", required: true },
  { id: "cpf_doc",               label: "CPF",                                    required: true },
  { id: "comprovante_residencia",label: "Comprovante de residência",               required: true },
  { id: "certidao",              label: "Certidão de nascimento ou casamento",     required: true },
  { id: "ctps",                  label: "Carteira de trabalho digital / evidência",required: true },
  { id: "comprovante_bancario",  label: "Comprovante bancário",                    required: true },
  { id: "comprovante_escolaridade", label: "Comprovante de escolaridade",          required: false },
  { id: "foto_3x4",              label: "Foto 3x4",                                required: false },
  { id: "documentos_dependentes",label: "Documentos de dependentes",               required: false },
];

const ESTADOS = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

// ─── Reusable UI Primitives ──────────────────────────────────────────────────

function Field({ label, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function TInput({ value, onChange, placeholder, type = "text", disabled, ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/30 focus:border-[#1A4731] transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400"
      {...rest}
    />
  );
}

function TSelect({ value, onChange, children, disabled }) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/30 focus:border-[#1A4731] transition-all bg-white disabled:bg-slate-50"
    >
      {children}
    </select>
  );
}

function TTextarea({ value, onChange, rows = 3, placeholder, disabled }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/30 focus:border-[#1A4731] transition-all bg-white resize-none disabled:bg-slate-50"
    />
  );
}

function RadioGroup({ value, onChange, options, disabled }) {
  return (
    <div className="flex gap-5">
      {options.map(o => (
        <label key={o.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio" value={o.value}
            checked={value === o.value}
            onChange={() => !disabled && onChange(o.value)}
            className="accent-[#1A4731] w-4 h-4"
            disabled={disabled}
          />
          <span className="text-sm text-slate-700">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OnboardingForm() {
  // Support both /onboarding/public/:token (parameterized) and ?token= (query string)
  const params = useParams();
  const location = useLocation();
  const queryToken = new URLSearchParams(location.search).get("token");
  const token = params.token || queryToken;

  const [pageState, setPageState] = useState("loading"); // loading | error | form | success
  const [errorMsg, setErrorMsg] = useState("");
  const [linkData, setLinkData] = useState(null);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState({});
  const [dragOver, setDragOver] = useState(null);

  const [form, setForm] = useState({
    nome_completo: "", nome_social: "", cpf: "", rg: "", orgao_emissor: "",
    data_nascimento: "", estado_civil: "", nacionalidade: "Brasileiro(a)",
    naturalidade: "", sexo: "", email_pessoal: "", telefone: "", telefone_secundario: "",
    nome_mae: "", nome_pai: "", pis_nis: "", ctps: "", titulo_eleitor: "", reservista: "",
    cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "",
    estado: "", pais: "Brasil", tipo_residencia: "", tempo_residencia: "",
    cargo: "", area: "", unidade: "", gestor_nome: "", gestor_email: "",
    tipo_contratacao: "CLT", jornada: "44h semanais", data_admissao_prevista: "",
    outro_vinculo: "nao", necessita_equipamento: "nao", obs_admissao: "",
    dependentes: [],
    necessita_vt: "nao", endereco_origem: "", modal_principal: "", qtd_conducoes: "",
    linhas_trajeto: "", custo_diario_vt: "", custo_mensal_vt: "", dias_presenciais: "",
    necessita_alimentacao: "nao", necessita_refeicao: "nao",
    modelo_trabalho: "presencial", restricao_alimentar: "nao",
    descricao_restricao: "", cidade_atuacao: "",
    banco: "", agencia: "", conta: "", tipo_conta: "corrente",
    chave_pix: "", nome_titular: "", cpf_titular: "",
    emergencia_nome: "", emergencia_parentesco: "", emergencia_telefone: "", emergencia_email: "",
    documentos_enviados: {},
    declara_veracidade: false, autoriza_uso: false, consentimento_lgpd: false, nome_assinatura: "",
  });

  useEffect(() => {
    document.title = "Formulário de Admissão — APSIS";
    // Hide the internal app layout when this page is accessed as a public link
    const style = document.createElement("style");
    style.id = "onboarding-public-override";
    style.textContent = `
      aside { display: none !important; }
      header.sticky { display: none !important; }
      .fade-in { animation: none !important; }
      main { padding: 0 !important; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById("onboarding-public-override")?.remove(); };
  }, []);

  useEffect(() => {
    if (!token) { setErrorMsg("Link inválido ou expirado."); setPageState("error"); return; }
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
        setErrorMsg("Este link expirou. Entre em contato com o RH da APSIS.");
        setPageState("error"); return;
      }
      if (data.status === "concluido") { setPageState("success"); return; }

      setLinkData(data);

      // Log access
      await supabase.from("onboarding_links").update({
        ultimo_acesso: new Date().toISOString(),
        acessos: (data.acessos || 0) + 1,
      }).eq("token", token);

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
          ...(d.form_data || {}),
        }));
      }
      setPageState("form");
    } catch {
      setErrorMsg("Link inválido ou não encontrado. Verifique com o RH.");
      setPageState("error");
    }
  };

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const buscarCep = async (cep) => {
    const c = cep.replace(/\D/g, "");
    if (c.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${c}/json/`);
      const d = await res.json();
      if (!d.erro) setForm(prev => ({
        ...prev, logradouro: d.logradouro || "", bairro: d.bairro || "",
        cidade: d.localidade || "", estado: d.uf || "",
      }));
    } catch {}
  };

  const handleFileUpload = async (docId, file) => {
    if (!file) return;
    setUploadingDoc(prev => ({ ...prev, [docId]: true }));
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `onboarding/${token}/${docId}-${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("onboarding-docs").upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("onboarding-docs").getPublicUrl(path);
      setForm(prev => ({
        ...prev,
        documentos_enviados: {
          ...prev.documentos_enviados,
          [docId]: { url: urlData.publicUrl, nome: file.name, tamanho: file.size, enviado_em: new Date().toISOString() }
        }
      }));
    } catch (e) {
      alert("Erro ao enviar arquivo: " + e.message);
    }
    setUploadingDoc(prev => ({ ...prev, [docId]: false }));
  };

  const salvarRascunho = async () => {
    if (!linkData) return;
    setSaving(true);
    await supabase.from("employees_onboarding").update({
      form_data: form, public_form_status: "em_andamento",
      updated_at: new Date().toISOString(),
    }).eq("id", linkData.onboarding_id);
    setSaving(false);
  };

  const handleSubmit = async () => {
    if (!form.declara_veracidade || !form.autoriza_uso || !form.consentimento_lgpd) {
      alert("Por favor, aceite todas as declarações para continuar.");
      return;
    }
    if (!form.nome_assinatura.trim()) {
      alert("Por favor, informe seu nome completo como assinatura digital.");
      return;
    }
    setSaving(true);
    try {
      await supabase.from("employees_onboarding").update({
        nome_completo: form.nome_completo,
        cpf: form.cpf,
        rg: form.rg,
        email_pessoal: form.email_pessoal,
        telefone: form.telefone,
        data_nascimento: form.data_nascimento,
        cep: form.cep, logradouro: form.logradouro, numero: form.numero,
        bairro: form.bairro, cidade: form.cidade, estado: form.estado,
        banco: form.banco, agencia: form.agencia, conta: form.conta,
        emergencia_nome: form.emergencia_nome,
        form_data: form,
        public_form_status: "enviado",
        overall_status: "formulario_enviado",
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", linkData.onboarding_id);

      await supabase.from("onboarding_links").update({
        status: "concluido"
      }).eq("token", token);

      await supabase.from("onboarding_status_history").insert({
        onboarding_id: linkData.onboarding_id,
        status: "formulario_enviado",
        observacao: "Formulário preenchido e enviado pelo colaborador via link público",
        criado_em: new Date().toISOString(),
      });

      setPageState("success");
    } catch (e) {
      alert("Erro ao enviar formulário: " + e.message);
    }
    setSaving(false);
  };

  const addDependente = () => setForm(prev => ({
    ...prev,
    dependentes: [...prev.dependentes, { nome: "", cpf: "", data_nascimento: "", parentesco: "", dep_ir: "nao", dep_beneficio: "nao" }]
  }));

  const updateDep = (i, f, v) => setForm(prev => ({
    ...prev, dependentes: prev.dependentes.map((d, idx) => idx === i ? { ...d, [f]: v } : d)
  }));

  const removeDep = (i) => setForm(prev => ({ ...prev, dependentes: prev.dependentes.filter((_, idx) => idx !== i) }));

  const completionPct = step === 0 ? 0 : Math.round((step / (STEPS.length - 1)) * 100);

  // ── Render States ──────────────────────────────────────────────────────────

  if (pageState === "loading") return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A4731] to-[#245E40] flex items-center justify-center">
      <div className="text-center text-white">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 opacity-80" />
        <p className="text-white/70 text-sm">Carregando formulário de admissão...</p>
      </div>
    </div>
  );

  if (pageState === "error") return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A4731] to-[#245E40] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <img src={LOGO_URL} alt="APSIS" className="h-7 object-contain mx-auto mb-5" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Link Inválido</h2>
        <p className="text-slate-500 text-sm leading-relaxed">{errorMsg}</p>
        <p className="text-slate-400 text-xs mt-4">Em caso de dúvidas, entre em contato com o RH APSIS.</p>
      </div>
    </div>
  );

  if (pageState === "success") return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A4731] to-[#245E40] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <img src={LOGO_URL} alt="APSIS" className="h-8 object-contain mx-auto mb-5" />
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Dados enviados com sucesso!</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Seus dados foram recebidos pela equipe de RH da APSIS.<br />
          O RH dará continuidade ao seu processo de admissão e entrará em contato em breve.
        </p>
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-400">Guarde este link como comprovante de envio. Você pode retornar a esta página a qualquer momento.</p>
        </div>
      </div>
    </div>
  );

  const currentStep = STEPS[step];

  // ── Main Form ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f4f6f4] flex flex-col">

      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <header className="bg-[#1A4731] sticky top-0 z-40 shadow-lg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <img src={LOGO_URL} alt="APSIS" className="h-7 object-contain brightness-0 invert" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-white/50 text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Ambiente seguro</span>
            </div>
            <button
              onClick={salvarRascunho}
              disabled={saving}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition-colors border border-white/20"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              <span>Salvar</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/50 text-xs">Formulário de Admissão</span>
            <span className="text-white text-xs font-semibold">{completionPct}% concluído</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div
              className="bg-[#F47920] h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </header>

      {/* ── Step indicator (scrollable) ─────────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 overflow-x-auto">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex gap-0 min-w-max">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = i < step;
              const active = i === step;
              return (
                <button
                  key={s.id}
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                    active ? "border-[#F47920] text-[#1A4731]"
                    : done ? "border-[#1A4731] text-[#1A4731] cursor-pointer hover:bg-slate-50"
                    : "border-transparent text-slate-300 cursor-default"
                  }`}
                >
                  {done ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1A4731]" /> : <Icon className="w-3.5 h-3.5" />}
                  <span className="hidden sm:block">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">

        {/* Section title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1A4731] flex items-center justify-center shadow-sm">
            {(() => { const Icon = currentStep.icon; return <Icon className="w-5 h-5 text-white" />; })()}
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Etapa {step + 1} de {STEPS.length}</p>
            <h2 className="text-xl font-bold text-slate-800">{currentStep.label}</h2>
          </div>
        </div>

        {/* ── Step 0: Boas-Vindas ─────────────────────────────────────────── */}
        {step === 0 && (
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-[#1A4731] to-[#245E40] rounded-2xl p-8 text-white shadow-lg">
              <img src={LOGO_URL} alt="APSIS" className="h-8 object-contain brightness-0 invert mb-5" />
              <h1 className="text-2xl font-bold mb-2">Bem-vindo(a) à APSIS!</h1>
              <p className="text-sm text-white/75 leading-relaxed">
                Este formulário é parte do seu processo de admissão. Preencha todas as seções com
                atenção e anexe os documentos solicitados. Você pode salvar seu progresso e retomar
                quando quiser.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Clock, title: "~15 min", desc: "Tempo estimado" },
                { icon: Save, title: "Auto-save", desc: "Salvo automaticamente" },
                { icon: Shield, title: "LGPD", desc: "Dados protegidos" },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
                  <Icon className="w-6 h-6 text-[#1A4731] mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-800 text-sm">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Shield className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Seus dados são tratados em conformidade com a <strong>LGPD (Lei 13.709/2018)</strong> e utilizados
                exclusivamente para fins de registro de admissão e cadastro de benefícios.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 1: Dados Pessoais ─────────────────────────────────────── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Nome completo" required>
                <TInput value={form.nome_completo} onChange={e => set("nome_completo", e.target.value)} placeholder="Seu nome completo" />
              </Field>
              <Field label="Nome social" hint="Como prefere ser chamado(a) — opcional">
                <TInput value={form.nome_social} onChange={e => set("nome_social", e.target.value)} />
              </Field>
              <Field label="CPF" required>
                <TInput value={form.cpf} onChange={e => set("cpf", e.target.value)} placeholder="000.000.000-00" />
              </Field>
              <Field label="RG" required>
                <TInput value={form.rg} onChange={e => set("rg", e.target.value)} />
              </Field>
              <Field label="Órgão emissor">
                <TInput value={form.orgao_emissor} onChange={e => set("orgao_emissor", e.target.value)} placeholder="SSP/SP" />
              </Field>
              <Field label="Data de nascimento" required>
                <TInput type="date" value={form.data_nascimento} onChange={e => set("data_nascimento", e.target.value)} />
              </Field>
              <Field label="Estado civil" required>
                <TSelect value={form.estado_civil} onChange={e => set("estado_civil", e.target.value)}>
                  <option value="">Selecione</option>
                  {["Solteiro(a)","Casado(a)","Divorciado(a)","Viúvo(a)","União Estável","Separado(a)"].map(o => <option key={o} value={o}>{o}</option>)}
                </TSelect>
              </Field>
              <Field label="Sexo" required>
                <TSelect value={form.sexo} onChange={e => set("sexo", e.target.value)}>
                  <option value="">Selecione</option>
                  {["Masculino","Feminino","Não-binário","Prefiro não informar"].map(o => <option key={o} value={o}>{o}</option>)}
                </TSelect>
              </Field>
              <Field label="Nacionalidade">
                <TInput value={form.nacionalidade} onChange={e => set("nacionalidade", e.target.value)} />
              </Field>
              <Field label="Naturalidade">
                <TInput value={form.naturalidade} onChange={e => set("naturalidade", e.target.value)} placeholder="Cidade / Estado" />
              </Field>
              <Field label="E-mail pessoal" required>
                <TInput type="email" value={form.email_pessoal} onChange={e => set("email_pessoal", e.target.value)} />
              </Field>
              <Field label="Celular" required>
                <TInput value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(11) 99999-0000" />
              </Field>
              <Field label="Telefone secundário">
                <TInput value={form.telefone_secundario} onChange={e => set("telefone_secundario", e.target.value)} />
              </Field>
              <Field label="Nome da mãe" required>
                <TInput value={form.nome_mae} onChange={e => set("nome_mae", e.target.value)} />
              </Field>
              <Field label="Nome do pai">
                <TInput value={form.nome_pai} onChange={e => set("nome_pai", e.target.value)} />
              </Field>
              <Field label="PIS / NIS">
                <TInput value={form.pis_nis} onChange={e => set("pis_nis", e.target.value)} />
              </Field>
              <Field label="CTPS Digital">
                <TInput value={form.ctps} onChange={e => set("ctps", e.target.value)} placeholder="Número da CTPS digital" />
              </Field>
              <Field label="Título de eleitor">
                <TInput value={form.titulo_eleitor} onChange={e => set("titulo_eleitor", e.target.value)} />
              </Field>
              <Field label="Cert. de reservista">
                <TInput value={form.reservista} onChange={e => set("reservista", e.target.value)} placeholder="Se aplicável" />
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 2: Endereço ─────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="CEP" required>
                <TInput
                  value={form.cep}
                  onChange={e => { set("cep", e.target.value); buscarCep(e.target.value); }}
                  placeholder="00000-000"
                />
              </Field>
              <Field label="País">
                <TInput value={form.pais} onChange={e => set("pais", e.target.value)} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Logradouro" required>
                  <TInput value={form.logradouro} onChange={e => set("logradouro", e.target.value)} placeholder="Rua, Avenida..." />
                </Field>
              </div>
              <Field label="Número" required>
                <TInput value={form.numero} onChange={e => set("numero", e.target.value)} />
              </Field>
              <Field label="Complemento">
                <TInput value={form.complemento} onChange={e => set("complemento", e.target.value)} placeholder="Apto, Bloco..." />
              </Field>
              <Field label="Bairro" required>
                <TInput value={form.bairro} onChange={e => set("bairro", e.target.value)} />
              </Field>
              <Field label="Cidade" required>
                <TInput value={form.cidade} onChange={e => set("cidade", e.target.value)} />
              </Field>
              <Field label="Estado" required>
                <TSelect value={form.estado} onChange={e => set("estado", e.target.value)}>
                  <option value="">Selecione</option>
                  {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </TSelect>
              </Field>
              <Field label="Tipo de residência">
                <TSelect value={form.tipo_residencia} onChange={e => set("tipo_residencia", e.target.value)}>
                  <option value="">Selecione</option>
                  {["Própria","Alugada","Cedida","Financiada"].map(o => <option key={o} value={o}>{o}</option>)}
                </TSelect>
              </Field>
              <Field label="Tempo de residência">
                <TInput value={form.tempo_residencia} onChange={e => set("tempo_residencia", e.target.value)} placeholder="Ex: 2 anos" />
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 3: Dados Profissionais ─────────────────────────────────── */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Cargo">
                <TInput value={form.cargo} onChange={e => set("cargo", e.target.value)} disabled={!!linkData?.employees_onboarding?.cargo} />
              </Field>
              <Field label="Área / Setor">
                <TInput value={form.area} onChange={e => set("area", e.target.value)} />
              </Field>
              <Field label="Unidade">
                <TInput value={form.unidade} onChange={e => set("unidade", e.target.value)} />
              </Field>
              <Field label="Gestor responsável">
                <TInput value={form.gestor_nome} onChange={e => set("gestor_nome", e.target.value)} />
              </Field>
              <Field label="Tipo de contratação">
                <TSelect value={form.tipo_contratacao} onChange={e => set("tipo_contratacao", e.target.value)}>
                  {["CLT","PJ","Estágio","Temporário","Outro"].map(o => <option key={o} value={o}>{o}</option>)}
                </TSelect>
              </Field>
              <Field label="Jornada">
                <TSelect value={form.jornada} onChange={e => set("jornada", e.target.value)}>
                  {["44h semanais","40h semanais","30h semanais","6h diárias","Outra"].map(o => <option key={o} value={o}>{o}</option>)}
                </TSelect>
              </Field>
              <Field label="Data prevista de admissão">
                <TInput type="date" value={form.data_admissao_prevista} onChange={e => set("data_admissao_prevista", e.target.value)} />
              </Field>
              <Field label="Possui outro vínculo?">
                <RadioGroup value={form.outro_vinculo} onChange={v => set("outro_vinculo", v)} options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
              </Field>
              <Field label="Necessita equipamento?">
                <RadioGroup value={form.necessita_equipamento} onChange={v => set("necessita_equipamento", v)} options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Observações">
                  <TTextarea value={form.obs_admissao} onChange={e => set("obs_admissao", e.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Dependentes ─────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-4">
            {form.dependentes.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-medium">Nenhum dependente adicionado</p>
                <p className="text-slate-400 text-xs mt-1">Adicione dependentes para IR e/ou benefícios se necessário</p>
              </div>
            )}
            {form.dependentes.map((dep, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-700">Dependente {i + 1}</h3>
                  <button onClick={() => removeDep(i)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Nome completo" required>
                    <TInput value={dep.nome} onChange={e => updateDep(i, "nome", e.target.value)} />
                  </Field>
                  <Field label="CPF">
                    <TInput value={dep.cpf} onChange={e => updateDep(i, "cpf", e.target.value)} />
                  </Field>
                  <Field label="Data de nascimento">
                    <TInput type="date" value={dep.data_nascimento} onChange={e => updateDep(i, "data_nascimento", e.target.value)} />
                  </Field>
                  <Field label="Parentesco">
                    <TSelect value={dep.parentesco} onChange={e => updateDep(i, "parentesco", e.target.value)}>
                      <option value="">Selecione</option>
                      {["Cônjuge","Filho(a)","Enteado(a)","Pai/Mãe","Irmão/Irmã","Outro"].map(o => <option key={o} value={o}>{o}</option>)}
                    </TSelect>
                  </Field>
                  <Field label="Dependente para IR?">
                    <RadioGroup value={dep.dep_ir} onChange={v => updateDep(i, "dep_ir", v)} options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
                  </Field>
                  <Field label="Dependente para benefício?">
                    <RadioGroup value={dep.dep_beneficio} onChange={v => updateDep(i, "dep_beneficio", v)} options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
                  </Field>
                </div>
              </div>
            ))}
            <button
              onClick={addDependente}
              className="w-full border-2 border-dashed border-slate-200 hover:border-[#1A4731] hover:bg-[#1A4731]/5 rounded-2xl py-5 text-sm text-slate-400 hover:text-[#1A4731] transition-all flex items-center justify-center gap-2 font-medium"
            >
              + Adicionar dependente
            </button>
          </div>
        )}

        {/* ── Step 5: Transporte ──────────────────────────────────────────── */}
        {step === 5 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
            <Field label="Necessita de vale-transporte?">
              <RadioGroup value={form.necessita_vt} onChange={v => set("necessita_vt", v)} options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
            </Field>
            {form.necessita_vt === "sim" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <Field label="Endereço de origem">
                  <TInput value={form.endereco_origem} onChange={e => set("endereco_origem", e.target.value)} />
                </Field>
                <Field label="Modal principal">
                  <TSelect value={form.modal_principal} onChange={e => set("modal_principal", e.target.value)}>
                    <option value="">Selecione</option>
                    {["Metrô","Ônibus","Trem","Balsa","Misto"].map(o => <option key={o} value={o}>{o}</option>)}
                  </TSelect>
                </Field>
                <Field label="Conduções por dia">
                  <TInput type="number" value={form.qtd_conducoes} onChange={e => set("qtd_conducoes", e.target.value)} />
                </Field>
                <Field label="Custo diário (R$)">
                  <TInput type="number" step="0.01" value={form.custo_diario_vt} onChange={e => set("custo_diario_vt", e.target.value)} />
                </Field>
                <Field label="Custo mensal (R$)">
                  <TInput type="number" step="0.01" value={form.custo_mensal_vt} onChange={e => set("custo_mensal_vt", e.target.value)} />
                </Field>
                <Field label="Dias presenciais / semana">
                  <TInput type="number" min="1" max="7" value={form.dias_presenciais} onChange={e => set("dias_presenciais", e.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Linhas / descrição do trajeto">
                    <TTextarea value={form.linhas_trajeto} onChange={e => set("linhas_trajeto", e.target.value)} rows={2} />
                  </Field>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 6: Benefícios ──────────────────────────────────────────── */}
        {step === 6 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Benefício alimentação?">
                <RadioGroup value={form.necessita_alimentacao} onChange={v => set("necessita_alimentacao", v)} options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
              </Field>
              <Field label="Benefício refeição?">
                <RadioGroup value={form.necessita_refeicao} onChange={v => set("necessita_refeicao", v)} options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
              </Field>
              <Field label="Modelo de trabalho">
                <TSelect value={form.modelo_trabalho} onChange={e => set("modelo_trabalho", e.target.value)}>
                  {["presencial","hibrido","remoto"].map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                </TSelect>
              </Field>
              <Field label="Cidade de atuação">
                <TInput value={form.cidade_atuacao} onChange={e => set("cidade_atuacao", e.target.value)} />
              </Field>
              <Field label="Restrição alimentar?">
                <RadioGroup value={form.restricao_alimentar} onChange={v => set("restricao_alimentar", v)} options={[{value:"sim",label:"Sim"},{value:"nao",label:"Não"}]} />
              </Field>
              {form.restricao_alimentar === "sim" && (
                <Field label="Descrição da restrição">
                  <TInput value={form.descricao_restricao} onChange={e => set("descricao_restricao", e.target.value)} />
                </Field>
              )}
            </div>
          </div>
        )}

        {/* ── Step 7: Dados Bancários ─────────────────────────────────────── */}
        {step === 7 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Banco" required>
                <TInput value={form.banco} onChange={e => set("banco", e.target.value)} placeholder="Ex: Itaú, Nubank..." />
              </Field>
              <Field label="Tipo de conta" required>
                <TSelect value={form.tipo_conta} onChange={e => set("tipo_conta", e.target.value)}>
                  <option value="corrente">Conta Corrente</option>
                  <option value="poupanca">Poupança</option>
                </TSelect>
              </Field>
              <Field label="Agência" required>
                <TInput value={form.agencia} onChange={e => set("agencia", e.target.value)} />
              </Field>
              <Field label="Conta" required>
                <TInput value={form.conta} onChange={e => set("conta", e.target.value)} />
              </Field>
              <Field label="Chave Pix">
                <TInput value={form.chave_pix} onChange={e => set("chave_pix", e.target.value)} placeholder="CPF, e-mail, celular..." />
              </Field>
              <Field label="Nome do titular" required>
                <TInput value={form.nome_titular} onChange={e => set("nome_titular", e.target.value)} />
              </Field>
              <Field label="CPF do titular" required>
                <TInput value={form.cpf_titular} onChange={e => set("cpf_titular", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 8: Contato de Emergência ───────────────────────────────── */}
        {step === 8 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Nome" required>
                <TInput value={form.emergencia_nome} onChange={e => set("emergencia_nome", e.target.value)} />
              </Field>
              <Field label="Parentesco" required>
                <TInput value={form.emergencia_parentesco} onChange={e => set("emergencia_parentesco", e.target.value)} />
              </Field>
              <Field label="Telefone" required>
                <TInput value={form.emergencia_telefone} onChange={e => set("emergencia_telefone", e.target.value)} />
              </Field>
              <Field label="E-mail">
                <TInput type="email" value={form.emergencia_email} onChange={e => set("emergencia_email", e.target.value)} />
              </Field>
            </div>
          </div>
        )}

        {/* ── Step 9: Documentos ─────────────────────────────────────────── */}
        {step === 9 && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Envie os documentos em <strong>PDF, JPG ou PNG</strong>. Tamanho máximo: 10MB por arquivo.
                Documentos obrigatórios são marcados com *.
              </p>
            </div>
            {DOCUMENT_TYPES.map(doc => {
              const uploaded = form.documentos_enviados[doc.id];
              const uploading = uploadingDoc[doc.id];
              return (
                <div
                  key={doc.id}
                  className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${
                    dragOver === doc.id ? "border-[#1A4731] bg-[#1A4731]/5" : "border-slate-100"
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragOver(doc.id); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => {
                    e.preventDefault(); setDragOver(null);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileUpload(doc.id, file);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {uploaded
                        ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                        : <div className={`w-5 h-5 rounded-full border-2 ${doc.required ? "border-amber-300" : "border-slate-200"}`} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">
                        {doc.label}{doc.required && <span className="text-red-400 ml-0.5">*</span>}
                      </p>
                      {uploaded ? (
                        <p className="text-xs text-green-600 truncate">{uploaded.nome}</p>
                      ) : (
                        <p className="text-xs text-slate-400">Arraste ou clique para enviar</p>
                      )}
                    </div>
                    <label className={`flex-shrink-0 cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      uploaded
                        ? "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                        : "bg-[#1A4731] text-white hover:bg-[#245E40]"
                    }`}>
                      {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
                      {uploading ? "Enviando..." : uploaded ? "Trocar" : "Enviar"}
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                        onChange={e => handleFileUpload(doc.id, e.target.files[0])} disabled={uploading} />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Step 10: Confirmação + Declarações ─────────────────────────── */}
        {step === 10 && (
          <div className="space-y-5">
            {/* Review Summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
              <h3 className="font-semibold text-slate-800 mb-3">Resumo do formulário</h3>
              {[
                { label: "Nome completo", value: form.nome_completo },
                { label: "CPF", value: form.cpf ? form.cpf.replace(/(\d{3})\d{3}(\d{3}-\d{2})/, "$1.***.***-$2") : "" },
                { label: "E-mail", value: form.email_pessoal },
                { label: "Cargo", value: form.cargo },
                { label: "Banco", value: form.banco ? `${form.banco} — Ag: ${form.agencia}` : "" },
                { label: "Documentos enviados", value: `${Object.keys(form.documentos_enviados).length} de ${DOCUMENT_TYPES.length}` },
              ].map(({ label, value }) => value ? (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-400 font-medium">{label}</span>
                  <span className="text-sm text-slate-700 font-medium text-right max-w-[60%] truncate">{value}</span>
                </div>
              ) : null)}
            </div>

            {/* Declarations */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <h3 className="font-semibold text-slate-800">Declarações</h3>
              {[
                { key: "declara_veracidade", text: "Declaro que todas as informações fornecidas são verdadeiras e completas, sendo de minha inteira responsabilidade qualquer incorreção." },
                { key: "autoriza_uso", text: "Autorizo a APSIS a utilizar os dados fornecidos para fins de registro de admissão, processamento de benefícios e cumprimento de obrigações legais." },
                { key: "consentimento_lgpd", text: "Consinto com o tratamento dos meus dados pessoais conforme a LGPD (Lei 13.709/2018) para as finalidades descritas neste processo de admissão." },
              ].map(({ key, text }) => (
                <label key={key} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form[key] ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                }`}>
                  <input
                    type="checkbox" checked={form[key]} onChange={e => set(key, e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#1A4731] flex-shrink-0"
                  />
                  <span className="text-sm text-slate-700 leading-relaxed">{text}</span>
                </label>
              ))}
            </div>

            {/* Digital Signature */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-800 mb-1">Assinatura digital</h3>
              <p className="text-xs text-slate-400 mb-4">Digite seu nome completo como confirmação das declarações acima.</p>
              <TInput
                value={form.nome_assinatura}
                onChange={e => set("nome_assinatura", e.target.value)}
                placeholder="Seu nome completo"
              />
              {form.nome_assinatura && (
                <div className="mt-3 p-4 bg-gradient-to-r from-slate-50 to-green-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-400 mb-1">Assinado digitalmente em {new Date().toLocaleString("pt-BR")}</p>
                  <p className="text-lg font-semibold text-[#1A4731] italic">{form.nome_assinatura}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-white hover:shadow-sm transition-all disabled:opacity-30 text-sm font-medium"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          <span className="text-xs text-slate-400 font-medium">{step + 1} / {STEPS.length}</span>

          {step < STEPS.length - 1 ? (
            <button
              onClick={async () => { await salvarRascunho(); setStep(s => s + 1); }}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1A4731] text-white rounded-xl hover:bg-[#245E40] transition-colors text-sm font-medium shadow-sm"
            >
              Próximo <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#F47920] hover:bg-[#d96b1a] text-white rounded-xl transition-colors text-sm font-medium shadow-sm disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Enviar Formulário
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} APSIS — Seus dados são protegidos pela LGPD. Ambiente seguro e criptografado.
        </p>
      </footer>
    </div>
  );
}