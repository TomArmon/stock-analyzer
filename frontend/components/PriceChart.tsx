"use client";
import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Customized,
} from "recharts";

interface ChartPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Props {
  data: ChartPoint[];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatPrice(v: number) {
  return `$${v.toFixed(0)}`;
}

function CandleSticks({ chartData, xAxisMap, yAxisMap }: any) {
  const xAxis = xAxisMap?.["0"] ?? Object.values(xAxisMap ?? {})[0] as any;
  const yAxis = yAxisMap?.["0"] ?? Object.values(yAxisMap ?? {})[0] as any;
  const xScale = xAxis?.scale;
  const yScale = yAxis?.scale;
  if (!xScale || !yScale) return null;

  const bw = typeof xScale.bandwidth === "function" ? xScale.bandwidth() : 4;
  const bodyW = Math.max(bw * 0.7, 2);

  return (
    <g>
      {chartData.map((pt: ChartPoint) => {
        const xLeft = xScale(pt.date);
        if (xLeft == null) return null;
        const cx = xLeft + bw / 2;
        const isGreen = pt.close >= pt.open;
        const color = isGreen ? "#22c55e" : "#ef4444";

        const yHigh = yScale(pt.high);
        const yLow = yScale(pt.low);
        const yBodyTop = Math.min(yScale(pt.open), yScale(pt.close));
        const yBodyBot = Math.max(yScale(pt.open), yScale(pt.close));
        const bodyH = Math.max(yBodyBot - yBodyTop, 1);

        return (
          <g key={pt.date}>
            <line x1={cx} y1={yHigh} x2={cx} y2={yLow} stroke={color} strokeWidth={1} />
            <rect x={cx - bodyW / 2} y={yBodyTop} width={bodyW} height={bodyH} fill={color} />
          </g>
        );
      })}
    </g>
  );
}

function CandleTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d: ChartPoint = payload[0]?.payload;
  if (!d) return null;
  const dateStr = new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <p style={{ fontWeight: 600, color: "#334155", marginBottom: 4 }}>{dateStr}</p>
      <p style={{ color: "#64748b" }}>O: <strong>${d.open.toFixed(2)}</strong></p>
      <p style={{ color: "#22c55e" }}>H: <strong>${d.high.toFixed(2)}</strong></p>
      <p style={{ color: "#ef4444" }}>L: <strong>${d.low.toFixed(2)}</strong></p>
      <p style={{ color: "#64748b" }}>C: <strong>${d.close.toFixed(2)}</strong></p>
    </div>
  );
}

export default function PriceChart({ data }: Props) {
  const [mode, setMode] = useState<"area" | "candle">("area");

  if (!data || data.length === 0) return null;

  const isUp = data[data.length - 1].close >= data[0].close;
  const color = isUp ? "#22c55e" : "#ef4444";
  const gradientId = isUp ? "pcGreen" : "pcRed";

  const step = Math.floor(data.length / 5);
  const ticks: string[] = [];
  for (let i = 0; i < data.length; i += step) ticks.push(data[i].date);

  const yMin = Math.min(...data.map(d => d.low));
  const yMax = Math.max(...data.map(d => d.high));
  const yPad = (yMax - yMin) * 0.05;

  const sharedAxisProps = {
    tick: { fontSize: 11, fill: "#94a3b8" } as const,
    axisLine: false as const,
    tickLine: false as const,
  };

  const yAxis = (domain: [any, any]) => (
    <YAxis
      domain={domain}
      tickFormatter={formatPrice}
      orientation="right"
      width={52}
      {...sharedAxisProps}
    />
  );

  const xAxis = (
    <XAxis
      dataKey="date"
      ticks={ticks}
      tickFormatter={formatDate}
      {...sharedAxisProps}
    />
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400 uppercase tracking-wide">6-Month Price</p>
        <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
          {(["area", "candle"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                mode === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {m === "area" ? "Area" : "Candles"}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        {mode === "area" ? (
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {xAxis}
            {yAxis(["auto", "auto"])}
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Close"]}
              labelFormatter={(label: string) =>
                new Date(label + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })
              }
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
        ) : (
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            {xAxis}
            {yAxis([yMin - yPad, yMax + yPad])}
            <Tooltip content={<CandleTooltip />} />
            {/* Hidden line so recharts computes x-scale and fires tooltip events */}
            <Line dataKey="close" stroke="transparent" dot={false} activeDot={false} legendType="none" />
            <Customized component={(props: any) => <CandleSticks {...props} chartData={data} />} />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
