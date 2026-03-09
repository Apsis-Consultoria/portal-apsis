import MetricTableComponent from "@/components/dashboards/MetricTableComponent";

export default function FinanceiroMetricasTable() {
  const tableRows = [
    { label: "Business Valuation", data: ["43%", "51%", "17%", "52%", "40%", "43%"] },
    { label: "Contábil & Fiscal", data: ["32%", "41%", "28%", "35%", "35%", "34%"] },
    { label: "Ativos Fixos", data: ["48%", "62%", "55%", "58%", "55%", "56%"] }
  ];

  const serviceRevenueRows = [
    { label: "Contabilidade", data: ["12%", "18%", "8%", "15%", "12%", "13%"] },
    { label: "Consultoria Estratégica", data: ["22%", "28%", "19%", "25%", "23%", "24%"] },
    { label: "M&A", data: ["35%", "42%", "30%", "38%", "35%", "36%"] }
  ];

  const marginByUnitRows = [
    { label: "Contabilidade", data: ["18%", "22%", "16%", "20%", "19%", "19%"] },
    { label: "Consultoria", data: ["28%", "35%", "25%", "32%", "30%", "30%"] },
    { label: "M&A", data: ["45%", "52%", "40%", "48%", "46%", "46%"] }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1A2B1F] mb-2">Indicadores Financeiros</h2>
          <p className="text-sm text-[#5C7060]">Acompanhamento trimestral de margem EBITDA e receita de serviços</p>
        </div>
        
        <h3 className="text-base font-semibold text-[#1A2B1F] mb-6 mt-8">Margem EBITDA</h3>
        <MetricTableComponent title="Divisão" rows={tableRows} />
        
        <h3 className="text-base font-semibold text-[#1A2B1F] mb-6 mt-8">Crescimento da Receita de Serviços Maduros</h3>
        <MetricTableComponent title="Divisão" rows={serviceRevenueRows} />
        
        <h3 className="text-base font-semibold text-[#1A2B1F] mb-6 mt-8">Margem por Unidade de Negócio</h3>
        <MetricTableComponent title="Unidade" rows={marginByUnitRows} />
      </div>
    </div>
  );
}