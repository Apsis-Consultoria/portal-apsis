import { CARGO_ORDER } from "./bvUtils";

export default function BVFiltros({ filtros, setFiltros, allStatuses, excluirTerceiro, setExcluirTerceiro }) {
  return (
    <div className="flex flex-wrap gap-3 mb-4 items-end">
      <div>
        <label className="text-xs text-gray-500 block mb-1">Buscar consultor</label>
        <input
          type="text"
          placeholder="Nome..."
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48"
          value={filtros.nome}
          onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Cargo</label>
        <select
          multiple
          className="border border-gray-300 rounded px-2 py-1 text-sm h-9 min-w-[160px]"
          value={filtros.cargos}
          onChange={e => {
            const vals = Array.from(e.target.selectedOptions).map(o => o.value);
            setFiltros(f => ({ ...f, cargos: vals }));
          }}
        >
          {CARGO_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Status SAN</label>
        <select
          multiple
          className="border border-gray-300 rounded px-2 py-1 text-sm h-9 min-w-[160px]"
          value={filtros.statuses}
          onChange={e => {
            const vals = Array.from(e.target.selectedOptions).map(o => o.value);
            setFiltros(f => ({ ...f, statuses: vals }));
          }}
        >
          {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filtros.soPendencias}
          onChange={e => setFiltros(f => ({ ...f, soPendencias: e.target.checked }))}
          className="accent-amber-500"
        />
        Somente com pendência de minuta
      </label>

      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={excluirTerceiro}
          onChange={e => setExcluirTerceiro(e.target.checked)}
          className="accent-gray-500"
        />
        Excluir Terceiros
      </label>
    </div>
  );
}