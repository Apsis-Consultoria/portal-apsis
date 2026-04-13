import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, Edit2, Trash2, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

const fmt = (v) => v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "—";

export default function AlocacoesHoras() {
  const [alocacoes, setAlocacoes] = useState([]);
  const [oss, setOss] = useState([]);
  const [colaboradoresList, setColaboradoresList] = useState([]);
  const [filtroSetor, setFiltroSetor] = useState("Todos");
  const [filtroProjeto, setFiltroProjeto] = useState("Todos");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroColaborador, setFiltroColaborador] = useState("Todos");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.AlocacaoHoras.list("-created_date", 200),
      base44.entities.OrdemServico.list("-created_date", 200),
      base44.entities.Colaborador.filter({ ativo: true }, "nome", 300),
    ]).then(([aloc, orders, cols]) => {
      setAlocacoes(aloc);
      setOss(orders);
      setColaboradoresList(cols.sort((a, b) => a.nome.localeCompare(b.nome)));
      setLoading(false);
    });
  }, []);

  const projetos = [...new Set(alocacoes.map(a => a.projeto_id).filter(Boolean))];
  const setores = [...new Set(alocacoes.map(a => a.setor).filter(Boolean))];
  const colaboradores = [...new Set(alocacoes.map(a => a.colaborador).filter(Boolean))].sort();

  const filtrados = alocacoes.filter(a => {
    const s = filtroSetor === "Todos" || a.setor === filtroSetor;
    const p = filtroProjeto === "Todos" || a.projeto_id === filtroProjeto;
    const st = filtroStatus === "Todos" || a.status === filtroStatus;
    const c = filtroColaborador === "Todos" || a.colaborador === filtroColaborador;
    return s && p && st && c;
  });

  // KPIs
  const totalHorasPrevistas = filtrados.reduce((s, a) => s + (a.horas_previstas || 0), 0);
  const totalHorasExecutadas = filtrados.reduce((s, a) => s + (a.horas_executadas || 0), 0);
  const horasRestantes = totalHorasPrevistas - totalHorasExecutadas;
  const pctExecutado = totalHorasPrevistas > 0 ? ((totalHorasExecutadas / totalHorasPrevistas) * 100).toFixed(1) : 0;

  // Ranking de colaboradores
  const ranking = {};
  filtrados.forEach(a => {
    if (!ranking[a.colaborador]) {
      ranking[a.colaborador] = { previstas: 0, executadas: 0, projetos: 0 };
    }
    ranking[a.colaborador].previstas += a.horas_previstas || 0;
    ranking[a.colaborador].executadas += a.horas_executadas || 0;
    ranking[a.colaborador].projetos += 1;
  });

  const rankingOrdenado = Object.entries(ranking)
    .map(([col, data]) => ({ colaborador: col, ...data, utilizacao: data.previstas > 0 ? ((data.executadas / data.previstas) * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.previstas - a.previstas);

  const salvar = async () => {
    setSaving(true);
    const { data, editing } = modal;
    if (editing?.id) await base44.entities.AlocacaoHoras.update(editing.id, data);
    else await base44.entities.AlocacaoHoras.create(data);
    const aloc = await base44.entities.AlocacaoHoras.list("-created_date", 200);
    setAlocacoes(aloc);
    setModal(null);
    setSaving(false);
  };

  const excluir = async (id) => {
    if (!confirm("Confirmar exclusão?")) return;
    await base44.entities.AlocacaoHoras.delete(id);
    const aloc = await base44.entities.AlocacaoHoras.list("-created_date", 200);
    setAlocacoes(aloc);
  };

  const InputField = ({ label, field, type = "text", options }) => (
    <div>
      <label className="block text-xs font-medium text-[#5C7060] mb-1">{label}</label>
      {options ? (
        <select className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
          value={modal?.data?.[field] || ""}
          onChange={e => setModal(m => ({ ...m, data: { ...m.data, [field]: e.target.value } }))}>
          <option value="">Selecionar</option>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type}
          className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
          value={modal?.data?.[field] || ""}
          onChange={e => setModal(m => ({ ...m, data: { ...m.data, [field]: type === "number" ? Number(e.target.value) : e.target.value } }))} />
      )}
    </div>
  );

  if (loading) return <div className="text-center py-16 text-[#5C7060]">Carregando...</div>;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-4">
          <p className="text-xs font-medium text-[#5C7060] uppercase mb-2">Horas Previstas</p>
          <p className="text-2xl font-bold text-[#1A2B1F]">{totalHorasPrevistas.toFixed(0)}h</p>
          <p className="text-xs text-[#5C7060] mt-1">{filtrados.length} alocações</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-4">
          <p className="text-xs font-medium text-[#5C7060] uppercase mb-2">Horas Executadas</p>
          <p className="text-2xl font-bold text-[#F47920]">{totalHorasExecutadas.toFixed(0)}h</p>
          <p className="text-xs text-[#5C7060] mt-1">{pctExecutado}% realizado</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-4">
          <p className="text-xs font-medium text-[#5C7060] uppercase mb-2">Horas Restantes</p>
          <p className="text-2xl font-bold text-[#1A4731]">{horasRestantes.toFixed(0)}h</p>
          <p className="text-xs text-[#5C7060] mt-1">para executar</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#DDE3DE] p-4">
          <p className="text-xs font-medium text-[#5C7060] uppercase mb-2">Colaboradores</p>
          <p className="text-2xl font-bold text-[#1A4731]">{rankingOrdenado.length}</p>
          <p className="text-xs text-[#5C7060] mt-1">envolvidos</p>
        </div>
      </div>

      {/* Barra de progresso geral */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] p-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-semibold text-[#1A2B1F]">Progresso Geral</p>
          <p className="text-sm font-bold text-[#F47920]">{pctExecutado}%</p>
        </div>
        <div className="w-full bg-[#F4F6F4] rounded-full h-3">
          <div className="h-3 bg-[#F47920] rounded-full transition-all" style={{ width: `${pctExecutado}%` }} />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroSetor} onChange={e => setFiltroSetor(e.target.value)}>
          <option value="Todos">Todos setores</option>
          {setores.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroProjeto} onChange={e => setFiltroProjeto(e.target.value)}>
          <option value="Todos">Todos projetos</option>
          {projetos.map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)}>
          <option value="Todos">Todos status</option>
          {["Planejada", "Em andamento", "Concluída", "Suspensa"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="border border-[#DDE3DE] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none"
          value={filtroColaborador} onChange={e => setFiltroColaborador(e.target.value)}>
          <option value="Todos">Todos colaboradores</option>
          {colaboradores.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => setModal({ data: {}, editing: null })}
          className="flex items-center gap-2 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#245E40]">
          <Plus size={15} /> Nova Alocação
        </button>
      </div>

      {/* Ranking */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5">
        <h2 className="font-semibold text-[#1A2B1F] mb-4 flex items-center gap-2"><TrendingUp size={16} /> Ranking — Carga de Trabalho</h2>
        <div className="space-y-2">
          {rankingOrdenado.length === 0 ? (
            <p className="text-sm text-[#5C7060] text-center py-8">Nenhuma alocação encontrada</p>
          ) : rankingOrdenado.map((item, idx) => {
            const max = Math.max(...rankingOrdenado.map(r => r.previstas), 1);
            const pct = (item.previstas / max) * 100;
            const alerta = item.utilizacao > 90;
            return (
              <div key={item.colaborador} className={`p-3 rounded-xl border ${alerta ? "bg-red-50 border-red-200" : "bg-[#F4F6F4] border-[#DDE3DE]"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                      idx === 0 ? "bg-[#F47920] text-white" : idx === 1 ? "bg-[#1A4731] text-white" : "bg-[#DDE3DE] text-[#1A2B1F]"
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#1A2B1F]">{item.colaborador}</p>
                      <p className="text-xs text-[#5C7060]">{item.projetos} projeto(s)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#1A2B1F]">{item.previstas.toFixed(0)}h</p>
                    <p className={`text-xs font-semibold ${alerta ? "text-red-600" : "text-[#F47920]"}`}>{item.utilizacao}% utilizado</p>
                    {alerta && <AlertTriangle size={12} className="text-red-500 inline mt-1" />}
                  </div>
                </div>
                <div className="w-full bg-white rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${alerta ? "bg-red-400" : "bg-[#F47920]"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabela de alocações */}
      <div className="bg-white rounded-2xl border border-[#DDE3DE] overflow-hidden">
        <div className="p-5 border-b border-[#DDE3DE]">
          <h2 className="font-semibold text-[#1A2B1F]">Detalhes das Alocações</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#F4F6F4] border-b border-[#DDE3DE]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-[#5C7060]">Colaborador</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5C7060]">Setor</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5C7060]">Projeto</th>
                <th className="px-4 py-3 text-center font-semibold text-[#5C7060]">Horas Prev.</th>
                <th className="px-4 py-3 text-center font-semibold text-[#5C7060]">Executadas</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5C7060]">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-[#5C7060]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-8 text-center text-[#5C7060]">Nenhuma alocação encontrada</td></tr>
              ) : filtrados.map((aloc) => (
                <tr key={aloc.id} className="border-b border-[#DDE3DE] hover:bg-[#F4F6F4]">
                  <td className="px-4 py-3 font-medium text-[#1A2B1F]">{aloc.colaborador}</td>
                  <td className="px-4 py-3 text-[#5C7060]">{aloc.setor || "—"}</td>
                  <td className="px-4 py-3 text-[#5C7060] max-w-xs truncate">{aloc.projeto_id}</td>
                  <td className="px-4 py-3 text-center font-semibold text-[#1A2B1F]">{aloc.horas_previstas || 0}h</td>
                  <td className="px-4 py-3 text-center font-semibold text-[#F47920]">{aloc.horas_executadas || 0}h</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                      aloc.status === "Concluída" ? "bg-green-100 text-green-700" :
                      aloc.status === "Em andamento" ? "bg-blue-100 text-blue-700" :
                      aloc.status === "Suspensa" ? "bg-red-100 text-red-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {aloc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-1">
                    <button onClick={() => setModal({ data: { ...aloc }, editing: aloc })} className="p-1 hover:bg-[#F4F6F4] rounded"><Edit2 size={13} className="text-[#5C7060]" /></button>
                    <button onClick={() => excluir(aloc.id)} className="p-1 hover:bg-red-50 rounded"><Trash2 size={13} className="text-red-400" /></button>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#DDE3DE]">
              <h2 className="font-semibold text-[#1A2B1F]">{modal.editing ? "Editar Alocação" : "Nova Alocação de Horas"}</h2>
              <button onClick={() => setModal(null)}><X size={18} className="text-[#5C7060]" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Colaborador</label>
                <select
                  className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                  value={modal?.data?.colaborador || ""}
                  onChange={e => {
                    const col = colaboradoresList.find(c => c.nome === e.target.value);
                    setModal(m => ({
                      ...m,
                      data: {
                        ...m.data,
                        colaborador: e.target.value,
                        setor: col?.departamento || m.data?.setor || ""
                      }
                    }));
                  }}
                >
                  <option value="">Selecionar colaborador</option>
                  {colaboradoresList.map(c => (
                    <option key={c.id} value={c.nome}>{c.nome}{c.departamento ? ` — ${c.departamento}` : ""}</option>
                  ))}
                </select>
              </div>
              <InputField label="Setor" field="setor" options={["Contábil", "Consultoria", "Tributária", "Societária", "M&A", "Outros"]} />
              <InputField label="Projeto/OS" field="projeto_id" />
              <InputField label="Status" field="status" options={["Planejada", "Em andamento", "Concluída", "Suspensa"]} />
              <InputField label="Horas Previstas" field="horas_previstas" type="number" />
              <InputField label="Horas Executadas" field="horas_executadas" type="number" />
              <InputField label="Data Início" field="data_inicio" type="date" />
              <InputField label="Data Fim" field="data_fim" type="date" />
              <div className="col-span-2">
                <label className="block text-xs font-medium text-[#5C7060] mb-1">Observações</label>
                <textarea rows={2} className="w-full border border-[#DDE3DE] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920]"
                  value={modal?.data?.observacoes || ""}
                  onChange={e => setModal(m => ({ ...m, data: { ...m.data, observacoes: e.target.value } }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setModal(null)} className="px-4 py-2 border border-[#DDE3DE] rounded-xl text-sm text-[#5C7060] hover:bg-[#F4F6F4]">Cancelar</button>
              <button onClick={salvar} disabled={saving}
                className="px-5 py-2 bg-[#1A4731] text-white rounded-xl text-sm font-medium hover:bg-[#245E40] disabled:opacity-60">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}