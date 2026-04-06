import { useState, useRef, useEffect } from "react";
import { CARGO_ORDER } from "./bvUtils";
import { ChevronDown, X, Search } from "lucide-react";

function MultiSelect({ label, options, selected, onChange, placeholder = "Todos" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (val) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };

  const displayText = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? selected[0]
      : `${selected.length} selecionados`;

  return (
    <div className="relative" ref={ref}>
      <label className="text-xs font-medium text-gray-500 block mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-sm min-w-[180px] bg-white transition-all ${
          open ? "border-[#1A4731] ring-2 ring-[#1A4731]/15" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className={selected.length > 0 ? "text-gray-800 font-medium" : "text-gray-400"}>
          {displayText}
        </span>
        <div className="flex items-center gap-1">
          {selected.length > 0 && (
            <span
              onClick={(e) => { e.stopPropagation(); onChange([]); }}
              className="w-4 h-4 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center cursor-pointer"
            >
              <X size={9} className="text-gray-500 hover:text-red-500" />
            </span>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[180px] max-h-52 overflow-y-auto">
          {options.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 hover:bg-gray-50 transition-colors ${
                selected.includes(opt) ? "text-[#1A4731] font-medium" : "text-gray-700"
              }`}
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${
                selected.includes(opt) ? "bg-[#1A4731] border-[#1A4731]" : "border-gray-300"
              }`}>
                {selected.includes(opt) && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BVFiltros({ filtros, setFiltros, allStatuses, allCargos, excluirTerceiro, setExcluirTerceiro }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 mb-4 flex flex-wrap gap-4 items-end shadow-sm">
      {/* Busca */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">Buscar consultor</label>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Nome..."
            className="pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm w-48 bg-white focus:outline-none focus:ring-2 focus:ring-[#1A4731]/15 focus:border-[#1A4731] transition-all hover:border-gray-300"
            value={filtros.nome}
            onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
          />
        </div>
      </div>

      <MultiSelect
        label="Cargo"
        options={allCargos}
        selected={filtros.cargos}
        onChange={vals => setFiltros(f => ({ ...f, cargos: vals }))}
        placeholder="Todos os cargos"
      />

      <MultiSelect
        label="Status SAN"
        options={allStatuses}
        selected={filtros.statuses}
        onChange={vals => setFiltros(f => ({ ...f, statuses: vals }))}
        placeholder="Todos os status"
      />

      {/* Toggles */}
      <div className="flex flex-col gap-2 pb-0.5">
        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none group">
          <div
            onClick={() => setFiltros(f => ({ ...f, soPendencias: !f.soPendencias }))}
            className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
              filtros.soPendencias ? "bg-amber-500" : "bg-gray-200"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${filtros.soPendencias ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-gray-600 text-xs font-medium">Somente com pendência</span>
        </label>

        <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none group">
          <div
            onClick={() => setExcluirTerceiro(!excluirTerceiro)}
            className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 cursor-pointer ${
              excluirTerceiro ? "bg-[#1A4731]" : "bg-gray-200"
            }`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${excluirTerceiro ? "translate-x-4" : "translate-x-0"}`} />
          </div>
          <span className="text-gray-600 text-xs font-medium">Excluir Terceiros</span>
        </label>
      </div>
    </div>
  );
}