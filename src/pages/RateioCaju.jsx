import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Settings, TrendingUp, MapPin, CalendarDays, ChevronRight } from "lucide-react";

import ColaboradoresCLTModal from "@/components/rateiocaju/ColaboradoresCLTModal";
import NovoRateioForm from "@/components/rateiocaju/NovoRateioForm";
import FeriadosModal from "@/components/rateiocaju/FeriadosModal";
import { formatMes } from "@/components/rateiocaju/feriadosUtils";

const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function RateioCaju() {
  const [rateios, setRateios] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCLTModal, setShowCLTModal] = useState(false);
  const [showFeriados, setShowFeriados] = useState(false);
  const [criandoRateio, setCriandoRateio] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const [r, c] = await Promise.all([
      base44.entities.RateioCaju.list("-created_date"),
      base44.entities.ColaboradorCLT.list(),
    ]);
    setRateios(r);
    setColaboradores(c.filter(c => c.ativo !== false));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const totalSP = colaboradores.filter(c => c.unidade === "SP").length;
  const totalRJ = colaboradores.filter(c => c.unidade === "RJ").length;
  const totalCLT = colaboradores.length;
  const valoresMensais = rateios.map(r => r.total_geral || 0);
  const mediaMensal = valoresMensais.length > 0 ? valoresMensais.reduce((a, b) => a + b, 0) / valoresMensais.length : 0;
  const vrPorPessoa = colaboradores.length > 0
    ? colaboradores.reduce((acc, c) => acc + (c.valor_vr_diario || 0), 0) / colaboradores.length
    : 0;

  // Tela de criação de rateio (inline, substitui o conteúdo da página)
  if (criandoRateio) {
    return (
      <NovoRateioForm
        onCancel={() => setCriandoRateio(false)}
        onSaved={() => { setCriandoRateio(false); fetchData(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A4731]">Rateio Caju — Vale Refeição</h1>
          <p className="text-sm text-gray-500 mt-0.5">Distribuição de VR por unidade e mês de referência</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFeriados(true)} className="gap-2 text-sm">
            <CalendarDays size={15} />
            Feriados SP/RJ
          </Button>
          <Button variant="outline" onClick={() => setShowCLTModal(true)} className="gap-2 text-sm">
            <Settings size={15} />
            Gerenciar Colaboradores CLT
          </Button>
          <Button onClick={() => setCriandoRateio(true)} className="bg-[#1A4731] hover:bg-[#1A4731]/90 gap-2 text-sm">
            <Plus size={15} />
            Novo Rateio
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#1A4731]/10 flex items-center justify-center">
              <TrendingUp size={16} className="text-[#1A4731]" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Média Mensal</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{fmt(mediaMensal)}</p>
          <p className="text-xs text-gray-400 mt-1">{rateios.length} rateios realizados</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <CalendarDays size={16} className="text-orange-500" />
            </div>
            <span className="text-xs text-gray-500 font-medium">VR Médio/dia</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{fmt(vrPorPessoa)}</p>
          <p className="text-xs text-gray-400 mt-1">média por colaborador</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Users size={16} className="text-blue-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Total CLT</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{totalCLT}</p>
          <p className="text-xs text-gray-400 mt-1">recebem Vale Refeição</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <MapPin size={16} className="text-green-600" />
            </div>
            <span className="text-xs text-gray-500 font-medium">Por Unidade</span>
          </div>
          <div className="flex gap-3 mt-1">
            <div>
              <p className="text-lg font-bold text-blue-700">{totalSP}</p>
              <p className="text-xs text-gray-400">SP</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="text-lg font-bold text-green-700">{totalRJ}</p>
              <p className="text-xs text-gray-400">RJ</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Rateios */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Histórico de Rateios</h2>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-gray-400">Carregando...</div>
        ) : rateios.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500 text-sm">Nenhum rateio criado ainda.</p>
            <p className="text-gray-400 text-xs mt-1">Clique em "Novo Rateio" para começar.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {rateios.map(r => (
              <div key={r.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition">
                <div className="w-10 h-10 rounded-lg bg-[#1A4731]/10 flex items-center justify-center flex-shrink-0">
                  <CalendarDays size={18} className="text-[#1A4731]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{r.mes_label || formatMes(r.mes_referencia)}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
                    <span className="text-blue-600">{r.dias_uteis_sp} dias úteis SP</span>
                    <span>•</span>
                    <span className="text-green-600">{r.dias_uteis_rj} dias úteis RJ</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex gap-4 text-xs text-gray-500 mb-1">
                    <span>SP: {fmt(r.total_sp)}</span>
                    <span>RJ: {fmt(r.total_rj)}</span>
                  </div>
                  <p className="text-sm font-bold text-[#1A4731]">{fmt(r.total_geral)}</p>
                </div>
                <Badge className={r.status === "Finalizado" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {r.status}
                </Badge>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      <ColaboradoresCLTModal open={showCLTModal} onClose={() => setShowCLTModal(false)} />
      <FeriadosModal open={showFeriados} onClose={() => setShowFeriados(false)} />
    </div>
  );
}