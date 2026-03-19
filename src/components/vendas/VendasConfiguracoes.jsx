import { useState } from "react";
import { GitBranch, Percent, Layers, Settings, Plus, Trash2, Save, Check } from "lucide-react";

const TABS = [
  { id: "etapas",        label: "Etapas do Pipeline", icon: GitBranch },
  { id: "probabilidades",label: "Probabilidades",      icon: Percent  },
  { id: "tipos",         label: "Tipos de Serviço",    icon: Layers   },
  { id: "parametros",    label: "Parâmetros",          icon: Settings },
];

const DEFAULT_ETAPAS = [
  { id: 1, nome: "Em elaboração", cor: "#60a5fa", ordem: 1 },
  { id: 2, nome: "Enviada",       cor: "#fbbf24", ordem: 2 },
  { id: 3, nome: "Ganha",         cor: "#10b981", ordem: 3 },
  { id: 4, nome: "Perdida",       cor: "#f87171", ordem: 4 },
  { id: 5, nome: "Caducada",      cor: "#94a3b8", ordem: 5 },
];

const DEFAULT_PROBS = [
  { etapa: "Em elaboração", prob: 20 },
  { etapa: "Enviada",       prob: 50 },
  { etapa: "Ganha",         prob: 100 },
  { etapa: "Perdida",       prob: 0 },
  { etapa: "Caducada",      prob: 0 },
];

const DEFAULT_TIPOS = [
  "Contábil - Laudo",
  "Contábil - Parecer",
  "Consultoria - Tributária",
  "Consultoria - Societária",
  "Consultoria - M&A",
  "Projetos Especiais",
  "Outros",
];

const DEFAULT_PARAMS = {
  moeda: "BRL",
  simbolo: "R$",
  followup_dias: 7,
  alerta_inatividade: 30,
  taxa_meta_conversao: 40,
  valor_meta_mensal: 0,
};

export default function VendasConfiguracoes() {
  const [tab, setTab] = useState("etapas");
  const [etapas, setEtapas] = useState(DEFAULT_ETAPAS);
  const [probs, setProbs] = useState(DEFAULT_PROBS);
  const [tipos, setTipos] = useState(DEFAULT_TIPOS);
  const [novoTipo, setNovoTipo] = useState("");
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações de Vendas</h1>
          <p className="text-sm text-slate-500 mt-1">Personalize o pipeline e os parâmetros comerciais</p>
        </div>
        <button onClick={showSaved}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            saved ? "bg-emerald-600 text-white" : "bg-[#1A4731] text-white hover:bg-[#245E40]"
          }`}>
          {saved ? <><Check size={15} /> Salvo!</> : <><Save size={15} /> Salvar</>}
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── Etapas do Pipeline ── */}
      {tab === "etapas" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Etapas do Pipeline</p>
              <p className="text-xs text-slate-400 mt-0.5">Defina as colunas e cores do funil de vendas</p>
            </div>
            <button
              onClick={() => setEtapas(prev => [...prev, { id: Date.now(), nome: "Nova Etapa", cor: "#a78bfa", ordem: prev.length + 1 }])}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1A4731] border border-[#1A4731]/20 bg-[#1A4731]/5 px-3 py-1.5 rounded-lg hover:bg-[#1A4731]/10 transition-colors">
              <Plus size={12} /> Nova Etapa
            </button>
          </div>
          <div className="p-6 space-y-3">
            {etapas.map((e) => (
              <div key={e.id} className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <div className="flex items-center gap-1 text-slate-300 cursor-grab select-none text-lg leading-none">⠿</div>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    value={e.nome}
                    onChange={ev => setEtapas(prev => prev.map(x => x.id === e.id ? { ...x, nome: ev.target.value } : x))}
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F47920] bg-white"
                    placeholder="Nome da etapa"
                  />
                  <div className="flex items-center gap-2">
                    <input type="color" value={e.cor}
                      onChange={ev => setEtapas(prev => prev.map(x => x.id === e.id ? { ...x, cor: ev.target.value } : x))}
                      className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white" />
                    <span className="text-xs text-slate-400 font-mono w-16">{e.cor}</span>
                  </div>
                  <div className="w-3 h-8 rounded-md flex-shrink-0" style={{ background: e.cor }} />
                </div>
                <button onClick={() => setEtapas(prev => prev.filter(x => x.id !== e.id))}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Probabilidades ── */}
      {tab === "probabilidades" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800">Probabilidades por Etapa</p>
            <p className="text-xs text-slate-400 mt-0.5">Defina a chance de conversão estimada para cada etapa do pipeline</p>
          </div>
          <div className="p-6 space-y-4">
            {probs.map((p, i) => (
              <div key={p.etapa} className="flex items-center gap-4">
                <span className="text-sm text-slate-700 w-40 flex-shrink-0">{p.etapa}</span>
                <input type="range" min={0} max={100} value={p.prob}
                  onChange={ev => setProbs(prev => prev.map((x, j) => j === i ? { ...x, prob: Number(ev.target.value) } : x))}
                  className="flex-1 accent-[#F47920]" />
                <div className="flex items-center gap-1 w-20">
                  <input type="number" min={0} max={100} value={p.prob}
                    onChange={ev => setProbs(prev => prev.map((x, j) => j === i ? { ...x, prob: Number(ev.target.value) } : x))}
                    className="w-14 border border-slate-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:border-[#F47920]" />
                  <span className="text-xs text-slate-400">%</span>
                </div>
                <div className="w-12 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    p.prob >= 75 ? "bg-emerald-50 text-emerald-700" :
                    p.prob >= 40 ? "bg-amber-50 text-amber-700" :
                    "bg-red-50 text-red-600"
                  }`}>{p.prob}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tipos de Serviço ── */}
      {tab === "tipos" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800">Tipos de Serviço</p>
            <p className="text-xs text-slate-400 mt-0.5">Padronize as categorias de serviço das propostas</p>
          </div>
          <div className="p-6 space-y-3">
            {tipos.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1A4731] flex-shrink-0" />
                <input value={t}
                  onChange={ev => setTipos(prev => prev.map((x, j) => j === i ? ev.target.value : x))}
                  className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F47920]" />
                <button onClick={() => setTipos(prev => prev.filter((_, j) => j !== i))}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={13} className="text-red-400" />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
              <input value={novoTipo} onChange={e => setNovoTipo(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && novoTipo.trim()) { setTipos(prev => [...prev, novoTipo.trim()]); setNovoTipo(""); } }}
                placeholder="Adicionar novo tipo..."
                className="flex-1 border border-dashed border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F47920] bg-slate-50" />
              <button
                onClick={() => { if (novoTipo.trim()) { setTipos(prev => [...prev, novoTipo.trim()]); setNovoTipo(""); } }}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#1A4731] border border-[#1A4731]/20 bg-[#1A4731]/5 px-3 py-2.5 rounded-xl hover:bg-[#1A4731]/10 transition-colors">
                <Plus size={12} /> Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Parâmetros ── */}
      {tab === "parametros" && (
        <div className="space-y-4">
          {/* Moeda */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-sm font-bold text-slate-800 mb-4">Configurações de Moeda</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Moeda (código)", field: "moeda", placeholder: "BRL" },
                { label: "Símbolo", field: "simbolo", placeholder: "R$" },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
                  <input value={params[field]} placeholder={placeholder}
                    onChange={e => setParams(p => ({ ...p, [field]: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F47920]" />
                </div>
              ))}
            </div>
          </div>

          {/* Regras */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-sm font-bold text-slate-800 mb-4">Regras Comerciais</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Alerta de follow-up (dias)", field: "followup_dias" },
                { label: "Alerta de inatividade (dias)", field: "alerta_inatividade" },
                { label: "Meta taxa de conversão (%)", field: "taxa_meta_conversao" },
                { label: "Meta de receita mensal (R$)", field: "valor_meta_mensal" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
                  <input type="number" value={params[field]}
                    onChange={e => setParams(p => ({ ...p, [field]: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#F47920]" />
                </div>
              ))}
            </div>
          </div>

          {/* Integrações futuras */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-slate-800">Integrações</p>
              <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Em breve</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {["Integrar com Projetos", "Integrar com Financeiro", "Notificações por Email", "Webhook de Alertas"].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-400 bg-slate-50 rounded-xl px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}