import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Trash2, Plus } from "lucide-react";
import { getDiasUteisNoIntervalo } from "./feriadosUtils";

const UNIDADE_CONFIG = {
  RJ:     { badgeCls: "bg-green-100 text-green-800" },
  SP:     { badgeCls: "bg-blue-100 text-blue-800" },
  Carbon: { badgeCls: "bg-teal-100 text-teal-800" },
  REDD:   { badgeCls: "bg-purple-100 text-purple-800" },
};

export default function FeriasColaboradorModal({ open, onClose, colaboradores, ferias, onFeriasChange, ano, mes }) {
  const [periodoTemp, setPeriodoTemp] = useState({ inicio: "", fim: "" });
  const [selectedColab, setSelectedColab] = useState(null);

  const handleAddPeriodo = () => {
    if (!selectedColab || !periodoTemp.inicio || !periodoTemp.fim) return;
    if (periodoTemp.fim < periodoTemp.inicio) return;

    const atual = ferias[selectedColab] || [];
    onFeriasChange(selectedColab, [...atual, { inicio: periodoTemp.inicio, fim: periodoTemp.fim }]);
    setPeriodoTemp({ inicio: "", fim: "" });
  };

  const handleRemove = (colaboradorId, idx) => {
    const atual = ferias[colaboradorId] || [];
    onFeriasChange(colaboradorId, atual.filter((_, i) => i !== idx));
  };

  // Dias úteis de férias de um colaborador no mês
  const calcDiasFerias = (colaboradorId) => {
    const colab = colaboradores.find(c => c.id === colaboradorId);
    const estado = colab?.unidade === "SP" ? "SP" : "RJ";
    const periodos = ferias[colaboradorId] || [];
    return periodos.reduce((acc, p) => acc + getDiasUteisNoIntervalo(p.inicio, p.fim, ano, mes, estado), 0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1A4731]">Férias Programadas dos Colaboradores</DialogTitle>
        </DialogHeader>

        {/* Adicionar período */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3">Adicionar período de férias</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Colaborador</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4731]"
                value={selectedColab || ""}
                onChange={e => setSelectedColab(e.target.value)}
              >
                <option value="">Selecione...</option>
                {colaboradores.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} ({c.unidade})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Data início</label>
              <input
                type="date"
                value={periodoTemp.inicio}
                onChange={e => setPeriodoTemp(p => ({ ...p, inicio: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4731]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Data fim</label>
              <input
                type="date"
                value={periodoTemp.fim}
                min={periodoTemp.inicio}
                onChange={e => setPeriodoTemp(p => ({ ...p, fim: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4731]"
              />
            </div>
            <Button
              onClick={handleAddPeriodo}
              disabled={!selectedColab || !periodoTemp.inicio || !periodoTemp.fim}
              className="bg-[#1A4731] hover:bg-[#1A4731]/90 gap-1"
              size="sm"
            >
              <Plus size={14} /> Adicionar
            </Button>
          </div>
        </div>

        {/* Lista de férias por colaborador */}
        <div className="space-y-3 mt-2">
          {colaboradores.map(c => {
            const periodos = ferias[c.id] || [];
            const dias = calcDiasFerias(c.id);
            const cfg = UNIDADE_CONFIG[c.unidade] || UNIDADE_CONFIG.RJ;
            return (
              <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${cfg.badgeCls} text-xs`}>{c.unidade}</Badge>
                  <span className="text-sm font-medium text-gray-800">{c.nome}</span>
                  {c.area && <span className="text-xs text-gray-400">— {c.area}</span>}
                  {dias > 0 && (
                    <span className="ml-auto text-xs text-orange-600 font-semibold flex items-center gap-1">
                      <CalendarDays size={12} /> {dias} dia(s) de férias no mês
                    </span>
                  )}
                </div>
                {periodos.length === 0 ? (
                  <p className="text-xs text-gray-400">Nenhum período cadastrado</p>
                ) : (
                  <div className="space-y-1">
                    {periodos.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-lg px-3 py-1.5">
                        <CalendarDays size={13} className="text-orange-400" />
                        <span className="text-xs text-gray-700">{p.inicio} → {p.fim}</span>
                        <button
                          onClick={() => handleRemove(c.id, idx)}
                          className="ml-auto text-red-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-2">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}