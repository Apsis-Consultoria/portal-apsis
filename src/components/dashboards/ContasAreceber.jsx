import MetricTableComponent from "@/components/dashboards/MetricTableComponent";

export default function ContasAreceberTable() {
  const tableRows = [
    { label: "Vencidas", data: ["8", "5", "10", "4", "7", "27"] },
    { label: "A receber (0-30 dias)", data: ["52", "48", "55", "50", "51", "205"] },
    { label: "A receber (31-60 dias)", data: ["35", "40", "38", "42", "39", "155"] },
    { label: "A receber (61+ dias)", data: ["25", "22", "28", "26", "25", "101"] }
  ];

  const valueRows = [
    { label: "Total Vencidas", data: ["R$ 45K", "R$ 35K", "R$ 55K", "R$ 28K", "R$ 41K", "R$ 163K"] },
    { label: "Total a Receber", data: ["R$ 1.2M", "R$ 1.15M", "R$ 1.25M", "R$ 1.18M", "R$ 1.19M", "R$ 4.77M"] },
    { label: "Taxa de Recebimento", data: ["92%", "94%", "90%", "93%", "92%", "92%"] }
  ];

  const indicadoresAvancados = [
    { label: "Dias Médios de Recebimento", data: ["28", "25", "32", "26", "29", "28"] },
    { label: "Ticket Médio de Venda", data: ["R$ 22.8K", "R$ 23.9K", "R$ 22.7K", "R$ 23.6K", "R$ 23.3K", "R$ 23.2K"] },
    { label: "Concentração Top 10 Clientes", data: ["42%", "45%", "40%", "43%", "42%", "42%"] },
    { label: "Taxa de Inadimplência", data: ["8%", "6%", "10%", "7%", "8%", "8%"] }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1A2B1F] mb-2">Contas a Receber</h2>
          <p className="text-sm text-[#5C7060]">Acompanhamento de créditos e prazos de recebimento</p>
        </div>

        <h3 className="text-base font-semibold text-[#1A2B1F] mb-6 mt-8">Quantidade de Títulos por Status</h3>
        <MetricTableComponent title="Status" rows={tableRows} />

        <h3 className="text-base font-semibold text-[#1A2B1F] mb-6 mt-8">Valores por Período</h3>
        <MetricTableComponent title="Período" rows={valueRows} />

        <h3 className="text-base font-semibold text-[#1A2B1F] mb-6 mt-8">Indicadores Avançados</h3>
        <MetricTableComponent title="Indicador" rows={indicadoresAvancados} />
      </div>
    </div>
  );
}