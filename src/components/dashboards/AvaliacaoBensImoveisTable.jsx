export default function AvaliacaoBensImoveisTable() {
  const data = [
    {
      label: "Vendas",
      Q1_2023: 373334,
      Q2_2023: 115143,
      Q3_2023: 118282,
      Q4_2023: 275314,
      Q1_2024: 331556,
      Q2_2024: 136980,
      Q3_2024: 302686,
      Q4_2024: 266800,
      Q1_2025: 860876,
      Q2_2025: 844056,
      Q3_2025: 554749,
      Q4_2025: 567497,
    },
    {
      label: "Clientes",
      Q1_2023: 15,
      Q2_2023: 6,
      Q3_2023: 8,
      Q4_2023: 10,
      Q1_2024: 7,
      Q2_2024: 8,
      Q3_2024: 13,
      Q4_2024: 10,
      Q1_2025: 16,
      Q2_2025: 13,
      Q3_2025: 14,
      Q4_2025: 19,
    },
    {
      label: "Ticket Médio",
      Q1_2023: 24889,
      Q2_2023: 19190,
      Q3_2023: 14785,
      Q4_2023: 27531,
      Q1_2024: 47365,
      Q2_2024: 17122,
      Q3_2024: 23284,
      Q4_2024: 26680,
      Q1_2025: 53805,
      Q2_2025: 64927,
      Q3_2025: 39625,
      Q4_2025: 29868,
    },
    {
      label: "Taxa de Conversão",
      Q1_2023: "63%",
      Q2_2023: "0%",
      Q3_2023: "25%",
      Q4_2023: "53%",
      Q1_2024: "50%",
      Q2_2024: "33%",
      Q3_2024: "40%",
      Q4_2024: "42%",
      Q1_2025: "19%",
      Q2_2025: "40%",
      Q3_2025: "29%",
      Q4_2025: "45%",
    },
    {
      label: "Volume de propostas (por data de criação)",
      Q1_2023: 11,
      Q2_2023: 8,
      Q3_2023: 15,
      Q4_2023: 12,
      Q1_2024: 7,
      Q2_2024: 13,
      Q3_2024: 14,
      Q4_2024: 13,
      Q1_2025: 14,
      Q2_2025: 18,
      Q3_2025: 11,
      Q4_2025: 16,
    },
  ];

  const formatValue = (value, label) => {
    if (label === "Vendas" || label === "Ticket Médio") {
      return typeof value === "number" ? `R$ ${value.toLocaleString("pt-BR")}` : value;
    }
    return value;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE] overflow-x-auto">
      <h3 className="text-lg font-bold text-[#1A2B1F] mb-4">Avaliação de Bens e Imóveis</h3>
      
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="border border-[#DDE3DE] bg-[#1A4731] text-white font-semibold p-2 text-left whitespace-nowrap">Avaliação de Bens Móveis</th>
            <th colSpan="4" className="border border-[#DDE3DE] bg-[#1A4731] text-white font-semibold p-2 text-center">2023</th>
            <th colSpan="4" className="border border-[#DDE3DE] bg-[#245E40] text-white font-semibold p-2 text-center">2024</th>
            <th colSpan="4" className="border border-[#DDE3DE] bg-[#F47920] text-white font-semibold p-2 text-center">2025</th>
          </tr>
          <tr>
            <th className="border border-[#DDE3DE] bg-[#F4F6F4] p-2 text-left font-semibold"></th>
            {["1º trimestre", "2º trimestre", "3º trimestre", "4º trimestre"].map((q, i) => (
              <th key={`2023-${i}`} className="border border-[#DDE3DE] bg-[#F4F6F4] p-2 text-center font-semibold text-xs">{q}</th>
            ))}
            {["1º trimestre", "2º trimestre", "3º trimestre", "4º trimestre"].map((q, i) => (
              <th key={`2024-${i}`} className="border border-[#DDE3DE] bg-[#F4F6F4] p-2 text-center font-semibold text-xs">{q}</th>
            ))}
            {["1º trimestre", "2º trimestre", "3º trimestre", "4º trimestre"].map((q, i) => (
              <th key={`2025-${i}`} className="border border-[#DDE3DE] bg-[#F4F6F4] p-2 text-center font-semibold text-xs">{q}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-[#F9F9F9]" : "bg-white"}>
              <td className="border border-[#DDE3DE] bg-[#E8EDE9] font-semibold p-2 text-left">{row.label}</td>
              {["Q1_2023", "Q2_2023", "Q3_2023", "Q4_2023"].map((q) => (
                <td key={q} className="border border-[#DDE3DE] p-2 text-center text-xs">{formatValue(row[q], row.label)}</td>
              ))}
              {["Q1_2024", "Q2_2024", "Q3_2024", "Q4_2024"].map((q) => (
                <td key={q} className="border border-[#DDE3DE] p-2 text-center text-xs">{formatValue(row[q], row.label)}</td>
              ))}
              {["Q1_2025", "Q2_2025", "Q3_2025", "Q4_2025"].map((q) => (
                <td key={q} className="border border-[#DDE3DE] p-2 text-center text-xs">{formatValue(row[q], row.label)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}