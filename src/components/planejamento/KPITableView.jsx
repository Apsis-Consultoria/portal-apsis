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
      className={`block w-full cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 min-h-[1.5rem] text-sm ${!value ? "text-gray-300 italic" : "text-gray-800"} ${className}`}
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
      className={`w-full text-sm border border-blue-300 rounded px-1.5 py-0.5 outline-none ring-1 ring-blue-400 bg-white ${className}`}
    />
  );
}

function InlineSelect({ value, onChange, options }) {
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-7 text-xs border-0 bg-transparent hover:bg-blue-50 focus:ring-1 focus:ring-blue-300 px-1">
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
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#003366] text-white text-xs font-semibold">
              <th className="px-3 py-3 text-left w-8">Nº</th>
              <th className="px-3 py-3 text-left min-w-[180px]">Nome do KPI</th>
              <th className="px-3 py-3 text-left w-36">Perspectiva</th>
              <th className="px-3 py-3 text-left min-w-[120px]">Objetivo Estratégico</th>
              <th className="px-3 py-3 text-left w-28">Responsável</th>
              <th className="px-3 py-3 text-left w-24">Fonte</th>
              <th className="px-3 py-3 text-center w-20">Unidade</th>
              <th className="px-3 py-3 text-center w-24">Periodicidade</th>
              <th className="px-3 py-3 text-center w-20">Meta</th>
              <th className="px-3 py-3 text-center w-16">T1</th>
              <th className="px-3 py-3 text-center w-16">T2</th>
              <th className="px-3 py-3 text-center w-16">T3</th>
              <th className="px-3 py-3 text-center w-16">T4</th>
              <th className="px-3 py-3 text-center w-28">Status</th>
              <th className="px-3 py-3 text-center w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {kpis.length === 0 && (
              <tr><td colSpan={15} className="text-center py-10 text-gray-400">Nenhum KPI encontrado</td></tr>
            )}
            {kpis.map((kpi, idx) => {
              const sub = isSubItem(kpi.numero);
              const status = calcKpiStatus(kpi);
              const sc = KPI_STATUS_CONFIG[status];
              return (
                <tr key={kpi.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/50"}`}>
                  <td className={`px-3 py-2 font-mono text-xs font-bold text-gray-600 ${sub ? "pl-6" : ""}`}>
                    <InlineInput value={kpi.numero} onChange={v => onUpdate(kpi.id, "numero", v)} className="w-12" />
                  </td>
                  <td className={`px-3 py-2 ${sub ? "pl-6" : ""}`}>
                    <InlineInput value={kpi.nome} onChange={v => onUpdate(kpi.id, "nome", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <InlineSelect value={kpi.perspectiva} onChange={v => onUpdate(kpi.id, "perspectiva", v)} options={PERSPECTIVAS} />
                  </td>
                  <td className="px-3 py-2">
                    <InlineInput value={kpi.objetivo_estrategico} onChange={v => onUpdate(kpi.id, "objetivo_estrategico", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <InlineInput value={kpi.responsavel} onChange={v => onUpdate(kpi.id, "responsavel", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <InlineInput value={kpi.fonte_dados} onChange={v => onUpdate(kpi.id, "fonte_dados", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <InlineSelect value={kpi.unidade} onChange={v => onUpdate(kpi.id, "unidade", v)} options={["%","R$","Quantidade"]} />
                  </td>
                  <td className="px-3 py-2">
                    <InlineSelect value={kpi.periodicidade} onChange={v => onUpdate(kpi.id, "periodicidade", v)} options={["Mensal","Trimestral","Semestral","Anual"]} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <InlineInput value={kpi.meta_anual} onChange={v => onUpdate(kpi.id, "meta_anual", Number(v))} type="number" className="text-center" />
                  </td>
                  {["resultado_t1","resultado_t2","resultado_t3","resultado_t4"].map(f => (
                    <td key={f} className="px-3 py-2 text-center">
                      <InlineInput value={kpi[f]} onChange={v => onUpdate(kpi.id, f, v === "" ? null : Number(v))} type="number" className="text-center" />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${sc.bg} ${sc.text} ${sc.border}`}>
                      {sc.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => onDelete(kpi.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
        {kpis.length} KPI(s) · Clique em qualquer campo para editar · Autosave após 2s
      </div>
    </div>
  );
}