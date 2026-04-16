import { useState, useRef } from "react";
import { Trash2, CheckCircle2, Clock, AlertTriangle, XCircle, MinusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_INICIATIVA, STATUS_CONFIG } from "./peUtils";

const DIRETORES = ["Bruno Bottino", "Caio Favero", "Marcelo Nascimento", "Angela Magalhães", "Miguel Monteiro", "Outro"];
const TEMAS = ["Comercial", "Inovação", "Qualidade Técnica", "Cultura e Pessoas", "Eficiência Operacional"];

const DIRETOR_COLORS = {
  "Bruno Bottino": "bg-blue-100 text-blue-800",
  "Caio Favero": "bg-orange-100 text-orange-800",
  "Marcelo Nascimento": "bg-purple-100 text-purple-800",
  "Angela Magalhães": "bg-pink-100 text-pink-800",
  "Miguel Monteiro": "bg-green-100 text-green-800",
  "Outro": "bg-gray-100 text-gray-800",
};

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
      className={`block w-full cursor-pointer hover:bg-[#134635]/5 rounded-md px-1.5 py-1 min-h-[1.5rem] text-sm transition-colors ${!value ? "text-gray-300 italic" : "text-gray-700"} ${className}`}>
      {value || "—"}
    </span>
  );

  if (multiline) return (
    <textarea autoFocus value={local} onChange={e => handleChange(e.target.value)} onBlur={commit}
      rows={2} className={`w-full text-sm border border-[#134635]/40 rounded-md px-2 py-1 outline-none ring-1 ring-[#134635]/30 bg-white resize-none ${className}`} />
  );

  return (
    <input autoFocus type={type} value={local} onChange={e => handleChange(e.target.value)}
      onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()}
      className={`w-full text-sm border border-[#134635]/40 rounded-md px-2 py-1 outline-none ring-1 ring-[#134635]/30 bg-white ${className}`} />
  );
}

const STATUS_BADGE = {
  "Concluído":    { bg: "bg-[#134635]/10", text: "text-[#134635]", label: "Concluído" },
  "Em Andamento": { bg: "bg-[#F48126]/10", text: "text-[#F48126]", label: "Em Andamento" },
  "Aguardando":   { bg: "bg-amber-100",    text: "text-amber-700", label: "Aguardando" },
  "Atrasado":     { bg: "bg-red-100",      text: "text-red-700",   label: "Atrasado" },
  "Não Iniciado": { bg: "bg-gray-100",     text: "text-gray-500",  label: "Não Iniciado" },
};

function DeadlineChip({ prazo, status }) {
  if (!prazo) return <span className="text-gray-300 text-xs">—</span>;
  const hoje = new Date();
  const d = new Date(prazo + "T12:00:00");
  const atrasada = d < hoje && status !== "Concluído";
  const em30 = new Date(hoje); em30.setDate(hoje.getDate() + 30);
  const proxima = d >= hoje && d <= em30;
  const formatted = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  if (atrasada) return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-700">{formatted}</span>;
  if (proxima)  return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#F48126]/10 text-[#F48126]">{formatted}</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500">{formatted}</span>;
}

const QUICK_ACTIONS = [
  { status: "Concluído",    icon: CheckCircle2, color: "text-[#134635] hover:bg-[#134635]/10", title: "Concluído" },
  { status: "Em Andamento", icon: Clock,         color: "text-[#F48126] hover:bg-[#F48126]/10", title: "Em Andamento" },
  { status: "Atrasado",     icon: AlertTriangle, color: "text-red-500 hover:bg-red-50",         title: "Atrasado" },
  { status: "Aguardando",   icon: MinusCircle,   color: "text-amber-500 hover:bg-amber-50",     title: "Aguardando" },
  { status: "Não Iniciado", icon: XCircle,       color: "text-gray-400 hover:bg-gray-100",      title: "Não Iniciado" },
];

function QuickActions({ status, onUpdate }) {
  return (
    <div className="flex items-center gap-1">
      {QUICK_ACTIONS.map(({ status: s, icon: Icon, color, title }) => (
        <button
          key={s}
          title={title}
          onClick={() => onUpdate(s)}
          className={`p-1 rounded-md transition-colors ${color} ${status === s ? "ring-1 ring-current" : "opacity-40 hover:opacity-100"}`}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}

export default function MetasTableView({ items, onUpdate, onDelete }) {
  const diretores = [...new Set(items.map(i => i.diretor))];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-[#F5F6F8]">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Diretor</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Tema</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[240px]">Iniciativa / Ação</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Prazo</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Ação Rápida</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Responsável</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">KPI de Sucesso</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-36">Observações</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr><td colSpan={11} className="text-center py-14 text-gray-400 text-sm">Nenhuma meta encontrada</td></tr>
            )}
            {diretores.map(diretor => {
              const grupo = items.filter(i => i.diretor === diretor);
              return grupo.map((item, idx) => {
                const sb = STATUS_BADGE[item.status || "Não Iniciado"];
                const dc = DIRETOR_COLORS[item.diretor] || "bg-gray-100 text-gray-800";
                return (
                  <tr key={item.id} className="group hover:bg-[#134635]/3 transition-colors">
                    <td className="px-4 py-3">
                      {idx === 0 ? (
                        <Select value={item.diretor || ""} onValueChange={v => onUpdate(item.id, "diretor", v)}>
                          <SelectTrigger className="h-7 text-xs border-0 bg-transparent hover:bg-[#134635]/5 focus:ring-1 focus:ring-[#134635]/30 px-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>{DIRETORES.map(d => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dc}`}>{item.diretor}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Select value={item.tema || ""} onValueChange={v => onUpdate(item.id, "tema", v)}>
                        <SelectTrigger className="h-7 text-xs border-0 bg-transparent hover:bg-[#134635]/5 focus:ring-1 focus:ring-[#134635]/30 px-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>{TEMAS.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <InlineInput value={item.iniciativa} onChange={v => onUpdate(item.id, "iniciativa", v)} multiline />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <DeadlineChip prazo={item.prazo} status={item.status} />
                        <InlineInput value={item.prazo} onChange={v => onUpdate(item.id, "prazo", v)} type="date" className="text-xs text-center" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <QuickActions status={item.status} onUpdate={v => onUpdate(item.id, "status", v)} />
                    </td>
                    <td className="px-4 py-3">
                      <InlineInput value={item.responsavel_execucao} onChange={v => onUpdate(item.id, "responsavel_execucao", v)} />
                    </td>
                    <td className="px-4 py-3">
                      <InlineInput value={item.kpi_sucesso} onChange={v => onUpdate(item.id, "kpi_sucesso", v)} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Select value={item.status || "Não Iniciado"} onValueChange={v => onUpdate(item.id, "status", v)}>
                        <SelectTrigger className="h-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 hover:opacity-80">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${sb.bg} ${sb.text}`}>
                            {sb.label}
                          </span>
                        </SelectTrigger>
                        <SelectContent>{STATUS_INICIATIVA.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
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
              });
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#134635]/40 inline-block" />
        {items.length} meta(s) · Clique para editar · Autosave em 2s
      </div>
    </div>
  );
}