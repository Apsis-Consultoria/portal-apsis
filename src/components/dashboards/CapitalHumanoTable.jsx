export default function CapitalHumanoTable() {
  const tableData = [
    {
      metric: "HR de Treinamento Time e Lideranças",
      data: ["4,6", "7,6", "0", "0", "45", "12,2"]
    },
    {
      metric: "Rotatividade Geral (Admissões+Demissões)",
      data: ["5%", "16%", "5%", "6%", "15%", "29%"]
    },
    {
      metric: "Desligamentos Ativos",
      data: ["5%", "3%", "3%", "4%", "10%", "15%"]
    },
    {
      metric: "% de Mulheres na área",
      data: ["40%", "40%", "40%", "37%", "40%", "39%"]
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-[#DDE3DE]">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#1A2B1F] mb-1">Capital Humano</h3>
        <p className="text-sm text-[#5C7060]">Métricas de Desenvolvimento e Gestão de Pessoas</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold bg-[#1A4731] text-white w-1/3">Métrica</th>
              <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920] text-white">1º trimestre</th>
              <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920] text-white">2º trimestre</th>
              <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920] text-white">3º trimestre</th>
              <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920] text-white">4º trimestre</th>
              <th className="px-6 py-4 text-center text-sm font-semibold bg-[#1A4731] text-white">Referência</th>
              <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920] text-white">Total 2025</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#F4F6F4]"}>
                <td className="px-6 py-4 text-sm font-semibold text-white bg-[#1A4731]">{row.metric}</td>
                <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] bg-[#FFC69F]">{row.data[0]}</td>
                <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] bg-[#FFC69F]">{row.data[1]}</td>
                <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] bg-[#FFC69F]">{row.data[2]}</td>
                <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] bg-[#FFC69F]">{row.data[3]}</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F]">{row.data[4]}</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-white bg-[#F47920]">{row.data[5]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}