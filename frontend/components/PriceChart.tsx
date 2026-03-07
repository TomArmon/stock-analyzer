"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

// ─── Pure-SVG candle chart (no recharts internals = no crashes) ───────────────
function CandleChart({ data, isDark }: { data: ChartPoint[]; isDark: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(500);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setW(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((e) => setW(e[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const H = 280, mT = 8, mR = 58, mB = 28, mL = 4;
  const plotW = w - mL - mR;
  const plotH = H - mT - mB;
  const n = data.length;

  const allLow  = Math.min(...data.map((d) => d.low));
  const allHigh = Math.max(...data.map((d) => d.high));
  const pad = (allHigh - allLow) * 0.05;
  const dMin = allLow - pad;
  const dMax = allHigh + pad;

  const xAt = (i: number) => mL + (i + 0.5) / n * plotW;
  const yAt = (v: number) => mT + (1 - (v - dMin) / (dMax - dMin)) * plotH;
  const candleW = Math.max(plotW / n * 0.7, 1.5);

  const yTicks = Array.from({ length: 5 }, (_, i) => dMin + (dMax - dMin) * (i / 4));
  const step = Math.floor(n / 5);
  const xTickIdxs: number[] = [];
  for (let i = 0; i < n; i += step) xTickIdxs.push(i);

  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const idx = Math.floor((e.clientX - rect.left - mL) / plotW * n);
    setHoverIdx(idx >= 0 && idx < n ? idx : null);
  };

  const hov = hoverIdx !== null ? data[hoverIdx] : null;
  const tooltipX = hoverIdx !== null
    ? Math.min(xAt(hoverIdx) + 10, w - 140)
    : 0;

  return (
    <div ref={containerRef} style={{ width: "100%", height: H, position: "relative" }}>
      <svg
        width={w}
        height={H}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Horizontal grid lines */}
        {yTicks.map((v) => (
          <line key={v} x1={mL} x2={w - mR} y1={yAt(v)} y2={yAt(v)} stroke={isDark ? "#1e293b" : "#f1f5f9"} strokeWidth={1} />
        ))}
        {/* Y-axis labels */}
        {yTicks.map((v) => (
          <text key={v} x={w - mR + 6} y={yAt(v) + 4} fontSize={11} fill={isDark ? "#475569" : "#94a3b8"}>
            ${v.toFixed(0)}
          </text>
        ))}
        {/* X-axis labels */}
        {xTickIdxs.map((i) => (
          <text key={i} x={xAt(i)} y={H - 6} fontSize={11} fill={isDark ? "#475569" : "#94a3b8"} textAnchor="middle">
            {formatDate(data[i].date)}
          </text>
        ))}
        {/* Candles */}
        {data.map((pt, i) => {
          const cx = xAt(i);
          const green = pt.close >= pt.open;
          const c = green ? "#22c55e" : "#ef4444";
          const bTop = Math.min(yAt(pt.open), yAt(pt.close));
          const bH   = Math.max(Math.abs(yAt(pt.open) - yAt(pt.close)), 1);
          return (
            <g key={pt.date}>
              <line x1={cx} x2={cx} y1={yAt(pt.high)} y2={yAt(pt.low)} stroke={c} strokeWidth={1} />
              <rect x={cx - candleW / 2} y={bTop} width={candleW} height={bH} fill={c} />
            </g>
          );
        })}
        {/* Hover crosshair */}
        {hoverIdx !== null && (
          <line
            x1={xAt(hoverIdx)} x2={xAt(hoverIdx)}
            y1={mT} y2={H - mB}
            stroke={isDark ? "#475569" : "#94a3b8"} strokeWidth={1} strokeDasharray="4 4"
          />
        )}
      </svg>

      {/* OHLC tooltip */}
      {hov && (
        <div style={{
          position: "absolute", top: 8, left: tooltipX,
          background: isDark ? "#1e293b" : "#fff",
          border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
          borderRadius: 8, padding: "8px 12px", fontSize: 12,
          pointerEvents: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}>
          <p style={{ fontWeight: 600, color: isDark ? "#e2e8f0" : "#334155", marginBottom: 4 }}>
            {new Date(hov.date + "T00:00:00").toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            })}
          </p>
          <p style={{ color: isDark ? "#94a3b8" : "#64748b" }}>O: <strong>${hov.open.toFixed(2)}</strong></p>
          <p style={{ color: "#22c55e" }}>H: <strong>${hov.high.toFixed(2)}</strong></p>
          <p style={{ color: "#ef4444" }}>L: <strong>${hov.low.toFixed(2)}</strong></p>
          <p style={{ color: isDark ? "#e2e8f0" : "#334155" }}>C: <strong>${hov.close.toFixed(2)}</strong></p>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PriceChart({ data }: Props) {
  const [mode, setMode] = useState<"area" | "candle">("area");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  useEffect(() => setMounted(true), []);

  if (!data || data.length === 0) return null;

  const isDark = mounted && resolvedTheme === "dark";
  const isUp = data[data.length - 1].close >= data[0].close;
  const color = isUp ? "#22c55e" : "#ef4444";
  const gradientId = isUp ? "pcGreen" : "pcRed";

  const step = Math.floor(data.length / 5);
  const ticks: string[] = [];
  for (let i = 0; i < data.length; i += step) ticks.push(data[i].date);

  const tickColor = isDark ? "#475569" : "#94a3b8";
  const tooltipStyle = {
    borderRadius: 8,
    border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    fontSize: 12,
    background: isDark ? "#1e293b" : "#fff",
    color: isDark ? "#e2e8f0" : "#334155",
  };

  const axisProps = {
    tick: { fontSize: 11, fill: tickColor } as const,
    axisLine: false as const,
    tickLine: false as const,
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide">6-Month Price</p>
        <div className="flex gap-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
          {(["area", "candle"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                mode === m
                  ? "bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              {m === "area" ? "Area" : "Candles"}
            </button>
          ))}
        </div>
      </div>

      {mode === "area" ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" ticks={ticks} tickFormatter={formatDate} {...axisProps} />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              orientation="right"
              width={52}
              {...axisProps}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Close"]}
              labelFormatter={(label: string) =>
                new Date(label + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })
              }
              contentStyle={tooltipStyle}
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
      ) : (
        <CandleChart data={data} isDark={isDark} />
      )}
    </div>
  );
}
