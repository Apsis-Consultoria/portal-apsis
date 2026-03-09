import MetricTableComponent from "@/components/dashboards/MetricTableComponent";

export default function MercadoClientesTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-[#1A2B1F] mb-2">Mercado / Clientes</h2>
        <p className="text-sm text-[#5C7060]">Métricas de Vendas e Conversão</p>
      </div>

      <MetricTableComponent title="Vendas Ativas/Vendas Gerais (Esforço do Colaborador)" rows={[{ label: "", data: ["32%", "20%", "24%", "14%", "30%", "20%"] }]} />
      <MetricTableComponent title="% Vendas Geradas por Produtos Estratégicos" rows={[{ label: "", data: ["6%", "6%", "15%", "7%", "15%", "9%"] }]} />
      <MetricTableComponent title="Cross Selling (Propostas)" rows={[{ label: "", data: ["5%", "9%", "5%", "5%", "5%", "5%"] }]} />
      <MetricTableComponent title="Propostas Geradas pelos Meios Digitais" rows={[{ label: "", data: ["44", "99", "71", "77", "200", "291"] }]} />
      <MetricTableComponent title="Taxa de Conversão em Valor" rows={[{ label: "", data: ["68%", "37%", "31%", "24%", "45%", "31%"] }]} />
      <MetricTableComponent title="Taxa de Conversão em Propostas" rows={[{ label: "", data: ["69%", "43%", "42%", "36%", "47%", "41%"] }]} />
    </div>
  );
}