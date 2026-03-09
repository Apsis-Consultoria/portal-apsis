export default function AvaliacaoImoveisTable() {
  const data = [
    {
      label: "Vendas",
      Q1_2023: 882915,
      Q2_2023: 388951,
      Q3_2023: 434123,
      Q4_2023: 845827,
      Q1_2024: 276034,
      Q2_2024: 721217,
      Q3_2024: 660470,
      Q4_2024: 1222714,
      Q1_2025: 1369521,
      Q2_2025: 1277368,
      Q3_2025: 531835,
      Q4_2025: 973010,
    },
    {
      label: "Clientes",
      Q1_2023: 23,
      Q2_2023: 10,
      Q3_2023: 21,
      Q4_2023: 31,
      Q1_2024: 13,
      Q2_2024: 28,
      Q3_2024: 28,
      Q4_2024: 40,
      Q1_2025: 30,
      Q2_2025: 28,
      Q3_2025: 19,
      Q4_2025: 37,
    },
    {
      label: "Ticket Médio",
      Q1_2023: 38388,
      Q2_2023: 38895,
      Q3_2023: 20673,
      Q4_2023: 27285,
      Q1_2024: 21233,
      Q2_2024: 25758,
      Q3_2024: 23588,
      Q4_2024: 30568,
      Q1_2025: 45651,
      Q2_2025: 45620,
      Q3_2025: 27991,
      Q4_2025: 26298,
    },
    {
      label: "Taxa de Conversão",
      Q1_2023: "43%",
      Q2_2023: "17%",
      Q3_2023: "37%",
      Q4_2023: "49%",
      Q1_2024: "25%",
      Q2_2024: "45%",
      Q3_2024: "48%",
      Q4_2024: "64%",
      Q1_2025: "52%",
      Q2_2025: "51%",
      Q3_2025: "40%",
      Q4_2025: "47%",
    },
    {
      label: "Volume de propostas (por data de criação)",
      Q1_2023: 53,
      Q2_2023: 37,
      Q3_2023: 48,
      Q4_2023: 52,
      Q1_2024: 42,
      Q2_2024: 52,
      Q3_2024: 62,
      Q4_2024: 67,
      Q1_2025: 50,
      Q2_2025: 66,
      Q3_2025: 86,
      Q4_2025: 88,
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
      <h3 className="text-lg font-bold text-[#1A2B1F] mb-4">Avaliação de Imóveis</h3>
      
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="border border-[#DDE3DE] bg-[#1A4731] text-white font-semibold p-2 text-left whitespace-nowrap">Avaliação de Imóveis</th>
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

      <p className="text-xs text-[#5C7060] mt-4">
        *Apenas a base de volume considera por data de criação de proposta, Nº de cliente e taxa de conversão está considerando data de Aceite ou Perda, portanto o cálculo da taxa de conversão é ganha/total de ganhas e perdidas no período.
      </p>
    </div>
  );
}