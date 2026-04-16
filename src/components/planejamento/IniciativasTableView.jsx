import { useState, useRef, useCallback, useEffect } from "react";
import { Trash2, Plus, ChevronRight, ChevronDown, GripVertical, CheckCircle2, Clock, AlertTriangle, XCircle, Hourglass, Lock } from "lucide-react";
import { PERSPECTIVAS, STATUS_INICIATIVA, isSubItem } from "./peUtils";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  "Não Iniciado": { bg: "bg-[#F3F4F6]",  text: "text-[#6B7280]", icon: XCircle,      label: "Não Iniciado" },
  "Em Andamento": { bg: "bg-[#FFF3E0]",  text: "text-[#F48126]", icon: Hourglass,    label: "Em Andamento" },
  "Concluído":    { bg: "bg-[#E8F5EE]",  text: "text-[#134635]", icon: CheckCircle2, label: "Concluído"    },
  "Atrasado":     { bg: "bg-[#FEF2F2]",  text: "text-[#DC2626]", icon: AlertTriangle,label: "Atrasado"     },
  "Aguardando":   { bg: "bg-purple-50",  text: "text-purple-600", icon: Lock,         label: "Aguardando"   },
};
const STATUS_ORDER = ["Não Iniciado", "Em Andamento", "Concluído", "Atrasado", "Aguardando"];

const PERSP_COLORS = {
  "FINANCEIRO":            "bg-blue-100 text-blue-700",
  "MERCADO/CLIENTES":      "bg-amber-100 text-amber-700",
  "PROCESSOS INTERNOS":    "bg-indigo-100 text-indigo-700",
  "APRENDIZADO/CRESCIMENTO":"bg-teal-100 text-teal-700",
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
function getInitials(name) {
  return (name || "").split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}
function avatarColor(name) {
  const c = ["bg-[#134635]","bg-[#F48126]","bg-blue-600","bg-purple-600","bg-teal-600","bg-rose-500","bg-indigo-600"];
  return c[(name?.charCodeAt(0) || 0) % c.length];
}

// ─── AVATAR ─────────────────────────────────────────────────────────────────
function Avatar({ name, size = "w-7 h-7" }) {
  if (!name) return null;
  return (
    <span title={name}
      className={`inline-flex items-center justify-center rounded-full text-white text-xs font-semibold flex-shrink-0 ring-2 ring-white ${size} ${avatarColor(name)}`}>
      {getInitials(name)}
    </span>
  );
}

function AvatarStack({ names, max = 3 }) {
  if (!names) return <span className="text-gray-300 text-xs italic">—</span>;
  const list = names.split(",").map(n => n.trim()).filter(Boolean);
  if (!list.length) return <span className="text-gray-300 text-xs italic">—</span>;
  return (
    <div className="flex items-center -space-x-2">
      {list.slice(0, max).map((n, i) => <Avatar key={i} name={n} />)}
      {list.length > max && (
        <span title={list.slice(max).join(", ")}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-xs font-bold ring-2 ring-white cursor-default">
          +{list.length - max}
        </span>
      )}
    </div>
  );
}

// ─── STATUS BADGE (clicável) ─────────────────────────────────────────────────
function StatusBadge({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Não Iniciado"];
  const Icon = cfg.icon;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:opacity-80 ${cfg.bg} ${cfg.text}`}>
        <Icon className="w-3 h-3" />
        {cfg.label}
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 min-w-[160px]">
          {STATUS_ORDER.map(s => {
            const c = STATUS_CONFIG[s];
            const I = c.icon;
            return (
              <button key={s} onClick={() => { onChange(s); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${s === status ? "font-bold" : ""}`}>
                <span className={`flex items-center justify-center w-5 h-5 rounded-full ${c.bg}`}>
                  <I className={`w-3 h-3 ${c.text}`} />
                </span>
                <span className={c.text}>{c.label}</span>
                {s === status && <span className="ml-auto text-[#134635] text-xs">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── DEADLINE CHIP (clicável) ────────────────────────────────────────────────
function DeadlineCell({ deadline, status, onChange }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!editing) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setEditing(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [editing]);

  const chip = () => {
    if (!deadline) return <span className="text-gray-300 text-xs italic cursor-pointer hover:text-gray-500">Definir prazo</span>;
    const hoje = new Date();
    const d = new Date(deadline + "T12:00:00");
    const em30 = new Date(hoje); em30.setDate(hoje.getDate() + 30);
    const atrasada = d < hoje && status !== "Concluído";
    const proxima  = !atrasada && d <= em30;
    const fmt = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

    if (atrasada) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-100 text-red-600 cursor-pointer">⚠ {fmt}</span>;
    if (proxima)  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-[#FFF3E0] text-[#F48126] cursor-pointer">⏰ {fmt}</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-500 cursor-pointer">{fmt}</span>;
  };

  return (
    <div className="relative flex flex-col items-center gap-1" ref={ref}>
      <div onClick={() => setEditing(true)}>{chip()}</div>
      {editing && (
        <div className="absolute z-50 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-3">
          <input type="date" defaultValue={deadline || ""}
            autoFocus
            onChange={e => { onChange(e.target.value); setEditing(false); }}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-[#134635]" />
        </div>
      )}
    </div>
  );
}

// ─── INLINE TEXT ─────────────────────────────────────────────────────────────
function InlineText({ value, onChange, multiline = false, placeholder = "—", className = "" }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value ?? "");
  const timer = useRef(null);
  const ref = useRef(null);

  useEffect(() => { if (!editing) setLocal(value ?? ""); }, [value, editing]);

  const commit = useCallback(() => {
    clearTimeout(timer.current);
    if (local !== (value ?? "")) onChange(local);
    setEditing(false);
  }, [local, value, onChange]);

  const handleChange = (v) => {
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 1500);
  };

  if (!editing) {
    return (
      <span onClick={() => { setLocal(value ?? ""); setEditing(true); }}
        className={`block w-full cursor-text hover:bg-[#134635]/5 rounded-md px-1.5 py-1 min-h-[1.6rem] transition-colors ${!value ? "text-gray-300 italic text-xs" : "text-gray-700 text-sm"} ${className}`}>
        {value || placeholder}
      </span>
    );
  }

  if (multiline) return (
    <textarea ref={ref} autoFocus value={local}
      onChange={e => handleChange(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Escape") { setLocal(value ?? ""); setEditing(false); } }}
      rows={2}
      className={`w-full text-sm border border-[#134635]/50 rounded-md px-2 py-1.5 outline-none ring-1 ring-[#134635]/20 bg-white resize-none ${className}`} />
  );

  return (
    <input ref={ref} autoFocus type="text" value={local}
      onChange={e => handleChange(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") { setLocal(value ?? ""); setEditing(false); }
      }}
      className={`w-full text-sm border border-[#134635]/50 rounded-md px-2 py-1.5 outline-none ring-1 ring-[#134635]/20 bg-white ${className}`} />
  );
}

// ─── INLINE NUMBER ───────────────────────────────────────────────────────────
function InlineNumber({ value, onChange }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value ?? "");

  useEffect(() => { if (!editing) setLocal(value ?? ""); }, [value, editing]);

  const commit = () => {
    const num = local === "" ? null : Number(local);
    if (num !== value) onChange(num);
    setEditing(false);
  };

  const fmt = value != null
    ? Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
    : null;

  if (!editing) return (
    <span onClick={() => { setLocal(value ?? ""); setEditing(true); }}
      className="block text-sm cursor-text hover:bg-[#134635]/5 rounded-md px-1.5 py-1 text-right text-gray-700 min-h-[1.6rem]">
      {fmt || <span className="text-gray-300 italic text-xs">—</span>}
    </span>
  );

  return (
    <input autoFocus type="number" value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
      className="w-full text-sm border border-[#134635]/50 rounded-md px-2 py-1.5 text-right outline-none ring-1 ring-[#134635]/20 bg-white" />
  );
}

// ─── INLINE SELECT ───────────────────────────────────────────────────────────
function InlineSelect({ value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const cls = PERSP_COLORS[value] || "bg-gray-100 text-gray-600";

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium cursor-pointer hover:opacity-80 transition-all ${cls}`}>
        {value || <span className="italic text-gray-400">—</span>}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 min-w-[240px]">
          {options.map(o => (
            <button key={o} onClick={() => { onChange(o); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors ${o === value ? "font-bold" : ""} ${PERSP_COLORS[o] ? PERSP_COLORS[o].split(" ")[1] : "text-gray-700"}`}>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PEOPLE EDITOR ───────────────────────────────────────────────────────────
function PeopleCell({ value, onChange, multi = false }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState("");
  const ref = useRef(null);
  const names = value ? value.split(",").map(n => n.trim()).filter(Boolean) : [];

  useEffect(() => {
    if (!editing) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { commitInput(); setEditing(false); } };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [editing, input]);

  const commitInput = () => {
    if (!input.trim()) return;
    const updated = multi ? [...names, input.trim()] : [input.trim()];
    onChange(updated.join(", "));
    setInput("");
  };

  const remove = (i) => {
    const updated = names.filter((_, idx) => idx !== i);
    onChange(updated.join(", "));
  };

  return (
    <div className="relative" ref={ref}>
      {!editing ? (
        <div onClick={() => setEditing(true)} className="cursor-pointer hover:bg-[#134635]/5 rounded-md p-1 transition-colors">
          {multi ? <AvatarStack names={value} /> : (
            <div className="flex items-center gap-1.5">
              {value && <Avatar name={names[0]} />}
              <span className={`text-xs ${value ? "text-gray-700" : "text-gray-300 italic"}`}>{names[0] || "—"}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="absolute z-50 top-0 left-0 min-w-[200px] bg-white rounded-xl shadow-xl border border-[#134635]/30 p-3 space-y-2">
          {multi && names.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {names.map((n, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-[#134635]/10 text-[#134635] text-xs rounded-full px-2 py-0.5">
                  {n}
                  <button onClick={() => remove(i)} className="hover:text-red-500 ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-1">
            <input autoFocus type="text" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") { commitInput(); if (!multi) setEditing(false); }
                if (e.key === "Escape") setEditing(false);
              }}
              placeholder={multi ? "Nome e Enter..." : "Nome..."}
              className="flex-1 text-xs border border-gray-300 rounded-md px-2 py-1.5 outline-none focus:border-[#134635]" />
            <button onClick={() => { commitInput(); if (!multi) setEditing(false); }}
              className="px-2 py-1 bg-[#134635] text-white text-xs rounded-md hover:bg-[#134635]/80">
              {multi ? "+" : "✓"}
            </button>
          </div>
          {!multi && <button onClick={() => { onChange(""); setEditing(false); }}
            className="w-full text-xs text-gray-400 hover:text-red-500 text-left">Limpar</button>}
        </div>
      )}
    </div>
  );
}

// ─── COUNTER BAR (topo) ──────────────────────────────────────────────────────
function CounterBar({ items }) {
  const counts = { total: items.length };
  STATUS_ORDER.forEach(s => { counts[s] = items.filter(i => (i.status || "Não Iniciado") === s).length; });

  const stats = [
    { label: "Total", value: counts.total, bg: "bg-[#134635]/10", text: "text-[#134635]", border: "border-[#134635]/20" },
    { label: "Em Andamento", value: counts["Em Andamento"], bg: "bg-[#FFF3E0]", text: "text-[#F48126]", border: "border-[#F48126]/20" },
    { label: "Concluídas",   value: counts["Concluído"],    bg: "bg-[#E8F5EE]",  text: "text-[#134635]", border: "border-[#134635]/20" },
    { label: "Atrasadas",    value: counts["Atrasado"],     bg: "bg-red-50",     text: "text-red-600",  border: "border-red-200" },
    { label: "Não Iniciadas",value: counts["Não Iniciado"], bg: "bg-gray-100",   text: "text-gray-500", border: "border-gray-200" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {stats.map(s => (
        <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${s.bg} ${s.border}`}>
          <span className={`text-lg font-bold ${s.text}`}>{s.value}</span>
          <span className={`text-xs ${s.text} opacity-80`}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function IniciativasTableView({ items, onUpdate, onDelete, onAddSub }) {
  const [collapsed, setCollapsed] = useState({});
  const [selectedId, setSelectedId] = useState(null);
  const [toolbarPos, setToolbarPos] = useState(null);
  const tableRef = useRef(null);

  // Group items: find parents and their children
  const parents = items.filter(i => !isSubItem(i.numero));
  const subs = items.filter(i => isSubItem(i.numero));

  // Build ordered list with hierarchy
  const ordered = [];
  parents.forEach(p => {
    ordered.push({ ...p, _isParent: true });
    const parentNum = p.numero;
    const children = subs.filter(s => {
      const parts = (s.numero || "").split(".");
      return parts.length === 2 && parts[0] === parentNum;
    });
    children.forEach(c => ordered.push({ ...c, _isParent: false, _parentNum: parentNum }));
    // also include standalone items that don't have a matching parent
  });
  // Add any sub-items whose parent isn't in current filter
  subs.forEach(s => {
    if (!ordered.find(o => o.id === s.id)) ordered.push({ ...s, _isParent: false });
  });
  // Add parents not yet in ordered
  parents.forEach(p => {
    if (!ordered.find(o => o.id === p.id)) ordered.push({ ...p, _isParent: true });
  });

  const handleRowClick = useCallback((e, id) => {
    e.stopPropagation();
    setSelectedId(prev => prev === id ? null : id);
  }, []);

  useEffect(() => {
    const handler = () => setSelectedId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="space-y-3">
      <CounterBar items={items} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden" ref={tableRef}>
        {/* Header */}
        <div className="bg-[#134635] px-5 py-3 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm tracking-wide">Iniciativas 2026 — Visão Planilha</h3>
          <span className="text-white/60 text-xs">{items.length} item(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="bg-[#F0F4F2] border-b border-gray-200">
                <th className="w-4 px-2" />
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#134635] uppercase tracking-wider w-14">Nº</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#134635] uppercase tracking-wider min-w-[260px]">Iniciativa / Ação</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#134635] uppercase tracking-wider w-44">Perspectiva</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#134635] uppercase tracking-wider w-36">Responsável</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#134635] uppercase tracking-wider w-32">Envolvidos</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#134635] uppercase tracking-wider w-28">Deadline</th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-[#134635] uppercase tracking-wider w-28">Custo Est.</th>
                <th className="px-3 py-3 text-center text-xs font-semibold text-[#134635] uppercase tracking-wider w-32">Status</th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-[#134635] uppercase tracking-wider w-40">Observações</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {ordered.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-16 text-gray-400 text-sm">
                    Nenhuma iniciativa encontrada
                  </td>
                </tr>
              )}
              {ordered.map((item) => {
                const isSub = !item._isParent && isSubItem(item.numero);
                const isSelected = selectedId === item.id;
                const hoje = new Date();
                const atrasada = item.deadline && new Date(item.deadline + "T12:00:00") < hoje && item.status !== "Concluído";
                const parentCollapsed = isSub && item._parentNum && collapsed[item._parentNum];
                if (parentCollapsed) return null;

                return (
                  <tr key={item.id}
                    onClick={(e) => handleRowClick(e, item.id)}
                    className={[
                      "group transition-all duration-150 cursor-pointer relative",
                      isSub ? "bg-white" : "bg-[#F0F4F2]/60",
                      isSelected
                        ? "outline outline-[1.5px] outline-[#134635] shadow-md z-10"
                        : "hover:bg-[#E8F5EE]/60 hover:border-l-[3px] hover:border-l-[#134635]",
                      atrasada && !isSelected ? "border-l-2 border-l-red-400" : "",
                    ].join(" ")}
                  >
                    {/* Drag handle */}
                    <td className="px-1 py-3 w-4">
                      <GripVertical className="w-3 h-3 text-gray-300 group-hover:text-gray-400 cursor-grab opacity-0 group-hover:opacity-100" />
                    </td>

                    {/* Número */}
                    <td className={`px-3 py-3 ${isSub ? "pl-8" : ""}`}>
                      <div className="flex items-center gap-1">
                        {!isSub && (
                          <button onClick={(e) => { e.stopPropagation(); setCollapsed(prev => ({ ...prev, [item.numero]: !prev[item.numero] })); }}
                            className="text-[#134635]/50 hover:text-[#134635] transition-colors">
                            {collapsed[item.numero]
                              ? <ChevronRight className="w-3.5 h-3.5" />
                              : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        {isSub && <div className="w-3 border-l-2 border-[#134635]/30 h-4 flex-shrink-0" />}
                        <span className={`font-mono text-xs font-bold ${isSub ? "text-[#134635]/60" : "text-[#134635]"}`}>
                          {item.numero || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Iniciativa */}
                    <td className={`px-3 py-3 ${isSub ? "pl-8" : ""}`} onClick={e => e.stopPropagation()}>
                      <InlineText
                        value={item.iniciativa}
                        onChange={v => onUpdate(item.id, "iniciativa", v)}
                        multiline
                        placeholder="Descrever iniciativa..."
                        className={isSub ? "" : "font-semibold"}
                      />
                    </td>

                    {/* Perspectiva */}
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <InlineSelect value={item.perspectiva} onChange={v => onUpdate(item.id, "perspectiva", v)} options={PERSPECTIVAS} />
                    </td>

                    {/* Responsável */}
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <PeopleCell value={item.responsavel} onChange={v => onUpdate(item.id, "responsavel", v)} multi={false} />
                    </td>

                    {/* Envolvidos */}
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <PeopleCell value={item.envolvidos} onChange={v => onUpdate(item.id, "envolvidos", v)} multi />
                    </td>

                    {/* Deadline */}
                    <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <DeadlineCell deadline={item.deadline} status={item.status} onChange={v => onUpdate(item.id, "deadline", v)} />
                    </td>

                    {/* Custo */}
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <InlineNumber value={item.custo_estimado} onChange={v => onUpdate(item.id, "custo_estimado", v)} />
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <StatusBadge status={item.status || "Não Iniciado"} onChange={v => onUpdate(item.id, "status", v)} />
                    </td>

                    {/* Obs */}
                    <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                      <InlineText
                        value={item.observacoes}
                        onChange={v => onUpdate(item.id, "observacoes", v)}
                        multiline
                        placeholder="Observações..."
                        className="text-xs text-gray-500"
                      />
                    </td>

                    {/* Ações */}
                    <td className="px-2 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onAddSub && !isSub && (
                          <button title="Adicionar sub-ação"
                            onClick={() => onAddSub(item)}
                            className="text-[#134635]/40 hover:text-[#134635] transition-colors">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button title="Excluir"
                          onClick={() => onDelete(item.id)}
                          className="text-gray-200 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#F0F4F2] border-t border-gray-100 text-xs text-[#134635]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#134635]/40 inline-block" />
            {items.length} iniciativa(s) · Clique para editar · Autosave em 1.5s
          </div>
          <div className="flex items-center gap-3 text-gray-400">
            <span>Enter = confirmar</span>
            <span>Esc = cancelar</span>
            <span>Click no badge = trocar status</span>
          </div>
        </div>
      </div>
    </div>
  );
}