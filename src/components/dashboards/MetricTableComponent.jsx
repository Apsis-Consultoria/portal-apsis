export default function MetricTable({ title, rows }) {
  return (
    <div className="overflow-x-auto mb-8">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-[#DDE3DE]">
            <th className="px-6 py-4 text-left text-sm font-semibold text-[#1A4731] bg-white">{title}</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-[#1A4731] bg-white border-l border-[#DDE3DE]">Q1</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-[#1A4731] bg-white border-l border-[#DDE3DE]">Q2</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-[#1A4731] bg-white border-l border-[#DDE3DE]">Q3</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-[#1A4731] bg-white border-l border-[#DDE3DE]">Q4</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-[#1A4731] bg-white border-l border-[#DDE3DE]">Ref.</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-white bg-[#F47920] border-l border-[#DDE3DE]">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-[#DDE3DE] hover:bg-[#F9F9F9] transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-[#1A2B1F]">{row.label}</td>
              <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] border-l border-[#DDE3DE]">{row.data[0]}</td>
              <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] border-l border-[#DDE3DE]">{row.data[1]}</td>
              <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] border-l border-[#DDE3DE]">{row.data[2]}</td>
              <td className="px-6 py-4 text-center text-sm text-[#1A2B1F] border-l border-[#DDE3DE]">{row.data[3]}</td>
              <td className="px-6 py-4 text-center text-sm font-semibold text-[#1A2B1F] bg-[#FAFAFA] border-l border-[#DDE3DE]">{row.data[4]}</td>
              <td className="px-6 py-4 text-center text-sm font-semibold text-white bg-[#F47920] border-l border-[#DDE3DE]">{row.data[5]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}