export default function MercadoClientesTable() {
  const tableData = [
    {
      metric: "Vendas Ativas/Vendas Gerais (Esforço do Colaborador)",
      data: ["32%", "20%", "24%", "14%", "30%", "20%"]
    },
    {
      metric: "% Vendas Geradas por Produtos Estratégicos",
      data: ["6%", "6%", "15%", "7%", "15%", "9%"]
    },
    {
      metric: "Cross Selling (Propostas)",
      data: ["5%", "9%", "5%", "5%", "5%", "5%"]
    },
    {
      metric: "Propostas Geradas pelos Meios Digitais",
      data: ["44", "99", "71", "77", "200", "291"]
    },
    {
      metric: "Taxa de Conversão em Valor",
      data: ["68%", "37%", "31%", "24%", "45%", "31%"]
    },
    {
      metric: "Taxa de Conversão em Propostas",
      data: ["69%", "43%", "42%", "36%", "47%", "41%"]
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#1A2B1F] mb-1">Mercado / Clientes</h3>
        <p className="text-sm text-[#5C7060]">Métricas de Vendas e Conversão</p>
      </div>

      <div className="space-y-6">
        {tableData.map((row, idx) => (
          <div key={idx} className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold bg-[#1A4731] text-white">{row.metric}</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920] text-white">1º trimestre</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920] text-white">2º trimestre</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920] text-white">3º trimestre</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920] text-white">4º trimestre</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold bg-[#1A4731] text-white">Referência</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920] text-white">Total 2025</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="7" className="px-0 py-0"></td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] bg-[#FFC69F]">{row.data[0]}</td>
                  <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] bg-[#FFC69F]">{row.data[1]}</td>
                  <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] bg-[#FFC69F]">{row.data[2]}</td>
                  <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] bg-[#FFC69F]">{row.data[3]}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F]">{row.data[4]}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-white bg-[#F47920]">{row.data[5]}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}