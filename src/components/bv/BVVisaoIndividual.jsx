import { useState, useCallback } from "react";
import { Maximize2, X } from "lucide-react";

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

function CheckBox({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all mx-auto ${
        checked ? "bg-[#1A4731] border-[#1A4731]" : "border-gray-300 bg-white hover:border-[#1A4731]/50"
      }`}
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

const FASE_KEYS = ["docRecebida", "modelagem", "revisao", "coladoValor", "minuta"];
const FASE_PESOS = [0, 0.20, 0.40, 0.60, 0.80, 0.90];

function calcConsumo(fases) {
  const checked = FASE_KEYS.filter(k => fases[k]).length;
  return FASE_PESOS[checked] ?? 0;
}

function ConsultorTable({ consultor, fasesOverride, toggleFase, comentarios, setComentario }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-500 uppercase tracking-wide text-[10px]">
            <th className="px-3 py-2 font-semibold">Link</th>
            <th className="px-3 py-2 font-semibold">Nome Projeto</th>
            <th className="px-3 py-2 font-semibold">Status SAN</th>
            <th className="px-3 py-2 font-semibold text-center">H. Alocadas</th>
            <th className="px-3 py-2 font-semibold">Data Minuta</th>
            <th className="px-3 py-2 font-semibold">Check Data</th>
            <th className="px-3 py-2 font-semibold text-center">%</th>
            <th className="px-3 py-2 font-semibold text-center">Horas</th>
            <th className="px-2 py-2 font-semibold text-center text-[9px] leading-tight w-14">Doc Rec.<br/>1ª Lista</th>
            <th className="px-2 py-2 font-semibold text-center text-[9px] leading-tight w-16">Modelagem<br/>Elaboração</th>
            <th className="px-2 py-2 font-semibold text-center text-[9px] leading-tight w-16">Fase Revisão<br/>Discussões</th>
            <th className="px-2 py-2 font-semibold text-center text-[9px] leading-tight w-14">Colado<br/>Valores</th>
            <th className="px-2 py-2 font-semibold text-center text-[9px] leading-tight w-14">Envio<br/>Minuta</th>
            <th className="px-3 py-2 font-semibold">Comentários</th>
          </tr>
        </thead>
        <tbody>
          {consultor.projetos.map((p, i) => {
            const fases = fasesOverride[p.os] || p.fases;
            const consumo = calcConsumo(fases);
            const horasAjustadas = Math.round(p.horasAlocadas * (1 - consumo));
            return (
              <tr key={p.os + i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50/30`}>
                <td className="px-3 py-2.5">
                  <a href="#" className="text-[#1A4731] underline font-medium hover:text-[#F47920]">Link</a>
                </td>
                <td className="px-3 py-2.5 font-medium text-gray-800 max-w-[180px] truncate" title={p.cliente}>{p.cliente}</td>
                <td className="px-3 py-2.5"><StatusBadge status={p.status} /></td>
                <td className="px-3 py-2.5 text-center font-semibold text-gray-800">{p.horasAlocadas}</td>
                <td className="px-3 py-2.5 text-gray-500">{p.dataMinuta || "—"}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.checkData === "ATUALIZAR" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                    {p.checkData}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center font-semibold text-[#1A4731]">{Math.round((1 - consumo) * 100)}%</td>
                <td className="px-3 py-2.5 text-center font-semibold text-gray-800">{horasAjustadas}</td>
                {FASE_KEYS.map(fase => (
                  <td key={fase} className="px-2 py-2.5 text-center">
                    <CheckBox
                      checked={fases[fase]}
                      onChange={() => toggleFase(p.os, fase, fases)}
                    />
                  </td>
                ))}
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ConsultorCard({ consultor, fasesOverride, toggleFase, comentarios, setComentario }) {
  const [open, setOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  // Recalcula totais com fases editadas
  const totalAjustado = consultor.projetos.reduce((s, p) => {
    const fases = fasesOverride[p.os] || p.fases;
    return s + Math.round(p.horasAlocadas * (1 - calcConsumo(fases)));
  }, 0);

  const header = (
    <div
      className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none flex-wrap"
      style={{ background: "#1A4731" }}
      onClick={() => setOpen(!open)}
    >
      <span className="text-white font-bold text-sm">{consultor.nome}</span>
      <span className="text-white/60 text-xs">{consultor.cargo}</span>
      <span className="text-white/30 text-xs">|</span>
      <span className="text-white/80 text-xs">Horas Totais: <strong className="text-white">{consultor.totalHoras}</strong></span>
      <span className="text-white/30 text-xs">|</span>
      <span className="text-white/80 text-xs">Ajustado: <strong className="text-white">{totalAjustado}</strong></span>
      {consultor.pendencias > 0 && (
        <>
          <span className="text-white/30 text-xs">|</span>
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Pendências: {consultor.pendencias}</span>
        </>
      )}
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setFullscreen(true); }}
          className="text-white/60 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
          title="Expandir tela cheia"
        >
          <Maximize2 size={14} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-5 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
        {header}
        {open && (
          <ConsultorTable
            consultor={consultor}
            fasesOverride={fasesOverride}
            toggleFase={toggleFase}
            comentarios={comentarios}
            setComentario={setComentario}
          />
        )}
      </div>

      {/* Modal tela cheia */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white" onClick={() => setFullscreen(false)}>
          <div
            className="flex items-center gap-3 px-5 py-4 flex-wrap flex-shrink-0"
            style={{ background: "#1A4731" }}
            onClick={e => e.stopPropagation()}
          >
            <span className="text-white font-bold">{consultor.nome}</span>
            <span className="text-white/60 text-sm">{consultor.cargo}</span>
            <span className="text-white/30 text-xs">|</span>
            <span className="text-white/80 text-sm">Horas Totais: <strong className="text-white">{consultor.totalHoras}</strong></span>
            <span className="text-white/30 text-xs">|</span>
            <span className="text-white/80 text-sm">Ajustado: <strong className="text-white">{totalAjustado}</strong></span>
            {consultor.pendencias > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Pendências: {consultor.pendencias}</span>
            )}
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="ml-auto text-white/70 hover:text-white p-1.5 rounded hover:bg-white/10 transition-colors"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4" onClick={e => e.stopPropagation()}>
            <ConsultorTable
              consultor={consultor}
              fasesOverride={fasesOverride}
              toggleFase={toggleFase}
              comentarios={comentarios}
              setComentario={setComentario}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default function BVVisaoIndividual({ consultores, comentarios, setComentario }) {
  // fasesOverride: { [os]: { docRecebida, modelagem, revisao, coladoValor, minuta } }
  const [fasesOverride, setFasesOverride] = useState({});

  const toggleFase = useCallback((os, fase, currentFases) => {
    setFasesOverride(prev => ({
      ...prev,
      [os]: { ...currentFases, [fase]: !currentFases[fase] },
    }));
  }, []);

  if (consultores.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center text-gray-400">
        <span className="text-3xl block mb-2">📋</span>
        <p className="text-sm font-medium">Nenhum dado carregado</p>
        <p className="text-xs mt-1">Importe a planilha SAN (.xlsx) para popular a tabela</p>
      </div>
    );
  }

  return (
    <div>
      {consultores.map((c, i) => (
        <ConsultorCard
          key={c.nome + i}
          consultor={c}
          fasesOverride={fasesOverride}
          toggleFase={toggleFase}
          comentarios={comentarios}
          setComentario={setComentario}
        />
      ))}
      <p className="text-xs text-gray-400 px-1 pb-4">
        * % calculado com base nas fases marcadas (cada fase = 20%). Clique nos checkboxes para alterar.
      </p>
    </div>
  );
}