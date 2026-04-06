import { useMemo } from "react";

const STATUS_ORDER = ["Iniciação", "Execução", "Revisão", "Aprovação", "Colado", "Minuta", "Concluído"];

function StatusBadge({ status }) {
  const cores = {
    "Iniciação": "bg-blue-100 text-blue-700",
    "Execução": "bg-yellow-100 text-yellow-700",
    "Revisão": "bg-purple-100 text-purple-700",
    "Aprovação": "bg-orange-100 text-orange-700",
    "Colado": "bg-teal-100 text-teal-700",
    "Minuta": "bg-green-100 text-green-700",
    "Concluído": "bg-gray-100 text-gray-600",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cores[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>;
}

export default function BVVisaoGeral({ consultores }) {
  // Agrega todos os projetos de todos os consultores (deduplicado por OS)
  const projetos = useMemo(() => {
    const map = {};
    consultores.forEach(c => {
      c.projetos.forEach(p => {
        if (!map[p.os]) {
          map[p.os] = {
            ...p,
            consultores: [{ nome: c.nome, cargo: c.cargo }],
          };
        } else {
          if (!map[p.os].consultores.find(x => x.nome === c.nome)) {
            map[p.os].consultores.push({ nome: c.nome, cargo: c.cargo });
          }
          map[p.os].horasAlocadas += p.horasAlocadas;
          map[p.os].horasAjustadas += p.horasAjustadas;
        }
      });
    });
    return Object.values(map).sort((a, b) => {
      const ia = STATUS_ORDER.indexOf(a.status);
      const ib = STATUS_ORDER.indexOf(b.status);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [consultores]);

  // Totais por status
  const porStatus = useMemo(() => {
    const acc = {};
    projetos.forEach(p => {
      if (!acc[p.status]) acc[p.status] = { qtd: 0, horas: 0, ajustado: 0 };
      acc[p.status].qtd++;
      acc[p.status].horas += p.horasAlocadas;
      acc[p.status].ajustado += p.horasAjustadas;
    });
    return acc;
  }, [projetos]);

  const totalHoras = projetos.reduce((s, p) => s + p.horasAlocadas, 0);
  const totalAjustado = projetos.reduce((s, p) => s + p.horasAjustadas, 0);
  const totalPendencias = projetos.filter(p => p.checkData === "ATUALIZAR").length;

  if (consultores.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
        <p className="text-sm font-medium">Nenhum dado carregado</p>
        <p className="text-xs mt-1">Importe a planilha SAN para visualizar a Visão Geral</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumo por status */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {STATUS_ORDER.filter(s => porStatus[s]).map(status => (
          <div key={status} className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
            <StatusBadge status={status} />
            <p className="text-2xl font-bold text-gray-800 mt-2">{porStatus[status].qtd}</p>
            <p className="text-xs text-gray-500">projetos</p>
            <p className="text-sm font-semibold text-[#1A4731] mt-1">{porStatus[status].horas}h</p>
          </div>
        ))}
      </div>

      {/* Totais gerais */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#1A4731] rounded-xl p-4 text-center text-white">
          <p className="text-3xl font-bold">{projetos.length}</p>
          <p className="text-sm text-white/70 mt-1">Total de Projetos</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-gray-800">{totalHoras}</p>
          <p className="text-sm text-gray-500 mt-1">Horas Brutas</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
          <p className="text-3xl font-bold text-[#1A4731]">{totalAjustado}</p>
          <p className="text-sm text-gray-500 mt-1">Horas Ajustadas</p>
        </div>
      </div>

      {/* Tabela geral */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr style={{ background: "#1A4731" }}>
              <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide">Ordem de Serviço</th>
              <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide">Cliente</th>
              <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide">Tipo de Serviço</th>
              <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide">Status</th>
              <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide text-center">H. Brutas</th>
              <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide text-center">H. Ajustadas</th>
              <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide">Data Minuta</th>
              <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide">Check</th>
              <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide">Consultores</th>
            </tr>
          </thead>
          <tbody>
            {projetos.map((p, i) => (
              <tr key={p.os} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/30`}>
                <td className="px-3 py-2.5 font-mono text-gray-600 text-xs">{p.os}</td>
                <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[180px] truncate" title={p.cliente}>{p.cliente}</td>
                <td className="px-3 py-2.5 text-gray-500 max-w-[160px] truncate" title={p.tipoServico}>{p.tipoServico}</td>
                <td className="px-3 py-2.5"><StatusBadge status={p.status} /></td>
                <td className="px-3 py-2.5 text-center font-semibold text-gray-700">{p.horasAlocadas}</td>
                <td className="px-3 py-2.5 text-center font-semibold text-[#1A4731]">{p.horasAjustadas}</td>
                <td className="px-3 py-2.5 text-gray-500">{p.dataMinuta || "—"}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.checkData === "ATUALIZAR" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                    {p.checkData}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {p.consultores.map(c => (
                      <span key={c.nome} className="bg-[#1A4731]/10 text-[#1A4731] text-xs px-1.5 py-0.5 rounded font-medium whitespace-nowrap">
                        {c.nome.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}