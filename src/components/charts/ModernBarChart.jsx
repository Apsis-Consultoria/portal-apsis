import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const CustomTooltip = ({ active, payload, formatter }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-[#DDE3DE] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold text-[#1A2B1F] mb-2">{payload[0].payload.name || payload[0].payload.mes}</p>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[#5C7060]">{entry.name}:</span>
          <span className="font-bold text-[#1A2B1F]">{formatter ? formatter(entry.value) : entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ModernBarChart({ 
  data, 
  dataKeys = [], 
  colors = ["#F47920", "#1A4731", "#22C55E"],
  formatter,
  height = 280,
  showLegend = true,
  stacked = false
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barSize={stacked ? 24 : 16} barGap={stacked ? 0 : 6}>
        <defs>
          {colors.map((color, idx) => (
            <linearGradient key={idx} id={`gradient${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.95} />
              <stop offset="100%" stopColor={color} stopOpacity={0.75} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EDE9" strokeOpacity={0.6} />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 11, fill: "#5C7060", fontWeight: 500 }} 
          axisLine={false} 
          tickLine={false}
          dy={8}
        />
        <YAxis 
          tickFormatter={formatter || (v => v)}
          tick={{ fontSize: 11, fill: "#5C7060", fontWeight: 500 }} 
          axisLine={false} 
          tickLine={false}
          dx={-4}
        />
        <Tooltip content={<CustomTooltip formatter={formatter} />} cursor={{ fill: "#F4F6F4", opacity: 0.3 }} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} iconType="circle" iconSize={8} />}
        {dataKeys.map((key, idx) => (
          <Bar 
            key={key.dataKey} 
            dataKey={key.dataKey} 
            name={key.name}
            fill={`url(#gradient${idx})`}
            radius={stacked ? [0, 0, 0, 0] : [6, 6, 0, 0]}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}