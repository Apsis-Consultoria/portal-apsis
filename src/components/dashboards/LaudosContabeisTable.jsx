export default function LaudosContabeisTable() {
  const data = {
    "Laudos Contabeis": [
      { trimestre: "1º trimestre", year: 2023, vendas: 1106796, clientes: 35, ticket: 31623, taxa: "60%", propostas: 64 },
      { trimestre: "2º trimestre", year: 2023, vendas: 1222306, clientes: 34, ticket: 35950, taxa: "68%", propostas: 61 },
      { trimestre: "3º trimestre", year: 2023, vendas: 1001468, clientes: 31, ticket: 32305, taxa: "55%", propostas: 62 },
      { trimestre: "4º trimestre", year: 2023, vendas: 1269641, clientes: 39, ticket: 32555, taxa: "73%", propostas: 61 },
      { trimestre: "1º trimestre", year: 2024, vendas: 1620029, clientes: 35, ticket: 46287, taxa: "63%", propostas: 71 },
      { trimestre: "2º trimestre", year: 2024, vendas: 954765, clientes: 27, ticket: 35362, taxa: "51%", propostas: 63 },
      { trimestre: "3º trimestre", year: 2024, vendas: 1898865, clientes: 33, ticket: 57541, taxa: "66%", propostas: 73 },
      { trimestre: "4º trimestre", year: 2024, vendas: 1078731, clientes: 37, ticket: 29155, taxa: "48%", propostas: 78 },
      { trimestre: "1º trimestre", year: 2025, vendas: 1597865, clientes: 36, ticket: 44385, taxa: "60%", propostas: 76 },
      { trimestre: "2º trimestre", year: 2025, vendas: 1361557, clientes: 28, ticket: 48627, taxa: "59%", propostas: 56 },
      { trimestre: "3º trimestre", year: 2025, vendas: 1937674, clientes: 39, ticket: 49684, taxa: "54%", propostas: 85 },
      { trimestre: "4º trimestre", year: 2025, vendas: 1187488, clientes: 31, ticket: 38306, taxa: "48%", propostas: 70 },
    ]
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE] overflow-x-auto">
      <h3 className="text-sm font-bold text-[#1A2B1F] mb-4">Laudos Contábeis</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#DDE3DE]">
            <th className="text-left px-3 py-2 font-semibold text-[#1A2B1F] bg-gray-50">Período</th>
            {[2023, 2024, 2025].map((year) => (
              <th key={year} colSpan="4" className="text-center px-2 py-2 font-semibold text-white" style={{ backgroundColor: year === 2023 ? "#D3D3D3" : year === 2024 ? "#245E40" : "#F47920" }}>
                {year}
              </th>
            ))}
          </tr>
          <tr className="border-b border-[#DDE3DE]">
            <th className="text-left px-3 py-2 font-semibold text-[#1A2B1F] bg-gray-50">Métrica</th>
            {[2023, 2024, 2025].map((year) => (
              <th key={`${year}-h`} colSpan="4" className="text-center px-2 py-1 font-medium text-[#5C7060]">
                <div className="flex justify-around">
                  <span>1º</span><span>2º</span><span>3º</span><span>4º</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {["Vendas", "Clientes", "Ticket Médio", "Taxa de Conversão", "Volume de propostas"].map((metric, idx) => (
            <tr key={metric} className={idx % 2 === 0 ? "bg-white" : "bg-[#F9F9F9]"}>
              <td className="px-3 py-2 font-medium text-[#1A2B1F] bg-gray-50">{metric}</td>
              {[2023, 2024, 2025].map((year) => {
                const yearData = data["Laudos Contabeis"].filter(d => d.year === year);
                const bgColor = year === 2023 ? "#D3D3D3" : year === 2024 ? "#A8D5BA" : "#F5B87A";
                return (
                  <td key={`${year}-data`} colSpan="4" style={{ backgroundColor: bgColor }}>
                    <div className="flex justify-around text-center">
                      {yearData.map((d, i) => {
                        let value = "";
                        if (metric === "Vendas") value = `${(d.vendas / 1000).toFixed(0)}k`;
                        else if (metric === "Clientes") value = d.clientes;
                        else if (metric === "Ticket Médio") value = `${(d.ticket / 1000).toFixed(1)}k`;
                        else if (metric === "Taxa de Conversão") value = d.taxa;
                        else if (metric === "Volume de propostas") value = d.propostas;
                        return <span key={i} className="px-1">{value}</span>;
                      })}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-[#5C7060] mt-4 italic">
        *Apenas a base de volume considera por data de criação de proposta, Nº de cliente e taxa de conversão está considerando data de Aceite ou Perda, portanto o cálculo da taxa de conversão é ganha/total de ganhas e perdidas no período.
      </p>
    </div>
  );
}