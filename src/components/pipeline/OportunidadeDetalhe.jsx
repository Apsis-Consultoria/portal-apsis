import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  X, User, Building2, Tag, Clock, Send, ChevronRight,
  Sparkles, CheckCircle2, ArrowRight, FileText, MessageSquare, BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_STYLES = {
  "Aberta":     { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  "Em análise": { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  "Encerrada":  { bg: "bg-slate-100", text: "text-slate-500",  border: "border-slate-200"  },
};

function parseLog(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return [{ timestamp: null, user: "Sistema", content: raw }]; }
}

function serializeLog(entries) {
  return JSON.stringify(entries);
}

const TABS = [
  { id: "visao", label: "Visão Geral", icon: BarChart3 },
  { id: "observacoes", label: "Observações", icon: MessageSquare },
  { id: "proposta", label: "Proposta", icon: FileText },
  { id: "conversao", label: "Conversão", icon: Sparkles },
];

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex flex-col gap-0.5 py-3 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-[#F47920]" : "text-slate-800"}`}>
        {value || <span className="text-slate-300 font-normal">—</span>}
      </span>
    </div>
  );
}

export default function OportunidadeDetalhe({ oap, onClose, onReload }) {
  const [tab, setTab] = useState("visao");
  const [logEntries, setLogEntries] = useState([]);
  const [novaObs, setNovaObs] = useState("");
  const [savingObs, setSavingObs] = useState(false);
  const [converting, setConverting] = useState(false);
  const [converted, setConverted] = useState(false);
  const [userName, setUserName] = useState("Usuário");
  const logEndRef = useRef(null);

  // Proposta fields (armazenados no próprio OAP ou campos extras)
  const [proposta, setProposta] = useState({
    valor: oap.valor || "",
    prazo: oap.prazo || "",
    probabilidade: oap.probabilidade || "",
    descricao: oap.descricao || oap.observacoes_proposta || "",
  });
  const [savingProp, setSavingProp] = useState(false);

  useEffect(() => {
    setLogEntries(parseLog(oap.observacoes));
    setConverted(!!oap.convertida_ap);
    base44.auth.me().then(u => { if (u?.full_name) setUserName(u.full_name); }).catch(() => {});
  }, [oap]);

  useEffect(() => {
    if (tab === "observacoes") {
      setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [tab, logEntries]);

  const adicionarObservacao = async () => {
    if (!novaObs.trim()) return;
    setSavingObs(true);
    const entry = {
      timestamp: new Date().toISOString(),
      user: userName,
      content: novaObs.trim(),
    };
    const updated = [...logEntries, entry];
    await base44.entities.OAP.update(oap.id, { observacoes: serializeLog(updated) });
    setLogEntries(updated);
    setNovaObs("");
    setSavingObs(false);
    onReload();
  };

  const salvarProposta = async () => {
    setSavingProp(true);
    await base44.entities.OAP.update(oap.id, {
      valor: proposta.valor ? Number(proposta.valor) : undefined,
      prazo: proposta.prazo || undefined,
      probabilidade: proposta.probabilidade ? Number(proposta.probabilidade) : undefined,
    });
    setSavingProp(false);
    onReload();
  };

  const converterEmProjeto = async () => {
    if (!confirm("Criar um projeto vinculado a esta oportunidade?")) return;
    setConverting(true);
    await base44.entities.OrdemServico.create({
      proposta_id: oap.id,
      cliente_nome: oap.cliente_nome,
      responsavel_tecnico: oap.responsavel || "",
      gerente_projeto: oap.responsavel || "",
      valor_projeto: oap.valor || 0,
      natureza: oap.natureza,
      nome_projeto: `Projeto - ${oap.cliente_nome}`,
      status: "Não iniciado",
    });
    await base44.entities.OAP.update(oap.id, { convertida_ap: true });
    setConverted(true);
    setConverting(false);
    onReload();
  };

  const fmt = (v) =>
    v ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v) : "—";

  const statusStyle = STATUS_STYLES[oap.status] || STATUS_STYLES["Aberta"];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-[#1A4731] to-[#245E40]">
          <div className="flex-1 min-w-0">
            <p className="text-[#F47920] text-xs font-bold uppercase tracking-widest mb-1">Detalhe da Oportunidade</p>
            <h2 className="text-white font-bold text-lg leading-tight truncate">{oap.cliente_nome || "—"}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                {oap.status}
              </span>
              <span className="text-white/50 text-xs">{oap.natureza}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-2 mt-0.5">
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-all border-b-2 ${
                tab === id
                  ? "border-[#F47920] text-[#F47920] bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── VISÃO GERAL ── */}
          {tab === "visao" && (
            <div className="p-5">
              <div className="grid grid-cols-1 gap-0 divide-y divide-slate-100 bg-white rounded-xl border border-slate-100 px-4">
                <InfoRow label="Cliente" value={oap.cliente_nome} />
                <InfoRow label="Natureza" value={oap.natureza} />
                <InfoRow label="Responsável" value={oap.responsavel} />
                <InfoRow label="Status" value={oap.status} />
                <InfoRow label="Valor" value={fmt(oap.valor)} highlight />
                <InfoRow label="Prazo" value={oap.prazo ? format(new Date(oap.prazo + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR }) : null} />
                <InfoRow label="Probabilidade" value={oap.probabilidade ? `${oap.probabilidade}%` : null} />
              </div>

              {/* Convertida badge */}
              {converted && (
                <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">Oportunidade convertida em projeto</span>
                </div>
              )}

              <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Criado em</p>
                <p className="text-sm text-slate-700">
                  {oap.created_date ? format(new Date(oap.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "—"}
                </p>
              </div>
            </div>
          )}

          {/* ── OBSERVAÇÕES ── */}
          {tab === "observacoes" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {logEntries.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-300">
                    <MessageSquare size={32} />
                    <p className="text-sm text-slate-400">Nenhuma observação ainda</p>
                  </div>
                )}
                {logEntries.map((entry, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-[#1A4731] flex items-center justify-center flex-shrink-0">
                        <User size={10} className="text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{entry.user}</span>
                      {entry.timestamp && (
                        <span className="text-[10px] text-slate-400 ml-auto flex items-center gap-1">
                          <Clock size={9} />
                          {format(new Date(entry.timestamp), "dd/MM/yyyy 'às' HH:mm")}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>

              {/* Input nova obs */}
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <textarea
                  rows={3}
                  value={novaObs}
                  onChange={e => setNovaObs(e.target.value)}
                  placeholder="Escreva uma observação..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-[#F47920] bg-white"
                  onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) adicionarObservacao(); }}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">Ctrl+Enter para enviar</span>
                  <button
                    onClick={adicionarObservacao}
                    disabled={savingObs || !novaObs.trim()}
                    className="flex items-center gap-1.5 bg-[#1A4731] text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-[#245E40] disabled:opacity-50 transition-colors">
                    <Send size={11} />
                    {savingObs ? "Salvando..." : "Adicionar"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── PROPOSTA ── */}
          {tab === "proposta" && (
            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-500">Dados financeiros e prazo da oportunidade.</p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Valor Estimado (R$)</label>
                  <input type="number"
                    value={proposta.valor}
                    onChange={e => setProposta(p => ({ ...p, valor: e.target.value }))}
                    placeholder="0"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F47920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Prazo Previsto</label>
                  <input type="date"
                    value={proposta.prazo}
                    onChange={e => setProposta(p => ({ ...p, prazo: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F47920]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Probabilidade de Fechamento (%)</label>
                  <input type="number" min={0} max={100}
                    value={proposta.probabilidade}
                    onChange={e => setProposta(p => ({ ...p, probabilidade: e.target.value }))}
                    placeholder="0–100"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F47920]"
                  />
                </div>
              </div>

              <button onClick={salvarProposta} disabled={savingProp}
                className="w-full bg-[#1A4731] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#245E40] disabled:opacity-60 transition-colors">
                {savingProp ? "Salvando..." : "Salvar Proposta"}
              </button>
            </div>
          )}

          {/* ── CONVERSÃO ── */}
          {tab === "conversao" && (
            <div className="p-5 space-y-5">
              {converted ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-emerald-700">Oportunidade Convertida!</p>
                    <p className="text-sm text-slate-500 mt-1">Um projeto foi criado para esta oportunidade.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Dados que serão vinculados ao projeto:</p>
                    <div className="space-y-2">
                      {[
                        { icon: Building2, label: "Cliente", value: oap.cliente_nome },
                        { icon: Tag, label: "Natureza", value: oap.natureza },
                        { icon: User, label: "Responsável", value: oap.responsavel },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                            <Icon size={12} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wide">{label}</p>
                            <p className="text-xs font-semibold text-slate-700">{value || "—"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                    <ArrowRight size={14} className="text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700">Um novo projeto será criado automaticamente em <strong>Projetos → Lista de Projetos</strong>.</p>
                  </div>

                  <button
                    onClick={converterEmProjeto}
                    disabled={converting}
                    className="w-full flex items-center justify-center gap-2 bg-[#F47920] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#d96a18] disabled:opacity-60 transition-colors shadow-md shadow-orange-200">
                    <Sparkles size={15} />
                    {converting ? "Convertendo..." : "Converter em Projeto"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}