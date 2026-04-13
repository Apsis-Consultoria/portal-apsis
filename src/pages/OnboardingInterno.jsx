import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Plus, Search, Filter, Download, RefreshCw, Eye, Link2, Send,
  CheckCircle2, XCircle, AlertCircle, Clock, Users, FileText,
  BarChart3, TrendingUp, Loader2, Copy, ExternalLink, ChevronDown,
  Shield, Zap, MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import OnboardingStatusBadge from "@/components/onboarding/OnboardingStatusBadge";
import OnboardingTimeline from "@/components/onboarding/OnboardingTimeline";
import NovoOnboardingModal from "@/components/onboarding/NovoOnboardingModal";
import OnboardingDetalheModal from "@/components/onboarding/OnboardingDetalheModal";
import GerarLinkModal from "@/components/onboarding/GerarLinkModal";

const STATUS_WORKFLOW = [
  { id: "link_nao_enviado", label: "Link não enviado", color: "slate" },
  { id: "link_enviado", label: "Link enviado", color: "blue" },
  { id: "formulario_iniciado", label: "Formulário iniciado", color: "indigo" },
  { id: "formulario_enviado", label: "Formulário enviado", color: "violet" },
  { id: "documentacao_pendente", label: "Documentação pendente", color: "amber" },
  { id: "em_validacao_rh", label: "Em validação RH", color: "orange" },
  { id: "aprovado_rh", label: "Aprovado RH", color: "teal" },
  { id: "aguardando_integracao", label: "Aguardando integração", color: "cyan" },
  { id: "integrado_sucesso", label: "Integrado com sucesso", color: "green" },
  { id: "erro_integracao", label: "Erro de integração", color: "red" },
  { id: "admissao_concluida", label: "Admissão concluída", color: "emerald" },
];

function KPICard({ title, value, icon: Icon, color, subtitle }) {
  const colors = {
    slate: "bg-slate-50 text-slate-600 border-slate-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    amber: "bg-amber-50 text-amber-600 border-amber-200",
    green: "bg-green-50 text-green-600 border-green-200",
    red: "bg-red-50 text-red-600 border-red-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export default function OnboardingInterno() {
  const [onboardings, setOnboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [showNovoModal, setShowNovoModal] = useState(false);
  const [selectedOnboarding, setSelectedOnboarding] = useState(null);
  const [showDetalhe, setShowDetalhe] = useState(false);
  const [showGerarLink, setShowGerarLink] = useState(false);
  const [activeTab, setActiveTab] = useState("visao_geral");

  const TABS = [
    { id: "visao_geral", label: "Visão Geral" },
    { id: "admissoes_pendentes", label: "Admissões Pendentes" },
    { id: "formularios_enviados", label: "Formulários Enviados" },
    { id: "documentos", label: "Documentos" },
    { id: "integracao_caju", label: "Integração Caju" },
    { id: "configuracoes", label: "Configurações" },
  ];

  useEffect(() => { loadOnboardings(); }, []);

  const loadOnboardings = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("employees_onboarding")
      .select("*, onboarding_links(*)")
      .order("created_at", { ascending: false });
    setOnboardings(data || []);
    setLoading(false);
  };

  const abrirGerarLink = (onboarding) => {
    setSelectedOnboarding(onboarding);
    setShowGerarLink(true);
  };

  const aprovarOnboarding = async (id) => {
    await supabase.from("employees_onboarding").update({
      overall_status: "aprovado_rh",
      updated_at: new Date().toISOString()
    }).eq("id", id);
    await supabase.from("onboarding_status_history").insert({
      onboarding_id: id, status: "aprovado_rh",
      observacao: "Aprovado pelo RH", criado_em: new Date().toISOString()
    });
    toast.success("Onboarding aprovado!");
    loadOnboardings();
  };

  const filteredOnboardings = onboardings.filter(o => {
    const matchSearch = !searchTerm ||
      o.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email_pessoal?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cargo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "todos" || o.overall_status === filterStatus;
    return matchSearch && matchStatus;
  });

  const kpis = {
    total: onboardings.length,
    pendentes: onboardings.filter(o => ["link_nao_enviado", "link_enviado", "formulario_iniciado"].includes(o.overall_status)).length,
    enviados: onboardings.filter(o => o.public_form_status === "enviado").length,
    validacao: onboardings.filter(o => o.overall_status === "em_validacao_rh").length,
    aprovados: onboardings.filter(o => o.overall_status === "aprovado_rh").length,
    concluidos: onboardings.filter(o => o.overall_status === "admissao_concluida").length,
    erros: onboardings.filter(o => o.overall_status === "erro_integracao").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A4731] to-[#245E40] text-white rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Onboarding — Capital Humano</h1>
          <p className="text-white/70 text-sm mt-1">Gestão completa do processo de admissão de colaboradores</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNovoModal(true)}
            className="flex items-center gap-2 bg-[#F47920] hover:bg-[#d96b1a] text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" /> Novo Onboarding
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <KPICard title="Total" value={kpis.total} icon={Users} color="slate" />
        <KPICard title="Pendentes" value={kpis.pendentes} icon={Clock} color="amber" />
        <KPICard title="Formulários" value={kpis.enviados} icon={FileText} color="blue" />
        <KPICard title="Em Validação" value={kpis.validacao} icon={Eye} color="orange" />
        <KPICard title="Aprovados" value={kpis.aprovados} icon={CheckCircle2} color="green" />
        <KPICard title="Concluídos" value={kpis.concluidos} icon={TrendingUp} color="green" />
        <KPICard title="Erros" value={kpis.erros} icon={AlertCircle} color="red" />
      </div>

      {/* Main panel with tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-[#1A4731] border-[#1A4731]"
                  : "text-slate-400 border-transparent hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Visão Geral / Admissões Pendentes / Formulários Enviados */}
          {["visao_geral", "admissoes_pendentes", "formularios_enviados"].includes(activeTab) && (
            <>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, e-mail ou cargo..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20 bg-white"
                >
                  <option value="todos">Todos os status</option>
                  {STATUS_WORKFLOW.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <button onClick={loadOnboardings} className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                  <Download className="w-4 h-4" /> Exportar
                </button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1A4731]" />
                </div>
              ) : filteredOnboardings.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Nenhum onboarding encontrado</p>
                  <p className="text-slate-300 text-xs mt-1">Crie um novo onboarding para começar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {["Nome", "Cargo", "Área", "Admissão Prevista", "Status", "Doc. Status", "Caju", "Ações"].map(h => (
                          <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredOnboardings.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-3">
                            <p className="font-medium text-slate-800">{o.nome_completo || "—"}</p>
                            <p className="text-xs text-slate-400">{o.email_pessoal || o.email || ""}</p>
                          </td>
                          <td className="py-3.5 px-3 text-slate-600">{o.cargo || "—"}</td>
                          <td className="py-3.5 px-3 text-slate-600">{o.area || "—"}</td>
                          <td className="py-3.5 px-3 text-slate-600">
                            {o.data_admissao_prevista ? new Date(o.data_admissao_prevista).toLocaleDateString("pt-BR") : "—"}
                          </td>
                          <td className="py-3.5 px-3">
                            <OnboardingStatusBadge status={o.overall_status} />
                          </td>
                          <td className="py-3.5 px-3">
                            <OnboardingStatusBadge status={o.document_status} type="doc" />
                          </td>
                          <td className="py-3.5 px-3">
                            <OnboardingStatusBadge status={o.integration_status} type="integration" />
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => { setSelectedOnboarding(o); setShowDetalhe(true); }}
                                className="p-1.5 text-slate-400 hover:text-[#1A4731] hover:bg-slate-100 rounded-lg transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => abrirGerarLink(o)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Gerar link público"
                              >
                                <Link2 className="w-4 h-4" />
                              </button>
                              {o.overall_status === "formulario_enviado" && (
                                <button
                                  onClick={() => aprovarOnboarding(o.id)}
                                  className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Aprovar"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Documentos */}
          {activeTab === "documentos" && (
            <div className="space-y-4">
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Controle de Documentos</p>
                <p className="text-slate-400 text-sm mt-1">Selecione um onboarding na aba Visão Geral para revisar documentos</p>
              </div>
            </div>
          )}

          {/* Integração Caju */}
          {activeTab === "integracao_caju" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <Zap className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Conector Caju Benefícios</p>
                  <p className="text-xs text-amber-600">Configure as credenciais de API para habilitar a integração automática</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Status da integração", value: "Não configurada" },
                  { label: "Último envio", value: "—" },
                  { label: "Registros integrados", value: "0" },
                  { label: "Erros pendentes", value: "0" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="font-semibold text-slate-800 mt-1">{value}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 text-center pt-4">
                Configure a integração na aba <strong>Configurações</strong> para habilitar o envio automático.
              </p>
            </div>
          )}

          {/* Configurações */}
          {activeTab === "configuracoes" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Caju Config */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#F47920]" /> Conector Caju
                  </h3>
                  {["URL da API", "Client ID", "Client Secret", "Token", "Identificador empresa"].map(f => (
                    <div key={f}>
                      <label className="text-xs font-medium text-slate-500">{f}</label>
                      <input
                        type={f.includes("Secret") || f.includes("Token") ? "password" : "text"}
                        placeholder={`${f}...`}
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20"
                      />
                    </div>
                  ))}
                  <button className="w-full bg-[#1A4731] text-white py-2 rounded-lg text-sm hover:bg-[#245E40] transition-colors">
                    Salvar configuração
                  </button>
                </div>

                {/* Regras gerais */}
                <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 space-y-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#1A4731]" /> Regras Gerais
                  </h3>
                  {[
                    { label: "Expiração do link (dias)", type: "number", placeholder: "30" },
                    { label: "Tamanho máximo de arquivo (MB)", type: "number", placeholder: "10" },
                    { label: "E-mail de notificação RH", type: "email", placeholder: "rh@apsis.com.br" },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-xs font-medium text-slate-500">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1A4731]/20"
                      />
                    </div>
                  ))}
                  <div className="space-y-3">
                    {[
                      "Seção de transporte ativa",
                      "Seção de benefícios ativa",
                      "Seção de dependentes ativa",
                      "Seção bancária ativa",
                      "Assinatura digital obrigatória",
                    ].map(opt => (
                      <label key={opt} className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" defaultChecked className="accent-[#1A4731]" />
                        <span className="text-sm text-slate-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                  <button className="w-full bg-[#1A4731] text-white py-2 rounded-lg text-sm hover:bg-[#245E40] transition-colors">
                    Salvar configuração
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showNovoModal && (
        <NovoOnboardingModal
          onClose={() => setShowNovoModal(false)}
          onSuccess={loadOnboardings}
        />
      )}
      {showDetalhe && selectedOnboarding && (
        <OnboardingDetalheModal
          onboarding={selectedOnboarding}
          onClose={() => setShowDetalhe(false)}
          onRefresh={loadOnboardings}
        />
      )}
      {showGerarLink && selectedOnboarding && (
        <GerarLinkModal
          onboarding={selectedOnboarding}
          onClose={() => setShowGerarLink(false)}
          onSuccess={loadOnboardings}
        />
      )}
    </div>
  );
}