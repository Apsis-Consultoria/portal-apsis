import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FileText, FileCheck, FileClock, Upload, Plus, ExternalLink, Trash2,
  HelpCircle, X, ChevronRight, BookOpen, Folder, Share2, FolderOpen,
  CheckCircle2, Users, Calendar, Eye, EyeOff, Link2
} from "lucide-react";

const TIPO_ICONS = {
  "Laudo": "📊", "Relatório": "📋", "Contrato": "📝",
  "Proposta": "💼", "Apresentação": "📑", "Planilha": "📈", "Outro": "📄"
};

const TIPO_COLORS = {
  "Laudo":        "bg-violet-100 text-violet-700 border-violet-200",
  "Relatório":    "bg-blue-100 text-blue-700 border-blue-200",
  "Contrato":     "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Proposta":     "bg-orange-100 text-orange-700 border-orange-200",
  "Apresentação": "bg-pink-100 text-pink-700 border-pink-200",
  "Planilha":     "bg-teal-100 text-teal-700 border-teal-200",
  "Outro":        "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_STYLE = {
  "Rascunho":   { bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400"   },
  "Em revisão": { bg: "bg-yellow-50",   text: "text-yellow-700",  dot: "bg-yellow-400"  },
  "Aprovado":   { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  "Entregue":   { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500"    },
};

const HELP_STEPS = [
  {
    icon: Folder,
    title: "Estrutura no SharePoint",
    desc: "Todos os documentos são armazenados no SharePoint da APSIS, organizados por projeto e tipo documental. O Portal registra metadados e mantém o link de acesso.",
  },
  {
    icon: Link2,
    title: "Como cadastrar",
    desc: "Abra ou crie o documento no SharePoint, copie o link de compartilhamento e cole no campo URL ao criar um novo registro aqui no Portal.",
  },
  {
    icon: FolderOpen,
    title: "Tipos documentais",
    desc: "Use o tipo correto: Laudo (avaliações técnicas), Relatório (relatórios periódicos), Contrato (acordos e contratos), Proposta (propostas comerciais), Apresentação e Planilha.",
  },
  {
    icon: Share2,
    title: "Compartilhamento com cliente",
    desc: "Marque 'Enviado ao cliente' para registrar que o documento foi compartilhado externamente. O controle de acesso real é feito no próprio SharePoint.",
  },
];

export default function ProjetosDocumentos({ data, onRefresh }) {
  const { documentos = [], projetos = [] } = data;

  const [filtroOS, setFiltroOS] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [showForm, setShowForm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    os_id: "", nome: "", tipo: "Laudo", url: "", versao: "1.0",
    status: "Rascunho", responsavel: "", enviado_cliente: false,
  });

  const filtrados = documentos.filter(d => {
    if (filtroOS !== "todos" && d.os_id !== filtroOS) return false;
    if (filtroTipo !== "todos" && d.tipo !== filtroTipo) return false;
    if (filtroStatus !== "todos" && d.status !== filtroStatus) return false;
    return true;
  });

  const projetoNome = (osId) => projetos.find(p => p.id === osId)?.cliente_nome || "—";

  const handleSave = async () => {
    if (!form.os_id || !form.nome || !form.tipo) return;
    setSaving(true);
    await base44.entities.DocumentoProjeto.create(form);
    setForm({ os_id: "", nome: "", tipo: "Laudo", url: "", versao: "1.0", status: "Rascunho", responsavel: "", enviado_cliente: false });
    setShowForm(false);
    onRefresh();
    setSaving(false);
  };

  const handleStatus = async (doc, novoStatus) => {
    await base44.entities.DocumentoProjeto.update(doc.id, { status: novoStatus });
    onRefresh();
  };

  const handleDelete = async (id) => {
    await base44.entities.DocumentoProjeto.delete(id);
    onRefresh();
  };

  const total = filtrados.length;
  const aprovados = filtrados.filter(d => ["Aprovado", "Entregue"].includes(d.status)).length;
  const emRevisao = filtrados.filter(d => d.status === "Em revisão").length;
  const enviados = filtrados.filter(d => d.enviado_cliente).length;

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Documentos</h2>
          <p className="text-sm text-slate-400 mt-0.5">Repositório documental integrado ao SharePoint</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHelp(!showHelp)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${showHelp ? "bg-[#1A4731] text-white border-[#1A4731]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
            <HelpCircle size={13} /> Ajuda
          </button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}
            className="bg-[#F47920] hover:bg-[#d96a18] text-white gap-1.5 text-xs">
            <Plus size={13} /> Novo Documento
          </Button>
        </div>
      </div>

      {/* Help / Onboarding drawer */}
      {showHelp && (
        <div className="bg-gradient-to-br from-[#1A4731]/5 to-[#1A4731]/0 border border-[#1A4731]/20 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1A4731]/10">
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-[#1A4731]" />
              <span className="text-sm font-semibold text-slate-800">Como funciona a gestão de documentos</span>
            </div>
            <button onClick={() => setShowHelp(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {HELP_STEPS.map((step, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#1A4731]/10 flex items-center justify-center flex-shrink-0">
                    <step.icon size={13} className="text-[#1A4731]" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{step.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="px-5 pb-4 flex flex-wrap gap-2">
            <a href="https://apsis.sharepoint.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-[#1A4731] border border-[#1A4731]/30 bg-white px-3 py-1.5 rounded-lg hover:bg-[#1A4731]/5 transition-colors">
              <ExternalLink size={11} /> Ver SharePoint
            </a>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-100 px-3 py-1.5 rounded-lg">
              <CheckCircle2 size={11} className="text-emerald-500" /> Cadastre → Vincule ao projeto → Compartilhe
            </span>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPIDoc icon={FileText}   color="blue"   label="Total de documentos" value={total} />
        <KPIDoc icon={FileCheck}  color="green"  label="Aprovados / Entregues" value={aprovados} />
        <KPIDoc icon={FileClock}  color="amber"  label="Em revisão" value={emRevisao} />
        <KPIDoc icon={Upload}     color="orange" label="Enviados ao cliente" value={enviados} />
      </div>

      {/* Filters + actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={filtroOS} onValueChange={setFiltroOS}>
            <SelectTrigger className="w-52 h-9 text-xs"><SelectValue placeholder="Todos os projetos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os projetos</SelectItem>
              {projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.cliente_nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {["Laudo","Relatório","Contrato","Proposta","Apresentação","Planilha","Outro"].map(t => (
                <SelectItem key={t} value={t}>{TIPO_ICONS[t]} {t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-36 h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {["Rascunho","Em revisão","Aprovado","Entregue"].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="ml-auto text-xs text-slate-400">
            {filtrados.length} documento{filtrados.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* New document form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#1A4731]/20 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-[#1A4731]/5">
            <span className="text-sm font-semibold text-slate-700">Novo Documento</span>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Projeto *</label>
                <Select value={form.os_id} onValueChange={v => setForm(f => ({ ...f, os_id: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
                  <SelectContent>{projetos.map(p => <SelectItem key={p.id} value={p.id}>{p.cliente_nome}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Nome do documento *</label>
                <Input className="h-9 text-xs" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} placeholder="Ex: Laudo de Avaliação v2" />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Tipo *</label>
                <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Laudo","Relatório","Contrato","Proposta","Apresentação","Planilha","Outro"].map(t => (
                      <SelectItem key={t} value={t}>{TIPO_ICONS[t]} {t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">URL SharePoint</label>
                <Input className="h-9 text-xs" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://apsis.sharepoint.com/sites/..." />
              </div>
              <div>
                <label className="text-xs text-slate-500 font-medium mb-1.5 block">Responsável</label>
                <Input className="h-9 text-xs" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} placeholder="Nome do responsável" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.enviado_cliente} onChange={e => setForm(f => ({ ...f, enviado_cliente: e.target.checked }))}
                  className="w-3.5 h-3.5 rounded accent-[#1A4731]" />
                <span className="text-xs text-slate-600">Enviado ao cliente</span>
              </label>
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowForm(false)} className="text-xs">Cancelar</Button>
                <Button size="sm" onClick={handleSave} disabled={saving} className="bg-[#1A4731] hover:bg-[#245E40] text-xs">
                  {saving ? "Salvando..." : "Salvar documento"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document list */}
      {filtrados.length === 0 ? (
        <EmptyDocumentos hasFilters={filtroOS !== "todos" || filtroTipo !== "todos" || filtroStatus !== "todos"} onNovo={() => setShowForm(true)} onHelp={() => setShowHelp(true)} />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {["Documento", "Projeto", "Responsável", "Status", "Visibilidade", "Data", ""].map((h, i) => (
                  <th key={i} className={`text-left px-4 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider ${i > 2 ? "hidden md:table-cell" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtrados.map(d => <DocRow key={d.id} d={d} projetoNome={projetoNome} onStatus={handleStatus} onDelete={handleDelete} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function DocRow({ d, projetoNome, onStatus, onDelete }) {
  const s = STATUS_STYLE[d.status] || STATUS_STYLE["Rascunho"];
  const tipoColor = TIPO_COLORS[d.tipo] || TIPO_COLORS["Outro"];

  return (
    <tr className="hover:bg-slate-50/60 transition-colors group">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none">{TIPO_ICONS[d.tipo] || "📄"}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{d.nome}</div>
            <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded-md border mt-0.5 ${tipoColor}`}>{d.tipo}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-xs text-slate-600 max-w-[140px]">
        <span className="truncate block">{projetoNome(d.os_id)}</span>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Users size={11} className="text-slate-400" />
          <span className="truncate max-w-[100px]">{d.responsavel || "—"}</span>
        </div>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <Select value={d.status} onValueChange={v => onStatus(d, v)}>
          <SelectTrigger className="border-0 p-0 h-auto w-auto shadow-none bg-transparent focus:ring-0">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
              {d.status}
            </span>
          </SelectTrigger>
          <SelectContent>
            {["Rascunho","Em revisão","Aprovado","Entregue"].map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${d.enviado_cliente ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"}`}>
          {d.enviado_cliente ? <><Eye size={10} /> Enviado</> : <><EyeOff size={10} /> Interno</>}
        </div>
      </td>
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar size={10} />
          {d.created_date ? new Date(d.created_date).toLocaleDateString("pt-BR") : "—"}
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {d.url && (
            <a href={d.url} target="_blank" rel="noopener noreferrer" title="Abrir no SharePoint"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-300 hover:text-blue-500 transition-colors">
              <ExternalLink size={13} />
            </a>
          )}
          <button onClick={() => onDelete(d.id)} title="Remover"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function KPIDoc({ icon: Icon, color, label, value }) {
  const palette = {
    blue:   { icon: "text-blue-500",    bg: "bg-blue-50",    border: "border-blue-100"   },
    green:  { icon: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    amber:  { icon: "text-amber-500",   bg: "bg-amber-50",   border: "border-amber-100"  },
    orange: { icon: "text-[#F47920]",   bg: "bg-orange-50",  border: "border-orange-100" },
  };
  const c = palette[color] || palette.blue;
  return (
    <div className={`bg-white rounded-xl border ${c.border} p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={17} className={c.icon} />
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 leading-tight">{value}</div>
          <div className="text-xs text-slate-500 mt-0.5">{label}</div>
        </div>
      </div>
    </div>
  );
}

function EmptyDocumentos({ hasFilters, onNovo, onHelp }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto mb-5">
        <FileText size={24} className="text-slate-300" />
      </div>
      {hasFilters ? (
        <>
          <h3 className="text-base font-semibold text-slate-600 mb-1">Nenhum documento encontrado</h3>
          <p className="text-sm text-slate-400 mb-5">Ajuste os filtros para ver outros documentos do portfólio.</p>
        </>
      ) : (
        <>
          <h3 className="text-base font-semibold text-slate-700 mb-1">Comece a organizar seus documentos</h3>
          <p className="text-sm text-slate-400 mb-2 max-w-sm mx-auto">
            Cadastre documentos do SharePoint, vincule aos projetos e acompanhe o status de revisão e entrega ao cliente.
          </p>
          <p className="text-xs text-slate-300 mb-6">Os arquivos continuam no SharePoint — o Portal apenas gerencia os metadados e o fluxo.</p>
        </>
      )}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button size="sm" onClick={onNovo} className="bg-[#F47920] hover:bg-[#d96a18] text-white gap-1.5 text-xs">
          <Plus size={13} /> Novo Documento
        </Button>
        {!hasFilters && (
          <Button size="sm" variant="outline" onClick={onHelp} className="gap-1.5 text-xs">
            <HelpCircle size={13} /> Como funciona
          </Button>
        )}
      </div>
    </div>
  );
}