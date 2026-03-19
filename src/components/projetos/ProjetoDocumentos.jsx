import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, Plus, Upload, Check, Trash2, ExternalLink, Send,
  X, Loader2, HelpCircle, FolderOpen, Link2, AlertCircle, ChevronDown
} from "lucide-react";

const TIPO_ICON = {
  "Laudo": "📋", "Relatório": "📊", "Contrato": "📝",
  "Proposta": "💼", "Apresentação": "🖼", "Planilha": "📈", "Outro": "📄"
};

const STATUS_STYLE = {
  "Rascunho":   { badge: "bg-slate-100 text-slate-500",     dot: "bg-slate-400"   },
  "Em revisão": { badge: "bg-amber-100 text-amber-700",     dot: "bg-amber-400"   },
  "Aprovado":   { badge: "bg-blue-100 text-blue-700",       dot: "bg-blue-500"    },
  "Entregue":   { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const EMPTY_FORM = {
  nome: "", tipo: "Laudo", versao: "1.0", responsavel: "",
  data_entrega: "", observacoes: "", status: "Rascunho", url: ""
};

export default function ProjetoDocumentos({ osId, projeto }) {
  const [documentos, setDocumentos] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [showHelp,   setShowHelp]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [filter,     setFilter]     = useState("todos");
  const [form,       setForm]       = useState(EMPTY_FORM);

  // SharePoint URL from projeto or config
  const spUrl = projeto?.sharepoint_url || null;

  useEffect(() => {
    base44.entities.DocumentoProjeto.filter({ os_id: osId }).then(d => {
      setDocumentos(d);
      setLoading(false);
    });
  }, [osId]);

  const salvar = async () => {
    if (!form.nome || !form.tipo) return;
    setSaving(true);
    const novo = await base44.entities.DocumentoProjeto.create({ ...form, os_id: osId });
    setDocumentos(prev => [novo, ...prev]);
    setShowForm(false);
    setForm(EMPTY_FORM);
    setSaving(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, url: file_url, nome: f.nome || file.name }));
    setUploading(false);
  };

  const atualizarStatus = async (id, status) => {
    await base44.entities.DocumentoProjeto.update(id, { status });
    setDocumentos(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const marcarEntregue = async (id) => {
    await base44.entities.DocumentoProjeto.update(id, { status: "Entregue", enviado_cliente: true });
    setDocumentos(prev => prev.map(d => d.id === id ? { ...d, status: "Entregue", enviado_cliente: true } : d));
  };

  const excluir = async (id) => {
    await base44.entities.DocumentoProjeto.delete(id);
    setDocumentos(prev => prev.filter(d => d.id !== id));
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
    </div>
  );

  const filtered = filter === "todos" ? documentos : documentos.filter(d => d.status === filter);
  const porStatus = (s) => documentos.filter(d => d.status === s).length;

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">

      {/* ── KPIs ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        {["Rascunho", "Em revisão", "Aprovado", "Entregue"].map(s => {
          const st = STATUS_STYLE[s];
          return (
            <button key={s} onClick={() => setFilter(filter === s ? "todos" : s)}
              className={`bg-white rounded-2xl border p-4 text-center hover:shadow-md transition-all ${filter === s ? "ring-2 ring-[#1A4731]/30 border-[#1A4731]/30" : "border-slate-200"}`}>
              <div className={`text-2xl font-bold ${filter === s ? "text-[#1A4731]" : "text-slate-800"}`}>{porStatus(s)}</div>
              <div className="flex items-center justify-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                <span className="text-xs text-slate-500">{s}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── SharePoint Banner ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <FolderOpen size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">SharePoint</p>
            <p className="text-xs text-slate-400">Acesso rápido à biblioteca de documentos integrada</p>
          </div>
        </div>
        <div className="flex gap-2">
          {spUrl ? (
            <a href={spUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                <ExternalLink size={12} /> Abrir SharePoint
              </Button>
            </a>
          ) : (
            <span className="text-xs text-slate-400 italic">URL do SharePoint não configurada — acesse Configurações do projeto</span>
          )}
          <button onClick={() => setShowHelp(!showHelp)}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#1A4731] hover:border-[#1A4731]/30 transition-colors">
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {/* ── Help panel ────────────────────────────────────────────────── */}
      {showHelp && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2"><HelpCircle size={14} /> Como usar documentos neste projeto</h4>
            <button onClick={() => setShowHelp(false)} className="text-blue-400 hover:text-blue-600"><X size={14} /></button>
          </div>
          <ul className="space-y-2 text-xs text-blue-700">
            <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Registre documentos fazendo upload direto ou colando uma URL externa (SharePoint, Drive, etc.).</li>
            <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Use o fluxo de status: <strong>Rascunho → Em revisão → Aprovado → Entregue</strong> para controle do ciclo de vida.</li>
            <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Ao marcar "Entregar", o documento é registrado como enviado ao cliente.</li>
            <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Configure a URL do SharePoint na aba <strong>Configurações</strong> do projeto para acesso rápido.</li>
          </ul>
        </div>
      )}

      {/* ── Actions ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button size="sm" onClick={() => setShowForm(!showForm)}
          variant="outline" className="gap-1.5 text-xs border-slate-300">
          <Plus size={12} /> Novo Documento
        </Button>
        {filter !== "todos" && (
          <button onClick={() => setFilter("todos")}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
            <X size={10} /> limpar filtro
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400">{filtered.length} documento{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[#1A4731]/20 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-[#1A4731]/5">
            <span className="text-sm font-semibold text-slate-700">Novo Documento</span>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Field label="Nome *" span={2}>
                <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  placeholder="Título do documento" className="h-9 text-sm" />
              </Field>
              <Field label="Tipo *">
                <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Laudo","Relatório","Contrato","Proposta","Apresentação","Planilha","Outro"].map(t =>
                      <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Versão">
                <Input value={form.versao} onChange={e => setForm(f => ({ ...f, versao: e.target.value }))} className="h-9 text-sm" />
              </Field>
              <Field label="Responsável">
                <Input value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} className="h-9 text-sm" />
              </Field>
              <Field label="Prazo entrega">
                <Input type="date" value={form.data_entrega} onChange={e => setForm(f => ({ ...f, data_entrega: e.target.value }))} className="h-9 text-sm" />
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Rascunho","Em revisão","Aprovado","Entregue"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            {/* URL / Upload */}
            <Field label="Arquivo ou Link">
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1.5 cursor-pointer border border-slate-200 rounded-lg px-3 h-9 text-xs text-slate-600 hover:bg-slate-50 flex-shrink-0">
                  <Upload size={12} />
                  {uploading ? <Loader2 size={12} className="animate-spin" /> : "Upload"}
                  <input type="file" className="hidden" onChange={handleUpload} />
                </label>
                {form.url ? (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Check size={11} /> Arquivo anexado</span>
                ) : (
                  <Input placeholder="Ou cole uma URL (SharePoint, Drive...)" value={form.url}
                    onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="h-9 text-xs flex-1" />
                )}
              </div>
            </Field>
            <Field label="Observações">
              <Input value={form.observacoes} onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                placeholder="Notas" className="h-9 text-sm" />
            </Field>
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs">Cancelar</Button>
              <Button size="sm" onClick={salvar} disabled={saving}
                className="bg-[#1A4731] hover:bg-[#245E40] text-white text-xs gap-1.5">
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Salvar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Lista ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <FileText size={14} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">Documentos do Projeto</span>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <FolderOpen size={28} className="text-slate-200" />
            <p className="text-sm text-slate-400 italic">Nenhum documento {filter !== "todos" ? `com status "${filter}"` : "cadastrado"}.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(d => {
              const st = STATUS_STYLE[d.status] || STATUS_STYLE["Rascunho"];
              return (
                <div key={d.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 group flex-wrap">
                  <span className="text-xl flex-shrink-0">{TIPO_ICON[d.tipo] || "📄"}</span>
                  <div className="flex-1 min-w-[180px]">
                    <p className="text-sm font-semibold text-slate-800">{d.nome}</p>
                    <p className="text-xs text-slate-400">{d.tipo} · v{d.versao || "1.0"}{d.responsavel ? ` · ${d.responsavel}` : ""}</p>
                  </div>
                  {d.data_entrega && (
                    <span className="text-xs text-slate-400">{new Date(d.data_entrega + "T00:00:00").toLocaleDateString("pt-BR")}</span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${st.badge}`}>
                    <span className={`w-1 h-1 rounded-full ${st.dot}`} />{d.status}
                  </span>
                  {d.enviado_cliente && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">Enviado ao cliente</span>
                  )}
                  <div className="flex gap-1 flex-wrap">
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer"
                        className="w-6 h-6 flex items-center justify-center rounded text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <ExternalLink size={12} />
                      </a>
                    )}
                    {d.status === "Rascunho" && (
                      <button onClick={() => atualizarStatus(d.id, "Em revisão")}
                        className="text-[10px] border border-amber-200 text-amber-600 rounded px-1.5 py-0.5 hover:bg-amber-50 transition-colors">
                        Revisar
                      </button>
                    )}
                    {d.status === "Em revisão" && (
                      <button onClick={() => atualizarStatus(d.id, "Aprovado")}
                        className="text-[10px] border border-blue-200 text-blue-600 rounded px-1.5 py-0.5 hover:bg-blue-50 transition-colors">
                        Aprovar
                      </button>
                    )}
                    {d.status !== "Entregue" && (
                      <button onClick={() => marcarEntregue(d.id)}
                        className="text-[10px] border border-violet-200 text-violet-600 rounded px-1.5 py-0.5 hover:bg-violet-50 transition-colors flex items-center gap-0.5">
                        <Send size={9} /> Entregar
                      </button>
                    )}
                    <button onClick={() => excluir(d.id)}
                      className="w-6 h-6 flex items-center justify-center rounded text-slate-200 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, span, children }) {
  return (
    <div className={span === 2 ? "col-span-2" : span === 3 ? "col-span-3" : ""}>
      <label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}