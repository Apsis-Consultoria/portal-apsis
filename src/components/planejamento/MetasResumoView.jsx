import { STATUS_CONFIG } from "./peUtils";

const DIRETORES = ["Bruno Bottino", "Caio Favero", "Marcelo Nascimento", "Angela Magalhães", "Miguel Monteiro", "Outro"];
const TEMAS = ["Comercial", "Inovação", "Qualidade Técnica", "Cultura e Pessoas", "Eficiência Operacional"];

export default function MetasResumoView({ items }) {
  // Tabela cruzada Diretor × Tema
  const diretoresComDados = DIRETORES.filter(d => items.some(i => i.diretor === d));
  const temasComDados = TEMAS.filter(t => items.some(i => i.tema === t));

  const getCell = (diretor, tema) => {
    const grupo = items.filter(i => i.diretor === diretor && i.tema === tema);
    if (!grupo.length) return null;
    const concluidas = grupo.filter(i => i.status === "Concluído").length;
    return { total: grupo.length, concluidas, pct: Math.round((concluidas / grupo.length) * 100) };
  };

  // Status summary
  const statusSummary = Object.entries(
    items.reduce((acc, i) => {
      const s = i.status || "Não Iniciado";
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {})
  );

  const total = items.length;
  const concluidas = items.filter(i => i.status === "Concluído").length;
  const emAndamento = items.filter(i => i.status === "Em Andamento").length;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#1A4731]">{total}</p>
          <p className="text-sm text-gray-500 mt-1">Total de Metas</p>
        </div>
        <div className="bg-white rounded-xl border border-green-200 p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-green-600">{concluidas}</p>
          <p className="text-sm text-gray-500 mt-1">Concluídas</p>
        </div>
        <div className="bg-white rounded-xl border border-[#1A4731]/20 p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#1A4731]">{emAndamento}</p>
          <p className="text-sm text-gray-500 mt-1">Em Andamento</p>
        </div>
        <div className="bg-white rounded-xl border border-[#E87722]/30 p-5 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#E87722]">{total ? Math.round((concluidas / total) * 100) : 0}%</p>
          <p className="text-sm text-gray-500 mt-1">Taxa de Conclusão</p>
        </div>
      </div>

      {/* Tabela Cruzada */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm">Resumo por Diretor × Tema</h3>
          <p className="text-xs text-gray-400 mt-0.5">Número de metas e % de conclusão por combinação</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 min-w-[160px]">Diretor</th>
                {temasComDados.map(t => (
                  <th key={t} className="px-3 py-3 text-center text-xs font-semibold text-gray-600 min-w-[100px]">{t}</th>
                ))}
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#1A4731]">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {diretoresComDados.map(diretor => {
                const totalDiretor = items.filter(i => i.diretor === diretor).length;
                const concDiretor = items.filter(i => i.diretor === diretor && i.status === "Concluído").length;
                return (
                  <tr key={diretor} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-sm text-gray-800">{diretor}</td>
                    {temasComDados.map(tema => {
                      const cell = getCell(diretor, tema);
                      if (!cell) return <td key={tema} className="px-3 py-3 text-center text-gray-200">—</td>;
                      return (
                        <td key={tema} className="px-3 py-3 text-center">
                          <div className="text-sm font-bold text-gray-800">{cell.total}</div>
                          <div className={`text-xs font-medium ${cell.pct === 100 ? "text-green-600" : cell.pct > 0 ? "text-[#1A4731]" : "text-gray-400"}`}>
                            {cell.pct}%
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1 mt-1">
                            <div className={`h-1 rounded-full ${cell.pct === 100 ? "bg-green-500" : "bg-[#1A4731]"}`} style={{ width: `${cell.pct}%` }} />
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-center bg-[#1A4731]/5">
                      <div className="text-sm font-bold text-[#1A4731]">{totalDiretor}</div>
                      <div className="text-xs font-medium text-[#E87722]">{totalDiretor ? Math.round((concDiretor / totalDiretor) * 100) : 0}%</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#1A4731]/5 border-t border-gray-200">
                <td className="px-4 py-3 font-bold text-sm text-[#1A4731]">Total</td>
                {temasComDados.map(tema => {
                  const g = items.filter(i => i.tema === tema);
                  const c = g.filter(i => i.status === "Concluído").length;
                  return (
                    <td key={tema} className="px-3 py-3 text-center">
                      <div className="text-sm font-bold text-[#1A4731]">{g.length}</div>
                      <div className="text-xs text-[#E87722] font-medium">{g.length ? Math.round((c / g.length) * 100) : 0}%</div>
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center font-bold text-[#1A4731]">
                  <div className="text-sm">{total}</div>
                  <div className="text-xs text-[#E87722]">{total ? Math.round((concluidas / total) * 100) : 0}%</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-bold text-gray-800 text-sm mb-4">Distribuição por Status</h3>
        <div className="space-y-3">
          {statusSummary.map(([status, count]) => {
            const sc = STATUS_CONFIG[status] || STATUS_CONFIG["Não Iniciado"];
            const pct = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className={`w-32 text-xs font-medium px-2 py-1 rounded-full border text-center ${sc.bg} ${sc.text} ${sc.border}`}>{sc.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${status === "Concluído" ? "bg-green-500" : status === "Em Andamento" ? "bg-[#1A4731]" : status === "Atrasado" ? "bg-red-400" : status === "Aguardando" ? "bg-yellow-400" : "bg-gray-300"}`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-12 text-right">{count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}