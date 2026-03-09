export default function VendasPorGrupoTable() {
  const servicoGroups = [
    {
      name: "Valuation",
      data: [
        { trimestre: "1º trimestre", year: 2023, vendas: 528714, clientes: 16, ticket: 33045, taxa: "45%", propostas: 43 },
        { trimestre: "2º trimestre", year: 2023, vendas: 644870, clientes: 16, ticket: 40304, taxa: "38%", propostas: 34 },
        { trimestre: "3º trimestre", year: 2023, vendas: 393461, clientes: 15, ticket: 26231, taxa: "34%", propostas: 38 },
        { trimestre: "4º trimestre", year: 2023, vendas: 692767, clientes: 11, ticket: 62979, taxa: "43%", propostas: 29 },
        { trimestre: "1º trimestre", year: 2024, vendas: 840515, clientes: 19, ticket: 44238, taxa: "67%", propostas: 33 },
        { trimestre: "2º trimestre", year: 2024, vendas: 433965, clientes: 16, ticket: 27123, taxa: "36%", propostas: 38 },
        { trimestre: "3º trimestre", year: 2024, vendas: 634086, clientes: 18, ticket: 35227, taxa: "45%", propostas: 47 },
        { trimestre: "4º trimestre", year: 2024, vendas: 1502417, clientes: 19, ticket: 79075, taxa: "57%", propostas: 39 },
        { trimestre: "1º trimestre", year: 2025, vendas: 771675, clientes: 17, ticket: 45393, taxa: "43%", propostas: 40 },
        { trimestre: "2º trimestre", year: 2025, vendas: 993290, clientes: 20, ticket: 49665, taxa: "33%", propostas: 43 },
        { trimestre: "3º trimestre", year: 2025, vendas: 1082654, clientes: 23, ticket: 47072, taxa: "49%", propostas: 70 },
        { trimestre: "4º trimestre", year: 2025, vendas: 1587875, clientes: 17, ticket: 93404, taxa: "20%", propostas: 48 },
      ]
    },
    {
      name: "PPA",
      data: [
        { trimestre: "1º trimestre", year: 2023, vendas: 737695, clientes: 17, ticket: 43394, taxa: "56%", propostas: 25 },
        { trimestre: "2º trimestre", year: 2023, vendas: 501048, clientes: 12, ticket: 41754, taxa: "40%", propostas: 30 },
        { trimestre: "3º trimestre", year: 2023, vendas: 450262, clientes: 11, ticket: 40933, taxa: "50%", propostas: 21 },
        { trimestre: "4º trimestre", year: 2023, vendas: 234100, clientes: 7, ticket: 33443, taxa: "43%", propostas: 14 },
        { trimestre: "1º trimestre", year: 2024, vendas: 433673, clientes: 14, ticket: 30977, taxa: "64%", propostas: 21 },
        { trimestre: "2º trimestre", year: 2024, vendas: 371783, clientes: 11, ticket: 33798, taxa: "46%", propostas: 29 },
        { trimestre: "3º trimestre", year: 2024, vendas: 545913, clientes: 13, ticket: 41993, taxa: "70%", propostas: 20 },
        { trimestre: "4º trimestre", year: 2024, vendas: 1007529, clientes: 17, ticket: 59266, taxa: "63%", propostas: 30 },
        { trimestre: "1º trimestre", year: 2025, vendas: 730957, clientes: 13, ticket: 56227, taxa: "58%", propostas: 35 },
        { trimestre: "2º trimestre", year: 2025, vendas: 532959, clientes: 9, ticket: 59218, taxa: "24%", propostas: 16 },
        { trimestre: "3º trimestre", year: 2025, vendas: 979404, clientes: 15, ticket: 65294, taxa: "42%", propostas: 43 },
        { trimestre: "4º trimestre", year: 2025, vendas: 974444, clientes: 17, ticket: 57320, taxa: "42%", propostas: 46 },
      ]
    },
    {
      name: "Lei das S.A",
      data: [
        { trimestre: "1º trimestre", year: 2023, vendas: 458921, clientes: 5, ticket: 91784, taxa: "71%", propostas: 7 },
        { trimestre: "2º trimestre", year: 2023, vendas: 385500, clientes: 5, ticket: 77100, taxa: "78%", propostas: 9 },
        { trimestre: "3º trimestre", year: 2023, vendas: 320080, clientes: 8, ticket: 40010, taxa: "70%", propostas: 10 },
        { trimestre: "4º trimestre", year: 2023, vendas: 20000, clientes: 1, ticket: 20000, taxa: "50%", propostas: 4 },
        { trimestre: "1º trimestre", year: 2024, vendas: 94400, clientes: 3, ticket: 31467, taxa: "50%", propostas: 4 },
        { trimestre: "2º trimestre", year: 2024, vendas: 270000, clientes: 3, ticket: 90000, taxa: "100%", propostas: 3 },
        { trimestre: "3º trimestre", year: 2024, vendas: 317510, clientes: 4, ticket: 79378, taxa: "63%", propostas: 8 },
        { trimestre: "4º trimestre", year: 2024, vendas: 170000, clientes: 1, ticket: 170000, taxa: "50%", propostas: 6 },
        { trimestre: "1º trimestre", year: 2025, vendas: 1307000, clientes: 4, ticket: 326750, taxa: "100%", propostas: 3 },
        { trimestre: "2º trimestre", year: 2025, vendas: 1716500, clientes: 6, ticket: 286083, taxa: "86%", propostas: 7 },
        { trimestre: "3º trimestre", year: 2025, vendas: 2000716, clientes: 4, ticket: 500179, taxa: "43%", propostas: 9 },
        { trimestre: "4º trimestre", year: 2025, vendas: 1911712, clientes: 5, ticket: 382342, taxa: "57%", propostas: 7 },
      ]
    },
    {
      name: "Projetos Recorrentes",
      data: [
        { trimestre: "1º trimestre", year: 2023, vendas: 905054, clientes: 10, ticket: 90505, taxa: "42%", propostas: 27 },
        { trimestre: "2º trimestre", year: 2023, vendas: 210692, clientes: 6, ticket: 35115, taxa: "50%", propostas: 14 },
        { trimestre: "3º trimestre", year: 2023, vendas: 987187, clientes: 8, ticket: 123398, taxa: "57%", propostas: 30 },
        { trimestre: "4º trimestre", year: 2023, vendas: 1251394, clientes: 22, ticket: 56882, taxa: "47%", propostas: 44 },
        { trimestre: "1º trimestre", year: 2024, vendas: 745856, clientes: 18, ticket: 41436, taxa: "67%", propostas: 27 },
        { trimestre: "2º trimestre", year: 2024, vendas: 831145, clientes: 10, ticket: 83114, taxa: "59%", propostas: 21 },
        { trimestre: "3º trimestre", year: 2024, vendas: 1347793, clientes: 15, ticket: 89853, taxa: "62%", propostas: 34 },
        { trimestre: "4º trimestre", year: 2024, vendas: 1414670, clientes: 23, ticket: 61507, taxa: "75%", propostas: 52 },
        { trimestre: "1º trimestre", year: 2025, vendas: 1000624, clientes: 17, ticket: 58860, taxa: "100%", propostas: 29 },
        { trimestre: "2º trimestre", year: 2025, vendas: 705652, clientes: 11, ticket: 64150, taxa: "36%", propostas: 14 },
        { trimestre: "3º trimestre", year: 2025, vendas: 1049898, clientes: 14, ticket: 74993, taxa: "52%", propostas: 35 },
        { trimestre: "4º trimestre", year: 2025, vendas: 1274834, clientes: 19, ticket: 67097, taxa: "31%", propostas: 46 },
      ]
    },
    {
      name: "Jurídico",
      data: [
        { trimestre: "1º trimestre", year: 2023, vendas: 325000, clientes: 4, ticket: 81250, taxa: "40%", propostas: 8 },
        { trimestre: "2º trimestre", year: 2023, vendas: 275000, clientes: 3, ticket: 91667, taxa: "35%", propostas: 6 },
        { trimestre: "3º trimestre", year: 2023, vendas: 410000, clientes: 5, ticket: 82000, taxa: "45%", propostas: 10 },
        { trimestre: "4º trimestre", year: 2023, vendas: 185000, clientes: 2, ticket: 92500, taxa: "38%", propostas: 5 },
        { trimestre: "1º trimestre", year: 2024, vendas: 290000, clientes: 3, ticket: 96667, taxa: "55%", propostas: 6 },
        { trimestre: "2º trimestre", year: 2024, vendas: 320000, clientes: 4, ticket: 80000, taxa: "48%", propostas: 7 },
        { trimestre: "3º trimestre", year: 2024, vendas: 380000, clientes: 5, ticket: 76000, taxa: "52%", propostas: 9 },
        { trimestre: "4º trimestre", year: 2024, vendas: 450000, clientes: 6, ticket: 75000, taxa: "60%", propostas: 11 },
        { trimestre: "1º trimestre", year: 2025, vendas: 520000, clientes: 7, ticket: 74286, taxa: "65%", propostas: 13 },
        { trimestre: "2º trimestre", year: 2025, vendas: 390000, clientes: 5, ticket: 78000, taxa: "42%", propostas: 10 },
        { trimestre: "3º trimestre", year: 2025, vendas: 610000, clientes: 8, ticket: 76250, taxa: "58%", propostas: 14 },
        { trimestre: "4º trimestre", year: 2025, vendas: 475000, clientes: 6, ticket: 79167, taxa: "50%", propostas: 12 },
      ]
    },
    {
      name: "Recuperação Judicial",
      data: [
        { trimestre: "1º trimestre", year: 2023, vendas: 185000, clientes: 2, ticket: 92500, taxa: "30%", propostas: 4 },
        { trimestre: "2º trimestre", year: 2023, vendas: 150000, clientes: 1, ticket: 150000, taxa: "25%", propostas: 3 },
        { trimestre: "3º trimestre", year: 2023, vendas: 220000, clientes: 3, ticket: 73333, taxa: "35%", propostas: 5 },
        { trimestre: "4º trimestre", year: 2023, vendas: 90000, clientes: 1, ticket: 90000, taxa: "20%", propostas: 2 },
        { trimestre: "1º trimestre", year: 2024, vendas: 140000, clientes: 2, ticket: 70000, taxa: "42%", propostas: 3 },
        { trimestre: "2º trimestre", year: 2024, vendas: 165000, clientes: 2, ticket: 82500, taxa: "38%", propostas: 4 },
        { trimestre: "3º trimestre", year: 2024, vendas: 195000, clientes: 3, ticket: 65000, taxa: "45%", propostas: 5 },
        { trimestre: "4º trimestre", year: 2024, vendas: 280000, clientes: 4, ticket: 70000, taxa: "55%", propostas: 7 },
        { trimestre: "1º trimestre", year: 2025, vendas: 320000, clientes: 4, ticket: 80000, taxa: "60%", propostas: 8 },
        { trimestre: "2º trimestre", year: 2025, vendas: 245000, clientes: 3, ticket: 81667, taxa: "38%", propostas: 6 },
        { trimestre: "3º trimestre", year: 2025, vendas: 410000, clientes: 5, ticket: 82000, taxa: "50%", propostas: 10 },
        { trimestre: "4º trimestre", year: 2025, vendas: 355000, clientes: 4, ticket: 88750, taxa: "45%", propostas: 8 },
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {servicoGroups.map((group) => (
        <div key={group.name} className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE] overflow-x-auto">
          <h3 className="text-sm font-bold text-[#1A2B1F] mb-4">{group.name}</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#DDE3DE]">
                <th className="text-left px-3 py-2 font-semibold text-[#1A2B1F] bg-gray-50">Período</th>
                {[2023, 2024, 2025].map((year) => (
                  <th key={year} colSpan="5" className="text-center px-2 py-2 font-semibold text-[#1A2B1F]" style={{ backgroundColor: year === 2023 ? "#E0E0E0" : year === 2024 ? "#245E40" : "#F47920", color: year === 2023 ? "#000" : "#FFF" }}>
                    {year}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-[#DDE3DE]">
                <th className="text-left px-3 py-2 font-semibold text-[#1A2B1F] bg-gray-50">Métrica</th>
                {[2023, 2024, 2025].map((year) => (
                  <th key={`${year}-h`} colSpan="5" className="text-center px-2 py-1 font-medium text-[#5C7060]">
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
                    const yearData = group.data.filter(d => d.year === year);
                    return (
                      <td key={`${year}-data`} colSpan="5">
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
      ))}
    </div>
  );
}