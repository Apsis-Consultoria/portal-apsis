import { useState, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERSPECTIVAS, STATUS_INICIATIVA, STATUS_CONFIG, isSubItem } from "./peUtils";

function InlineInput({ value, onChange, type = "text", className = "", multiline = false }) {
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
    timer.current = setTimeout(() => onChange(v), 2000);
  };

  if (!editing) return (
    <span onClick={() => { setLocal(value ?? ""); setEditing(true); }}
      className={`block w-full cursor-pointer hover:bg-blue-50 rounded px-1 py-0.5 min-h-[1.5rem] text-sm ${!value ? "text-gray-300 italic" : "text-gray-800"} ${className}`}>
      {value || "—"}
    </span>
  );

  if (multiline) return (
    <textarea autoFocus value={local} onChange={e => handleChange(e.target.value)} onBlur={commit}
      rows={2} className={`w-full text-sm border border-blue-300 rounded px-1.5 py-0.5 outline-none ring-1 ring-blue-400 bg-white resize-none ${className}`} />
  );

  return (
    <input autoFocus type={type} value={local} onChange={e => handleChange(e.target.value)}
      onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()}
      className={`w-full text-sm border border-blue-300 rounded px-1.5 py-0.5 outline-none ring-1 ring-blue-400 bg-white ${className}`} />
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

function StatusChip({ status }) {
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG["Não Iniciado"];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sc.bg} ${sc.text} ${sc.border}`}>
      {sc.label}
    </span>
  );
}

export default function IniciativasTableView({ items, onUpdate, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#003366] text-white text-xs font-semibold">
              <th className="px-3 py-3 text-left w-12">Nº</th>
              <th className="px-3 py-3 text-left min-w-[220px]">Iniciativa / Ação</th>
              <th className="px-3 py-3 text-left w-36">Perspectiva</th>
              <th className="px-3 py-3 text-left w-32">Objetivo</th>
              <th className="px-3 py-3 text-left w-32">Responsável</th>
              <th className="px-3 py-3 text-left w-28">Envolvidos</th>
              <th className="px-3 py-3 text-center w-24">Deadline</th>
              <th className="px-3 py-3 text-center w-24">Custo Est.</th>
              <th className="px-3 py-3 text-center w-32">Status</th>
              <th className="px-3 py-3 text-left w-36">Observações</th>
              <th className="px-3 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={11} className="text-center py-10 text-gray-400">Nenhuma iniciativa encontrada</td></tr>
            )}
            {items.map((item, idx) => {
              const sub = isSubItem(item.numero);
              const hoje = new Date();
              const atrasada = item.deadline && new Date(item.deadline) < hoje && item.status !== "Concluído";
              return (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "" : "bg-gray-50/50"} ${atrasada ? "border-l-2 border-red-400" : ""}`}>
                  <td className={`px-3 py-2 font-mono text-xs font-bold text-gray-500 ${sub ? "pl-6" : ""}`}>
                    <InlineInput value={item.numero} onChange={v => onUpdate(item.id, "numero", v)} className="w-12" />
                  </td>
                  <td className={`px-3 py-2 ${sub ? "pl-6" : ""}`}>
                    <InlineInput value={item.iniciativa} onChange={v => onUpdate(item.id, "iniciativa", v)} multiline />
                  </td>
                  <td className="px-3 py-2">
                    <InlineSelect value={item.perspectiva} onChange={v => onUpdate(item.id, "perspectiva", v)} options={PERSPECTIVAS} />
                  </td>
                  <td className="px-3 py-2">
                    <InlineInput value={item.objetivo_estrategico} onChange={v => onUpdate(item.id, "objetivo_estrategico", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <InlineInput value={item.responsavel} onChange={v => onUpdate(item.id, "responsavel", v)} />
                  </td>
                  <td className="px-3 py-2">
                    <InlineInput value={item.envolvidos} onChange={v => onUpdate(item.id, "envolvidos", v)} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <InlineInput value={item.deadline} onChange={v => onUpdate(item.id, "deadline", v)} type="date" className={atrasada ? "text-red-600 font-semibold" : ""} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <InlineInput value={item.custo_estimado} onChange={v => onUpdate(item.id, "custo_estimado", v === "" ? null : Number(v))} type="number" className="text-center" />
                  </td>
                  <td className="px-3 py-2">
                    <Select value={item.status || "Não Iniciado"} onValueChange={v => onUpdate(item.id, "status", v)}>
                      <SelectTrigger className="h-7 text-xs border-0 bg-transparent hover:bg-blue-50 focus:ring-1 focus:ring-blue-300 px-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_INICIATIVA.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <StatusChip status={item.status} />
                  </td>
                  <td className="px-3 py-2">
                    <InlineInput value={item.observacoes} onChange={v => onUpdate(item.id, "observacoes", v)} multiline />
                  </td>
                  <td className="px-3 py-2">
                    <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
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
        {items.length} iniciativa(s) · Clique para editar inline · Autosave após 2s
      </div>
    </div>
  );
}