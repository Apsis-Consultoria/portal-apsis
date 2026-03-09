import MetricTableComponent from "@/components/dashboards/MetricTableComponent";

export default function ContasApagarTable() {
  const tableRows = [
    { label: "Vencidas", data: ["15", "8", "12", "5", "12", "40"] },
    { label: "A vencer (0-30 dias)", data: ["45", "38", "42", "40", "41", "165"] },
    { label: "A vencer (31-60 dias)", data: ["28", "35", "30", "32", "31", "125"] },
    { label: "A vencer (61+ dias)", data: ["22", "19", "25", "23", "23", "89"] }
  ];

  const valueRows = [
    { label: "Total Vencidas", data: ["R$ 125K", "R$ 95K", "R$ 110K", "R$ 75K", "R$ 101K", "R$ 405K"] },
    { label: "Total a Pagar", data: ["R$ 850K", "R$ 920K", "R$ 880K", "R$ 900K", "R$ 890K", "R$ 3.55M"] },
    { label: "Diferença de Prazo", data: ["32%", "28%", "35%", "30%", "32%", "31%"] }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1A2B1F] mb-2">Contas a Pagar</h2>
          <p className="text-sm text-[#5C7060]">Acompanhamento de obrigações e prazos de pagamento</p>
        </div>

        <h3 className="text-base font-semibold text-[#1A2B1F] mb-6 mt-8">Quantidade de Títulos por Status</h3>
        <MetricTableComponent title="Status" rows={tableRows} />

        <h3 className="text-base font-semibold text-[#1A2B1F] mb-6 mt-8">Valores por Período</h3>
        <MetricTableComponent title="Período" rows={valueRows} />
      </div>
    </div>
  );
}