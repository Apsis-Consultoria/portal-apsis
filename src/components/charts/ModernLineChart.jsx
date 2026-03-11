import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";

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

export default function ModernLineChart({ 
  data, 
  dataKeys = [], 
  colors = ["#F47920", "#1A4731", "#22C55E"],
  formatter,
  height = 280,
  showLegend = true,
  filled = false,
  smooth = true
}) {
  const Chart = filled ? AreaChart : LineChart;
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data}>
        <defs>
          {colors.map((color, idx) => (
            <linearGradient key={idx} id={`lineGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
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
        <Tooltip content={<CustomTooltip formatter={formatter} />} cursor={{ stroke: "#F47920", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
        {showLegend && <Legend wrapperStyle={{ fontSize: 11, paddingTop: 16 }} iconType="circle" iconSize={8} />}
        {dataKeys.map((key, idx) => 
          filled ? (
            <Area
              key={key.dataKey}
              type={smooth ? "monotone" : "linear"}
              dataKey={key.dataKey}
              name={key.name}
              stroke={colors[idx]}
              strokeWidth={2.5}
              fill={`url(#lineGradient${idx})`}
              dot={{ fill: colors[idx], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ) : (
            <Line
              key={key.dataKey}
              type={smooth ? "monotone" : "linear"}
              dataKey={key.dataKey}
              name={key.name}
              stroke={colors[idx]}
              strokeWidth={2.5}
              dot={{ fill: colors[idx], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          )
        )}
      </Chart>
    </ResponsiveContainer>
  );
}