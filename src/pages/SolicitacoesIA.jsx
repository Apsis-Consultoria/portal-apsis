import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Send, Save, X, CheckCircle2, Upload, Loader2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const SECTIONS = ["Informações do Usuário", "Classificação", "Detalhamento", "Anexos & IA"];
const PRIORIDADE_COLORS = { Baixa: "bg-green-100 text-green-700", Média: "bg-yellow-100 text-yellow-700", Alta: "bg-orange-100 text-orange-700", Crítica: "bg-red-100 text-red-700" };

export default function SolicitacoesIA() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loadingIA, setLoadingIA] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const [form, setForm] = useState({
    nome_usuario: "",
    email: "",
    setor: "",
    cargo: "",
    tipo_solicitacao: "",
    prioridade: "",
    sistema_area: "",
    titulo: "",
    descricao: "",
    beneficio: "",
    processo_atual: "",
    processo_desejado: "",
    anexos: [],
    link_evidencia: "",
    sugestao_ia: "",
  });

  useEffect(() => {
    base44.auth.me().then(user => {
      if (user) {
        setForm(f => ({
          ...f,
          nome_usuario: user.full_name || "",
          email: user.email || "",
        }));
      }
    }).catch(() => {});
  }, []);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingFiles(true);
    try {
      const urls = await Promise.all(files.map(file => base44.integrations.Core.UploadFile({ file })));
      setForm(f => ({ ...f, anexos: [...f.anexos, ...urls.map(r => r.file_url)] }));
      toast.success(`${files.length} arquivo(s) anexado(s)`);
    } catch {
      toast.error("Erro ao fazer upload dos arquivos");
    }
    setUploadingFiles(false);
  };

  const gerarSugestaoIA = async () => {
    if (!form.descricao) { toast.error("Preencha a descrição primeiro"); return; }
    setLoadingIA(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise a seguinte solicitação de melhoria/automação e forneça uma sugestão técnica estruturada:

Tipo: ${form.tipo_solicitacao || "Não informado"}
Sistema/Área: ${form.sistema_area || "Não informado"}
Descrição: ${form.descricao}
Benefício esperado: ${form.beneficio || "Não informado"}

Responda em português com:
1. Tipo de solução recomendada
2. Complexidade: Baixa / Média / Alta
3. Ferramentas sugeridas (ex: API, Power Automate, OCR, Chatbot, RPA, etc.)
4. Principais etapas de implementação (resumo)
5. Estimativa de impacto

Seja objetivo e direto.`,
      });
      set("sugestao_ia", typeof res === "string" ? res : JSON.stringify(res));
      toast.success("Sugestão gerada com sucesso!");
    } catch {
      toast.error("Erro ao gerar sugestão com IA");
    }
    setLoadingIA(false);
  };

  const validateStep = () => {
    if (step === 0) return form.nome_usuario && form.email && form.setor;
    if (step === 1) return form.tipo_solicitacao && form.prioridade && form.sistema_area;
    if (step === 2) return form.titulo && form.descricao && form.beneficio;
    return true;
  };

  const saveRecord = async (status) => {
    setSubmitting(true);
    try {
      await base44.entities.SolicitacaoIA.create({
        ...form,
        status,
        data_criacao: new Date().toISOString(),
      });

      if (status === "Novo") {
        // Notify TI
        await base44.integrations.Core.SendEmail({
          to: "ti@apsis.com.br",
          subject: `[Nova Solicitação IA] ${form.titulo}`,
          body: `Nova solicitação registrada por ${form.nome_usuario} (${form.email}).\n\nTipo: ${form.tipo_solicitacao}\nPrioridade: ${form.prioridade}\nSistema: ${form.sistema_area}\n\nDescrição:\n${form.descricao}`,
        }).catch(() => {});
        // Confirm to user
        if (form.email) {
          await base44.integrations.Core.SendEmail({
            to: form.email,
            subject: `Solicitação registrada: ${form.titulo}`,
            body: `Olá ${form.nome_usuario},\n\nSua solicitação "${form.titulo}" foi registrada com sucesso e está sendo analisada pela equipe de TI e Inovação.\n\nStatus inicial: Novo\n\nObrigado!`,
          }).catch(() => {});
        }
        setSubmitted(true);
      } else {
        toast.success("Rascunho salvo com sucesso!");
      }
    } catch {
      toast.error("Erro ao salvar solicitação");
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Solicitação registrada com sucesso!</h2>
          <p className="text-slate-500 mb-1">Sua solicitação foi enviada para análise da equipe de TI e Inovação.</p>
          <p className="text-slate-400 text-sm">Você receberá uma confirmação por e-mail em breve.</p>
        </div>
        <Button onClick={() => { setSubmitted(false); setStep(0); setForm(f => ({ ...f, tipo_solicitacao: "", prioridade: "", sistema_area: "", titulo: "", descricao: "", beneficio: "", processo_atual: "", processo_desejado: "", anexos: [], link_evidencia: "", sugestao_ia: "" })); }}
          className="bg-[#1A4731] hover:bg-[#245E40] text-white">
          Nova Solicitação
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Solicitações de Melhoria & Criação de IA</h1>
        <p className="text-slate-500 text-sm mt-1">Formulário para registro de melhorias, automações e criação de agentes de IA.</p>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          {SECTIONS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${i < step ? "bg-green-500 text-white" : i === step ? "bg-[#1A4731] text-white" : "bg-slate-100 text-slate-400"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-slate-800" : "text-slate-400"}`}>{s}</span>
              {i < SECTIONS.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 ml-1" />}
            </div>
          ))}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div className="bg-[#F47920] h-1.5 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / SECTIONS.length) * 100}%` }} />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">

        {/* Step 0: Informações do Usuário */}
        {step === 0 && (
          <>
            <h2 className="text-base font-semibold text-slate-700 border-b pb-2">Informações do Usuário</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Nome do Usuário <span className="text-red-500">*</span></Label>
                <Input value={form.nome_usuario} onChange={e => set("nome_usuario", e.target.value)} placeholder="Seu nome completo" />
              </div>
              <div className="space-y-1.5">
                <Label>Email <span className="text-red-500">*</span></Label>
                <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="seu@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Setor <span className="text-red-500">*</span></Label>
                <Select value={form.setor} onValueChange={v => set("setor", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger>
                  <SelectContent>
                    {["Financeiro","Comercial","TI","Operações","RH","Diretoria","Outro"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Cargo</Label>
                <Input value={form.cargo} onChange={e => set("cargo", e.target.value)} placeholder="Seu cargo (opcional)" />
              </div>
            </div>
          </>
        )}

        {/* Step 1: Classificação */}
        {step === 1 && (
          <>
            <h2 className="text-base font-semibold text-slate-700 border-b pb-2">Classificação da Solicitação</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo de Solicitação <span className="text-red-500">*</span></Label>
                <Select value={form.tipo_solicitacao} onValueChange={v => set("tipo_solicitacao", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                  <SelectContent>
                    {["Melhoria de Sistema","Novo Projeto","Automação de Processo","Criação de Agente de IA","Correção de Erro"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Prioridade <span className="text-red-500">*</span></Label>
                <Select value={form.prioridade} onValueChange={v => set("prioridade", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione a prioridade" /></SelectTrigger>
                  <SelectContent>
                    {["Baixa","Média","Alta","Crítica"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form.prioridade && <Badge className={PRIORIDADE_COLORS[form.prioridade]}>{form.prioridade}</Badge>}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Sistema / Área Impactada <span className="text-red-500">*</span></Label>
                <Select value={form.sistema_area} onValueChange={v => set("sistema_area", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione o sistema/área" /></SelectTrigger>
                  <SelectContent>
                    {["SAN ERP","Portal APSIS","SharePoint","Financeiro","Comercial","Outro"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Detalhamento */}
        {step === 2 && (
          <>
            <h2 className="text-base font-semibold text-slate-700 border-b pb-2">Detalhamento</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Título da Solicitação <span className="text-red-500">*</span></Label>
                <Input value={form.titulo} onChange={e => set("titulo", e.target.value)} placeholder="Título objetivo e claro" />
              </div>
              <div className="space-y-1.5">
                <Label>Descrição Detalhada <span className="text-red-500">*</span></Label>
                <Textarea rows={4} value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Descreva o problema ou oportunidade, impacto e sugestão" />
              </div>
              <div className="space-y-1.5">
                <Label>Benefício Esperado <span className="text-red-500">*</span></Label>
                <Textarea rows={3} value={form.beneficio} onChange={e => set("beneficio", e.target.value)} placeholder="Ex: ganho de tempo, redução de erros, eficiência operacional" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Processo Atual</Label>
                  <Textarea rows={3} value={form.processo_atual} onChange={e => set("processo_atual", e.target.value)} placeholder="Como é feito hoje?" />
                </div>
                <div className="space-y-1.5">
                  <Label>Processo Desejado</Label>
                  <Textarea rows={3} value={form.processo_desejado} onChange={e => set("processo_desejado", e.target.value)} placeholder="Como deveria funcionar?" />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Anexos & IA */}
        {step === 3 && (
          <>
            <h2 className="text-base font-semibold text-slate-700 border-b pb-2">Anexos & Evidências</h2>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Anexar Arquivos</Label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 cursor-pointer hover:bg-slate-50 transition-colors">
                  {uploadingFiles ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : <Upload className="w-6 h-6 text-slate-400 mb-2" />}
                  <span className="text-sm text-slate-500">{uploadingFiles ? "Enviando..." : "Clique para selecionar arquivos"}</span>
                  <span className="text-xs text-slate-400 mt-1">PDF, PNG, JPG, XLSX, DOCX • Máx 10MB cada</span>
                  <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.xlsx,.docx" className="hidden" onChange={handleFiles} disabled={uploadingFiles} />
                </label>
                {form.anexos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.anexos.map((url, i) => (
                      <div key={i} className="flex items-center gap-1 bg-slate-100 rounded px-2 py-1 text-xs text-slate-600">
                        📎 Arquivo {i + 1}
                        <button onClick={() => setForm(f => ({ ...f, anexos: f.anexos.filter((_, j) => j !== i) }))} className="text-slate-400 hover:text-red-500 ml-1">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Link de Evidência (Opcional)</Label>
                <Input value={form.link_evidencia} onChange={e => set("link_evidencia", e.target.value)} placeholder="https://..." />
              </div>

              {/* IA Section */}
              <div className="border border-purple-100 bg-purple-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">Sugestão Gerada por IA</span>
                </div>
                <p className="text-xs text-purple-600">Gere uma sugestão automática com base na sua descrição — tipo de automação, ferramentas e complexidade.</p>
                <Button variant="outline" onClick={gerarSugestaoIA} disabled={loadingIA} className="border-purple-300 text-purple-700 hover:bg-purple-100">
                  {loadingIA ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Gerando...</> : <><Sparkles className="w-4 h-4 mr-2" /> Gerar Sugestão com IA</>}
                </Button>
                {form.sugestao_ia && (
                  <Textarea rows={6} value={form.sugestao_ia} onChange={e => set("sugestao_ia", e.target.value)} className="bg-white border-purple-200 text-sm" />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pb-6">
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>← Voltar</Button>
          )}
          <Button variant="ghost" onClick={() => saveRecord("Rascunho")} disabled={submitting} className="text-slate-500">
            <Save className="w-4 h-4 mr-1" /> Salvar Rascunho
          </Button>
        </div>
        <div className="flex gap-2">
          {step < SECTIONS.length - 1 ? (
            <Button onClick={() => { if (!validateStep()) { toast.error("Preencha os campos obrigatórios"); return; } setStep(s => s + 1); }}
              className="bg-[#1A4731] hover:bg-[#245E40] text-white">
              Próximo →
            </Button>
          ) : (
            <Button onClick={() => saveRecord("Novo")} disabled={submitting} className="bg-[#F47920] hover:bg-[#d96b1a] text-white">
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4 mr-2" /> Enviar Solicitação</>}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}