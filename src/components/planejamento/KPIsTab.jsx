import { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Download, Search, BarChart2, LayoutGrid, BarChart, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERSPECTIVAS, PERSPECTIVA_COLORS, calcKpiStatus, KPI_STATUS_CONFIG, isSubItem, exportToExcel } from "./peUtils";
import { KPIS_SEED } from "./kpisSeed";
import DeleteConfirmModal from "./DeleteConfirmModal";
import FullscreenTableModal from "./FullscreenTableModal";
import KPITableView from "./KPITableView";
import KPICardsView from "./KPICardsView";
import KPIProgressView from "./KPIProgressView";

const VIEWS = [
  { id: "table", label: "Tabela", icon: BarChart2 },
  { id: "cards", label: "Cards", icon: LayoutGrid },
  { id: "progress", label: "Progresso", icon: BarChart },
];

export default function KPIsTab() {
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [filterPerspectiva, setFilterPerspectiva] = useState("todas");
  const [filterResponsavel, setFilterResponsavel] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterPeriodicidade, setFilterPeriodicidade] = useState("todas");
  const [deleteId, setDeleteId] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.KPI2026.filter({}, "-created_date", 200);
    if (data.length === 0 && !seeded) {
      setSeeded(true);
      const criados = await Promise.all(KPIS_SEED.map(s => base44.entities.KPI2026.create(s)));
      setKpis(criados);
    } else {
      setKpis(data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const novo = await base44.entities.KPI2026.create({
      perspectiva: "FINANCEIRO", nome: "Novo KPI", numero: "", unidade: "%", periodicidade: "Mensal"
    });
    setKpis(prev => [novo, ...prev]);
  };

  const handleUpdate = useCallback(async (id, field, value) => {
    setKpis(prev => prev.map(k => k.id === id ? { ...k, [field]: value } : k));
    await base44.entities.KPI2026.update(id, { [field]: value });
  }, []);

  const handleDelete = async () => {
    await base44.entities.KPI2026.delete(deleteId);
    setKpis(prev => prev.filter(k => k.id !== deleteId));
    setDeleteId(null);
  };

  const sorted = [...kpis].sort((a, b) => {
    const na = a.numero || "";
    const nb = b.numero || "";
    // natural sort: "1.1" < "1.2" < "2" etc.
    return na.localeCompare(nb, undefined, { numeric: true, sensitivity: "base" });
  });

  const filtered = sorted.filter(k => {
    if (filterPerspectiva !== "todas" && k.perspectiva !== filterPerspectiva) return false;
    if (filterResponsavel && !k.responsavel?.toLowerCase().includes(filterResponsavel.toLowerCase())) return false;
    if (filterStatus !== "todos" && calcKpiStatus(k) !== filterStatus) return false;
    if (filterPeriodicidade !== "todas" && k.periodicidade !== filterPeriodicidade) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!k.nome?.toLowerCase().includes(s) && !k.numero?.toLowerCase().includes(s) && !k.responsavel?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const handleExport = () => {
    exportToExcel(filtered.map(k => ({
      Perspectiva: k.perspectiva, Objetivo: k.objetivo_estrategico, "Nº": k.numero, Nome: k.nome,
      Fonte: k.fonte_dados, Responsável: k.responsavel, Unidade: k.unidade, Periodicidade: k.periodicidade,
      "Meta Anual": k.meta_anual, "T1": k.resultado_t1, "T2": k.resultado_t2, "T3": k.resultado_t3, "T4": k.resultado_t4,
      Status: KPI_STATUS_CONFIG[calcKpiStatus(k)]?.label
    })), "KPIs_2026.xlsx");
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9 w-48 rounded-lg border-gray-200" placeholder="Buscar KPI..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterPerspectiva} onValueChange={setFilterPerspectiva}>
            <SelectTrigger className="w-52 rounded-lg border-gray-200"><SelectValue placeholder="Perspectiva" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as perspectivas</SelectItem>
              {PERSPECTIVAS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44 rounded-lg border-gray-200"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="batida">✅ Meta Batida</SelectItem>
              <SelectItem value="progresso">⚠️ Em Progresso</SelectItem>
              <SelectItem value="fora">🔴 Fora da Meta</SelectItem>
              <SelectItem value="sem_dados">⚪ Sem Dados</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPeriodicidade} onValueChange={setFilterPeriodicidade}>
            <SelectTrigger className="w-40 rounded-lg border-gray-200"><SelectValue placeholder="Periodicidade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {["Mensal","Trimestral","Semestral","Anual"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input className="w-36 rounded-lg border-gray-200" placeholder="Responsável..." value={filterResponsavel} onChange={e => setFilterResponsavel(e.target.value)} />
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
            <Plus className="w-4 h-4" /> Novo KPI
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando KPIs...</div>
      ) : view === "table" ? (
        <KPITableView kpis={filtered} onUpdate={handleUpdate} onDelete={id => setDeleteId(id)} />
      ) : view === "cards" ? (
        <KPICardsView kpis={filtered} />
      ) : (
        <KPIProgressView kpis={filtered} />
      )}

      <FullscreenTableModal open={fullscreen} onClose={() => setFullscreen(false)} title="KPIs 2026 — Visão Planilha">
        <KPITableView kpis={filtered} onUpdate={handleUpdate} onDelete={id => setDeleteId(id)} />
      </FullscreenTableModal>

      <DeleteConfirmModal
        open={!!deleteId}
        label="este KPI"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}