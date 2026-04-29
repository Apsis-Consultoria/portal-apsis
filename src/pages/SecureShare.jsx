import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Plus, Trash2, Eye, EyeOff, Mail, Lock, Building2,
  FileText, Share2, CheckCircle2, AlertCircle, Loader2,
  RefreshCw, Paperclip, X, Shield, Users, Calendar
} from "lucide-react";

const AREAS = ["Contábil", "Tributária", "Societária", "M&A", "Projetos Especiais", "Outros"];

function gerarSenha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function SecureShare() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [showSenhas, setShowSenhas] = useState({});
  const [uploadingArquivos, setUploadingArquivos] = useState(false);
  const [arquivos, setArquivos] = useState([]); // [{nome, url}]
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    ap_os: "",
    empresa: "",
    area: "",
    contatos: [{ nome: "", email: "", senha: gerarSenha() }],
  });

  const carregarProjetos = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("secureShareList", {});
      setProjetos(res.data?.data || []);
    } catch {
      setProjetos([]);
    }
    setLoading(false);
  };

  useEffect(() => { carregarProjetos(); }, []);

  const addContato = () =>
    setForm(f => ({ ...f, contatos: [...f.contatos, { nome: "", email: "", senha: gerarSenha() }] }));

  const removeContato = (i) =>
    setForm(f => ({ ...f, contatos: f.contatos.filter((_, idx) => idx !== i) }));

  const updateContato = (i, field, value) =>
    setForm(f => {
      const contatos = [...f.contatos];
      contatos[i] = { ...contatos[i], [field]: value };
      return { ...f, contatos };
    });

  const toggleSenha = (i) =>
    setShowSenhas(prev => ({ ...prev, [i]: !prev[i] }));

  const handleArquivoSelecionado = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingArquivos(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setArquivos(prev => [...prev, { nome: file.name, url: file_url }]);
    }
    setUploadingArquivos(false);
    e.target.value = "";
  };

  const handleSalvar = async () => {
    const acessos = form.contatos.filter(c => c.email.trim());
    if (!form.ap_os.trim() || !form.empresa.trim() || acessos.length === 0) {
      setGlobalError("Preencha AP/OS, empresa e pelo menos um e-mail.");
      return;
    }
    setSaving(true);
    setGlobalError(null);

    await base44.functions.invoke("secureShareCreate", {
      ap_os: form.ap_os,
      empresa: form.empresa,
      emails: JSON.stringify(acessos),
      area: form.area || null,
      status: "ativo",
      criado_em: new Date().toISOString(),
      arquivos: arquivos.length > 0 ? JSON.stringify(arquivos) : null,
    });

    await carregarProjetos();
    setShowModal(false);
    setForm({ ap_os: "", empresa: "", area: "", contatos: [{ nome: "", email: "", senha: gerarSenha() }] });
    setArquivos([]);
    setSaving(false);
  };

  const statusColor = {
    active: "bg-emerald-100 text-emerald-700",
    inactive: "bg-slate-100 text-slate-500",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A4731] flex items-center gap-2">
            <Shield size={22} className="text-[#F47920]" /> Secure Share
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Compartilhe projetos com clientes de forma segura e rastreável.</p>
        </div>
        <Button
          onClick={() => { setShowModal(true); setGlobalError(null); }}
          className="bg-[#1A4731] hover:bg-[#1A4731]/90 text-white gap-2"
        >
          <Plus size={16} /> Novo Projeto
        </Button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 size={24} className="animate-spin mr-2" /> Carregando...
        </div>
      ) : projetos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Share2 size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm">Nenhum projeto compartilhado ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projetos.map((p, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800">{p.ap_os}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-medium">{p.empresa}</span>
                    {p.area && (
                      <span className="text-xs px-2 py-0.5 bg-[#1A4731]/10 text-[#1A4731] rounded-full font-medium">
                        {p.area}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {p.emails}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {p.criado_em ? new Date(p.criado_em).toLocaleDateString("pt-BR") : "—"}
                    </span>
                    {p.arquivos && (
                      <span className="flex items-center gap-1">
                        <Paperclip size={11} /> {(() => { try { return JSON.parse(p.arquivos).length; } catch { return 1; } })()} arquivo(s)
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${statusColor[p.status] || statusColor.inactive}`}>
                  {p.status === "active" ? "Ativo" : "Encerrado"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Novo Projeto Seguro</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* AP/OS e Empresa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">AP / OS *</label>
                  <input
                    value={form.ap_os}
                    onChange={e => setForm(f => ({ ...f, ap_os: e.target.value }))}
                    placeholder="Ex: AP-2025-042"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4731] bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Empresa *</label>
                  <input
                    value={form.empresa}
                    onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                    placeholder="Ex: Empresa XYZ Ltda"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4731] bg-slate-50"
                  />
                </div>
              </div>

              {/* Área */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Área</label>
                <select
                  value={form.area}
                  onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4731] bg-slate-50"
                >
                  <option value="">Selecione...</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Contatos */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600">Contatos com acesso *</label>
                  <button onClick={addContato} className="text-xs text-[#1A4731] font-semibold flex items-center gap-1 hover:opacity-70">
                    <Plus size={13} /> Adicionar
                  </button>
                </div>
                <div className="space-y-3">
                  {form.contatos.map((c, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={c.nome}
                          onChange={e => updateContato(i, "nome", e.target.value)}
                          placeholder="Nome"
                          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4731]"
                        />
                        <input
                          value={c.email}
                          onChange={e => updateContato(i, "email", e.target.value)}
                          placeholder="E-mail *"
                          type="email"
                          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4731]"
                        />
                      </div>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1 relative">
                          <Lock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            value={c.senha}
                            onChange={e => updateContato(i, "senha", e.target.value)}
                            type={showSenhas[i] ? "text" : "password"}
                            className="w-full border border-slate-200 rounded-lg pl-8 pr-8 py-2 text-sm bg-white focus:outline-none focus:border-[#1A4731] font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => toggleSenha(i)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showSenhas[i] ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateContato(i, "senha", gerarSenha())}
                          className="p-2 text-slate-400 hover:text-[#1A4731] transition"
                          title="Gerar nova senha"
                        >
                          <RefreshCw size={14} />
                        </button>
                        {form.contatos.length > 1 && (
                          <button onClick={() => removeContato(i)} className="p-2 text-slate-400 hover:text-red-500 transition">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arquivos */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Arquivos para compartilhar</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleArquivoSelecionado}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingArquivos}
                  className="flex items-center gap-2 text-xs px-3 py-2.5 border border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-[#1A4731] hover:text-[#1A4731] transition w-full justify-center"
                >
                  {uploadingArquivos
                    ? <><RefreshCw size={13} className="animate-spin" /> Enviando...</>
                    : <><Paperclip size={13} /> Anexar arquivos</>}
                </button>
                {arquivos.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {arquivos.map((arq, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <FileText size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-700 flex-1 truncate">{arq.nome}</span>
                        <button
                          type="button"
                          onClick={() => setArquivos(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Aviso */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-700">
                  <Mail size={12} className="inline mr-1" />
                  Cada e-mail receberá credenciais de acesso e o link do portal de envio de arquivos.
                </p>
              </div>

              {globalError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle size={15} /> {globalError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-[#1A4731] hover:bg-[#1A4731]/90 text-white gap-2"
                  onClick={handleSalvar}
                  disabled={saving || uploadingArquivos}
                >
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Salvando...</> : <><CheckCircle2 size={15} /> Criar Projeto</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}