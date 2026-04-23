import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const UNIDADE_BADGE = {
  RJ:     "bg-green-100 text-green-800",
  SP:     "bg-blue-100 text-blue-800",
  Carbon: "bg-teal-100 text-teal-800",
  REDD:   "bg-purple-100 text-purple-800",
};

const STORAGE_KEY = "ferias_programadas_caju";

export function loadFeriasProgramadas() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveFeriasProgramadas(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function FeriasProgramadasModal({ open, onClose }) {
  const [colaboradores, setColaboradores] = useState([]);
  const [ferias, setFerias] = useState({}); // { [colaboradorId]: [{inicio, fim}] }
  const [adicionando, setAdicionando] = useState(null); // colaboradorId que está adicionando
  const [novoInicio, setNovoInicio] = useState("");
  const [novoFim, setNovoFim] = useState("");

  useEffect(() => {
    if (open) {
      base44.entities.ColaboradorCLT.list().then(data => {
        setColaboradores(data.filter(c => c.ativo !== false));
      });
      setFerias(loadFeriasProgramadas());
    }
  }, [open]);

  const handleAdd = (id) => {
    if (!novoInicio || !novoFim || novoFim < novoInicio) return;
    const atual = ferias[id] || [];
    const updated = { ...ferias, [id]: [...atual, { inicio: novoInicio, fim: novoFim }] };
    setFerias(updated);
    saveFeriasProgramadas(updated);
    setAdicionando(null);
    setNovoInicio("");
    setNovoFim("");
  };

  const handleRemove = (id, idx) => {
    const atual = ferias[id] || [];
    const updated = { ...ferias, [id]: atual.filter((_, i) => i !== idx) };
    setFerias(updated);
    saveFeriasProgramadas(updated);
  };

  const handleStartAdd = (id) => {
    setAdicionando(id);
    setNovoInicio("");
    setNovoFim("");
  };

  const totalPeriodos = Object.values(ferias).reduce((acc, arr) => acc + (arr?.length || 0), 0);

  // Agrupar por unidade
  const porUnidade = ["RJ", "SP", "Carbon", "REDD"].map(u => ({
    unidade: u,
    colabs: colaboradores.filter(c => c.unidade === u),
  })).filter(g => g.colabs.length > 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays size={18} className="text-orange-500" />
            Férias Programadas
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-0.5">
            Cadastre períodos de férias por colaborador. Esses dados serão aplicados automaticamente ao criar um novo rateio.
          </p>
        </DialogHeader>

        {totalPeriodos > 0 && (
          <div className="bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 text-xs text-orange-700 flex items-center gap-2">
            <CalendarDays size={13} />
            {totalPeriodos} período(s) programado(s) — serão aplicados no próximo rateio
          </div>
        )}

        <div className="space-y-5 mt-2">
          {porUnidade.map(({ unidade, colabs }) => (
            <div key={unidade}>
              <Badge className={`${UNIDADE_BADGE[unidade]} text-xs font-bold mb-3 px-3`}>{unidade}</Badge>
              <div className="space-y-2">
                {colabs.map(c => {
                  const periodos = ferias[c.id] || [];
                  const isAdding = adicionando === c.id;
                  return (
                    <div key={c.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{c.nome}</span>
                          {c.area && <span className="text-xs text-gray-400 ml-2">{c.area}</span>}
                        </div>
                        <button
                          onClick={() => handleStartAdd(c.id)}
                          className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-700 hover:bg-orange-50 px-2 py-1 rounded-lg transition"
                        >
                          <Plus size={12} />
                          Adicionar período
                        </button>
                      </div>

                      {/* Períodos existentes */}
                      {periodos.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {periodos.map((p, idx) => (
                            <span key={idx} className="flex items-center gap-1.5 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md px-2 py-1">
                              <CalendarDays size={10} />
                              {p.inicio} → {p.fim}
                              <button
                                onClick={() => handleRemove(c.id, idx)}
                                className="ml-0.5 text-red-400 hover:text-red-600"
                              >
                                <Trash2 size={10} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Formulário inline */}
                      {isAdding && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <input
                            type="date"
                            value={novoInicio}
                            onChange={e => setNovoInicio(e.target.value)}
                            className="border border-orange-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-orange-400"
                          />
                          <span className="text-xs text-gray-400">até</span>
                          <input
                            type="date"
                            value={novoFim}
                            min={novoInicio}
                            onChange={e => setNovoFim(e.target.value)}
                            className="border border-orange-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-orange-400"
                          />
                          <button
                            onClick={() => handleAdd(c.id)}
                            disabled={!novoInicio || !novoFim}
                            className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1 rounded-lg disabled:opacity-40 transition"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={() => { setAdicionando(null); setNovoInicio(""); setNovoFim(""); }}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Cancelar
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose} className="bg-[#1A4731] hover:bg-[#1A4731]/90">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}