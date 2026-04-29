import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Plus, Mail, FileText, Share2, Shield, Users, Calendar,
  Loader2, CheckCircle2, AlertCircle, X, Paperclip, RefreshCw, Send
} from "lucide-react";

const AREAS = ["M&A", "Business Valuation", "Consultoria Contábil", "Ativos Fixos"];

function gerarSenha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function formatApOs(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 5) return digits ? `AP-${digits}` : "";
  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 7);
  const part3 = digits.slice(7, 10);
  let result = `AP-${part1}`;
  if (part2) result += `/${part2}`;
  if (part3) result += `-${part3}`;
  return result;
}

export default function SecureShare() {
  const [projetos, setProjetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [uploadingArquivos, setUploadingArquivos] = useState(false);
  const [arquivos, setArquivos] = useState([]);
  const fileInputRef = useRef();

  const [form, setForm] = useState({
    ap_os: "",
    empresa: "",
    area: "",
    contatos: [{ nome: "", email: "" }],
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
    setForm(f => ({ ...f, contatos: [...f.contatos, { nome: "", email: "" }] }));

  const removeContato = (i) =>
    setForm(f => ({ ...f, contatos: f.contatos.filter((_, idx) => idx !== i) }));

  const updateContato = (i, field, value) =>
    setForm(f => {
      const contatos = [...f.contatos];
      contatos[i] = { ...contatos[i], [field]: value };
      return { ...f, contatos };
    });

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
    const acessos = form.contatos
      .filter(c => c.email.trim())
      .map(c => ({ ...c, senha: gerarSenha() }));

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
    setForm({ ap_os: "", empresa: "", area: "", contatos: [{ nome: "", email: "" }] });
    setArquivos([]);
    setSaving(false);
  };

  const openModal = () => {
    setForm({ ap_os: "", empresa: "", area: "", contatos: [{ nome: "", email: "" }] });
    setArquivos([]);
    setGlobalError(null);
    setShowModal(true);
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
          <p className="text-sm text-slate-500 mt-0.5">Crie projetos e envie links de acesso seguro para clientes.</p>
        </div>
        <Button onClick={openModal} className="bg-[#1A4731] hover:bg-[#1A4731]/90 text-white gap-2">
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

            <div className="p-6 pb-2">
              <h2 className="text-xl font-bold text-slate-900">Novo Projeto</h2>
              <p className="text-sm text-slate-500 mt-0.5">Preencha os dados e enviaremos os acessos automaticamente</p>
            </div>

            <div className="p-6 space-y-5">

              {/* AP/OS */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">AP/OS</label>
                <input
                  value={form.ap_os}
                  onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, "");
                    setForm(f => ({ ...f, ap_os: formatApOs(raw) }));
                  }}
                  placeholder="AP-XXXXX/XX-XXX"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A4731] focus:ring-2 focus:ring-[#1A4731]/10 bg-white"
                />
                <p className="text-xs text-slate-400 mt-1">Digite apenas os números — o formato é aplicado automaticamente</p>
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nome da Empresa</label>
                <input
                  value={form.empresa}
                  onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                  placeholder="Ex: Empresa XYZ Ltda"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1A4731] focus:ring-2 focus:ring-[#1A4731]/10 bg-white"
                />
              </div>

              {/* Área */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Área</label>
                <div className="grid grid-cols-2 gap-2">
                  {AREAS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, area: f.area === a ? "" : a }))}
                      className={`px-3 py-2.5 rounded-xl text-sm font-medium border transition text-left ${
                        form.area === a
                          ? "border-[#1A4731] bg-[#1A4731]/5 text-[#1A4731]"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contatos */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Contatos de Acesso</label>
                <div className="space-y-2">
                  {form.contatos.map((c, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={c.nome}
                        onChange={e => updateContato(i, "nome", e.target.value)}
                        placeholder="Nome da pessoa"
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4731] bg-white"
                      />
                      <input
                        value={c.email}
                        onChange={e => updateContato(i, "email", e.target.value)}
                        placeholder="email@empresa.com"
                        type="email"
                        className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1A4731] bg-white"
                      />
                      {form.contatos.length > 1 && (
                        <button onClick={() => removeContato(i)} className="text-slate-300 hover:text-red-400 transition flex-shrink-0">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addContato}
                  className="mt-2 text-sm text-slate-500 hover:text-[#1A4731] flex items-center gap-1 transition"
                >
                  <Plus size={14} /> Adicionar outro contato
                </button>
              </div>

              {/* Arquivos */}
              <div>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleArquivoSelecionado} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingArquivos}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#1A4731] transition"
                >
                  {uploadingArquivos
                    ? <><RefreshCw size={13} className="animate-spin" /> Enviando arquivos...</>
                    : <><Paperclip size={13} /> Anexar arquivos</>}
                </button>
                {arquivos.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {arquivos.map((arq, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <FileText size={12} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs text-slate-700 flex-1 truncate">{arq.nome}</span>
                        <button type="button" onClick={() => setArquivos(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition">
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
                  Cada e-mail receberá uma mensagem com credenciais de acesso e o link do portal de envio de arquivos.
                </p>
              </div>

              {globalError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle size={15} /> {globalError}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)} disabled={saving}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-[#1A4731] hover:bg-[#1A4731]/90 text-white gap-2"
                  onClick={handleSalvar}
                  disabled={saving || uploadingArquivos}
                >
                  {saving
                    ? <><Loader2 size={15} className="animate-spin" /> Salvando...</>
                    : <><Send size={15} /> Criar e Enviar Acessos</>}
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}