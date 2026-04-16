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
      className={`block w-full cursor-pointer hover:bg-[#134635]/5 rounded-md px-1.5 py-1 min-h-[1.6rem] text-sm transition-colors ${!value ? "text-gray-300 italic" : "text-gray-700"} ${className}`}>
      {value || "—"}
    </span>
  );

  if (multiline) return (
    <textarea autoFocus value={local} onChange={e => handleChange(e.target.value)} onBlur={commit}
      rows={2} className={`w-full text-sm border border-[#134635]/40 rounded-md px-2 py-1 outline-none ring-1 ring-[#134635]/30 bg-white resize-none pe-input ${className}`} />
  );

  return (
    <input autoFocus type={type} value={local} onChange={e => handleChange(e.target.value)}
      onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()}
      className={`w-full text-sm border border-[#134635]/40 rounded-md px-2 py-1 outline-none ring-1 ring-[#134635]/30 bg-white pe-input ${className}`} />
  );
}

function InlineSelect({ value, onChange, options }) {
  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger className="h-7 text-xs border-0 bg-transparent hover:bg-[#134635]/5 focus:ring-1 focus:ring-[#134635]/30 px-1 pe-select-trigger">
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        {options.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

const STATUS_BADGE = {
  "Concluído":    { bg: "bg-[#134635]/10", text: "text-[#134635]", label: "Concluído" },
  "Em Andamento": { bg: "bg-[#F48126]/10", text: "text-[#F48126]", label: "Em Andamento" },
  "Aguardando":   { bg: "bg-amber-100",    text: "text-amber-700", label: "Aguardando" },
  "Atrasado":     { bg: "bg-red-100",      text: "text-red-700",   label: "Atrasado" },
  "Não Iniciado": { bg: "bg-gray-100",     text: "text-gray-500",  label: "Não Iniciado" },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE["Não Iniciado"];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function DeadlineChip({ deadline, status }) {
  if (!deadline) return <span className="text-gray-300 text-xs">—</span>;
  const hoje = new Date();
  const d = new Date(deadline);
  const atrasada = d < hoje && status !== "Concluído";
  const em30 = new Date(hoje); em30.setDate(hoje.getDate() + 30);
  const proxima = d >= hoje && d <= em30;

  const formatted = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  if (atrasada) return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700">{formatted}</span>;
  if (proxima)  return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#F48126]/10 text-[#F48126]">{formatted}</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">{formatted}</span>;
}

function Avatar({ name }) {
  if (!name) return null;
  const initials = name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  const colors = ["bg-[#134635]", "bg-[#F48126]", "bg-blue-600", "bg-purple-600", "bg-teal-600"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <span title={name} className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-semibold flex-shrink-0 ${color}`}>
      {initials}
    </span>
  );
}

function AvatarList({ names }) {
  if (!names) return <span className="text-gray-300 text-xs">—</span>;
  const list = names.split(",").map(n => n.trim()).filter(Boolean);
  return (
    <div className="flex items-center -space-x-1">
      {list.slice(0, 3).map((n, i) => <Avatar key={i} name={n} />)}
      {list.length > 3 && (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold ring-2 ring-white">
          +{list.length - 3}
        </span>
      )}
    </div>
  );
}

export default function IniciativasTableView({ items, onUpdate, onDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-[#F5F6F8]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">Nº</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[240px]">Iniciativa / Ação</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Perspectiva</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Objetivo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Responsável</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Envolvidos</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Deadline</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Custo Est.</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Observações</th>
              <th className="px-4 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr>
                <td colSpan={11} className="text-center py-14 text-gray-400 text-sm">
                  Nenhuma iniciativa encontrada
                </td>
              </tr>
            )}
            {items.map((item) => {
              const sub = isSubItem(item.numero);
              const hoje = new Date();
              const atrasada = item.deadline && new Date(item.deadline) < hoje && item.status !== "Concluído";
              return (
                <tr key={item.id} className={`group hover:bg-[#134635]/3 transition-colors ${sub ? "bg-gray-50/60" : ""} ${atrasada ? "border-l-2 border-l-red-400" : ""}`}>
                  <td className={`px-4 py-3 font-mono text-xs font-bold text-gray-400 ${sub ? "pl-8" : ""}`}>
                    <InlineInput value={item.numero} onChange={v => onUpdate(item.id, "numero", v)} className="w-12" />
                  </td>
                  <td className={`px-4 py-3 ${sub ? "pl-8" : ""}`}>
                    {sub && (
                      <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" style={{ position: "relative", display: "inline-block", width: 0 }} />
                    )}
                    <InlineInput value={item.iniciativa} onChange={v => onUpdate(item.id, "iniciativa", v)} multiline />
                  </td>
                  <td className="px-4 py-3">
                    <InlineSelect value={item.perspectiva} onChange={v => onUpdate(item.id, "perspectiva", v)} options={PERSPECTIVAS} />
                  </td>
                  <td className="px-4 py-3">
                    <InlineInput value={item.objetivo_estrategico} onChange={v => onUpdate(item.id, "objetivo_estrategico", v)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.responsavel && <Avatar name={item.responsavel} />}
                      <InlineInput value={item.responsavel} onChange={v => onUpdate(item.id, "responsavel", v)} />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AvatarList names={item.envolvidos} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div onClick={() => {}} className="cursor-pointer">
                      <DeadlineChip deadline={item.deadline} status={item.status} />
                      <div className="mt-1">
                        <InlineInput value={item.deadline} onChange={v => onUpdate(item.id, "deadline", v)} type="date" className="text-xs text-center opacity-0 group-hover:opacity-100 h-0 overflow-hidden group-hover:h-auto" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <InlineInput value={item.custo_estimado} onChange={v => onUpdate(item.id, "custo_estimado", v === "" ? null : Number(v))} type="number" className="text-center" />
                  </td>
                  <td className="px-4 py-3">
                    <Select value={item.status || "Não Iniciado"} onValueChange={v => onUpdate(item.id, "status", v)}>
                      <SelectTrigger className="h-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 hover:opacity-80">
                        <StatusBadge status={item.status || "Não Iniciado"} />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_INICIATIVA.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <InlineInput value={item.observacoes} onChange={v => onUpdate(item.id, "observacoes", v)} multiline />
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => onDelete(item.id)} className="text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
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
        {items.length} iniciativa(s) · Clique para editar · Autosave em 2s
      </div>
    </div>
  );
}