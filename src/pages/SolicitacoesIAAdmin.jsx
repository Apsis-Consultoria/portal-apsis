import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, ExternalLink, Paperclip, ChevronDown, ChevronUp } from "lucide-react";

const SUPABASE_URL = "https://ybixbsfmxblaippubtvw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaXhic2ZteGJsYWlwcHVidHZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTEzMDgsImV4cCI6MjA5MDYyNzMwOH0.4F72hq_oSLw6BVHISLcGS_IdXeMowE-a7_zFGpAVVP4";

const STATUS_COLORS = {
  "Novo": "bg-blue-100 text-blue-700",
  "Em Análise": "bg-yellow-100 text-yellow-700",
  "Aprovado": "bg-green-100 text-green-700",
  "Em Desenvolvimento": "bg-purple-100 text-purple-700",
  "Concluído": "bg-emerald-100 text-emerald-700",
  "Rascunho": "bg-slate-100 text-slate-500",
};

const PRIORIDADE_COLORS = {
  "Baixa": "bg-green-100 text-green-700",
  "Média": "bg-yellow-100 text-yellow-700",
  "Alta": "bg-orange-100 text-orange-700",
  "Crítica": "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = ["Todos", "Novo", "Em Análise", "Aprovado", "Em Desenvolvimento", "Concluído", "Rascunho"];

export default function SolicitacoesIAAdmin() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [selected, setSelected] = useState(null);
  const [expandedIA, setExpandedIA] = useState(false);

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const fetchSolicitacoes = async () => {
    setLoading(true);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/solicitacoes_ia?order=data_criacao.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    const data = await res.json();
    setSolicitacoes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus) => {
    await fetch(`${SUPABASE_URL}/rest/v1/solicitacoes_ia?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ status: newStatus }),
    });
    setSolicitacoes(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    if (selected?.id === id) setSelected(prev => ({ ...prev, status: newStatus }));
  };

  const filtered = solicitacoes.filter(s => {
    const matchSearch = !search ||
      s.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      s.nome_usuario?.toLowerCase().includes(search.toLowerCase()) ||
      s.setor?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Todos" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Solicitações de IA — Painel de Controle</h1>
        <p className="text-slate-500 text-sm mt-1">Visualize e gerencie todas as solicitações enviadas pelo portal.</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-9" placeholder="Buscar por título, usuário ou setor..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Contadores */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.filter(s => s !== "Todos").map(s => {
          const count = solicitacoes.filter(x => x.status === s).length;
          return count > 0 ? (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "Todos" : s)}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${statusFilter === s ? "border-[#F47920] bg-[#F47920]/10 font-semibold" : "border-slate-200 bg-white"}`}>
              {s}: {count}
            </button>
          ) : null;
        })}
        <span className="text-xs text-slate-400 self-center ml-auto">{filtered.length} resultado(s)</span>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">Nenhuma solicitação encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Data</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Solicitante</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Título</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Prioridade</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id} onClick={() => { setSelected(s); setExpandedIA(false); }}
                    className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/40"}`}>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatDate(s.data_criacao)}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{s.nome_usuario}</div>
                      <div className="text-xs text-slate-400">{s.setor}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <span className="line-clamp-2 text-slate-700">{s.titulo}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.tipo_solicitacao}</td>
                    <td className="px-4 py-3">
                      <Badge className={PRIORIDADE_COLORS[s.prioridade] || ""}>{s.prioridade}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={STATUS_COLORS[s.status] || ""}>{s.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalhe */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-bold text-slate-800 pr-6">{selected.titulo}</DialogTitle>
                <div className="flex gap-2 flex-wrap mt-1">
                  <Badge className={PRIORIDADE_COLORS[selected.prioridade] || ""}>{selected.prioridade}</Badge>
                  <Badge className={STATUS_COLORS[selected.status] || ""}>{selected.status}</Badge>
                  <span className="text-xs text-slate-400 self-center">{formatDate(selected.data_criacao)}</span>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                {/* Solicitante */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 rounded-lg p-3 text-sm">
                  <div><span className="text-slate-400 block text-xs">Solicitante</span><span className="font-medium">{selected.nome_usuario}</span></div>
                  <div><span className="text-slate-400 block text-xs">Email</span><span>{selected.email}</span></div>
                  <div><span className="text-slate-400 block text-xs">Setor</span><span>{selected.setor}</span></div>
                  <div><span className="text-slate-400 block text-xs">Cargo</span><span>{selected.cargo || "—"}</span></div>
                  <div><span className="text-slate-400 block text-xs">Sistema/Área</span><span>{selected.sistema_area}</span></div>
                  <div><span className="text-slate-400 block text-xs">Tipo</span><span>{selected.tipo_solicitacao}</span></div>
                </div>

                {/* Conteúdo */}
                <div className="space-y-3">
                  <Section title="Descrição" content={selected.descricao} />
                  <Section title="Benefício Esperado" content={selected.beneficio} />
                  {selected.processo_atual && <Section title="Processo Atual" content={selected.processo_atual} />}
                  {selected.processo_desejado && <Section title="Processo Desejado" content={selected.processo_desejado} />}
                </div>

                {/* Sugestão IA */}
                {selected.sugestao_ia && (
                  <div className="border border-purple-100 bg-purple-50 rounded-lg p-3">
                    <button onClick={() => setExpandedIA(!expandedIA)}
                      className="flex items-center justify-between w-full text-sm font-semibold text-purple-700">
                      🤖 Sugestão da IA
                      {expandedIA ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {expandedIA && <p className="text-xs text-purple-700 mt-2 whitespace-pre-wrap">{selected.sugestao_ia}</p>}
                  </div>
                )}

                {/* Anexos */}
                {selected.anexos?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Anexos</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.anexos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 text-slate-600 transition-colors">
                          <Paperclip className="w-3 h-3" /> Arquivo {i + 1} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Alterar status */}
                <div className="border-t pt-4">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Alterar Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.filter(s => s !== "Todos").map(s => (
                      <button key={s} onClick={() => updateStatus(selected.id, s)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selected.status === s ? "bg-[#1A4731] text-white border-[#1A4731]" : "border-slate-200 hover:border-[#1A4731] hover:text-[#1A4731]"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, content }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-1">{title}</p>
      <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3">{content}</p>
    </div>
  );
}