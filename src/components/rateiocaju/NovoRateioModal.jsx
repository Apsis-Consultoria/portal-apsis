import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calcularDiasUteis, formatMes } from "./feriadosUtils";
import { CalendarDays, Users, Check } from "lucide-react";

export default function NovoRateioModal({ open, onClose, onSaved }) {
  const [mesRef, setMesRef] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [selecionadosSP, setSelecionadosSP] = useState([]);
  const [selecionadosRJ, setSelecionadosRJ] = useState([]);
  const [saving, setSaving] = useState(false);

  const [ano, mes] = mesRef.split("-").map(Number);
  const diasUteisSP = calcularDiasUteis(ano, mes, "SP");
  const diasUteisRJ = calcularDiasUteis(ano, mes, "RJ");

  useEffect(() => {
    if (open) {
      base44.entities.ColaboradorCLT.list().then(data => {
        setColaboradores(data.filter(c => c.ativo !== false));
        setSelecionadosSP(data.filter(c => (c.estado || c.unidade) === "SP").map(c => c.id));
        setSelecionadosRJ(data.filter(c => (c.estado || c.unidade) === "RJ").map(c => c.id));
      });
    }
  }, [open]);

  const toggleSP = (id) => setSelecionadosSP(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleRJ = (id) => setSelecionadosRJ(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const colSP = colaboradores.filter(c => (c.estado || c.unidade) === "SP");
  const colRJ = colaboradores.filter(c => (c.estado || c.unidade) === "RJ");

  const totalSP = colSP.filter(c => selecionadosSP.includes(c.id)).reduce((acc, c) => acc + (c.valor_vr_diario * diasUteisSP), 0);
  const totalRJ = colRJ.filter(c => selecionadosRJ.includes(c.id)).reduce((acc, c) => acc + (c.valor_vr_diario * diasUteisRJ), 0);

  const handleSalvar = async () => {
    setSaving(true);
    const colabSPData = colSP.filter(c => selecionadosSP.includes(c.id)).map(c => ({
      id: c.id, nome: c.nome, valor_diario: c.valor_vr_diario, total: c.valor_vr_diario * diasUteisSP
    }));
    const colabRJData = colRJ.filter(c => selecionadosRJ.includes(c.id)).map(c => ({
      id: c.id, nome: c.nome, valor_diario: c.valor_vr_diario, total: c.valor_vr_diario * diasUteisRJ
    }));

    await base44.entities.RateioCaju.create({
      mes_referencia: mesRef,
      mes_label: formatMes(mesRef),
      dias_uteis_sp: diasUteisSP,
      dias_uteis_rj: diasUteisRJ,
      colaboradores_sp: JSON.stringify(colabSPData),
      colaboradores_rj: JSON.stringify(colabRJData),
      total_sp: totalSP,
      total_rj: totalRJ,
      total_geral: totalSP + totalRJ,
      status: "Rascunho",
    });
    setSaving(false);
    onSaved();
    onClose();
  };

  const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Rateio — Vale Refeição Caju</DialogTitle>
        </DialogHeader>

        {/* Mês de referência */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Mês de Referência</label>
            <input
              type="month"
              value={mesRef}
              onChange={e => setMesRef(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4731]"
            />
          </div>
          <div className="text-sm text-gray-600 font-medium mt-4">{formatMes(mesRef)}</div>
        </div>

        {/* Boxes SP e RJ */}
        <div className="grid grid-cols-2 gap-4">
          {/* SP */}
          <div className="border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800 text-sm font-bold">SP</Badge>
                <span className="text-xs text-gray-500">São Paulo</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                <CalendarDays size={12} />
                <span>{diasUteisSP} dias úteis</span>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {colSP.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Nenhum colaborador cadastrado</p>}
              {colSP.map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition">
                  <input
                    type="checkbox"
                    checked={selecionadosSP.includes(c.id)}
                    onChange={() => toggleSP(c.id)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm flex-1">{c.nome}</span>
                  <span className="text-xs text-gray-500">{fmt(c.valor_vr_diario * diasUteisSP)}</span>
                </label>
              ))}
            </div>
            <div className="border-t border-blue-100 pt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">{selecionadosSP.length} colaboradores</span>
              <span className="text-sm font-bold text-blue-700">{fmt(totalSP)}</span>
            </div>
          </div>

          {/* RJ */}
          <div className="border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 text-sm font-bold">RJ</Badge>
                <span className="text-xs text-gray-500">Rio de Janeiro</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                <CalendarDays size={12} />
                <span>{diasUteisRJ} dias úteis</span>
              </div>
            </div>
            <div className="space-y-2 mb-3">
              {colRJ.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Nenhum colaborador cadastrado</p>}
              {colRJ.map(c => (
                <label key={c.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-green-50 transition">
                  <input
                    type="checkbox"
                    checked={selecionadosRJ.includes(c.id)}
                    onChange={() => toggleRJ(c.id)}
                    className="accent-green-600"
                  />
                  <span className="text-sm flex-1">{c.nome}</span>
                  <span className="text-xs text-gray-500">{fmt(c.valor_vr_diario * diasUteisRJ)}</span>
                </label>
              ))}
            </div>
            <div className="border-t border-green-100 pt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">{selecionadosRJ.length} colaboradores</span>
              <span className="text-sm font-bold text-green-700">{fmt(totalRJ)}</span>
            </div>
          </div>
        </div>

        {/* Total geral */}
        <div className="mt-4 p-4 bg-[#1A4731]/5 rounded-xl flex items-center justify-between">
          <span className="text-sm font-semibold text-[#1A4731]">Total Geral</span>
          <span className="text-lg font-bold text-[#1A4731]">{fmt(totalSP + totalRJ)}</span>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={saving} className="bg-[#1A4731] hover:bg-[#1A4731]/90">
            {saving ? "Salvando..." : "Salvar Rateio"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}