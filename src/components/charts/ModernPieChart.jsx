import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const RADIAN = Math.PI / 180;

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null; // Não mostrar labels < 5%
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-bold"
      style={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload, formatter }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-[#DDE3DE] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold text-[#1A2B1F] mb-1">{data.name}</p>
      <div className="flex items-center gap-2 text-xs">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.fill }} />
        <span className="font-bold text-[#1A2B1F]">{formatter ? formatter(data.value) : data.value}</span>
        <span className="text-[#5C7060]">({((data.value / data.payload.total) * 100).toFixed(1)}%)</span>
      </div>
    </div>
  );
};

export default function ModernPieChart({ 
  data, 
  colors = ["#F47920", "#1A4731", "#22C55E", "#6366F1", "#F59E0B", "#EF4444"],
  formatter,
  height = 260,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 100,
  showLabels = true
}) {
  // Calcular total para tooltip
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const dataWithTotal = data.map(item => ({ ...item, total }));
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={dataWithTotal}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={showLabels ? renderCustomLabel : false}
          outerRadius={outerRadius}
          innerRadius={innerRadius}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
        >
          {dataWithTotal.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={colors[index % colors.length]}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {showLegend && (
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }} 
            iconType="circle" 
            iconSize={8}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}