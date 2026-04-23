import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMes } from "./feriadosUtils";
import { getDiasUteisParaMes } from "./FeriadosModal";
import { CalendarDays, ArrowLeft } from "lucide-react";

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function NovoRateioForm({ onCancel, onSaved }) {
  const [mesRef, setMesRef] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [selecionadosSP, setSelecionadosSP] = useState([]);
  const [selecionadosRJ, setSelecionadosRJ] = useState([]);
  const [saving, setSaving] = useState(false);

  const [ano, mes] = mesRef.split("-").map(Number);
  const diasUteisSP = getDiasUteisParaMes(ano, mes, "SP");
  const diasUteisRJ = getDiasUteisParaMes(ano, mes, "RJ");

  useEffect(() => {
    base44.entities.ColaboradorCLT.list().then(data => {
      const ativos = data.filter(c => c.ativo !== false);
      setColaboradores(ativos);
      setSelecionadosSP(ativos.filter(c => c.unidade === "SP").map(c => c.id));
      setSelecionadosRJ(ativos.filter(c => c.unidade === "RJ").map(c => c.id));
    });
  }, []);

  const toggleSP = (id) => setSelecionadosSP(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleRJ = (id) => setSelecionadosRJ(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const colSP = colaboradores.filter(c => c.unidade === "SP");
  const colRJ = colaboradores.filter(c => c.unidade === "RJ");

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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1A4731]">Novo Rateio — Vale Refeição Caju</h1>
            <p className="text-sm text-gray-500 mt-0.5">Selecione o mês e confirme os colaboradores por unidade</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSalvar} disabled={saving} className="bg-[#1A4731] hover:bg-[#1A4731]/90">
            {saving ? "Salvando..." : "Salvar Rateio"}
          </Button>
        </div>
      </div>

      {/* Mês de referência */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Mês de Referência</label>
          <input
            type="month"
            value={mesRef}
            onChange={e => setMesRef(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1A4731]"
          />
        </div>
        <div className="text-base font-semibold text-gray-700 mt-4">{formatMes(mesRef)}</div>
      </div>

      {/* RJ */}
      <div className="bg-white border border-green-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 text-sm font-bold px-3">RJ</Badge>
            <span className="text-sm text-gray-600 font-medium">Rio de Janeiro</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full">
            <CalendarDays size={12} />
            <span>{diasUteisRJ} dias úteis</span>
          </div>
        </div>
        <div className="space-y-1 mb-4">
          {colRJ.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhum colaborador cadastrado</p>}
          {colRJ.map(c => (
            <label key={c.id} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-green-50 transition">
              <input
                type="checkbox"
                checked={selecionadosRJ.includes(c.id)}
                onChange={() => toggleRJ(c.id)}
                className="accent-green-600 w-4 h-4"
              />
              <span className="text-sm flex-1 text-gray-800">{c.nome}</span>
              <span className="text-sm font-medium text-gray-600">{fmt(c.valor_vr_diario * diasUteisRJ)}</span>
            </label>
          ))}
        </div>
        <div className="border-t border-green-100 pt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">{selecionadosRJ.length} de {colRJ.length} colaboradores selecionados</span>
          <span className="text-base font-bold text-green-700">{fmt(totalRJ)}</span>
        </div>
      </div>

      {/* SP */}
      <div className="bg-white border border-blue-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800 text-sm font-bold px-3">SP</Badge>
            <span className="text-sm text-gray-600 font-medium">São Paulo</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
            <CalendarDays size={12} />
            <span>{diasUteisSP} dias úteis</span>
          </div>
        </div>
        <div className="space-y-1 mb-4">
          {colSP.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Nenhum colaborador cadastrado</p>}
          {colSP.map(c => (
            <label key={c.id} className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg hover:bg-blue-50 transition">
              <input
                type="checkbox"
                checked={selecionadosSP.includes(c.id)}
                onChange={() => toggleSP(c.id)}
                className="accent-blue-600 w-4 h-4"
              />
              <span className="text-sm flex-1 text-gray-800">{c.nome}</span>
              <span className="text-sm font-medium text-gray-600">{fmt(c.valor_vr_diario * diasUteisSP)}</span>
            </label>
          ))}
        </div>
        <div className="border-t border-blue-100 pt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">{selecionadosSP.length} de {colSP.length} colaboradores selecionados</span>
          <span className="text-base font-bold text-blue-700">{fmt(totalSP)}</span>
        </div>
      </div>

      {/* Total geral */}
      <div className="bg-[#1A4731]/5 border border-[#1A4731]/20 rounded-xl p-5 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#1A4731]">Total Geral</span>
        <span className="text-xl font-bold text-[#1A4731]">{fmt(totalSP + totalRJ)}</span>
      </div>

      {/* Botões de ação (rodapé) */}
      <div className="flex justify-end gap-2 pb-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={handleSalvar} disabled={saving} className="bg-[#1A4731] hover:bg-[#1A4731]/90">
          {saving ? "Salvando..." : "Salvar Rateio"}
        </Button>
      </div>
    </div>
  );
}