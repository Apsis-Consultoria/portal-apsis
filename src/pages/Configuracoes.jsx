import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import { Plus, Edit2, X, Loader2, UserCheck, Save, Briefcase, ExternalLink } from "lucide-react";

export default function Configuracoes() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [colaboradores, setColaboradores] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // null | "novo" | colaborador obj
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    base44.auth.me().then(async u => {
      if (!u) { window.location.href = createPageUrl("Dashboard"); return; }
      if (u.role !== "admin" && u.role !== "manager") {
        window.location.href = createPageUrl("AccessDenied"); return;
      }
      setCurrentUser(u);
      setAuthLoading(false);
      load(u);
    });
  }, []);

  const load = async (u) => {
    setLoading(true);
    const [cols, depts] = await Promise.all([
      base44.entities.Colaborador.list(),
      base44.entities.Departamento.list(),
    ]);

    // manager só vê colaboradores do próprio departamento
    if (u?.role === "manager") {
      // busca departamento do manager pelo email
      const mgrCol = cols.find(c => c.email === u.email);
      const mgrDept = mgrCol?.departamento || "";
      setColaboradores(mgrDept ? cols.filter(c => c.departamento === mgrDept) : []);
    } else {
      setColaboradores(cols);
    }
    setDepartamentos(depts.filter(d => d.ativo));
    setLoading(false);
  };

  const openNovo = () => {
    // manager já pré-preenche o departamento dele
    const mgrCol = colaboradores.find(c => c.email === currentUser?.email);
    const mgrDept = mgrCol?.departamento || "";
    setForm({
      nome: "", cargo: "", area: "", email: "",
      departamento: currentUser?.role === "manager" ? mgrDept : "",
      capacidade_horas_mensais: 160, ativo: true
    });
    setModal("novo");
  };

  const openEdit = (col) => {
    setForm({ ...col });
    setModal(col);
  };

  const save = async () => {
    if (!form.nome?.trim()) return;
    setSaving(true);
    if (modal === "novo") {
      await base44.entities.Colaborador.create(form);
    } else {
      await base44.entities.Colaborador.update(form.id, form);
    }
    setSaving(false);
    setModal(null);
    load(currentUser);
  };

  const remove = async (col) => {
    await base44.entities.Colaborador.delete(col.id);
    load(currentUser);
  };

  const mgrDept = colaboradores.find(c => c.email === currentUser?.email)?.departamento;

  if (authLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-7 h-7 text-[#F47920] animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Card de acesso rápido — Onboarding */}
      <div className="bg-white border border-[#DDE3DE] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#F47920]/10 rounded-xl">
            <Briefcase size={22} className="text-[#F47920]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#1A2B1F]">Onboarding de Colaboradores</h3>
            <p className="text-xs text-[#5C7060] mt-0.5">Visualize e gerencie o formulário de onboarding interno</p>
          </div>
        </div>
        <Link
          to="/OnboardingInterno"
          className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors"
        >
          <ExternalLink size={14} /> Abrir Onboarding
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A2B1F]">Gestão de Colaboradores</h2>
          <p className="text-sm text-[#5C7060] mt-0.5">
            {currentUser?.role === "manager"
              ? `Você pode cadastrar e editar colaboradores do departamento: ${mgrDept || "—"}`
              : "Administre todos os colaboradores do portal"}
          </p>
        </div>
        <button onClick={openNovo}
          className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40]">
          <Plus size={14} /> Novo Colaborador
        </button>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#DDE3DE] bg-[#F4F6F4]">
                {["Nome","Cargo","Área","Departamento","E-mail","Cap. Horas/mês","Status","Ações"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#5C7060] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F6F4]">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#F47920]" /></td></tr>
              ) : colaboradores.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-[#5C7060]">Nenhum colaborador cadastrado</td></tr>
              ) : colaboradores.map(c => (
                <tr key={c.id} className="hover:bg-[#F4F6F4] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A2B1F]">{c.nome}</td>
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{c.cargo || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{c.area || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{c.departamento || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#5C7060]">{c.capacidade_horas_mensais ?? 160}h</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${c.ativo !== false ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                      {c.ativo !== false ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-[#E8EDE9] rounded-lg">
                      <Edit2 size={13} className="text-[#5C7060]" />
                    </button>
                    <button onClick={() => remove(c)} className="p-1.5 hover:bg-red-50 rounded-lg">
                      <X size={13} className="text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-[#DDE3DE]">
              <h2 className="font-semibold text-[#1A2B1F]">{modal === "novo" ? "Novo Colaborador" : "Editar Colaborador"}</h2>
              <button onClick={() => setModal(null)}><X size={18} className="text-[#5C7060]" /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Nome *</label>
                <input value={form.nome || ""} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className="w-full border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Cargo</label>
                <input value={form.cargo || ""} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))}
                  className="w-full border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Área</label>
                <input value={form.area || ""} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
                  className="w-full border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#5C7060] mb-1">E-mail</label>
                <input type="email" value={form.email || ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Departamento</label>
                <select value={form.departamento || ""}
                  onChange={e => setForm(f => ({ ...f, departamento: e.target.value }))}
                  disabled={currentUser?.role === "manager"}
                  className="w-full border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920] disabled:bg-[#F4F6F4] disabled:cursor-not-allowed">
                  <option value="">— Nenhum —</option>
                  {departamentos.map(d => <option key={d.id} value={d.nome}>{d.nome}</option>)}
                </select>
                {currentUser?.role === "manager" && (
                  <p className="text-[10px] text-[#5C7060] mt-1">Departamento fixo ao seu perfil de gestor.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Cap. Horas/mês</label>
                <input type="number" value={form.capacidade_horas_mensais ?? 160}
                  onChange={e => setForm(f => ({ ...f, capacidade_horas_mensais: Number(e.target.value) }))}
                  className="w-full border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]" />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <label className="text-xs font-medium text-[#5C7060]">Ativo</label>
                <button onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.ativo !== false ? "bg-[#1A4731]" : "bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.ativo !== false ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-5 pb-5">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-[#DDE3DE] rounded-xl text-sm text-[#5C7060] hover:bg-[#F4F6F4]">Cancelar</button>
              <button onClick={save} disabled={saving || !form.nome?.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-[#1A4731] text-white rounded-xl text-sm font-medium hover:bg-[#245E40] disabled:opacity-50">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}