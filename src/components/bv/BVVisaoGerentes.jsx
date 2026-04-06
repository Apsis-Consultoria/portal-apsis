import { useState } from "react";

function CheckBox({ checked }) {
  return (
    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${checked ? "bg-[#1A4731] border-[#1A4731]" : "border-gray-300"}`}>
      {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </div>
  );
}

function CheckDataBadge({ val }) {
  if (!val || val === "ATUALIZAR") return <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">ATUALIZAR</span>;
  return <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">OK</span>;
}

function ConsultorGerentes({ consultor, comentarios, setComentario }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-6">
      {/* Header do consultor */}
      <div
        className="flex items-center gap-4 px-4 py-3 rounded-t-xl cursor-pointer select-none"
        style={{ background: "#1A4731" }}
        onClick={() => setOpen(!open)}
      >
        <span className="text-white font-bold text-sm">{consultor.nome}</span>
        <span className="text-white/60 text-xs">{consultor.cargo}</span>
        <span className="text-white/60 text-xs">|</span>
        <span className="text-white/80 text-xs">Horas Totais: <strong className="text-white">{consultor.totalHoras}</strong></span>
        <span className="text-white/60 text-xs">|</span>
        <span className="text-white/80 text-xs">Ajustado: <strong className="text-white">{consultor.totalAjustado}</strong></span>
        {consultor.pendencias > 0 && (
          <>
            <span className="text-white/60 text-xs">|</span>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Pendências: {consultor.pendencias}</span>
          </>
        )}
      </div>

      {open && (
        <div className="border border-gray-200 rounded-b-xl overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase tracking-wide">
                <th className="px-3 py-2 font-semibold">Link</th>
                <th className="px-3 py-2 font-semibold">Nome Projeto</th>
                <th className="px-3 py-2 font-semibold">Status SAN</th>
                <th className="px-3 py-2 font-semibold text-center">H. Alocadas</th>
                <th className="px-3 py-2 font-semibold">Data Minuta</th>
                <th className="px-3 py-2 font-semibold">Check Data</th>
                <th className="px-3 py-2 font-semibold text-center">%</th>
                <th className="px-3 py-2 font-semibold text-center">Horas</th>
                {/* Checkboxes de fase */}
                <th className="px-2 py-2 font-semibold text-center text-[10px]">Doc Rec.<br/>1ª Lista</th>
                <th className="px-2 py-2 font-semibold text-center text-[10px]">Modelagem<br/>elaboração</th>
                <th className="px-2 py-2 font-semibold text-center text-[10px]">Fase Revisão<br/>Discussões</th>
                <th className="px-2 py-2 font-semibold text-center text-[10px]">Colado<br/>Valores</th>
                <th className="px-2 py-2 font-semibold text-center text-[10px]">Envio<br/>Minuta</th>
                <th className="px-3 py-2 font-semibold">Comentários</th>
              </tr>
            </thead>
            <tbody>
              {consultor.projetos.map((p, i) => (
                <tr key={p.os + i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/30`}>
                  <td className="px-3 py-2.5">
                    <a href="#" className="text-[#1A4731] underline font-medium hover:text-[#F47920]">Link</a>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[180px] truncate" title={p.cliente}>{p.cliente}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.status === "Iniciação" ? "bg-blue-100 text-blue-700" :
                      p.status === "Execução" ? "bg-yellow-100 text-yellow-700" :
                      p.status === "Revisão" ? "bg-purple-100 text-purple-700" :
                      p.status === "Aprovação" ? "bg-orange-100 text-orange-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-800">{p.horasAlocadas}</td>
                  <td className="px-3 py-2.5 text-gray-600">{p.dataMinuta || "—"}</td>
                  <td className="px-3 py-2.5"><CheckDataBadge val={p.checkData} /></td>
                  <td className="px-3 py-2.5 text-center font-semibold text-[#1A4731]">{Math.round(p.consumo * 100)}%</td>
                  <td className="px-3 py-2.5 text-center font-semibold text-gray-800">{p.horasAjustadas}</td>
                  <td className="px-2 py-2.5 text-center"><CheckBox checked={p.fases.docRecebida} /></td>
                  <td className="px-2 py-2.5 text-center"><CheckBox checked={p.fases.modelagem} /></td>
                  <td className="px-2 py-2.5 text-center"><CheckBox checked={p.fases.revisao} /></td>
                  <td className="px-2 py-2.5 text-center"><CheckBox checked={p.fases.coladoValor} /></td>
                  <td className="px-2 py-2.5 text-center"><CheckBox checked={p.fases.minuta} /></td>
                  <td className="px-3 py-2.5">
                    <input
                      type="text"
                      value={comentarios[p.os] || ""}
                      onChange={e => setComentario(p.os, e.target.value)}
                      placeholder="Comentário..."
                      className="border border-gray-200 rounded px-2 py-1 text-xs w-36 focus:outline-none focus:border-[#1A4731]"
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function BVVisaoGerentes({ consultores, comentarios, setComentario }) {
  if (consultores.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
        <p className="text-sm font-medium">Nenhum dado carregado</p>
        <p className="text-xs mt-1">Importe a planilha SAN para visualizar a Reunião de Gerentes</p>
      </div>
    );
  }

  return (
    <div>
      {consultores.map((c, i) => (
        <ConsultorGerentes
          key={c.nome + i}
          consultor={c}
          comentarios={comentarios}
          setComentario={setComentario}
        />
      ))}
    </div>
  );
}