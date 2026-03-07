"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartPoint {
  date: string;
  close: number;
}

interface Props {
  data: ChartPoint[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function PriceChart({ data }: Props) {
  if (!data || data.length === 0) return null;

  const isUp = data[data.length - 1].close >= data[0].close;
  const color = isUp ? "#22c55e" : "#ef4444";
  const gradientId = isUp ? "greenGradient" : "redGradient";

  // Pick ~6 evenly spaced tick indices
  const tickIndices: number[] = [];
  const step = Math.floor(data.length / 5);
  for (let i = 0; i < data.length; i += step) {
    tickIndices.push(i);
  }
  const ticks = tickIndices.map((i) => data[i].date);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-3">6-Month Price</p>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Close"]}
            labelFormatter={(label: string) => {
              const d = new Date(label + "T00:00:00");
              return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            }}
            contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
