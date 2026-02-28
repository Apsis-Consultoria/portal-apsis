export default function StatCard({ label, value, sub, icon: Icon, color = "orange", trend }) {
  const colors = {
    orange: "bg-[#F47920]/10 text-[#F47920]",
    green:  "bg-[#1A4731]/10 text-[#1A4731]",
    gold:   "bg-[#F47920]/10 text-[#F47920]",
    blue:   "bg-blue-50 text-blue-600",
    red:    "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-[#5C7060] uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon size={15} />
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-[#1A2B1F] leading-tight">{value}</div>
        {sub && <div className="text-xs text-[#5C7060] mt-1">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`text-xs font-medium ${trend >= 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs meta
        </div>
      )}
    </div>
  );
}