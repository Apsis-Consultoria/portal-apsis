import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Download, Search, Table2, LayoutGrid, CalendarDays, Maximize2 } from "lucide-react";
import { isSubItem } from "./peUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERSPECTIVAS, STATUS_INICIATIVA, STATUS_CONFIG, exportToExcel } from "./peUtils";
import DeleteConfirmModal from "./DeleteConfirmModal";
import IniciativasTableView from "./IniciativasTableView";
import IniciativasKanban from "./IniciativasKanban";
import IniciativasGantt from "./IniciativasGantt";
import FullscreenTableModal from "./FullscreenTableModal";
import { INICIATIVAS_SEED } from "./iniciativasSeed";

const VIEWS = [
  { id: "table", label: "Tabela", icon: Table2 },
  { id: "kanban", label: "Kanban", icon: LayoutGrid },
  { id: "gantt", label: "Timeline", icon: CalendarDays },
];

export default function IniciativasTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [filterPerspectiva, setFilterPerspectiva] = useState("todas");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterResponsavel, setFilterResponsavel] = useState("");
  const [filterPrazo, setFilterPrazo] = useState("todos");
  const [deleteId, setDeleteId] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.Iniciativa2026.filter({}, "-created_date", 200);
    if (data.length === 0 && !seeded) {
      // Seed inicial
      setSeeded(true);
      const criados = await Promise.all(INICIATIVAS_SEED.map(s => base44.entities.Iniciativa2026.create(s)));
      setItems(criados);
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const novo = await base44.entities.Iniciativa2026.create({
      perspectiva: "FINANCEIRO", iniciativa: "Nova Iniciativa", status: "Não Iniciado", numero: String(items.filter(i => !isSubItem(i.numero)).length + 1)
    });
    setItems(prev => [...prev, novo]);
  };

  const handleAddSub = async (parent) => {
    const parentNum = parent.numero || "1";
    const siblings = items.filter(i => {
      const p = (i.numero || "").split(".");
      return p.length === 2 && p[0] === parentNum;
    });
    const subNum = `${parentNum}.${siblings.length + 1}`;
    const novo = await base44.entities.Iniciativa2026.create({
      perspectiva: parent.perspectiva,
      iniciativa: "Nova sub-ação",
      status: "Não Iniciado",
      numero: subNum,
      objetivo_estrategico: parent.objetivo_estrategico,
      responsavel: parent.responsavel,
    });
    setItems(prev => [...prev, novo]);
  };

  const handleUpdate = useCallback(async (id, field, value) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    await base44.entities.Iniciativa2026.update(id, { [field]: value });
  }, []);

  const handleDelete = async () => {
    await base44.entities.Iniciativa2026.delete(deleteId);
    setItems(prev => prev.filter(i => i.id !== deleteId));
    setDeleteId(null);
  };

  const hoje = new Date();
  const em30 = new Date(hoje); em30.setDate(hoje.getDate() + 30);

  const sorted = [...items].sort((a, b) => {
    const na = a.numero || "";
    const nb = b.numero || "";
    return na.localeCompare(nb, undefined, { numeric: true, sensitivity: "base" });
  });

  const filtered = sorted.filter(item => {
    if (filterPerspectiva !== "todas" && item.perspectiva !== filterPerspectiva) return false;
    if (filterStatus !== "todos" && item.status !== filterStatus) return false;
    if (filterResponsavel && !item.responsavel?.toLowerCase().includes(filterResponsavel.toLowerCase())) return false;
    if (filterPrazo !== "todos" && item.deadline) {
      const d = new Date(item.deadline);
      if (filterPrazo === "atrasadas" && d >= hoje) return false;
      if (filterPrazo === "proximas" && (d < hoje || d > em30)) return false;
      if (filterPrazo === "futuras" && d <= em30) return false;
    }
    if (search) {
      const s = search.toLowerCase();
      if (!item.iniciativa?.toLowerCase().includes(s) && !item.responsavel?.toLowerCase().includes(s) && !item.numero?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const handleExport = () => {
    exportToExcel(filtered.map(i => ({
      Perspectiva: i.perspectiva, Objetivo: i.objetivo_estrategico, "Nº": i.numero,
      Iniciativa: i.iniciativa, Responsável: i.responsavel, Envolvidos: i.envolvidos,
      Deadline: i.deadline, "Custo Estimado": i.custo_estimado, Status: i.status, Observações: i.observacoes
    })), "Iniciativas_2026.xlsx");
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9 w-48 rounded-lg border-gray-200 focus:border-[#134635] focus:ring-[#134635]/20 pe-input" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterPerspectiva} onValueChange={setFilterPerspectiva}>
            <SelectTrigger className="w-52 rounded-lg border-gray-200 pe-select-trigger"><SelectValue placeholder="Perspectiva" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as perspectivas</SelectItem>
              {PERSPECTIVAS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44 rounded-lg border-gray-200 pe-select-trigger"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {STATUS_INICIATIVA.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPrazo} onValueChange={setFilterPrazo}>
            <SelectTrigger className="w-44 rounded-lg border-gray-200 pe-select-trigger"><SelectValue placeholder="Prazo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os prazos</SelectItem>
              <SelectItem value="atrasadas">🔴 Atrasadas</SelectItem>
              <SelectItem value="proximas">🟡 Próximas 30 dias</SelectItem>
              <SelectItem value="futuras">🔵 Futuras</SelectItem>
            </SelectContent>
          </Select>
          <Input className="w-36 rounded-lg border-gray-200 pe-input" placeholder="Responsável..." value={filterResponsavel} onChange={e => setFilterResponsavel(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-shrink-0 items-center">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {VIEWS.map(v => {
              const Icon = v.icon;
              return (
                <button key={v.id} onClick={() => setView(v.id)} title={v.label}
                  className={`p-1.5 rounded-md transition-all ${view === v.id ? "bg-[#134635] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 border-[#134635] text-[#134635] hover:bg-[#134635]/5 rounded-lg">
            <Download className="w-4 h-4" /> Excel
          </Button>
          {view === "table" && (
            <button onClick={() => setFullscreen(true)} title="Expandir para tela cheia"
              className="p-1.5 rounded-md text-gray-400 hover:text-[#134635] hover:bg-[#134635]/5 transition-all border border-gray-200">
              <Maximize2 className="w-4 h-4" />
            </button>
          )}
          <Button size="sm" onClick={handleAdd} className="gap-2 bg-[#F48126] hover:bg-[#e07420] text-white border-0 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <Plus className="w-4 h-4" /> Nova Iniciativa
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando iniciativas...</div>
      ) : view === "table" ? (
        <IniciativasTableView items={filtered} onUpdate={handleUpdate} onDelete={id => setDeleteId(id)} onAddSub={handleAddSub} />
      ) : view === "kanban" ? (
        <IniciativasKanban items={filtered} onUpdate={handleUpdate} />
      ) : (
        <IniciativasGantt items={filtered} />
      )}

      <FullscreenTableModal open={fullscreen} onClose={() => setFullscreen(false)} title="Iniciativas 2026 — Visão Planilha">
        <IniciativasTableView items={filtered} onUpdate={handleUpdate} onDelete={id => setDeleteId(id)} onAddSub={handleAddSub} />
      </FullscreenTableModal>

      <DeleteConfirmModal
        open={!!deleteId}
        label="esta iniciativa"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}