import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Plus, LayoutGrid, List, Filter, TrendingUp, Clock,
  AlertTriangle, CheckCircle2, Briefcase, Users, Calendar, DollarSign
} from "lucide-react";
import NovoProjetoModal from "@/components/projetos/NovoProjetoModal";

const STATUS_COLOR = {
  "Ativo": "bg-green-100 text-green-700",
  "Em andamento": "bg-blue-100 text-blue-700",
  "Pausado": "bg-yellow-100 text-yellow-700",
  "Cancelado": "bg-red-100 text-red-700",
  "Não iniciado": "bg-gray-100 text-gray-600",
  "Concluído": "bg-purple-100 text-purple-700",
};

export default function Projetos() {
  const [projetos, setProjetos] = useState([]);
  const [parcelas, setParcelas] = useState([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroResponsavel, setFiltroResponsavel] = useState("todos");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [showNovo, setShowNovo] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.OrdemServico.list("-created_date", 200),
      base44.entities.Parcela.list("-created_date", 500),
    ]).then(([os, parc]) => {
      setProjetos(os);
      setParcelas(parc);
      setLoading(false);
    });
  }, []);

  const responsaveis = [...new Set(projetos.map(p => p.responsavel_tecnico).filter(Boolean))];

  const projetosFiltrados = projetos.filter(p => {
    const matchBusca = !busca || [p.cliente_nome, p.proposta_numero, p.natureza, p.responsavel_tecnico]
      .some(v => v?.toLowerCase().includes(busca.toLowerCase()));
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    const matchResp = filtroResponsavel === "todos" || p.responsavel_tecnico === filtroResponsavel;
    return matchBusca && matchStatus && matchResp;
  });

  const getParcelasOS = (osId) => parcelas.filter(p => p.os_id === osId);
  const getValorFaturado = (osId) => {
    return getParcelasOS(osId).filter(p => ["Faturada", "Recebida"].includes(p.status))
      .reduce((s, p) => s + (p.valor || 0), 0);
  };
  const getValorTotal = (osId) => getParcelasOS(osId).reduce((s, p) => s + (p.valor || 0), 0);

  // KPIs
  const totalAtivos = projetos.filter(p => p.status === "Ativo").length;
  const totalEmAndamento = projetos.filter(p => p.status !== "Cancelado" && p.status !== "Não iniciado").length;
  const receitaTotal = projetos.reduce((s, p) => s + getValorTotal(p.id), 0);
  const receitaRealizada = projetos.reduce((s, p) => s + getValorFaturado(p.id), 0);
  const atrasados = projetos.filter(p => {
    if (!p.prazo_previsto || p.status === "Cancelado") return false;
    return new Date(p.prazo_previsto) < new Date() && p.percentual_conclusao < 100;
  }).length;

  const fmt = (v) => v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Projetos</h1>
          <p className="text-slate-500 text-sm mt-1">Gestão completa de projetos em execução</p>
        </div>
        <Button onClick={() => setShowNovo(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Projeto
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalEmAndamento}</p>
                <p className="text-xs text-slate-500">Em execução</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-lg font-bold text-slate-800">{fmt(receitaRealizada)}</p>
                <p className="text-xs text-slate-500">Faturado / {fmt(receitaTotal)} total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-slate-800">{atrasados}</p>
                <p className="text-xs text-slate-500">Com atraso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-slate-800">{projetos.length}</p>
                <p className="text-xs text-slate-500">Total de projetos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input placeholder="Buscar projeto, cliente, responsável..." className="pl-9" value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="Ativo">Ativo</SelectItem>
            <SelectItem value="Não iniciado">Não iniciado</SelectItem>
            <SelectItem value="Pausado">Pausado</SelectItem>
            <SelectItem value="Cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroResponsavel} onValueChange={setFiltroResponsavel}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Responsável" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {responsaveis.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-1 border rounded-md p-1">
          <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-slate-100" : ""}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-slate-100" : ""}`}><List className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Lista de projetos */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projetosFiltrados.map(p => (
            <ProjetoCard key={p.id} projeto={p} valorFaturado={getValorFaturado(p.id)} valorTotal={getValorTotal(p.id)} />
          ))}
          {projetosFiltrados.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-400">Nenhum projeto encontrado.</div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {projetosFiltrados.map(p => (
            <ProjetoRow key={p.id} projeto={p} valorFaturado={getValorFaturado(p.id)} valorTotal={getValorTotal(p.id)} />
          ))}
          {projetosFiltrados.length === 0 && (
            <div className="text-center py-16 text-slate-400">Nenhum projeto encontrado.</div>
          )}
        </div>
      )}

      {showNovo && <NovoProjetoModal onClose={() => setShowNovo(false)} onSaved={() => { setShowNovo(false); window.location.reload(); }} />}
    </div>
  );
}

function ProjetoCard({ projeto, valorFaturado, valorTotal }) {
  const fmt = (v) => v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0";
  const atrasado = projeto.prazo_previsto && new Date(projeto.prazo_previsto) < new Date() && projeto.percentual_conclusao < 100;
  const progresso = projeto.percentual_conclusao || 0;

  return (
    <Link to={`/ProjetoDetalhe?id=${projeto.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border hover:border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-800 truncate">{projeto.cliente_nome || "—"}</p>
              <p className="text-xs text-slate-500 truncate">{projeto.natureza} · {projeto.proposta_numero || "—"}</p>
            </div>
            <Badge className={`text-xs shrink-0 ${STATUS_COLOR[projeto.status] || "bg-gray-100 text-gray-600"}`}>
              {projeto.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Progresso */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progresso</span>
              <span className={atrasado ? "text-red-500 font-medium" : ""}>{progresso}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${atrasado ? "bg-red-400" : progresso === 100 ? "bg-green-500" : "bg-blue-500"}`} style={{ width: `${progresso}%` }} />
            </div>
          </div>

          {/* Infos */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-400" />
              <span className="truncate">{projeto.responsavel_tecnico || "—"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span className={atrasado ? "text-red-500 font-medium" : ""}>
                {projeto.prazo_previsto ? new Date(projeto.prazo_previsto + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
              </span>
            </div>
          </div>

          {/* Financeiro */}
          {valorTotal > 0 && (
            <div className="bg-slate-50 rounded-lg p-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Faturado</span>
                <span className="font-medium text-green-600">{fmt(valorFaturado)}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-500">Total</span>
                <span className="font-medium">{fmt(valorTotal)}</span>
              </div>
            </div>
          )}
          {atrasado && (
            <div className="flex items-center gap-1 text-xs text-red-500">
              <AlertTriangle className="w-3 h-3" /> Prazo vencido
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function ProjetoRow({ projeto, valorFaturado, valorTotal }) {
  const fmt = (v) => v?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) ?? "R$ 0";
  const atrasado = projeto.prazo_previsto && new Date(projeto.prazo_previsto) < new Date() && projeto.percentual_conclusao < 100;
  const progresso = projeto.percentual_conclusao || 0;

  return (
    <Link to={`/ProjetoDetalhe?id=${projeto.id}`}>
      <Card className="hover:shadow-sm transition-shadow cursor-pointer border hover:border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <p className="font-medium text-slate-800">{projeto.cliente_nome || "—"}</p>
              <p className="text-xs text-slate-500">{projeto.natureza} · {projeto.proposta_numero || "—"}</p>
            </div>
            <Badge className={`text-xs ${STATUS_COLOR[projeto.status] || "bg-gray-100 text-gray-600"}`}>{projeto.status}</Badge>
            <div className="flex items-center gap-2 w-32">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                <div className={`h-full rounded-full ${atrasado ? "bg-red-400" : "bg-blue-500"}`} style={{ width: `${progresso}%` }} />
              </div>
              <span className="text-xs text-slate-500 w-8">{progresso}%</span>
            </div>
            <span className="text-xs text-slate-500 w-28 text-right">{projeto.responsavel_tecnico || "—"}</span>
            <span className={`text-xs w-24 text-right ${atrasado ? "text-red-500 font-medium" : "text-slate-500"}`}>
              {projeto.prazo_previsto ? new Date(projeto.prazo_previsto + "T00:00:00").toLocaleDateString("pt-BR") : "—"}
            </span>
            <span className="text-xs font-medium text-green-600 w-28 text-right">{fmt(valorFaturado)} / {fmt(valorTotal)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}