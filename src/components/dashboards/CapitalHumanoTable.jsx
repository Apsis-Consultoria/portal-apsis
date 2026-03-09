import MetricTableComponent from "@/components/dashboards/MetricTableComponent";

export default function CapitalHumanoTable() {
  const tableRows = [
    { label: "HR de Treinamento Time e Lideranças", data: ["4,6", "7,6", "0", "0", "45", "12,2"] },
    { label: "Rotatividade Geral (Admissões+Demissões)", data: ["5%", "16%", "5%", "6%", "15%", "29%"] },
    { label: "Desligamentos Ativos", data: ["5%", "3%", "3%", "4%", "10%", "15%"] },
    { label: "% de Mulheres na área", data: ["40%", "40%", "40%", "37%", "40%", "39%"] }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1A2B1F] mb-2">Capital Humano</h2>
        <p className="text-sm text-[#5C7060]">Métricas de Desenvolvimento e Gestão de Pessoas</p>
      </div>

      <MetricTableComponent title="Métrica" rows={tableRows} />
    </div>
  );
}