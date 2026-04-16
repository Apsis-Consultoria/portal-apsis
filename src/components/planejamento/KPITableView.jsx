import { useState, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERSPECTIVAS, calcKpiStatus, KPI_STATUS_CONFIG, isSubItem } from "./peUtils";

function InlineInput({ value, onChange, type = "text", className = "" }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value ?? "");
  const timer = useRef(null);

  const commit = () => {
    clearTimeout(timer.current);
    if (local !== (value ?? "")) onChange(local);
    setEditing(false);
  };

  const handleChange = (v) => {
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { onChange(v); }, 2000);
  };

  if (!editing) return (
    <span
      onClick={() => { setLocal(value ?? ""); setEditing(true); }}
      className={`block w-full cursor-pointer hover:bg-[#134635]/5 rounded-md px-1.5 py-1 min-h-[1.5rem] text-sm transition-colors ${!value ? "text-gray-300 italic" : "text-gray-700"} ${className}`}
    >
      {value || "—"}
    </span>
  );

  return (
    <input
      autoFocus
      type={type}
      value={local}
      onChange={e => handleChange(e.target.value)}
      onBlur={commit}
      onKeyDown={e => e.key === "Enter" && commit()}
      className={`w-full text-sm border border-[#134635]/40 rounded-md px-2 py-1 outline-none ring-1 ring-[#134635]/30 bg-white ${className}`}
    />
  );
}

function InlineSelect({ value, onChange, options }) {
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-7 text-xs border-0 bg-transparent hover:bg-[#134635]/5 focus:ring-1 focus:ring-[#134635]/30 px-1">
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        {options.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export default function KPITableView({ kpis, onUpdate, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-[#F5F6F8]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">Nº</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[180px]">Nome do KPI</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Perspectiva</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Objetivo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Responsável</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Fonte</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Unidade</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Period.</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">Meta</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">T1</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">T2</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">T3</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-16">T4</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Status</th>
              <th className="px-4 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {kpis.length === 0 && (
              <tr><td colSpan={15} className="text-center py-14 text-gray-400 text-sm">Nenhum KPI encontrado</td></tr>
            )}
            {kpis.map((kpi) => {
              const sub = isSubItem(kpi.numero);
              const status = calcKpiStatus(kpi);
              const sc = KPI_STATUS_CONFIG[status];
              return (
                <tr key={kpi.id} className={`group hover:bg-[#134635]/3 transition-colors ${sub ? "bg-gray-50/60" : ""}`}>
                  <td className={`px-4 py-3 font-mono text-xs font-bold text-gray-400 ${sub ? "pl-8" : ""}`}>
                    <InlineInput value={kpi.numero} onChange={v => onUpdate(kpi.id, "numero", v)} className="w-12" />
                  </td>
                  <td className={`px-4 py-3 ${sub ? "pl-8" : ""}`}>
                    <InlineInput value={kpi.nome} onChange={v => onUpdate(kpi.id, "nome", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <InlineSelect value={kpi.perspectiva} onChange={v => onUpdate(kpi.id, "perspectiva", v)} options={PERSPECTIVAS} />
                  </td>
                  <td className="px-4 py-3">
                    <InlineInput value={kpi.objetivo_estrategico} onChange={v => onUpdate(kpi.id, "objetivo_estrategico", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <InlineInput value={kpi.responsavel} onChange={v => onUpdate(kpi.id, "responsavel", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <InlineInput value={kpi.fonte_dados} onChange={v => onUpdate(kpi.id, "fonte_dados", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <InlineSelect value={kpi.unidade} onChange={v => onUpdate(kpi.id, "unidade", v)} options={["%","R$","Quantidade"]} />
                  </td>
                  <td className="px-4 py-3">
                    <InlineSelect value={kpi.periodicidade} onChange={v => onUpdate(kpi.id, "periodicidade", v)} options={["Mensal","Trimestral","Semestral","Anual"]} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <InlineInput value={kpi.meta_anual} onChange={v => onUpdate(kpi.id, "meta_anual", Number(v))} type="number" className="text-center" />
                  </td>
                  {["resultado_t1","resultado_t2","resultado_t3","resultado_t4"].map(f => (
                    <td key={f} className="px-4 py-3 text-center">
                      <InlineInput value={kpi[f]} onChange={v => onUpdate(kpi.id, f, v === "" ? null : Number(v))} type="number" className="text-center" />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.text}`}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => onDelete(kpi.id)} className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#134635]/40 inline-block" />
        {kpis.length} KPI(s) · Clique para editar · Autosave em 2s
      </div>
    </div>
  );
}