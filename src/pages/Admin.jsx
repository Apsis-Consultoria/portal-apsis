import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Users, Shield, Plus, X, Edit2,
  CheckCircle, XCircle, Loader2, Search, Building2, Bot, BookOpen,
  ToggleLeft, ToggleRight, Trash2, Printer, FileSpreadsheet, ChevronDown, ChevronUp,
  RefreshCw, UserCheck, AlertCircle
} from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/19aad65cc_Logohorizontal-Fundobranco.png";

const ROLES = [
  { value: "admin", label: "Admin", desc: "Acesso Total" },
  { value: "diretor", label: "Diretor", desc: "Acesso Total" },
  { value: "gerente", label: "Gerente", desc: "Dashboard do Departamento + Projetos + Apps APSIS" },
  { value: "analista", label: "Analista", desc: "Projetos + Apps APSIS" },
];

const TODAS_PAGINAS = [
  { id: "Dashboard", label: "Dashboard (Geral)" },
  { id: "DashboardValuation", label: "Dashboard — Business Valuation" },
  { id: "DashboardContabil", label: "Dashboard — Contábil & Fiscal" },
  { id: "DashboardAtivos", label: "Dashboard — Ativos Fixos" },
  { id: "DashboardEstrategica", label: "Dashboard — Consultoria Estratégica" },
  { id: "DashboardMA", label: "Dashboard — M&A" },
  { id: "DashboardProjetos", label: "Dashboard — Projetos Especiais" },
  { id: "DashboardFinanceiro", label: "Dashboard — Financeiro" },
  { id: "DashboardCapitalHumano", label: "Dashboard — Capital Humano" },
  { id: "DashboardMercadoClientes", label: "Dashboard — Mercado/Clientes" },
  { id: "Projetos", label: "Projetos" },
  { id: "AlocacoesHoras", label: "Projetos — Horas e Alocações" },
  { id: "Pipeline", label: "Projetos — Pipeline" },
  { id: "Budget", label: "Projetos — Budget" },
  { id: "Financeiro", label: "Financeiro" },
  { id: "ContasAPagar", label: "Financeiro — Contas a Pagar" },
  { id: "ContasAReceber", label: "Financeiro — Contas a Receber" },
  { id: "Marketing", label: "Marketing" },
  { id: "MarketingComercial", label: "Marketing — Comercial" },
  { id: "MarketingOrcado", label: "Marketing — Orçado vs Real" },
  { id: "DashboardQualidade", label: "Qualidade" },
  { id: "QuestionarioRevisao", label: "Qualidade — Questionário de Revisão" },
  { id: "AppsAPSIS", label: "Apps APSIS" },
  { id: "Relatorios", label: "Relatórios" },
  { id: "Configuracoes", label: "Configurações" },
];

// Permissões padrão por perfil
const DEFAULT_PERMISSIONS = {
  admin: TODAS_PAGINAS.reduce((acc, p) => ({ ...acc, [p.id]: { view: true, edit: true, write: true } }), {}),
  diretor: TODAS_PAGINAS.reduce((acc, p) => ({ ...acc, [p.id]: { view: true, edit: true, write: true } }), {}),
  gerente: TODAS_PAGINAS.reduce((acc, p) => {
    const allowed = ["Dashboard","DashboardValuation","DashboardContabil","DashboardAtivos","DashboardEstrategica","DashboardMA","DashboardProjetos","DashboardFinanceiro","DashboardCapitalHumano","DashboardMercadoClientes","Projetos","AlocacoesHoras","Pipeline","Budget","AppsAPSIS"];
    return { ...acc, [p.id]: { view: allowed.includes(p.id), edit: false, write: false } };
  }, {}),
  analista: TODAS_PAGINAS.reduce((acc, p) => {
    const allowed = ["Projetos","AlocacoesHoras","Pipeline","Budget","AppsAPSIS"];
    return { ...acc, [p.id]: { view: allowed.includes(p.id), edit: false, write: false } };
  }, {}),
};

const tabs = [
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "departamentos", label: "Departamentos", icon: Building2 },
  { id: "privilegios", label: "Privilégios", icon: Shield },
  { id: "assistente", label: "Assistente IA", icon: Bot },
];

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("usuarios");

  const [users, setUsers] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);

  // Assistente IA
  const [knowledgeDocs, setKnowledgeDocs] = useState([]);
  const [assistantConfig, setAssistantConfig] = useState({});
  const [newDoc, setNewDoc] = useState({ title: "", content: "", category: "FAQ", module: "Geral", sensitivity: "INTERNO", tags: "" });
  const [showDocForm, setShowDocForm] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [assistantLogs, setAssistantLogs] = useState([]);

  // Departamentos
  const [novoDeptNome, setNovoDeptNome] = useState("");
  const [novoDeptDesc, setNovoDeptDesc] = useState("");
  const [savingDept, setSavingDept] = useState(false);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroRole, setFiltroRole] = useState("Todos");

  // Modal usuário
  const [modalUser, setModalUser] = useState(null);
  const [modalPermissions, setModalPermissions] = useState({});
  const [modalDepts, setModalDepts] = useState([]);
  const [modalAllowPrint, setModalAllowPrint] = useState(false);
  const [modalAllowExcel, setModalAllowExcel] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  // Invite
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("analista");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  // Sync
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState("");

  useEffect(() => {
    base44.auth.me().then(u => {
      if (!u) { window.location.href = createPageUrl("Login"); return; }
      if (u.role !== "admin") { window.location.href = createPageUrl("AccessDenied"); return; }
      setCurrentUser(u);
      setAuthLoading(false);
      loadAll();
    });
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const [u, d, c, kb, cfg, logs] = await Promise.all([
      base44.entities.User.list(),
      base44.entities.Departamento.list(),
      base44.entities.Colaborador.list(),
      base44.entities.KnowledgeBase.list(),
      base44.entities.AssistantConfig.list(),
      base44.entities.AssistantLog.list('-created_date', 50),
    ]);
    setUsers(u); setDepartamentos(d); setColaboradores(c);
    setKnowledgeDocs(kb);
    const cfgObj = {};
    (cfg || []).forEach(c => { cfgObj[c.key] = { id: c.id, value: c.value }; });
    setAssistantConfig(cfgObj);
    setAssistantLogs(logs || []);
    setLoading(false);
  };

  const openModal = (u) => {
    const col = colaboradores.find(c => c.email === u.email);
    const role = u.role || "analista";
    let perms = DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS["analista"];
    if (col?.paginas_permissoes) {
      try { perms = JSON.parse(col.paginas_permissoes); } catch {}
    }
    let depts = [];
    if (col?.departamentos) {
      try { depts = JSON.parse(col.departamentos); } catch {}
    } else if (col?.departamento) {
      depts = [col.departamento];
    }
    setModalUser({ ...u, role });
    setModalPermissions(perms);
    setModalDepts(depts);
    setModalAllowPrint(col?.allow_print || false);
    setModalAllowExcel(col?.allow_excel || false);
    setExpandedGroups({});
  };

  const handleRoleChange = (newRole) => {
    setModalUser(u => ({ ...u, role: newRole }));
    setModalPermissions(DEFAULT_PERMISSIONS[newRole] || DEFAULT_PERMISSIONS["analista"]);
  };

  const toggleDeptSelection = (deptNome) => {
    setModalDepts(prev =>
      prev.includes(deptNome) ? prev.filter(d => d !== deptNome) : [...prev, deptNome]
    );
  };

  const togglePagePerm = (pageId, type) => {
    setModalPermissions(prev => ({
      ...prev,
      [pageId]: { ...prev[pageId], [type]: !prev[pageId]?.[type] }
    }));
  };

  const toggleExpandGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const saveUser = async () => {
    if (!modalUser) return;
    await base44.entities.User.update(modalUser.id, { role: modalUser.role });

    const col = colaboradores.find(c => c.email === modalUser.email);
    const colData = {
      paginas_permissoes: JSON.stringify(modalPermissions),
      departamentos: JSON.stringify(modalDepts),
      departamento: modalDepts[0] || "",
      allow_print: modalAllowPrint,
      allow_excel: modalAllowExcel,
    };
    if (col) {
      await base44.entities.Colaborador.update(col.id, colData);
    } else {
      await base44.entities.Colaborador.create({
        nome: modalUser.full_name || modalUser.email,
        email: modalUser.email,
        ...colData,
      });
    }
    loadAll();
    setModalUser(null);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg("");
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole === "admin" ? "admin" : "user");
      setInviteMsg("Convite enviado com sucesso!");
      setInviteEmail("");
      loadAll();
    } catch (e) {
      setInviteMsg("Erro ao enviar convite: " + e.message);
    }
    setInviting(false);
  };

  const toggleWidgetEnabled = async () => {
    const current = assistantConfig['widget_enabled'];
    const newValue = current?.value === 'false' ? 'true' : 'false';
    if (current?.id) {
      await base44.entities.AssistantConfig.update(current.id, { value: newValue });
    } else {
      await base44.entities.AssistantConfig.create({ key: 'widget_enabled', value: newValue, descricao: 'Ativar/desativar widget do Assistente APSIS' });
    }
    loadAll();
  };

  const saveDoc = async () => {
    if (!newDoc.title.trim() || !newDoc.content.trim()) return;
    setSavingDoc(true);
    await base44.entities.KnowledgeBase.create({ ...newDoc, ativo: true });
    setNewDoc({ title: "", content: "", category: "FAQ", module: "Geral", sensitivity: "INTERNO", tags: "" });
    setShowDocForm(false);
    setSavingDoc(false);
    loadAll();
  };

  const deleteDoc = async (doc) => { await base44.entities.KnowledgeBase.delete(doc.id); loadAll(); };
  const toggleDoc = async (doc) => { await base44.entities.KnowledgeBase.update(doc.id, { ativo: !doc.ativo }); loadAll(); };
  const createDept = async () => {
    if (!novoDeptNome.trim()) return;
    setSavingDept(true);
    await base44.entities.Departamento.create({ nome: novoDeptNome.trim(), descricao: novoDeptDesc.trim(), ativo: true });
    setNovoDeptNome(""); setNovoDeptDesc("");
    setSavingDept(false);
    loadAll();
  };
  const toggleDept = async (dept) => { await base44.entities.Departamento.update(dept.id, { ativo: !dept.ativo }); loadAll(); };
  const deleteDept = async (dept) => { await base44.entities.Departamento.delete(dept.id); loadAll(); };

  // Sincroniza Colaboradores → garante que todo colaborador com email tenha registro cruzado
  const syncColaboradores = async () => {
    setSyncing(true);
    setSyncMsg("");
    let criados = 0;
    let atualizados = 0;
    // Para cada user que não tem colaborador vinculado, cria o registro
    for (const u of users) {
      if (!u.email) continue;
      const col = colaboradores.find(c => c.email === u.email);
      if (!col) {
        await base44.entities.Colaborador.create({
          nome: u.full_name || u.email,
          email: u.email,
          ativo: true,
        });
        criados++;
      } else if (!col.nome || col.nome !== u.full_name) {
        // Atualiza nome se divergente
        if (u.full_name && col.nome !== u.full_name) {
          await base44.entities.Colaborador.update(col.id, { nome: u.full_name });
          atualizados++;
        }
      }
    }
    await loadAll();
    setSyncMsg(`Sincronização concluída: ${criados} criado(s), ${atualizados} atualizado(s).`);
    setSyncing(false);
  };

  const filteredUsers = users.filter(u => {
    const b = !busca || u.full_name?.toLowerCase().includes(busca.toLowerCase()) || u.email?.toLowerCase().includes(busca.toLowerCase());
    const r = filtroRole === "Todos" || u.role === filtroRole;
    return b && r;
  });

  // Agrupar páginas por categoria
  const pageGroups = [
    { label: "Dashboard", pages: TODAS_PAGINAS.filter(p => p.id.startsWith("Dashboard")) },
    { label: "Projetos", pages: TODAS_PAGINAS.filter(p => ["Projetos","AlocacoesHoras","Pipeline","Budget"].includes(p.id)) },
    { label: "Financeiro", pages: TODAS_PAGINAS.filter(p => ["Financeiro","ContasAPagar","ContasAReceber"].includes(p.id)) },
    { label: "Marketing", pages: TODAS_PAGINAS.filter(p => ["Marketing","MarketingComercial","MarketingOrcado"].includes(p.id)) },
    { label: "Qualidade", pages: TODAS_PAGINAS.filter(p => ["DashboardQualidade","QuestionarioRevisao"].includes(p.id)) },
    { label: "Outros", pages: TODAS_PAGINAS.filter(p => ["AppsAPSIS","Relatorios","Configuracoes"].includes(p.id)) },
  ];

  const roleColors = {
    admin: "bg-[#1A4731]/10 text-[#1A4731]",
    diretor: "bg-purple-100 text-purple-700",
    gerente: "bg-[#F47920]/10 text-[#F47920]",
    analista: "bg-blue-100 text-blue-700",
    manager: "bg-[#F47920]/10 text-[#F47920]",
    user: "bg-gray-100 text-gray-600",
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#F4F6F4] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#F47920] animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F6F4]">
      {/* Header */}
      <div className="bg-[#1A4731] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src={LOGO} alt="APSIS" className="h-8 object-contain bg-white rounded px-2 py-0.5" />
          <div>
            <p className="font-bold text-base">Admin Console</p>
            <p className="text-white/50 text-xs">Portal APSIS · Painel Administrativo</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium">{currentUser?.full_name}</p>
            <span className="text-[10px] bg-[#F47920]/20 text-[#F47920] px-2 py-0.5 rounded-full font-semibold uppercase">{currentUser?.role}</span>
          </div>
          <a href={createPageUrl("Dashboard")} className="text-xs text-white/50 hover:text-white border border-white/20 px-3 py-1.5 rounded-lg">← Portal</a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-[#DDE3DE] p-1 rounded-2xl w-fit flex-wrap">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === t.id ? "bg-[#1A4731] text-white shadow" : "text-[#5C7060] hover:text-[#1A2B1F]"}`}>
              <t.icon size={15} /> {t.label}
            </button>
          ))}
        </div>

        {/* USUÁRIOS */}
        {activeTab === "usuarios" && (
          <div className="space-y-4">
            {/* Convidar */}
            <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
              <p className="text-sm font-semibold text-[#1A2B1F] mb-3">Convidar Novo Usuário</p>
              <div className="flex flex-wrap gap-3">
                <input type="email" placeholder="email@apsis.com.br" value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="flex-1 min-w-[200px] border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
                <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                  className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <button onClick={handleInvite} disabled={inviting}
                  className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] disabled:opacity-50">
                  {inviting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Convidar
                </button>
              </div>
              {inviteMsg && <p className="text-xs mt-2 text-[#5C7060]">{inviteMsg}</p>}
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7060]" />
                <input placeholder="Buscar usuário..." value={busca} onChange={e => setBusca(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#DDE3DE] rounded-xl text-sm bg-white focus:outline-none focus:border-[#F47920]" />
              </div>
              <select value={filtroRole} onChange={e => setFiltroRole(e.target.value)}
                className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none">
                <option>Todos</option>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {/* Tabela usuários */}
            <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                      {["Nome","E-mail","Perfil","Departamentos","Impressão/Excel","Ações"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F6F4]">
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#F47920]" /></td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-[#5C7060] text-sm">Nenhum usuário encontrado</td></tr>
                    ) : filteredUsers.map(u => {
                      const col = colaboradores.find(c => c.email === u.email);
                      let depts = [];
                      if (col?.departamentos) { try { depts = JSON.parse(col.departamentos); } catch {} }
                      else if (col?.departamento) { depts = [col.departamento]; }
                      return (
                        <tr key={u.id} className="hover:bg-[#F4F6F4] transition-colors">
                          <td className="px-4 py-3 font-medium text-[#1A2B1F]">{u.full_name || "—"}</td>
                          <td className="px-4 py-3 text-xs text-[#5C7060]">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[u.role] || roleColors.user}`}>
                              {ROLES.find(r => r.value === u.role)?.label || u.role || "user"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#5C7060]">
                            {depts.length > 0 ? depts.join(", ") : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="flex gap-2">
                              {col?.allow_print && <span className="flex items-center gap-1 text-[#1A4731]"><Printer size={11} /> Impressão</span>}
                              {col?.allow_excel && <span className="flex items-center gap-1 text-[#F47920]"><FileSpreadsheet size={11} /> Excel</span>}
                              {!col?.allow_print && !col?.allow_excel && <span className="text-[#5C7060]">—</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => openModal(u)}
                              className="p-1.5 hover:bg-[#E8EDE9] rounded-lg"><Edit2 size={13} className="text-[#5C7060]" /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DEPARTAMENTOS */}
        {activeTab === "departamentos" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
              <p className="text-sm font-semibold text-[#1A2B1F] mb-3">Novo Departamento</p>
              <div className="flex flex-wrap gap-3">
                <input placeholder="Nome do departamento" value={novoDeptNome} onChange={e => setNovoDeptNome(e.target.value)}
                  className="flex-1 min-w-[180px] border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
                <input placeholder="Descrição (opcional)" value={novoDeptDesc} onChange={e => setNovoDeptDesc(e.target.value)}
                  className="flex-1 min-w-[200px] border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
                <button onClick={createDept} disabled={savingDept || !novoDeptNome.trim()}
                  className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] disabled:opacity-50">
                  {savingDept ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Criar
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                      {["Departamento","Descrição","Status","Ações"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F6F4]">
                    {loading ? (
                      <tr><td colSpan={4} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#F47920]" /></td></tr>
                    ) : departamentos.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-10 text-[#5C7060] text-sm">Nenhum departamento cadastrado</td></tr>
                    ) : departamentos.map(d => (
                      <tr key={d.id} className="hover:bg-[#F4F6F4] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A2B1F]">{d.nome}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{d.descricao || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${d.ativo ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                            {d.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <button onClick={() => toggleDept(d)} className="p-1.5 hover:bg-[#E8EDE9] rounded-lg text-xs text-[#5C7060]">
                            {d.ativo ? <XCircle size={13} /> : <CheckCircle size={13} />}
                          </button>
                          <button onClick={() => deleteDept(d)} className="p-1.5 hover:bg-red-50 rounded-lg"><X size={13} className="text-red-400" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PRIVILÉGIOS */}
        {activeTab === "privilegios" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
              <p className="font-semibold text-[#1A2B1F] mb-4">Perfis de Acesso — Referência</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROLES.map(r => (
                  <div key={r.value} className="flex items-start gap-3 bg-[#F4F6F4] rounded-xl p-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5 ${roleColors[r.value]}`}>{r.label}</span>
                    <p className="text-xs text-[#5C7060]">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
              <div className="p-4 border-b border-[#DDE3DE]">
                <p className="font-semibold text-[#1A2B1F] text-sm">Usuários e suas Permissões</p>
                <p className="text-xs text-[#5C7060] mt-0.5">Edite um usuário na aba Usuários para ajustar permissões detalhadas</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                      {["Nome","Perfil","Departamentos","Páginas com Acesso","Impressão","Excel"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F6F4]">
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#F47920]" /></td></tr>
                    ) : users.map(u => {
                      const col = colaboradores.find(c => c.email === u.email);
                      let depts = [];
                      if (col?.departamentos) { try { depts = JSON.parse(col.departamentos); } catch {} }
                      else if (col?.departamento) { depts = [col.departamento]; }
                      let perms = {};
                      if (col?.paginas_permissoes) { try { perms = JSON.parse(col.paginas_permissoes); } catch {} }
                      const viewCount = Object.values(perms).filter(p => p.view).length;
                      return (
                        <tr key={u.id} className="hover:bg-[#F4F6F4] transition-colors">
                          <td className="px-4 py-3 font-medium text-[#1A2B1F] text-sm">{u.full_name || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${roleColors[u.role] || roleColors.user}`}>
                              {ROLES.find(r => r.value === u.role)?.label || u.role || "user"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-[#5C7060]">{depts.length > 0 ? depts.join(", ") : "—"}</td>
                          <td className="px-4 py-3 text-xs text-[#5C7060]">{viewCount > 0 ? `${viewCount} página(s)` : "Padrão do perfil"}</td>
                          <td className="px-4 py-3 text-center">{col?.allow_print ? <CheckCircle size={14} className="text-emerald-600 mx-auto" /> : <XCircle size={14} className="text-gray-300 mx-auto" />}</td>
                          <td className="px-4 py-3 text-center">{col?.allow_excel ? <CheckCircle size={14} className="text-emerald-600 mx-auto" /> : <XCircle size={14} className="text-gray-300 mx-auto" />}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ASSISTENTE IA */}
        {activeTab === "assistente" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#1A2B1F]">Widget Flutuante</p>
                  <p className="text-xs text-[#5C7060] mt-0.5">Ativar ou desativar o Assistente APSIS para todos os usuários</p>
                </div>
                <button onClick={toggleWidgetEnabled} className="flex items-center gap-2 text-sm font-medium">
                  {assistantConfig['widget_enabled']?.value === 'false' ? (
                    <><ToggleLeft size={28} className="text-gray-400" /> <span className="text-gray-500">Desativado</span></>
                  ) : (
                    <><ToggleRight size={28} className="text-[#1A4731]" /> <span className="text-[#1A4731]">Ativado</span></>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
              <p className="font-semibold text-[#1A2B1F] mb-3">Últimas Interações (50)</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                      {["Usuário","Módulo","Status","Fontes","Data"].map(h => (
                        <th key={h} className="text-left px-3 py-2 font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F6F4]">
                    {assistantLogs.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-6 text-[#5C7060]">Nenhuma interação registrada</td></tr>
                    ) : assistantLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#F4F6F4]">
                        <td className="px-3 py-2 text-[#1A2B1F]">{log.user_email}</td>
                        <td className="px-3 py-2 text-[#5C7060]">{log.modulo || '—'}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${log.status === 'success' ? 'bg-emerald-50 text-emerald-700' : log.status === 'blocked' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[#5C7060]">{log.sources_count ?? 0}</td>
                        <td className="px-3 py-2 text-[#5C7060]">{log.created_date ? new Date(log.created_date).toLocaleString('pt-BR') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
              <div className="p-5 border-b border-[#DDE3DE] flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#1A2B1F] flex items-center gap-2"><BookOpen size={15} /> Base de Conhecimento</p>
                  <p className="text-xs text-[#5C7060] mt-0.5">{knowledgeDocs.length} documento(s) cadastrado(s)</p>
                </div>
                <button onClick={() => setShowDocForm(!showDocForm)}
                  className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40]">
                  <Plus size={13} /> Novo Documento
                </button>
              </div>
              {showDocForm && (
                <div className="p-5 border-b border-[#DDE3DE] bg-[#F4F6F4] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input placeholder="Título *" value={newDoc.title} onChange={e => setNewDoc(d => ({ ...d, title: e.target.value }))}
                      className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
                    <input placeholder="Tags (ex: budget, proposta)" value={newDoc.tags} onChange={e => setNewDoc(d => ({ ...d, tags: e.target.value }))}
                      className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
                  </div>
                  <textarea placeholder="Conteúdo *" value={newDoc.content} onChange={e => setNewDoc(d => ({ ...d, content: e.target.value }))}
                    rows={4} className="w-full border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920] resize-none" />
                  <div className="flex flex-wrap gap-3">
                    <select value={newDoc.category} onChange={e => setNewDoc(d => ({ ...d, category: e.target.value }))} className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none">
                      {["FAQ","Manual","Política","Procedimento","Relatório","Outro"].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={newDoc.module} onChange={e => setNewDoc(d => ({ ...d, module: e.target.value }))} className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none">
                      {["Geral","Dashboard","Pipeline","Projetos","Financeiro","Budget","Marketing","Admin"].map(m => <option key={m}>{m}</option>)}
                    </select>
                    <select value={newDoc.sensitivity} onChange={e => setNewDoc(d => ({ ...d, sensitivity: e.target.value }))} className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none">
                      {["PUBLICO","INTERNO","RESTRITO"].map(s => <option key={s}>{s}</option>)}
                    </select>
                    <button onClick={saveDoc} disabled={savingDoc || !newDoc.title.trim() || !newDoc.content.trim()}
                      className="flex items-center gap-2 bg-[#F47920] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#D4640D] disabled:opacity-50 ml-auto">
                      {savingDoc ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Salvar
                    </button>
                  </div>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                      {["Título","Categoria","Módulo","Sensibilidade","Status","Ações"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F6F4]">
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#F47920]" /></td></tr>
                    ) : knowledgeDocs.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-[#5C7060] text-sm">Nenhum documento cadastrado</td></tr>
                    ) : knowledgeDocs.map(doc => (
                      <tr key={doc.id} className="hover:bg-[#F4F6F4] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A2B1F] max-w-[200px] truncate">{doc.title}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{doc.category}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{doc.module}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${doc.sensitivity === 'PUBLICO' ? 'bg-emerald-50 text-emerald-700' : doc.sensitivity === 'RESTRITO' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-700'}`}>
                            {doc.sensitivity}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${doc.ativo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                            {doc.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <button onClick={() => toggleDoc(doc)} className="p-1.5 hover:bg-[#E8EDE9] rounded-lg">
                            {doc.ativo ? <XCircle size={13} className="text-[#5C7060]" /> : <CheckCircle size={13} className="text-emerald-600" />}
                          </button>
                          <button onClick={() => deleteDoc(doc)} className="p-1.5 hover:bg-red-50 rounded-lg">
                            <Trash2 size={13} className="text-red-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDITAR USUÁRIO */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 overflow-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
            <div className="flex items-center justify-between p-6 border-b border-[#DDE3DE]">
              <div>
                <h2 className="font-semibold text-[#1A2B1F]">Editar Usuário</h2>
                <p className="text-xs text-[#5C7060]">{modalUser.full_name} · {modalUser.email}</p>
              </div>
              <button onClick={() => setModalUser(null)}><X size={18} className="text-[#5C7060]" /></button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Perfil de Acesso */}
              <div>
                <label className="block text-xs font-semibold text-[#1A2B1F] mb-2">Perfil de Acesso</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ROLES.map(r => (
                    <button key={r.value} onClick={() => handleRoleChange(r.value)}
                      className={`text-left p-3 rounded-xl border-2 transition-all ${modalUser.role === r.value ? "border-[#1A4731] bg-[#1A4731]/5" : "border-[#DDE3DE] hover:border-[#1A4731]/30"}`}>
                      <p className="text-xs font-semibold text-[#1A2B1F]">{r.label}</p>
                      <p className="text-[10px] text-[#5C7060] mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Departamentos — múltipla seleção */}
              <div>
                <label className="block text-xs font-semibold text-[#1A2B1F] mb-2">Departamentos (múltipla seleção)</label>
                <div className="flex flex-wrap gap-2">
                  {departamentos.filter(d => d.ativo).map(d => (
                    <button key={d.id} onClick={() => toggleDeptSelection(d.nome)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${modalDepts.includes(d.nome) ? "bg-[#1A4731] text-white border-[#1A4731]" : "border-[#DDE3DE] text-[#5C7060] hover:border-[#1A4731]/40"}`}>
                      {d.nome}
                    </button>
                  ))}
                  {departamentos.filter(d => d.ativo).length === 0 && (
                    <p className="text-xs text-[#5C7060]">Nenhum departamento cadastrado</p>
                  )}
                </div>
              </div>

              {/* Páginas e Permissões */}
              <div>
                <label className="block text-xs font-semibold text-[#1A2B1F] mb-2">Permissões por Página</label>
                <div className="space-y-2">
                  {pageGroups.map(group => (
                    <div key={group.label} className="border border-[#DDE3DE] rounded-xl overflow-hidden">
                      <button onClick={() => toggleExpandGroup(group.label)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#F4F6F4] hover:bg-[#E8EDE9] transition-colors">
                        <span className="text-xs font-semibold text-[#1A2B1F]">{group.label}</span>
                        {expandedGroups[group.label] ? <ChevronUp size={14} className="text-[#5C7060]" /> : <ChevronDown size={14} className="text-[#5C7060]" />}
                      </button>
                      {expandedGroups[group.label] && (
                        <div className="divide-y divide-[#F4F6F4]">
                          {/* Header */}
                          <div className="grid grid-cols-[1fr_80px_80px_80px] px-4 py-1.5 bg-[#FAFAFA]">
                            <span className="text-[10px] font-semibold text-[#5C7060] uppercase">Página</span>
                            {["Visualizar","Editar","Escrever"].map(h => (
                              <span key={h} className="text-[10px] font-semibold text-[#5C7060] uppercase text-center">{h}</span>
                            ))}
                          </div>
                          {group.pages.map(page => (
                            <div key={page.id} className="grid grid-cols-[1fr_80px_80px_80px] px-4 py-2 items-center hover:bg-[#F4F6F4]">
                              <span className="text-xs text-[#1A2B1F]">{page.label}</span>
                              {["view","edit","write"].map(type => (
                                <div key={type} className="flex justify-center">
                                  <button onClick={() => togglePagePerm(page.id, type)}
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${modalPermissions[page.id]?.[type] ? "bg-[#1A4731] border-[#1A4731]" : "border-[#DDE3DE] hover:border-[#1A4731]/50"}`}>
                                    {modalPermissions[page.id]?.[type] && <CheckCircle size={11} className="text-white" />}
                                  </button>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Exportação */}
              <div>
                <label className="block text-xs font-semibold text-[#1A2B1F] mb-2">Permissões de Exportação</label>
                <div className="flex gap-3">
                  <button onClick={() => setModalAllowPrint(!modalAllowPrint)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${modalAllowPrint ? "bg-[#1A4731] text-white border-[#1A4731]" : "border-[#DDE3DE] text-[#5C7060] hover:border-[#1A4731]/40"}`}>
                    <Printer size={14} /> Liberar Impressão
                  </button>
                  <button onClick={() => setModalAllowExcel(!modalAllowExcel)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${modalAllowExcel ? "bg-[#F47920] text-white border-[#F47920]" : "border-[#DDE3DE] text-[#5C7060] hover:border-[#F47920]/40"}`}>
                    <FileSpreadsheet size={14} /> Liberar Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#DDE3DE]">
              <button onClick={() => setModalUser(null)} className="px-4 py-2 border border-[#DDE3DE] rounded-xl text-sm text-[#5C7060] hover:bg-[#F4F6F4]">Cancelar</button>
              <button onClick={saveUser} className="px-5 py-2 bg-[#1A4731] text-white rounded-xl text-sm font-medium hover:bg-[#245E40]">
                Salvar Permissões
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}