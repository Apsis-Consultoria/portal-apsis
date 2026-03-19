import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import PageHeader from "./shared/PageHeader";
import {
  Save, Settings, Calendar, FileText, AlertCircle,
  Users, Lock, Link2, Eye, Building2, Check, Loader2, ExternalLink
} from "lucide-react";
import ObservacoesLog from "./shared/ObservacoesLog";

const STATUS_OPTIONS = ["Não iniciado", "Ativo", "Pausado", "Cancelado"];

const TABS = [
  { id: "geral",        label: "Geral",                       icon: Settings  },
  { id: "responsaveis", label: "Equipe",                      icon: Users     },
  { id: "integracoes",  label: "SharePoint & Integrações",    icon: Link2     },
  { id: "clientes",     label: "Cliente",                     icon: Building2 },
  { id: "permissoes",   label: "Permissões",                  icon: Lock      },
];

export default function ProjetoConfig({ projeto, onUpdate, osId }) {
  const [tab,    setTab]    = useState("geral");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const [form, setForm] = useState({
    status:                projeto.status || "Não iniciado",
    responsavel_tecnico:   projeto.responsavel_tecnico || "",
    prazo_previsto:        projeto.prazo_previsto || "",
    percentual_conclusao:  projeto.percentual_conclusao ?? 0,
    descricao:             projeto.descricao || "",
    observacoes:           projeto.observacoes || "",
    gerente_projeto:       projeto.gerente_projeto || "",
    equipe_tecnica:        projeto.equipe_tecnica || "",
    aprovador:             projeto.aprovador || "",
    visivel_cliente:       projeto.visivel_cliente ?? false,
    permite_download:      projeto.permite_download ?? true,
    sharepoint_url:        projeto.sharepoint_url || "",
    teams_channel:         projeto.teams_channel || "",
    external_ref:          projeto.external_ref || "",
    cliente_contato:       projeto.cliente_contato || "",
    cliente_email:         projeto.cliente_email || "",
    cliente_portal_access: projeto.cliente_portal_access ?? false,
    confidencial:          projeto.confidencial ?? false,
    apenas_responsaveis:   projeto.apenas_responsaveis ?? false,
    observacoes_log:       projeto.observacoes_log || "",
  });

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.OrdemServico.update(osId, form);
    onUpdate({ ...projeto, ...form });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = (key) => (e) =>
    setForm(f => ({ ...f, [key]: e?.target ? e.target.value : e }));
  const toggle = (key) => setForm(f => ({ ...f, [key]: !f[key] }));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">

      <PageHeader
        title="Configurações do Projeto"
        subtitle="Parâmetros operacionais, responsabilidades, permissões e integrações"
        icon={Settings}
      />

      {/* Tab nav */}
      <div className="flex overflow-x-auto gap-1 bg-slate-100/70 rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              tab === id ? "bg-white shadow-sm text-[#1A4731]" : "text-slate-500 hover:text-slate-700"
            }`}>
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">

        {/* ── Geral ─────────────────────────────────────────────────────── */}
        {tab === "geral" && (
          <>
            <Section label="Status" icon={AlertCircle}>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(s => (
                  <button key={s} onClick={() => setForm(f => ({ ...f, status: s }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.status === s
                        ? "bg-[#1A4731] text-white border-[#1A4731]"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}>{s}</button>
                ))}
              </div>
            </Section>

            <Section label="Prazo & Progresso" icon={Calendar}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Prazo previsto</label>
                  <input type="date" value={form.prazo_previsto} onChange={set("prazo_previsto")}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20" />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">% Conclusão — <strong>{form.percentual_conclusao}%</strong></label>
                  <input type="range" min={0} max={100} step={5} value={form.percentual_conclusao}
                    onChange={e => setForm(f => ({ ...f, percentual_conclusao: Number(e.target.value) }))}
                    className="w-full accent-[#1A4731] mt-2" />
                </div>
              </div>
            </Section>

            <Section label="Descrição do Projeto" icon={FileText}>
              <textarea value={form.descricao} onChange={set("descricao")} rows={3}
                placeholder="Contexto, objetivos e escopo do projeto..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20" />
            </Section>

            <Section label="Observações / Histórico" icon={FileText}>
              <ObservacoesLog
                value={form.observacoes_log || ""}
                onChange={(val) => setForm(f => ({ ...f, observacoes_log: val }))}
                currentUser="Usuário"
                label="Log de Observações do Projeto"
              />
            </Section>
          </>
        )}

        {/* ── Equipe ────────────────────────────────────────────────────── */}
        {tab === "responsaveis" && (
          <Section label="Equipe do Projeto" icon={Users}>
            <div className="space-y-3">
              <InputField label="Responsável Técnico *" value={form.responsavel_tecnico}
                onChange={set("responsavel_tecnico")} placeholder="Nome do responsável técnico" />
              <InputField label="Gerente do Projeto" value={form.gerente_projeto}
                onChange={set("gerente_projeto")} placeholder="Nome do gerente de projeto" />
              <InputField label="Equipe Técnica" value={form.equipe_tecnica}
                onChange={set("equipe_tecnica")} placeholder="Nomes separados por vírgula" />
              <InputField label="Aprovador de Entregas" value={form.aprovador}
                onChange={set("aprovador")} placeholder="Quem aprova as entregas finais" />
            </div>
          </Section>
        )}

        {/* ── SharePoint & Integrações ──────────────────────────────────── */}
        {tab === "integracoes" && (
          <>
            {/* SharePoint */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[11px] font-bold tracking-tight">SP</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">Microsoft SharePoint</p>
                  <p className="text-xs text-slate-500">Biblioteca de documentos integrada ao projeto</p>
                </div>
                {form.sharepoint_url && (
                  <a href={form.sharepoint_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <ExternalLink size={11} /> Abrir
                  </a>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-600 font-medium mb-1.5 block">URL da biblioteca de documentos</label>
                <input
                  type="url"
                  value={form.sharepoint_url}
                  onChange={set("sharepoint_url")}
                  placeholder="https://empresa.sharepoint.com/sites/NomeSite/Shared%20Documents"
                  className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Configure a URL do SharePoint para habilitar o acesso rápido à pasta de documentos na aba
                <strong className="text-slate-500"> Documentos</strong> deste projeto. Salve para ativar.
              </p>
            </div>

            {/* Teams */}
            <Section label="Microsoft Teams" icon={Link2}>
              <InputField label="Link do canal do projeto" value={form.teams_channel}
                onChange={set("teams_channel")} placeholder="https://teams.microsoft.com/l/channel/..." />
              {form.teams_channel && (
                <a href={form.teams_channel} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-600 hover:underline mt-1.5">
                  <ExternalLink size={10} /> Abrir canal no Teams
                </a>
              )}
            </Section>

            {/* Ref. externa */}
            <Section label="Referência Externa" icon={Link2}>
              <InputField
                label="Código ou URL de sistema externo (ERP, CRM, Jira...)"
                value={form.external_ref}
                onChange={set("external_ref")}
                placeholder="Ex: OS-2024-001 ou https://erp.empresa.com/os/123"
              />
            </Section>
          </>
        )}

        {/* ── Cliente ───────────────────────────────────────────────────── */}
        {tab === "clientes" && (
          <>
            <Section label="Contato do Cliente" icon={Building2}>
              <div className="space-y-3">
                <div className="px-3 py-2 bg-slate-50 rounded-lg text-xs">
                  Cliente: <strong className="text-slate-700">{projeto.cliente_nome || "—"}</strong>
                </div>
                <InputField label="Nome do contato" value={form.cliente_contato}
                  onChange={set("cliente_contato")} placeholder="Nome do responsável pelo cliente" />
                <InputField label="E-mail do contato" value={form.cliente_email}
                  onChange={set("cliente_email")} placeholder="email@cliente.com.br" />
              </div>
            </Section>
            <Section label="Acesso ao Portal" icon={Eye}>
              <ToggleField
                label="Habilitar acesso do cliente ao portal"
                desc="O cliente poderá acompanhar o andamento do projeto"
                value={form.cliente_portal_access}
                onToggle={() => toggle("cliente_portal_access")}
              />
            </Section>
          </>
        )}

        {/* ── Permissões ────────────────────────────────────────────────── */}
        {tab === "permissoes" && (
          <Section label="Controle de Acesso" icon={Lock}>
            <div className="space-y-1">
              <ToggleField
                label="Visível ao cliente"
                desc="Permite que o contato do cliente visualize o status do projeto"
                value={form.visivel_cliente}
                onToggle={() => toggle("visivel_cliente")}
              />
              <ToggleField
                label="Permitir download de documentos"
                desc="Clientes e usuários podem baixar documentos do projeto"
                value={form.permite_download}
                onToggle={() => toggle("permite_download")}
              />
              <ToggleField
                label="Acesso apenas para responsáveis"
                desc="Restringe visualização apenas à equipe designada"
                value={form.apenas_responsaveis}
                onToggle={() => toggle("apenas_responsaveis")}
              />
              <ToggleField
                label="Projeto confidencial"
                desc="Não aparece em listagens gerais ou dashboards"
                value={form.confidencial}
                onToggle={() => toggle("confidencial")}
              />
            </div>
          </Section>
        )}

        {/* ── Save bar ─────────────────────────────────────────────────── */}
        <div className="pt-3 flex items-center gap-3 border-t border-slate-100">
          <Button onClick={handleSave} disabled={saving}
            className="bg-[#1A4731] hover:bg-[#245E40] text-white gap-1.5 text-xs shadow-sm">
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
          {saved && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Check size={11} /> Salvo com sucesso
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ label, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <Icon size={12} className="text-slate-400" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20 focus:border-[#1A4731]/40" />
    </div>
  );
}

function ToggleField({ label, desc, value, onToggle }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      <button onClick={onToggle}
        className={`w-10 h-5 rounded-full transition-all flex-shrink-0 relative mt-0.5 ${value ? "bg-[#1A4731]" : "bg-slate-200"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}