import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  Users, Shield, Plus, X, Edit2,
  CheckCircle, XCircle, Loader2, Search, Building2, Bot, BookOpen, ToggleLeft, ToggleRight, Trash2
} from "lucide-react";

const LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a1fc4b60b4c477ea324579/19aad65cc_Logohorizontal-Fundobranco.png";
const ROLES = ["admin","manager","user"];

const tabs = [
  { id:"usuarios", label:"Usuários", icon: Users },
  { id:"colaboradores", label:"Colaboradores", icon: Users },
  { id:"departamentos", label:"Departamentos", icon: Building2 },
  { id:"privilegios", label:"Privilégios", icon: Shield },
  { id:"assistente", label:"Assistente IA", icon: Bot },
];

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("usuarios");

  // Dados
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
  const [buscaColaboradores, setBuscaColaboradores] = useState("");

  // Modal usuário
  const [modalUser, setModalUser] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

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
    // Transformar configs em objeto key:value
    const cfgObj = {};
    (cfg || []).forEach(c => { cfgObj[c.key] = { id: c.id, value: c.value }; });
    setAssistantConfig(cfgObj);
    setAssistantLogs(logs || []);
    setLoading(false);
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

  const deleteDoc = async (doc) => {
    await base44.entities.KnowledgeBase.delete(doc.id);
    loadAll();
  };

  const toggleDoc = async (doc) => {
    await base44.entities.KnowledgeBase.update(doc.id, { ativo: !doc.ativo });
    loadAll();
  };

  const createDept = async () => {
    if (!novoDeptNome.trim()) return;
    setSavingDept(true);
    await base44.entities.Departamento.create({ nome: novoDeptNome.trim(), descricao: novoDeptDesc.trim(), ativo: true });
    setNovoDeptNome(""); setNovoDeptDesc("");
    setSavingDept(false);
    loadAll();
  };

  const toggleDept = async (dept) => {
    await base44.entities.Departamento.update(dept.id, { ativo: !dept.ativo });
    loadAll();
  };

  const deleteDept = async (dept) => {
    await base44.entities.Departamento.delete(dept.id);
    loadAll();
  };

  const updateUserRole = async (user, newRole) => {
    await base44.entities.User.update(user.id, { role: newRole });
    // Atualiza ou cria colaborador vinculando departamento
    if (user.departamento !== undefined) {
      const cols = await base44.entities.Colaborador.filter({ email: user.email });
      if (cols && cols.length > 0) {
        await base44.entities.Colaborador.update(cols[0].id, { departamento: user.departamento || "" });
      } else if (user.departamento) {
        await base44.entities.Colaborador.create({ nome: user.full_name, email: user.email, departamento: user.departamento });
      }
    }
    await base44.entities.AuditLog.create({
      usuario: currentUser?.full_name,
      email: currentUser?.email,
      acao: `Perfil de ${user.full_name} alterado para ${newRole}${user.departamento ? ` | Depto: ${user.departamento}` : ""}`,
      resultado: "Sucesso",
      modulo: "Admin"
    });
    try {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Portal APSIS — Perfil atualizado",
        body: `Olá ${user.full_name},\n\nSeu perfil de acesso no Portal APSIS foi atualizado para: ${newRole}.\n\nEm caso de dúvidas, entre em contato com o administrador.\n\nEquipe APSIS`
      });
    } catch {}
    loadAll();
    setModalUser(null);
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    setInviteMsg("");
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      await base44.entities.AuditLog.create({
        usuario: currentUser?.full_name,
        email: currentUser?.email,
        acao: `Usuário convidado: ${inviteEmail} (${inviteRole})`,
        resultado: "Sucesso",
        modulo: "Admin"
      });
      setInviteMsg("Convite enviado com sucesso!");
      setInviteEmail("");
      loadAll();
    } catch (e) {
      setInviteMsg("Erro ao enviar convite: " + e.message);
    }
    setInviting(false);
  };

  const filteredUsers = users.filter(u => {
    const b = !busca || u.full_name?.toLowerCase().includes(busca.toLowerCase()) || u.email?.toLowerCase().includes(busca.toLowerCase());
    const r = filtroRole === "Todos" || u.role === filtroRole;
    return b && r;
  });

  const filteredColaboradores = colaboradores.filter(c => {
    const search = buscaColaboradores.toLowerCase();
    return !search || 
      c.nome?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.cargo?.toLowerCase().includes(search) ||
      c.area?.toLowerCase().includes(search) ||
      c.departamento?.toLowerCase().includes(search);
  });

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
        <div className="flex gap-1 bg-white border border-[#DDE3DE] p-1 rounded-2xl w-fit">
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
                  {ROLES.map(r => <option key={r}>{r}</option>)}
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
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            {/* Tabela usuários */}
            <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                      {["Nome","E-mail","Perfil","Cadastro","Ações"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F6F4]">
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#F47920]" /></td></tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-10 text-[#5C7060] text-sm">Nenhum usuário encontrado</td></tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-[#F4F6F4] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A2B1F]">{u.full_name || "—"}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${u.role==="admin"?"bg-[#1A4731]/10 text-[#1A4731]":u.role==="manager"?"bg-[#F47920]/10 text-[#F47920]":"bg-gray-100 text-gray-600"}`}>
                            {u.role || "user"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{u.created_date ? new Date(u.created_date).toLocaleDateString("pt-BR") : "—"}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setModalUser(u)}
                            className="p-1.5 hover:bg-[#E8EDE9] rounded-lg"><Edit2 size={13} className="text-[#5C7060]" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* COLABORADORES */}
        {activeTab === "colaboradores" && (
          <div className="space-y-4">
            {/* Busca */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[250px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C7060]" />
                <input placeholder="Buscar por nome, email, cargo, área ou departamento..." value={buscaColaboradores} onChange={e => setBuscaColaboradores(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-[#DDE3DE] rounded-xl text-sm bg-white focus:outline-none focus:border-[#F47920]" />
              </div>
            </div>

            {/* Tabela colaboradores */}
            <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                      {["Nome","E-mail","Cargo","Área","Departamento","Status"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F6F4]">
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#F47920]" /></td></tr>
                    ) : filteredColaboradores.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-10 text-[#5C7060] text-sm">{colaboradores.length === 0 ? "Nenhum colaborador cadastrado" : "Nenhum colaborador encontrado"}</td></tr>
                    ) : filteredColaboradores.map(col => (
                      <tr key={col.id} className="hover:bg-[#F4F6F4] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A2B1F]">{col.nome || "—"}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{col.email || "—"}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{col.cargo || "—"}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{col.area || "—"}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{col.departamento || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${col.ativo ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                            {col.ativo !== false ? "Ativo" : "Inativo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DEPARTAMENTOS */}
        {activeTab === "departamentos" && (
          <div className="space-y-4">
            {/* Criar departamento */}
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

            {/* Lista */}
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
                          <button onClick={() => toggleDept(d)}
                            className="p-1.5 hover:bg-[#E8EDE9] rounded-lg text-xs text-[#5C7060]">
                            {d.ativo ? <XCircle size={13} /> : <CheckCircle size={13} />}
                          </button>
                          <button onClick={() => deleteDept(d)}
                            className="p-1.5 hover:bg-red-50 rounded-lg"><X size={13} className="text-red-400" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ASSISTENTE IA */}
        {activeTab === "assistente" && (
          <div className="space-y-5">
            {/* Status do widget */}
            <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#1A2B1F]">Widget Flutuante</p>
                  <p className="text-xs text-[#5C7060] mt-0.5">Ativar ou desativar o Assistente APSIS para todos os usuários</p>
                </div>
                <button onClick={toggleWidgetEnabled}
                  className="flex items-center gap-2 text-sm font-medium">
                  {assistantConfig['widget_enabled']?.value === 'false' ? (
                    <><ToggleLeft size={28} className="text-gray-400" /> <span className="text-gray-500">Desativado</span></>
                  ) : (
                    <><ToggleRight size={28} className="text-[#1A4731]" /> <span className="text-[#1A4731]">Ativado</span></>
                  )}
                </button>
              </div>
            </div>

            {/* Logs de uso */}
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

            {/* Base de conhecimento */}
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
                    <input placeholder="Tags (ex: budget, proposta, laudo)" value={newDoc.tags} onChange={e => setNewDoc(d => ({ ...d, tags: e.target.value }))}
                      className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
                  </div>
                  <textarea placeholder="Conteúdo do documento *" value={newDoc.content} onChange={e => setNewDoc(d => ({ ...d, content: e.target.value }))}
                    rows={4} className="w-full border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920] resize-none" />
                  <div className="flex flex-wrap gap-3">
                    <select value={newDoc.category} onChange={e => setNewDoc(d => ({ ...d, category: e.target.value }))}
                      className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none">
                      {["FAQ","Manual","Política","Procedimento","Relatório","Outro"].map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={newDoc.module} onChange={e => setNewDoc(d => ({ ...d, module: e.target.value }))}
                      className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none">
                      {["Geral","Dashboard","Pipeline","Projetos","Financeiro","Budget","Marketing","Admin"].map(m => <option key={m}>{m}</option>)}
                    </select>
                    <select value={newDoc.sensitivity} onChange={e => setNewDoc(d => ({ ...d, sensitivity: e.target.value }))}
                      className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none">
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

        {/* PRIVILÉGIOS — quem pode acessar Configurações */}
        {activeTab === "privilegios" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm text-amber-800 font-medium">Gestores com acesso à página de Configurações</p>
              <p className="text-xs text-amber-700 mt-1">
                Usuários com perfil <strong>manager</strong> já têm acesso à página de Configurações e podem cadastrar colaboradores do próprio departamento.
                Para conceder esse acesso a um usuário com perfil <strong>user</strong>, altere seu perfil para <strong>manager</strong> na aba Usuários.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
              <div className="p-4 border-b border-[#DDE3DE]">
                <p className="font-semibold text-[#1A2B1F] text-sm">Usuários com privilégio de Gestor (manager)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                      {["Nome","E-mail","Departamento","Acesso Configurações","Ação"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F6F4]">
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#F47920]" /></td></tr>
                    ) : users.filter(u => u.role === "manager" || u.role === "admin").length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-[#5C7060] text-sm">Nenhum gestor cadastrado</td></tr>
                    ) : users.filter(u => u.role === "manager" || u.role === "admin").map(u => (
                      <tr key={u.id} className="hover:bg-[#F4F6F4] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A2B1F]">{u.full_name || "—"}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">{u.email}</td>
                        <td className="px-4 py-3 text-xs text-[#5C7060]">
                          {(() => {
                            const col = colaboradores.find ? colaboradores.find(c => c.email === u.email) : null;
                            return col?.departamento || "—";
                          })()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-[#1A4731]/10 text-[#1A4731]" : "bg-[#F47920]/10 text-[#F47920]"}`}>
                            {u.role === "admin" ? "Admin (total)" : "Gestor (dept.)"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {u.role === "manager" && (
                            <button onClick={() => { setModalUser(u); setActiveTab("usuarios"); }}
                              className="text-xs text-[#5C7060] hover:text-red-500 border border-[#DDE3DE] px-2 py-1 rounded-lg hover:border-red-200 transition-colors">
                              Revogar
                            </button>
                          )}
                          {u.role === "admin" && <span className="text-xs text-[#5C7060]">Irrevogável</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-[#DDE3DE] bg-[#F4F6F4]">
                <p className="text-xs text-[#5C7060]">
                  Para <strong>conceder</strong> acesso de gestor: vá na aba <strong>Usuários</strong>, edite o usuário e altere o perfil para <strong>manager</strong>.<br/>
                  Para <strong>revogar</strong>: clique em "Revogar" acima — isso abrirá o modal de edição do usuário.
                </p>
              </div>
            </div>
          </div>
        )}


      </div>

      {/* Modal editar usuário */}
      {modalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-[#DDE3DE]">
              <h2 className="font-semibold text-[#1A2B1F]">Editar Perfil</h2>
              <button onClick={() => setModalUser(null)}><X size={18} className="text-[#5C7060]" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs text-[#5C7060]">Usuário</p>
                <p className="font-medium text-[#1A2B1F]">{modalUser.full_name}</p>
                <p className="text-xs text-[#5C7060]">{modalUser.email}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Perfil de Acesso</label>
                <select className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                  defaultValue={modalUser.role || "user"}
                  onChange={e => setModalUser(u => ({ ...u, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Departamento</label>
                <select className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                  value={modalUser.departamento || ""}
                  onChange={e => setModalUser(u => ({ ...u, departamento: e.target.value }))}>
                  <option value="">— Nenhum —</option>
                  {departamentos.filter(d => d.ativo).map(d => <option key={d.id} value={d.nome}>{d.nome}</option>)}
                </select>
                <p className="text-[10px] text-[#5C7060] mt-1">Será exibido na sidebar do usuário após o login.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModalUser(null)} className="px-4 py-2 border border-[#DDE3DE] rounded-xl text-sm text-[#5C7060] hover:bg-[#F4F6F4]">Cancelar</button>
              <button onClick={() => updateUserRole(modalUser, modalUser.role || "user")}
                className="px-5 py-2 bg-[#1A4731] text-white rounded-xl text-sm font-medium hover:bg-[#245E40]">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}