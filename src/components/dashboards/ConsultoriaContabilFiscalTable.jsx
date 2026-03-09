export default function ConsultoriaContabilFiscalTable() {
  const data = [
    { trimestre: "1º trimestre", year: 2023, vendas: 261645, clientes: 5, ticket: 52329, taxa: "29%", propostas: 16 },
    { trimestre: "2º trimestre", year: 2023, vendas: 141012, clientes: 5, ticket: 28202, taxa: "25%", propostas: 10 },
    { trimestre: "3º trimestre", year: 2023, vendas: 292581, clientes: 7, ticket: 41797, taxa: "33%", propostas: 21 },
    { trimestre: "4º trimestre", year: 2023, vendas: 210806, clientes: 6, ticket: 35134, taxa: "25%", propostas: 19 },
    { trimestre: "1º trimestre", year: 2024, vendas: 303534, clientes: 8, ticket: 37942, taxa: "50%", propostas: 18 },
    { trimestre: "2º trimestre", year: 2024, vendas: 249246, clientes: 6, ticket: 41541, taxa: "29%", propostas: 24 },
    { trimestre: "3º trimestre", year: 2024, vendas: 417090, clientes: 12, ticket: 34757, taxa: "50%", propostas: 25 },
    { trimestre: "4º trimestre", year: 2024, vendas: 549719, clientes: 8, ticket: 68715, taxa: "35%", propostas: 27 },
    { trimestre: "1º trimestre", year: 2025, vendas: 471928, clientes: 12, ticket: 39327, taxa: "54%", propostas: 26 },
    { trimestre: "2º trimestre", year: 2025, vendas: 455872, clientes: 9, ticket: 50685, taxa: "42%", propostas: 19 },
    { trimestre: "3º trimestre", year: 2025, vendas: 922299, clientes: 10, ticket: 92230, taxa: "44%", propostas: 22 },
    { trimestre: "4º trimestre", year: 2025, vendas: 458838, clientes: 12, ticket: 38237, taxa: "27%", propostas: 31 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE] overflow-x-auto">
      <h3 className="text-sm font-bold text-[#1A2B1F] mb-4">Consultoria Contábil e Fiscal</h3>
      <p className="text-xs text-[#5C7060] mb-4">Incluindo serviços de jurídico</p>
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
                const yearData = data.filter(d => d.year === year);
                const bgColor = year === 2023 ? "#D3D3D3" : year === 2024 ? "#A8D5BA" : "#F5B87A";
                return (
                  <td key={`${year}-data`} colSpan="4" style={{ backgroundColor: bgColor }}>
                    <div className="flex justify-around text-center">
                      {yearData.map((d, i) => {
                        let value = "";
                        if (metric === "Vendas") value = `${(d.vendas / 1000).toFixed(0)}k`;
                        else if (metric === "Clientes") value = d.clientes;
                        else if (metric === "Ticket Médio") value = `${(d.ticket / 1000).toFixed(0)}k`;
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
    </div>
  );
}