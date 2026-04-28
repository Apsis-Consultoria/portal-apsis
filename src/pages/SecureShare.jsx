import { useState, useEffect } from "react";
import { Share2, Plus, Mail, Eye, Trash2, Copy, Check, RefreshCw, Search, ExternalLink, Users, FolderOpen, Clock, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabaseAdmin as supabase } from "@/lib/supabaseClient";

const UPLOAD_APP_URL = "[LINK_DO_APP_DE_UPLOAD]"; // será configurado depois

function gerarSenha(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function formatAP(value) {
  // Remove tudo que não for número
  const nums = value.replace(/\D/g, "");
  // Aplica máscara AP-XXXXX/XX-XXX
  let result = "";
  if (nums.length > 0) result = "AP-" + nums.substring(0, 5);
  if (nums.length >= 5) result += "/" + nums.substring(5, 7);
  if (nums.length >= 7) result += "-" + nums.substring(7, 10);
  return result;
}

export default function SecureShare() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [projetoDetalhe, setProjetoDetalhe] = useState(null);
  const [copied, setCopied] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({
    ap_os: "",
    empresa: "",
    emails: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarProjetos();
  }, []);

  async function carregarProjetos() {
    setLoading(true);
    const { data } = await supabase
      .from("inov_secure_share")
      .select("*")
      .order("created_at", { ascending: false });
    setProjetos(data || []);
    setLoading(false);
  }

  async function criarProjeto() {
    if (!form.ap_os || !form.empresa || !form.emails.trim()) return;

    const emailList = form.emails.split(/[,;\n]/).map(e => e.trim()).filter(Boolean);
    setSaving(true);

    // Gera senha para cada email
    const acessos = emailList.map(email => ({
      email,
      senha: gerarSenha(),
    }));

    const { data, error } = await supabase
      .from("inov_secure_share")
      .insert([{
        ap_os: form.ap_os,
        empresa: form.empresa,
        emails: emailList,
        acessos: acessos,
        status: "ativo",
        criado_em: new Date().toISOString(),
      }])
      .select()
      .single();

    if (!error && data) {
      // Enviar emails para cada acesso
      for (const acesso of acessos) {
        await enviarEmailAcesso(acesso.email, acesso.senha, form.ap_os, form.empresa);
      }
      await carregarProjetos();
      setShowModal(false);
      setForm({ ap_os: "", empresa: "", emails: "" });
    }
    setSaving(false);
  }

  async function enviarEmailAcesso(email, senha, apOs, empresa) {
    try {
      const { base44 } = await import("@/api/base44Client");
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `Acesso ao Portal de Envio de Arquivos — ${empresa} (${apOs})`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #1A4731; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">Portal Seguro de Envio de Arquivos</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">APSIS Consultores</p>
            </div>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; padding: 28px; border-radius: 0 0 12px 12px;">
              <p style="color: #374151; font-size: 15px; margin-bottom: 16px;">Olá,</p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Você recebeu acesso ao nosso portal seguro para envio de arquivos referente ao projeto <strong>${apOs}</strong> — <strong>${empresa}</strong>.
              </p>
              <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-top: 16px;">
                Para acessar a plataforma, utilize as credenciais abaixo:
              </p>
              <div style="background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Suas credenciais de acesso</p>
                <p style="margin: 0 0 6px; color: #111827; font-size: 15px;"><strong>E-mail:</strong> ${email}</p>
                <p style="margin: 0; color: #111827; font-size: 15px;"><strong>Senha:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 2px 8px; border-radius: 4px;">${senha}</span></p>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${UPLOAD_APP_URL}" style="background: #F47920; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: bold; display: inline-block;">
                  Acessar Portal de Envio
                </a>
              </div>
              <p style="color: #6b7280; font-size: 13px; line-height: 1.5; border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 8px;">
                Caso tenha dúvidas, entre em contato com nossa equipe. Por segurança, recomendamos não compartilhar suas credenciais com terceiros.
              </p>
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.error("Erro ao enviar email:", e);
    }
  }

  async function reenviarAcessos(projeto) {
    setEnviando(projeto.id);
    for (const acesso of (projeto.acessos || [])) {
      await enviarEmailAcesso(acesso.email, acesso.senha, projeto.ap_os, projeto.empresa);
    }
    setEnviando(null);
  }

  async function alterarStatus(id, status) {
    await supabase.from("inov_secure_share").update({ status }).eq("id", id);
    await carregarProjetos();
  }

  async function deletarProjeto(id) {
    if (!confirm("Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.")) return;
    await supabase.from("inov_secure_share").delete().eq("id", id);
    await carregarProjetos();
  }

  function copiar(texto, id) {
    navigator.clipboard.writeText(texto);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtrados = projetos.filter(p =>
    p.empresa?.toLowerCase().includes(search.toLowerCase()) ||
    p.ap_os?.toLowerCase().includes(search.toLowerCase())
  );

  const totalAtivos = projetos.filter(p => p.status === "ativo").length;

  return (
    <div className="min-h-screen bg-[#F4F6F4] p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-[#1A4731] rounded-lg flex items-center justify-center">
                <Share2 size={16} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-[#1A2B1F]">Secure Share</h1>
            </div>
            <p className="text-sm text-[#5C7060]">Gerencie projetos e envie links de acesso seguro para clientes</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#1A4731] hover:bg-[#245E40] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={16} /> Novo Projeto
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Projetos ativos", value: totalAtivos, icon: FolderOpen, color: "text-[#1A4731]", bg: "bg-[#1A4731]/10" },
            { label: "Total de projetos", value: projetos.length, icon: FolderOpen, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Clientes com acesso", value: projetos.reduce((acc, p) => acc + (p.emails?.length || 0), 0), icon: Users, color: "text-[#F47920]", bg: "bg-[#F47920]/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1A2B1F]">{value}</p>
                <p className="text-xs text-[#5C7060]">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por empresa ou AP/OS..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20"
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
            <span className="text-sm">Carregando projetos...</span>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Share2 size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Nenhum projeto encontrado</p>
            <p className="text-slate-400 text-xs mt-1">Crie um novo projeto para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map(projeto => (
              <div key={projeto.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Row principal */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#1A2B1F] text-sm font-mono">{projeto.ap_os}</span>
                      <Badge className={projeto.status === "ativo" ? "bg-green-100 text-green-700 border-0" : "bg-slate-100 text-slate-600 border-0"}>
                        {projeto.status}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-[#1A2B1F]">{projeto.empresa}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Users size={11} />
                      <span>{(projeto.emails || []).length} email(s)</span>
                      <span className="mx-1">·</span>
                      <Clock size={11} />
                      <span>{new Date(projeto.criado_em || projeto.created_at).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => reenviarAcessos(projeto)}
                      disabled={enviando === projeto.id}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition"
                    >
                      {enviando === projeto.id ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                      Reenviar Acessos
                    </button>
                    <button
                      onClick={() => setProjetoDetalhe(projetoDetalhe?.id === projeto.id ? null : projeto)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
                    >
                      <Eye size={12} /> Detalhes
                    </button>
                    <button
                      onClick={() => alterarStatus(projeto.id, projeto.status === "ativo" ? "encerrado" : "ativo")}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-medium transition"
                    >
                      <RefreshCw size={12} />
                      {projeto.status === "ativo" ? "Encerrar" : "Reativar"}
                    </button>
                    <button
                      onClick={() => deletarProjeto(projeto.id)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Detalhe expandido */}
                {projetoDetalhe?.id === projeto.id && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-3">
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Credenciais de Acesso</p>
                    <div className="space-y-2">
                      {(projeto.acessos || []).map((acesso, idx) => (
                        <div key={idx} className="bg-white rounded-lg border border-slate-200 p-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800">{acesso.email}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">Senha: {acesso.senha}</p>
                          </div>
                          <button
                            onClick={() => copiar(acesso.senha, `${projeto.id}-${idx}`)}
                            className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                          >
                            {copied === `${projeto.id}-${idx}` ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                            {copied === `${projeto.id}-${idx}` ? "Copiado" : "Copiar senha"}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <ExternalLink size={11} />
                        Link do portal: <span className="font-mono text-[#1A4731]">{UPLOAD_APP_URL}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo Projeto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#1A2B1F]">Novo Projeto</h2>
              <p className="text-sm text-slate-500 mt-0.5">Preencha os dados e enviaremos os acessos automaticamente</p>
            </div>
            <div className="p-6 space-y-4">
              {/* AP/OS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">AP/OS</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono pointer-events-none">
                    {form.ap_os ? "" : "AP-XXXXX/XX-XXX"}
                  </span>
                  <input
                    value={form.ap_os}
                    onChange={e => setForm(f => ({ ...f, ap_os: formatAP(e.target.value) }))}
                    placeholder="AP-XXXXX/XX-XXX"
                    maxLength={15}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20 focus:border-[#1A4731]"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Digite apenas os números — o formato é aplicado automaticamente</p>
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nome da Empresa</label>
                <input
                  value={form.empresa}
                  onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                  placeholder="Ex: Empresa XYZ Ltda"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20 focus:border-[#1A4731]"
                />
              </div>

              {/* Emails */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">E-mails de Acesso</label>
                <textarea
                  value={form.emails}
                  onChange={e => setForm(f => ({ ...f, emails: e.target.value }))}
                  placeholder={"email1@empresa.com\nemail2@empresa.com"}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20 focus:border-[#1A4731] resize-none"
                />
                <p className="text-xs text-slate-400 mt-1">Um e-mail por linha, ou separados por vírgula. Cada e-mail receberá uma senha única.</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-700">
                  <Mail size={12} className="inline mr-1" />
                  Cada e-mail receberá uma mensagem com credenciais de acesso e o link do portal de envio de arquivos.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
              <button
                onClick={() => { setShowModal(false); setForm({ ap_os: "", empresa: "", emails: "" }); }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={criarProjeto}
                disabled={saving || !form.ap_os || !form.empresa || !form.emails.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-[#1A4731] hover:bg-[#245E40] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition"
              >
                {saving ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                {saving ? "Criando e enviando..." : "Criar e Enviar Acessos"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}