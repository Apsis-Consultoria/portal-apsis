import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

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
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cores[status] || "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

function CheckIcon({ checked }) {
  return checked
    ? <span className="text-green-600 text-base">✔</span>
    : <span className="text-gray-300 text-base">☐</span>;
}

function ConsultorRow({ consultor, comentarios, setComentario }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Linha do consultor */}
      <tr
        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[#1A4731]">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </div>
        </td>
        <td className="px-3 py-2.5 font-semibold text-sm text-gray-800">{consultor.nome}</td>
        <td className="px-3 py-2.5 text-xs text-gray-500">{consultor.cargo}</td>
        <td className="px-3 py-2.5 text-xs text-gray-500">{consultor.area}</td>
        <td className="px-3 py-2.5 text-center text-sm font-medium text-gray-800">{consultor.projetos.length}</td>
        <td className="px-3 py-2.5 text-center text-sm font-semibold text-gray-900">{consultor.totalHoras}</td>
        <td className="px-3 py-2.5 text-center text-sm font-semibold text-[#1A4731]">{consultor.totalAjustado}</td>
        <td className="px-3 py-2.5 text-center">
          {consultor.pendencias > 0 ? (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{consultor.pendencias}</span>
          ) : (
            <span className="text-green-600 text-xs font-medium">—</span>
          )}
        </td>
      </tr>

      {/* Linhas dos projetos */}
      {open && consultor.projetos.map((p, i) => (
        <tr key={p.os + i} className="bg-gray-50/70 border-b border-gray-100 text-xs">
          <td className="px-3 py-2 pl-6">
            <a href={`#`} className="text-[#1A4731] underline font-medium hover:text-[#F47920]">Link</a>
          </td>
          <td className="px-3 py-2 text-gray-700 font-medium max-w-[200px] truncate" title={p.cliente}>
            {p.cliente}
          </td>
          <td className="px-3 py-2 text-gray-500 max-w-[160px] truncate" title={p.tipoServico}>
            {p.tipoServico}
          </td>
          <td className="px-3 py-2 text-gray-400">{p.os}</td>
          <td className="px-3 py-2 text-center"><StatusBadge status={p.status} /></td>
          <td className="px-3 py-2 text-center font-medium text-gray-700">{p.horasAlocadas}</td>
          <td className="px-3 py-2 text-center font-semibold text-[#1A4731]">{p.horasAjustadas}</td>
          <td className="px-3 py-2 text-center">
            <span className={`font-semibold px-2 py-0.5 rounded text-xs ${p.checkData === "ATUALIZAR" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
              {p.checkData}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function BVVisaoIndividual({ consultores, comentarios, setComentario }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr style={{ background: "#1A4731" }}>
            <th className="px-3 py-3 w-8" />
            <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide">Consultor</th>
            <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide">Cargo</th>
            <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide">Área</th>
            <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide text-center">Projetos</th>
            <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide text-center">H. Brutas</th>
            <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide text-center">H. Ajustadas</th>
            <th className="px-3 py-3 text-xs font-semibold text-white uppercase tracking-wide text-center">Pendências</th>
          </tr>
        </thead>
        <tbody>
          {consultores.length === 0 ? (
            <tr>
              <td colSpan={8} className="text-center py-16 text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">📋</span>
                  <p className="text-sm font-medium">Nenhum dado carregado</p>
                  <p className="text-xs">Importe a planilha SAN (.xlsx) para popular a tabela</p>
                </div>
              </td>
            </tr>
          ) : (
            consultores.map((c, i) => (
              <ConsultorRow
                key={c.nome + i}
                consultor={c}
                comentarios={comentarios}
                setComentario={setComentario}
              />
            ))
          )}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 px-4 py-3">
        * H. Ajustadas calculadas com base no % de consumo por status do projeto (Iniciação 40%, Execução 40%, Revisão 60%, Aprovação 20%, Colado 80%, Minuta 90%).
      </p>
    </div>
  );
}