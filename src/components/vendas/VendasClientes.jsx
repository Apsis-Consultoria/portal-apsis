import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Building2, Edit2, Trash2, X, Users } from "lucide-react";

const fmt = (v) =>
  v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "R$ 0";

const TIPOS = ["Todos os tipos", "Empresa", "Pessoa Física", "Governo", "ONG", "Outro"];
const empty = { nome: "", tipo: "Empresa", cnpj: "", segmento: "", responsavel: "", contato_nome: "", contato_email: "", ativo: true };

export default function VendasClientes() {
  const [clientes, setClientes] = useState([]);
  const [propostas, setPropostas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos os tipos");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => Promise.all([
    base44.entities.Cliente.list("-created_date", 200),
    base44.entities.Proposta.list("-created_date", 500),
  ]).then(([c, p]) => { setClientes(c); setPropostas(p); });

  useEffect(() => { load(); }, []);

  const filtrados = clientes.filter(c => {
    const matchBusca = !busca ||
      c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      c.cnpj?.includes(busca) ||
      c.responsavel?.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo === "Todos os tipos" || c.tipo === filtroTipo;
    return matchBusca && matchTipo;
  });

  const getStats = (cliente) => {
    const opp = propostas.filter(p => p.cliente_nome === cliente.nome);
    const valor = opp.filter(p => p.status === "Ganha").reduce((s, p) => s + (p.valor_total || 0), 0);
    return { total: opp.length, valor };
  };

  const salvar = async () => {
    setSaving(true);
    if (modal.editing?.id) await base44.entities.Cliente.update(modal.editing.id, modal.data);
    else await base44.entities.Cliente.create(modal.data);
    await load(); setModal(null); setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Confirma exclusão?")) return;
    await base44.entities.Cliente.delete(id); await load();
  };

  const Field = ({ label, field, type = "text", options, colSpan }) => (
    <div className={colSpan ? `col-span-${colSpan}` : ""}>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      {options ? (
        <select value={modal?.data?.[field] || ""}
          onChange={e => setModal(m => ({ ...m, data: { ...m.data, [field]: e.target.value } }))}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F47920] bg-white">
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={modal?.data?.[field] || ""}
          onChange={e => setModal(m => ({ ...m, data: { ...m.data, [field]: e.target.value } }))}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F47920]" />
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Cadastro e relacionamento comercial</p>
        </div>
        <button onClick={() => setModal({ data: { ...empty }, editing: null })}
          className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#245E40] transition-colors flex-shrink-0">
          <Plus size={15} /> Novo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, CNPJ ou responsável..."
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-[#F47920]" />
        </div>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none min-w-[160px]">
          {TIPOS.map(t => <option key={t}>{t}</option>)}
        </select>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
          <Users size={13} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-700">{filtrados.length}</span>
          <span className="text-xs text-slate-400">cliente{filtrados.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Building2 size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Nenhum cliente encontrado</p>
            <p className="text-xs text-slate-400">Adicione um cliente para começar</p>
            <button onClick={() => setModal({ data: { ...empty }, editing: null })}
              className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40] transition-colors mt-1">
              <Plus size={14} /> Novo Cliente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {["Nome", "Tipo", "Responsável", "Oportunidades", "Valor Gerado", "Status", ""].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtrados.map(c => {
                  const { total, valor } = getStats(c);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1A4731]/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[#1A4731]">{c.nome?.[0]?.toUpperCase() || "?"}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{c.nome}</p>
                            {c.cnpj && <p className="text-[10px] text-slate-400">{c.cnpj}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">{c.tipo || "—"}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{c.responsavel || "—"}</td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-bold text-slate-800">{total}</span>
                        <span className="text-xs text-slate-400 ml-1">oport.</span>
                      </td>
                      <td className="px-5 py-4 text-sm font-bold text-emerald-700">{fmt(valor)}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.ativo !== false ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                          {c.ativo !== false ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModal({ data: { ...c }, editing: c })}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Edit2 size={13} className="text-slate-400" /></button>
                          <button onClick={() => excluir(c.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} className="text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-800">{modal.editing ? "Editar" : "Novo"} Cliente</h2>
                <p className="text-xs text-slate-400 mt-0.5">Preencha os dados do cliente</p>
              </div>
              <button onClick={() => setModal(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2"><Field label="Nome *" field="nome" /></div>
              <Field label="Tipo" field="tipo" options={["Empresa","Pessoa Física","Governo","ONG","Outro"]} />
              <Field label="CNPJ / CPF" field="cnpj" />
              <Field label="Segmento" field="segmento" />
              <Field label="Responsável" field="responsavel" />
              <Field label="Nome do Contato" field="contato_nome" />
              <Field label="Email do Contato" field="contato_email" type="email" />
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button onClick={salvar} disabled={saving}
                className="px-6 py-2.5 bg-[#1A4731] text-white rounded-xl text-sm font-semibold hover:bg-[#245E40] disabled:opacity-60 transition-colors">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}