export default function InventarioConciliacaoTable() {
  const data = [
    {
      label: "Vendas",
      Q1_2023: 69600,
      Q2_2023: 652075,
      Q3_2023: 1460384,
      Q4_2023: 984137,
      Q1_2024: 305051,
      Q2_2024: 881470,
      Q3_2024: 259000,
      Q4_2024: 514267,
      Q1_2025: 902358,
      Q2_2025: 257085,
      Q3_2025: 520000,
      Q4_2025: 1038099,
    },
    {
      label: "Clientes",
      Q1_2023: 5,
      Q2_2023: 6,
      Q3_2023: 9,
      Q4_2023: 15,
      Q1_2024: 5,
      Q2_2024: 10,
      Q3_2024: 3,
      Q4_2024: 8,
      Q1_2025: 8,
      Q2_2025: 10,
      Q3_2025: 5,
      Q4_2025: 9,
    },
    {
      label: "Ticket Médio",
      Q1_2023: 13920,
      Q2_2023: 108679,
      Q3_2023: 162265,
      Q4_2023: 65609,
      Q1_2024: 61010,
      Q2_2024: 88147,
      Q3_2024: 86333,
      Q4_2024: 64283,
      Q1_2025: 112795,
      Q2_2025: 25709,
      Q3_2025: 104000,
      Q4_2025: 115344,
    },
    {
      label: "Taxa de Conversão",
      Q1_2023: "20%",
      Q2_2023: "18%",
      Q3_2023: "28%",
      Q4_2023: "33%",
      Q1_2024: "18%",
      Q2_2024: "33%",
      Q3_2024: "7%",
      Q4_2024: "31%",
      Q1_2025: "14%",
      Q2_2025: "24%",
      Q3_2025: "12%",
      Q4_2025: "29%",
    },
    {
      label: "Volume de propostas (por data de criação)",
      Q1_2023: 22,
      Q2_2023: 25,
      Q3_2023: 29,
      Q4_2023: 32,
      Q1_2024: 16,
      Q2_2024: 37,
      Q3_2024: 34,
      Q4_2024: 47,
      Q1_2025: 31,
      Q2_2025: 32,
      Q3_2025: 35,
      Q4_2025: 36,
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
      <h3 className="text-lg font-bold text-[#1A2B1F] mb-4">Inventário / Conciliação</h3>
      
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="border border-[#DDE3DE] bg-[#1A4731] text-white font-semibold p-2 text-left whitespace-nowrap">Inventário/Conciliação</th>
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