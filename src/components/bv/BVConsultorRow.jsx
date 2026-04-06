import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { cargaStatus, minutaAlert } from "./bvUtils";

function CargaBadge({ horas }) {
  const s = cargaStatus(horas);
  const map = {
    disponivel: { label: "Disponível", cls: "bg-green-100 text-green-800" },
    atencao: { label: "Atenção", cls: "bg-yellow-100 text-yellow-800" },
    sobrecarregado: { label: "Sobrecarregado", cls: "bg-red-100 text-red-800" },
  };
  const { label, cls } = map[s];
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>{label}</span>;
}

function MinutaBadge({ dataMinuta }) {
  const alert = minutaAlert(dataMinuta);
  if (alert === "ok") return <span className="text-gray-400 text-xs">OK</span>;
  if (alert === "sem_minuta") return <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded">Sem minuta</span>;
  return <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded">Atualizar</span>;
}

export default function BVConsultorRow({ consultor, index, comentarios, setComentario }) {
  const [expanded, setExpanded] = useState(false);
  const isZebra = index % 2 === 0;

  return (
    <>
      <tr
        className={`cursor-pointer hover:bg-blue-50 transition-colors ${isZebra ? "bg-white" : "bg-gray-50"}`}
        onClick={() => setExpanded(e => !e)}
      >
        <td className="px-4 py-2.5 text-sm font-medium text-gray-900 flex items-center gap-2">
          {expanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
          {consultor.nome}
        </td>
        <td className="px-4 py-2.5 text-sm text-gray-600">{consultor.cargo}</td>
        <td className="px-4 py-2.5 text-sm text-center">{consultor.projetos.length}</td>
        <td className="px-4 py-2.5 text-sm text-center font-mono">{consultor.horasBrutas.toFixed(1)}h</td>
        <td className="px-4 py-2.5 text-sm text-center font-mono">{consultor.horasAjustadas.toFixed(1)}h</td>
        <td className="px-4 py-2.5 text-sm text-center">
          {consultor.pendencias > 0
            ? <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded">{consultor.pendencias}</span>
            : <span className="text-gray-400 text-xs">—</span>}
        </td>
        <td className="px-4 py-2.5"><CargaBadge horas={consultor.horasAjustadas} /></td>
      </tr>

      {expanded && consultor.projetos.map((p, i) => (
        <tr key={p.os + i} className="bg-blue-50/40 border-l-4 border-blue-200">
          <td className="px-8 py-2 text-xs text-blue-700 font-mono">
            <a
              href={`https://apsis.sanflow.com.br/projects/details/${p.os}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
              onClick={e => e.stopPropagation()}
            >
              {p.os} <ExternalLink size={10} />
            </a>
          </td>
          <td className="px-4 py-2 text-xs text-gray-700" colSpan={1}>{p.cliente}</td>
          <td className="px-4 py-2 text-xs text-gray-600">{p.tipoServico}</td>
          <td className="px-4 py-2 text-xs">
            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{p.status}</span>
          </td>
          <td className="px-4 py-2 text-xs font-mono text-center">{p.horasAlocadas.toFixed(1)}h</td>
          <td className="px-4 py-2 text-xs font-mono text-center">{p.horasAjustadas.toFixed(1)}h</td>
          <td className="px-4 py-2 text-xs">
            <MinutaBadge dataMinuta={p.dataMinuta} />
            {p.dataMinuta && minutaAlert(p.dataMinuta) === "ok" && (
              <span className="text-gray-400 ml-1">{p.dataMinuta.toLocaleDateString("pt-BR")}</span>
            )}
          </td>
          <td className="px-4 py-2" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              placeholder="Comentário..."
              value={comentarios[p.os] || ""}
              onChange={e => setComentario(p.os, e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-xs w-full min-w-[120px] bg-white"
            />
          </td>
        </tr>
      ))}
    </>
  );
}