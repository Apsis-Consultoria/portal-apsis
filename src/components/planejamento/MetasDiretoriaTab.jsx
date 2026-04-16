import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Download, Search, Table2, LayoutGrid, BarChart2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_INICIATIVA, STATUS_CONFIG, exportToExcel } from "./peUtils";
import DeleteConfirmModal from "./DeleteConfirmModal";
import FullscreenTableModal from "./FullscreenTableModal";
import MetasTableView from "./MetasTableView";
import MetasCardsView from "./MetasCardsView";
import MetasResumoView from "./MetasResumoView";
import { METAS_SEED } from "./metasSeed";

const DIRETORES = ["Bruno Bottino", "Caio Favero", "Marcelo Nascimento", "Angela Magalhães", "Miguel Monteiro", "Outro"];
const TEMAS = ["Comercial", "Inovação", "Qualidade Técnica", "Cultura e Pessoas", "Eficiência Operacional"];

const VIEWS = [
  { id: "table", label: "Tabela", icon: Table2 },
  { id: "cards", label: "Cards por Diretor", icon: LayoutGrid },
  { id: "resumo", label: "Resumo Executivo", icon: BarChart2 },
];

export default function MetasDiretoriaTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);
  const [view, setView] = useState("table");
  const [search, setSearch] = useState("");
  const [filterDiretor, setFilterDiretor] = useState("todos");
  const [filterTema, setFilterTema] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterResponsavel, setFilterResponsavel] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.MetaDiretoria2026.filter({}, "-created_date", 300);
    if (data.length === 0 && !seeded) {
      setSeeded(true);
      const criados = await Promise.all(METAS_SEED.map(s => base44.entities.MetaDiretoria2026.create(s)));
      setItems(criados);
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    const novo = await base44.entities.MetaDiretoria2026.create({
      diretor: "Bruno Bottino", tema: "Comercial", iniciativa: "Nova Meta", status: "Não Iniciado"
    });
    setItems(prev => [novo, ...prev]);
  };

  const handleUpdate = useCallback(async (id, field, value) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
    await base44.entities.MetaDiretoria2026.update(id, { [field]: value });
  }, []);

  const handleDelete = async () => {
    await base44.entities.MetaDiretoria2026.delete(deleteId);
    setItems(prev => prev.filter(i => i.id !== deleteId));
    setDeleteId(null);
  };

  const hoje = new Date();
  const filtered = items.filter(item => {
    if (filterDiretor !== "todos" && item.diretor !== filterDiretor) return false;
    if (filterTema !== "todos" && item.tema !== filterTema) return false;
    if (filterStatus !== "todos" && item.status !== filterStatus) return false;
    if (filterResponsavel && !item.responsavel_execucao?.toLowerCase().includes(filterResponsavel.toLowerCase())) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!item.iniciativa?.toLowerCase().includes(s) && !item.responsavel_execucao?.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const handleExport = () => {
    exportToExcel(filtered.map(i => ({
      Diretor: i.diretor, Tema: i.tema, Iniciativa: i.iniciativa,
      Prazo: i.prazo, Responsável: i.responsavel_execucao,
      "KPI de Sucesso": i.kpi_sucesso, Status: i.status, Observações: i.observacoes
    })), "Metas_Diretoria_2026.xlsx");
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9 w-48 rounded-lg border-gray-200" placeholder="Buscar meta..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filterDiretor} onValueChange={setFilterDiretor}>
            <SelectTrigger className="w-48 rounded-lg border-gray-200"><SelectValue placeholder="Diretor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os diretores</SelectItem>
              {DIRETORES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterTema} onValueChange={setFilterTema}>
            <SelectTrigger className="w-44 rounded-lg border-gray-200"><SelectValue placeholder="Tema" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os temas</SelectItem>
              {TEMAS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40 rounded-lg border-gray-200"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {STATUS_INICIATIVA.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
            <Plus className="w-4 h-4" /> Nova Meta
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Carregando metas...</div>
      ) : view === "table" ? (
        <MetasTableView items={filtered} onUpdate={handleUpdate} onDelete={id => setDeleteId(id)} />
      ) : view === "cards" ? (
        <MetasCardsView items={filtered} />
      ) : (
        <MetasResumoView items={filtered} />
      )}

      <FullscreenTableModal open={fullscreen} onClose={() => setFullscreen(false)} title="Metas Diretoria 2026 — Visão Planilha">
        <MetasTableView items={filtered} onUpdate={handleUpdate} onDelete={id => setDeleteId(id)} />
      </FullscreenTableModal>

      <DeleteConfirmModal
        open={!!deleteId}
        label="esta meta"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}