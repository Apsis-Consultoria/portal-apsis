export default function FinanceiroMetricasTable() {
  const tablesData = [
    {
      title: "EBTIDA MARGEM",
      rows: [
        { label: "1º trimestre", value: "43%" },
        { label: "2º trimestre", value: "51%" },
        { label: "3º trimestre", value: "17%" },
        { label: "4º trimestre", value: "52%" },
        { label: "Referência", value: "40%" },
      ]
    },
    {
      title: "Crescimento da Receita de Serviços Maduros",
      rows: [
        { label: "1º trimestre", value: "214%" },
        { label: "2º trimestre", value: "37%" },
        { label: "3º trimestre", value: "5%" },
        { label: "4º trimestre", value: "29%" },
        { label: "Referência", value: "15%" },
      ]
    },
    {
      title: "MC% por UM",
      subRows: true,
      rows: [
        { label: "BV", data: [{ q: "1º", v: "68,5%" }, { q: "2º", v: "64,5%" }, { q: "3º", v: "53,7%" }, { q: "4º", v: "69,7%" }, { q: "Ref", v: "58%" }] },
        { label: "AF", data: [{ q: "1º", v: "55,5%" }, { q: "2º", v: "60,3%" }, { q: "3º", v: "15,7%" }, { q: "4º", v: "41,3%" }, { q: "Ref", v: "44%" }] },
        { label: "PE", data: [{ q: "1º", v: "18,3%" }, { q: "2º", v: "10,9%" }, { q: "3º", v: "4,7%" }, { q: "4º", v: "-208,6%" }, { q: "Ref", v: "43%" }] },
        { label: "M&A", data: [{ q: "1º", v: "65,7%" }, { q: "2º", v: "33,6%" }, { q: "3º", v: "-64,9%" }, { q: "4º", v: "49,5%" }, { q: "Ref", v: "70%" }] },
        { label: "CC", data: [{ q: "1º", v: "59,9%" }, { q: "2º", v: "61,3%" }, { q: "3º", v: "62,8%" }, { q: "4º", v: "66,4%" }, { q: "Ref", v: "60%" }] },
        { label: "CE", data: [{ q: "1º", v: "8,2%" }, { q: "2º", v: "50,7%" }, { q: "3º", v: "-244,8%" }, { q: "4º", v: "34,5%" }, { q: "Ref", v: "20%" }] },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Tabela 1: EBTIDA MARGEM */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DDE3DE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1A4731] text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold w-1/3">EBTIDA MARGEM</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">1º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">2º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">3º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">4º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Referência</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#DDE3DE] hover:bg-[#F4F6F4]">
                <td className="px-6 py-4 text-sm font-medium text-[#1A2B1F]"></td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F] bg-[#FFC69F]">43%</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F] bg-[#FFC69F]">51%</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F] bg-[#FFC69F]">17%</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F] bg-[#FFC69F]">52%</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F] bg-[#FFC69F]">40%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela 2: Crescimento da Receita de Serviços Maduros */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DDE3DE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1A4731] text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold w-1/3">Crescimento da Receita de Serviços Maduros</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">1º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">2º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">3º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">4º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Referência</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-[#DDE3DE] hover:bg-[#F4F6F4]">
                <td className="px-6 py-4 text-sm font-medium text-[#1A2B1F]"></td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F]">214%</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F]">37%</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F]">5%</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F]">29%</td>
                <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F]">15%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela 3: MC% por UM */}
      <div className="bg-white rounded-xl shadow-sm border border-[#DDE3DE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1A4731] text-white">
                <th className="px-6 py-4 text-left text-sm font-semibold w-1/5">MC% por UM</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">1º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">2º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">3º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold bg-[#F47920]">4º trimestre</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Referência</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "BV", data: ["68,5%", "64,5%", "53,7%", "69,7%", "58%"] },
                { label: "AF", data: ["55,5%", "60,3%", "15,7%", "41,3%", "44%"] },
                { label: "PE", data: ["18,3%", "10,9%", "4,7%", "-208,6%", "43%"] },
                { label: "M&A", data: ["65,7%", "33,6%", "-64,9%", "49,5%", "70%"] },
                { label: "CC", data: ["59,9%", "61,3%", "62,8%", "66,4%", "60%"] },
                { label: "CE", data: ["8,2%", "50,7%", "-244,8%", "34,5%", "20%"] },
              ].map((row, idx) => (
                <tr key={idx} className={`border-t border-[#DDE3DE] hover:bg-[#F4F6F4] ${idx % 2 === 0 ? "bg-white" : "bg-[#F9F9F9]"}`}>
                  <td className="px-6 py-4 text-sm font-semibold text-[#1A2B1F]">{row.label}</td>
                  <td className="px-6 py-4 text-center text-sm text-[#1A2B1F]">{row.data[0]}</td>
                  <td className="px-6 py-4 text-center text-sm text-[#1A2B1F]">{row.data[1]}</td>
                  <td className="px-6 py-4 text-center text-sm text-[#1A2B1F]">{row.data[2]}</td>
                  <td className="px-6 py-4 text-center text-sm text-[#1A2B1F]">{row.data[3]}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F]">{row.data[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}