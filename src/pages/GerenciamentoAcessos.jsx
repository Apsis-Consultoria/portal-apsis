import { useState, useEffect } from "react";
import { colaboradoresService } from "@/lib/supabaseColaboradores";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock, ChevronDown, ChevronUp, Search, Save
} from "lucide-react";

const AREAS_DISPONIVEIS = [
  "Contábil",
  "Consultoria",
  "Tributária",
  "Societária",
  "M&A",
  "Projetos Especiais",
  "Outros"
];

const CARGOS_DISPONIVEIS = [
  "Analista",
  "Coordenador",
  "Gerente",
  "Diretor",
  "Partner",
  "Estagiário"
];

const MODULOS_ACESSO = {
  "Contábil": ["Dashboard", "Relatórios", "Auditoria", "Documentos", "Clientes"],
  "Consultoria": ["Projetos", "Propostas", "Faturamento", "Timeline", "Equipe"],
  "Tributária": ["Conformidade", "Planejamento", "Operações", "Consultas", "Alertas"],
  "Societária": ["Contratos", "Acionistas", "Governança", "Documentos", "Reuniões"],
  "M&A": ["Due Diligence", "Integração", "Análise", "Comunicação", "Valuation"],
  "Projetos Especiais": ["Gestão", "Timeline", "Budget", "Riscos", "Comunicação"],
  "Outros": ["Painel", "Relatórios", "Integrações", "Configurações"]
};

export default function GerenciamentoAcessos() {
  const [colaboradores, setColaboradores] = useState([]);
  const [acessos, setAcessos] = useState({});
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [areaExpandida, setAreaExpandida] = useState({});
  const [cargoFiltro, setCargoFiltro] = useState("Todos");

  useEffect(() => {
    setLoading(true);
    colaboradoresService.list().then(data => {
      const ativos = (data || []).filter(c => c.ativo !== false);
      setColaboradores(ativos);
      // Carregar acessos do localStorage ou criar vazio
      const saved = localStorage.getItem("acessos_colaboradores");
      setAcessos(saved ? JSON.parse(saved) : {});
      setLoading(false);
    });
  }, []);

  const saveAcessos = (newAcessos) => {
    setAcessos(newAcessos);
    localStorage.setItem("acessos_colaboradores", JSON.stringify(newAcessos));
  };

  const toggleAcesso = (colabId, modulo) => {
    const acessosColab = acessos[colabId] || [];
    const updated = acessosColab.includes(modulo)
      ? acessosColab.filter(m => m !== modulo)
      : [...acessosColab, modulo];
    saveAcessos({ ...acessos, [colabId]: updated });
  };

  const toggleAreaExpandida = (area) => {
    setAreaExpandida(prev => ({ ...prev, [area]: !prev[area] }));
  };

  // Agrupar por área
  const colabsPorArea = AREAS_DISPONIVEIS.map(area => ({
    area,
    colaboradores: colaboradores.filter(c => {
      const nomeOk = !busca || (c.nome || "").toLowerCase().includes(busca.toLowerCase());
      const cargoOk = cargoFiltro === "Todos" || c.cargo === cargoFiltro;
      return c.area === area && nomeOk && cargoOk;
    })
  })).filter(g => g.colaboradores.length > 0);

  const cargosUnicos = ["Todos", ...new Set(colaboradores.map(c => c.cargo).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-2 text-slate-400">
        <div className="w-5 h-5 border-2 border-slate-200 border-t-[#1A4731] rounded-full animate-spin" />
        <span className="text-sm">Carregando colaboradores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1A4731]">Gerenciamento de Acessos</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure acessos por área e cargo.
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar colaborador..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#1A4731] bg-slate-50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {cargosUnicos.map(cargo => (
            <button
              key={cargo}
              onClick={() => setCargoFiltro(cargo)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                cargoFiltro === cargo
                  ? "bg-[#1A4731] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cargo}
            </button>
          ))}
        </div>
      </div>

      {/* Lista por área */}
      <div className="space-y-3">
        {colabsPorArea.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">Nenhum colaborador encontrado.</div>
        )}
        {colabsPorArea.map(({ area, colaboradores: colabs }) => {
          const isExpanded = !!areaExpandida[area];
          return (
            <div key={area} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header da área */}
              <button
                onClick={() => toggleAreaExpandida(area)}
                className="w-full px-5 py-3 flex items-center gap-3 bg-slate-50 hover:bg-slate-100 transition"
              >
                <Badge className="bg-[#1A4731] text-white font-bold px-3">{area}</Badge>
                <span className="text-xs text-slate-500 font-medium">{colabs.length} colaborador{colabs.length !== 1 ? "es" : ""}</span>
                <span className="ml-auto text-slate-400">
                  {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </span>
              </button>

              {/* Colaboradores da área */}
              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {colabs.map(colab => {
                    const modulosDaArea = MODULOS_ACESSO[area] || [];
                    const acessosColab = acessos[colab.id] || [];
                    return (
                      <div key={colab.id} className="p-4">
                        {/* Info colaborador */}
                        <div className="flex items-center gap-3 mb-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{colab.nome}</p>
                            <p className="text-xs text-slate-500">{colab.cargo || "Sem cargo"}</p>
                          </div>
                        </div>

                        {/* Módulos de acesso */}
                        <div className="flex flex-wrap gap-2 ml-0">
                          {modulosDaArea.map(modulo => (
                            <button
                              key={modulo}
                              onClick={() => toggleAcesso(colab.id, modulo)}
                              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                                acessosColab.includes(modulo)
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              <Lock size={12} />
                              {modulo}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer com botão salvar */}
      <div className="flex justify-end gap-2 sticky bottom-6">
        <Button
          onClick={() => {
            alert("Acessos salvos com sucesso!");
          }}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Save size={16} />
          Salvar Acessos
        </Button>
      </div>
    </div>
  );
}