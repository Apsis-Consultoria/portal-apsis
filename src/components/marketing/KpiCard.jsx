import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function KpiCard({ label, value, sub, trend, color = "green" }) {
  const colors = {
    green: "bg-[#1A4731] text-white",
    orange: "bg-[#F47920] text-white",
    blue: "bg-[#1E3A5F] text-white",
    gray: "bg-white border border-[#DDE3DE] text-[#1A2B1F]",
    red: "bg-red-50 border border-red-200 text-red-700",
  };

  return (
    <div className={`rounded-2xl p-5 ${colors[color]}`}>
      <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${color === "gray" ? "text-[#5C7060]" : "text-white/60"}`}>{label}</p>
      <p className="text-2xl font-bold leading-tight">{value}</p>
      {sub && <p className={`text-xs mt-1 ${color === "gray" ? "text-[#5C7060]" : "text-white/70"}`}>{sub}</p>}
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend > 0 ? "text-green-300" : trend < 0 ? "text-red-300" : "text-white/50"}`}>
          {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
          {trend > 0 ? "+" : ""}{trend}%
        </div>
      )}
    </div>
  );
}