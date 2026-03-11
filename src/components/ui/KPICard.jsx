import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function KPICard({ 
  label, 
  value, 
  subtitle,
  icon: Icon, 
  color = "orange", 
  trend,
  progress,
  variant = "default" // default | compact | highlight
}) {
  const colors = {
    orange: { bg: "bg-[#F47920]/10", text: "text-[#F47920]", border: "border-[#F47920]/20", gradient: "from-[#F47920]/5 to-transparent" },
    green: { bg: "bg-[#1A4731]/10", text: "text-[#1A4731]", border: "border-[#1A4731]/20", gradient: "from-[#1A4731]/5 to-transparent" },
    blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", gradient: "from-blue-50 to-transparent" },
    red: { bg: "bg-red-50", text: "text-red-500", border: "border-red-200", gradient: "from-red-50 to-transparent" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", gradient: "from-purple-50 to-transparent" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", gradient: "from-amber-50 to-transparent" },
  };

  const getTrendIcon = () => {
    if (trend === undefined || trend === null) return null;
    if (trend > 0) return <TrendingUp size={14} className="text-emerald-600" />;
    if (trend < 0) return <TrendingDown size={14} className="text-red-500" />;
    return <Minus size={14} className="text-gray-400" />;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === null) return "text-gray-500";
    return trend >= 0 ? "text-emerald-600" : "text-red-500";
  };

  if (variant === "compact") {
    return (
      <div className="bg-white rounded-xl border border-[#DDE3DE] p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#5C7060] uppercase tracking-wide">{label}</span>
          {Icon && (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors[color].bg} ${colors[color].text}`}>
              <Icon size={13} strokeWidth={2.5} />
            </div>
          )}
        </div>
        <div className="text-xl font-bold text-[#1A2B1F]">{value}</div>
        {subtitle && <div className="text-xs text-[#5C7060] mt-1">{subtitle}</div>}
      </div>
    );
  }

  if (variant === "highlight") {
    return (
      <div className={`relative overflow-hidden rounded-2xl border ${colors[color].border} bg-gradient-to-br ${colors[color].gradient} to-white p-6 hover:shadow-lg transition-all duration-200`}>
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-semibold text-[#1A2B1F] uppercase tracking-wider">{label}</span>
            {Icon && (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color].bg} ${colors[color].text} shadow-sm`}>
                <Icon size={18} strokeWidth={2.5} />
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-[#1A2B1F] mb-2">{value}</div>
          {subtitle && <div className="text-sm text-[#5C7060] mb-3">{subtitle}</div>}
          {trend !== undefined && (
            <div className={`flex items-center gap-1.5 text-sm font-semibold ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trend > 0 ? "+" : ""}{trend}%</span>
              <span className="text-xs font-normal text-[#5C7060]">vs meta</span>
            </div>
          )}
          {progress !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-black/5 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${colors[color].text.replace("text-", "bg-")}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#DDE3DE] p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[#5C7060] uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color].bg} ${colors[color].text} group-hover:scale-110 transition-transform duration-200`}>
            <Icon size={16} strokeWidth={2.5} />
          </div>
        )}
      </div>
      <div className="mb-2">
        <div className="text-2xl font-bold text-[#1A2B1F] leading-tight">{value}</div>
        {subtitle && <div className="text-xs text-[#5C7060] mt-1.5">{subtitle}</div>}
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{trend > 0 ? "+" : ""}{trend}%</span>
          <span className="font-normal text-[#5C7060]">vs meta</span>
        </div>
      )}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-medium text-[#5C7060] mb-1.5">
            <span>Progresso</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[#F4F6F4] rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-500 ${colors[color].text.replace("text-", "bg-")}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}