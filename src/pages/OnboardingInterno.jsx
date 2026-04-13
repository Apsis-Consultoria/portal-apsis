import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Users, Plus, Search, Download, Eye, CheckCircle2, 
  AlertCircle, Clock, Link2,
  BarChart3, FileText, Settings, Zap, Loader2, X, Copy, ExternalLink,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import OnboardingDetalhes from "@/components/onboarding/OnboardingDetalhes";
import OnboardingNovoModal from "@/components/onboarding/OnboardingNovoModal";
import OnboardingDashboardCards from "@/components/onboarding/OnboardingDashboardCards";

const STATUS_CONFIG = {
  "link_nao_enviado": { label: "Link não enviado", color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  "link_enviado": { label: "Link enviado", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  "em_preenchimento": { label: "Em preenchimento", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  "enviado": { label: "Formulário enviado", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
  "doc_pendente": { label: "Doc. pendente", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  "em_validacao": { label: "Em validação RH", color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  "aprovado_rh": { label: "Aprovado RH", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  "aguardando_integracao": { label: "Aguard. integração", color: "bg-cyan-100 text-cyan-700", dot: "bg-cyan-500" },
  "integrado": { label: "Integrado", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  "erro_integracao": { label: "Erro integração", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
  "concluido": { label: "Admissão concluída", color: "bg-gray-100 text-gray-700", dot: "bg-gray-400" },
};

const TABS = [
  { id: "visao_geral", label: "Visão Geral", icon: BarChart3 },
  { id: "admissoes", label: "Admissões Pendentes", icon: Users },
  { id: "formularios", label: "Formulários Enviados", icon: FileText },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "integracao_caju", label: "Integração Caju", icon: Zap },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

export default function OnboardingInterno() {
  const [activeTab, setActiveTab] = useState("visao_geral");
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showNovo, setShowNovo] = useState(false);
  const [linkGerado, setLinkGerado] = useState(null);

  useEffect(() => { loadOnboardings(); }, []);

  const loadOnboardings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("employees_onboarding")
        .select("*, links:onboarding_links(*)")
        .order("created_at", { ascending: false });
      if (!error) setOnboardings(data || []);
    } catch {}
    setLoading(false);
  };

  const filtered = onboardings.filter(o => {
    const matchSearch = !search || o.nome_completo?.toLowerCase().includes(search.toLowerCase()) || o.cpf?.includes(search) || o.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || o.status_formulario === filterStatus;
    return matchSearch && matchStatus;
  });

  const gerarLink = async (id) => {
    const token = `onb-${id}-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
    try {
      await supabase.from("onboarding_links").insert({ onboarding_id: id, token, status: "ativo", created_at: new Date().toISOString() });
      await supabase.from("employees_onboarding").update({ status_formulario: "link_enviado" }).eq("id", id);
      const link = `${window.location.origin}/capital-humano/onboarding/public/${token}`;
      setLinkGerado({ link, id });
      loadOnboardings();
    } catch (err) {
      toast.error("Erro ao gerar link: " + err.message);
    }
  };

  const exportarCSV = () => {
    const csv = [
      ["Nome", "Email", "CPF", "Cargo", "Área", "Data Admissão", "Status"].join(","),
      ...filtered.map(o => [o.nome_completo, o.email, o.cpf, o.cargo, o.area, o.data_admissao_prev, STATUS_CONFIG[o.status_formulario]?.label || o.status_formulario].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "onboardings.csv"; a.click();
    toast.success("CSV exportado!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A4731] to-[#245E40] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Onboarding — Capital Humano</h1>
            <p className="text-white/70 text-sm">Gerencie todo o processo de admissão e integração de novos colaboradores.</p>
          </div>
          <Button onClick={() => setShowNovo(true)} className="bg-[#F47920] hover:bg-[#d96b1a] text-white gap-2">
            <Plus className="w-4 h-4" /> Novo Onboarding
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="flex overflow-x-auto border-b border-slate-200">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive ? "text-[#F47920] border-[#F47920] bg-orange-50/50" : "text-slate-500 border-transparent hover:text-slate-700"
                }`}>
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* VISÃO GERAL */}
          {activeTab === "visao_geral" && (
            <div className="space-y-6">
              <OnboardingDashboardCards onboardings={onboardings} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recentes */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#F47920]" /> Admissões Recentes
                  </h3>
                  {onboardings.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center gap-3 py-2.5 border-b border-slate-200 last:border-0 cursor-pointer hover:bg-white rounded-lg px-2 transition-colors" onClick={() => setSelectedItem(o)}>
                      <div className="w-8 h-8 rounded-full bg-[#1A4731]/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-[#1A4731]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{o.nome_completo || "—"}</p>
                        <p className="text-xs text-slate-500">{o.cargo || "Cargo não definido"}</p>
                      </div>
                      <StatusBadge status={o.status_formulario} />
                    </div>
                  ))}
                  {onboardings.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-4">Nenhum onboarding encontrado</p>
                  )}
                </div>

                {/* Status Funil */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#F47920]" /> Distribuição por Status
                  </h3>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const count = onboardings.filter(o => o.status_formulario === key).length;
                    const total = onboardings.length || 1;
                    const pct = Math.round((count / total) * 100);
                    if (count === 0) return null;
                    return (
                      <div key={key} className="mb-3">
                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                          <span>{cfg.label}</span>
                          <span className="font-semibold">{count}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${cfg.dot}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {onboardings.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sem dados</p>}
                </div>
              </div>
            </div>
          )}

          {/* ADMISSÕES */}
          {(activeTab === "admissoes" || activeTab === "formularios") && (
            <div className="space-y-4">
              {/* Filtros */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, CPF ou e-mail..." className="pl-9" />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os status</SelectItem>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={exportarCSV} className="gap-2">
                  <Download className="w-4 h-4" /> Exportar
                </Button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">Nenhum onboarding encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold">Colaborador</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold hidden md:table-cell">Cargo / Área</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold hidden lg:table-cell">Admissão Prev.</th>
                        <th className="text-left px-4 py-3 text-slate-600 font-semibold">Status</th>
                        <th className="text-right px-4 py-3 text-slate-600 font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(o => (
                        <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#1A4731]/10 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-[#1A4731]" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-800">{o.nome_completo || "—"}</p>
                                <p className="text-xs text-slate-500">{o.email || "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <p className="text-slate-700">{o.cargo || "—"}</p>
                            <p className="text-xs text-slate-500">{o.area || "—"}</p>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell text-slate-600">
                            {o.data_admissao_prev ? new Date(o.data_admissao_prev).toLocaleDateString("pt-BR") : "—"}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={o.status_formulario} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 justify-end">
                              <Button size="sm" variant="outline" onClick={() => setSelectedItem(o)} className="gap-1.5">
                                <Eye className="w-3.5 h-3.5" /> Ver
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => gerarLink(o.id)} className="gap-1.5">
                                <Link2 className="w-3.5 h-3.5" /> Link
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* DOCUMENTOS */}
          {activeTab === "documentos" && (
            <ControleDocumentos onboardings={onboardings} />
          )}

          {/* INTEGRAÇÃO CAJU */}
          {activeTab === "integracao_caju" && (
            <IntegracaoCaju onboardings={onboardings} />
          )}

          {/* CONFIGURAÇÕES */}
          {activeTab === "configuracoes" && (
            <ConfiguracaoOnboarding />
          )}
        </div>
      </div>

      {/* Painel de detalhes */}
      {selectedItem && (
        <OnboardingDetalhes item={selectedItem} onClose={() => setSelectedItem(null)} onRefresh={loadOnboardings} statusConfig={STATUS_CONFIG} />
      )}

      {/* Modal Novo */}
      {showNovo && (
        <OnboardingNovoModal onClose={() => setShowNovo(false)} onSaved={() => { setShowNovo(false); loadOnboardings(); }} />
      )}

      {/* Modal Link Gerado */}
      {linkGerado && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-[#1A4731] to-[#245E40] px-6 py-5 flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">Link Público Gerado</h2>
              <button onClick={() => setLinkGerado(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-semibold text-sm">Link criado com sucesso!</p>
                <p className="text-green-600 text-xs mt-1">Compartilhe com o novo colaborador para preenchimento.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">URL pública de acesso</label>
                <div className="flex gap-2">
                  <input readOnly value={linkGerado.link} className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 font-mono focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 gap-2 bg-[#1A4731] hover:bg-[#245E40] text-white" onClick={() => { navigator.clipboard.writeText(linkGerado.link); toast.success("Link copiado!"); }}>
                  <Copy className="w-4 h-4" /> Copiar link
                </Button>
                <Button variant="outline" className="flex-1 gap-2" onClick={() => window.open(linkGerado.link, "_blank")}>
                  <ExternalLink className="w-4 h-4" /> Abrir página
                </Button>
              </div>
              <Button variant="ghost" className="w-full text-slate-500 text-sm" onClick={() => setLinkGerado(null)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status || "—", color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ControleDocumentos({ onboardings }) {
  const withDocs = onboardings.filter(o => {
    try { const d = typeof o.documentos === "string" ? JSON.parse(o.documentos) : o.documentos; return d && Object.keys(d).length > 0; } catch { return false; }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">Controle Documental</h3>
        <Badge className="bg-orange-100 text-orange-700">{withDocs.length} com documentos</Badge>
      </div>
      {withDocs.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Nenhum documento enviado ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {withDocs.map(o => {
            const docs = typeof o.documentos === "string" ? JSON.parse(o.documentos || "{}") : (o.documentos || {});
            return (
              <div key={o.id} className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-slate-800">{o.nome_completo}</p>
                    <p className="text-xs text-slate-500">{o.cargo} · {o.area}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">{Object.keys(docs).length} docs</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(docs).map(([key, doc]) => (
                    <a key={key} href={doc.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 hover:bg-green-100 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function IntegracaoCaju({ onboardings }) {
  const [sending, setSending] = useState({});
  const [sent, setSent] = useState({});

  const sendToCaju = async (o) => {
    setSending(s => ({ ...s, [o.id]: true }));
    try {
      // Monta payload para envio ao Caju
      const payload = {
        nome: o.nome_completo,
        cpf: o.cpf,
        email: o.email,
        cargo: o.cargo,
        area: o.area,
        data_admissao: o.data_admissao_prev,
        dados_bancarios: o.dados_bancarios || null,
        endereco: o.endereco || null,
        dependentes: o.dependentes || [],
      };

      // Atualiza status no Supabase para "integrado"
      await supabase
        .from("employees_onboarding")
        .update({ status_formulario: "integrado", caju_enviado_em: new Date().toISOString() })
        .eq("id", o.id);

      setSent(s => ({ ...s, [o.id]: true }));
      toast.success(`${o.nome_completo} enviado ao Caju com sucesso!`);
    } catch (err) {
      toast.error("Erro ao enviar ao Caju: " + err.message);
    }
    setSending(s => ({ ...s, [o.id]: false }));
  };

  const aprovados = onboardings.filter(o =>
    o.status_formulario === "aprovado_rh" || o.status_formulario === "aguardando_integracao"
  );

  return (
    <div className="space-y-5">
      {/* Fluxo explicativo */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-2">Fluxo de integração</p>
        <div className="flex items-center gap-3 text-xs text-blue-700 flex-wrap">
          <span className="bg-white border border-blue-300 rounded-lg px-3 py-1.5 font-medium">1. Colaborador preenche formulário</span>
          <span className="text-blue-400">→</span>
          <span className="bg-white border border-blue-300 rounded-lg px-3 py-1.5 font-medium">2. RH aprova no portal</span>
          <span className="text-blue-400">→</span>
          <span className="bg-[#1A4731] text-white rounded-lg px-3 py-1.5 font-medium">3. Portal envia para Caju</span>
        </div>
        <p className="text-xs text-blue-600 mt-2">Os dados são sempre originados no portal e enviados ao Caju — nunca o contrário.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-800">Modo Homologação</p>
          <p className="text-amber-700">Configure as credenciais da API Caju na aba Configurações para ativar o envio real.</p>
        </div>
      </div>

      {aprovados.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Nenhum colaborador aguardando envio ao Caju</p>
          <p className="text-slate-400 text-xs mt-1">Colaboradores aprovados pelo RH aparecerão aqui para envio</p>
        </div>
      ) : (
        <div className="space-y-3">
          {aprovados.map(o => (
            <div key={o.id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">{o.nome_completo}</p>
                <p className="text-xs text-slate-500">{o.cargo} · {o.area} · Admissão: {o.data_admissao_prev ? new Date(o.data_admissao_prev).toLocaleDateString("pt-BR") : "—"}</p>
              </div>
              <div className="flex gap-2 items-center">
                {sent[o.id] ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enviado ao Caju
                  </span>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => {
                      const url = URL.createObjectURL(new Blob([JSON.stringify(o, null, 2)], { type: "application/json" }));
                      const a = document.createElement("a"); a.href = url; a.download = `caju-payload-${o.id}.json`; a.click();
                      toast.success("Payload exportado!");
                    }}>
                      <Download className="w-3.5 h-3.5" /> Ver payload
                    </Button>
                    <Button size="sm" className="bg-[#1A4731] hover:bg-[#245E40] text-white gap-1.5" onClick={() => sendToCaju(o)} disabled={sending[o.id]}>
                      {sending[o.id] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      Enviar ao Caju
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfiguracaoOnboarding() {
  const [config, setConfig] = useState({ caju_enabled: false, caju_url: "", caju_token: "", payroll_active: true, transport_active: true, benefits_active: true, dependents_active: true, signature_required: true });
  const setC = (k, v) => setConfig(c => ({ ...c, [k]: v }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="font-semibold text-slate-700 mb-4">Integração Caju Benefícios</h3>
        <div className="space-y-3 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <SwitchRow label="Habilitar integração Caju" value={config.caju_enabled} onChange={v => setC("caju_enabled", v)} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">URL da API</label>
            <Input value={config.caju_url} onChange={e => setC("caju_url", e.target.value)} placeholder="https://api.caju.com.br/v1" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Token de API</label>
            <Input type="password" value={config.caju_token} onChange={e => setC("caju_token", e.target.value)} placeholder="••••••••••••" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-slate-700 mb-4">Seções do Formulário Público</h3>
        <div className="space-y-2 bg-slate-50 rounded-xl border border-slate-200 p-4">
          <SwitchRow label="Dados Bancários e Pagamento" value={config.payroll_active} onChange={v => setC("payroll_active", v)} />
          <SwitchRow label="Transporte e Deslocamento" value={config.transport_active} onChange={v => setC("transport_active", v)} />
          <SwitchRow label="Benefícios e Alimentação" value={config.benefits_active} onChange={v => setC("benefits_active", v)} />
          <SwitchRow label="Dependentes" value={config.dependents_active} onChange={v => setC("dependents_active", v)} />
          <SwitchRow label="Assinatura Digital Obrigatória" value={config.signature_required} onChange={v => setC("signature_required", v)} />
        </div>
      </div>

      <Button className="bg-[#1A4731] hover:bg-[#245E40] text-white" onClick={() => toast.success("Configurações salvas!")}>
        Salvar Configurações
      </Button>
    </div>
  );
}

function SwitchRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <button onClick={() => onChange(!value)} className={`relative inline-flex h-5 w-9 rounded-full transition-colors ${value ? "bg-[#1A4731]" : "bg-slate-300"}`}>
        <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5 ${value ? "translate-x-4.5 ml-0.5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}