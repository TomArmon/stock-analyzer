"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { StockData } from "@/lib/api";
import { isInWatchlist, toggleWatchlist } from "@/lib/watchlist";

function fmtPrice(v: number): string {
  if (v >= 1000) return `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${v.toFixed(2)}`;
}

function fmtVolume(v: number): string {
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  return v.toLocaleString("en-US");
}

function fmtDiff(diff: number | null, pct: number | null) {
  if (diff === null || pct === null) return { diffStr: "N/A", pctStr: "N/A", positive: null };
  const positive = diff >= 0;
  const sign = positive ? "+" : "-";
  return {
    diffStr: `${sign}$${Math.abs(diff).toFixed(2)}`,
    pctStr: `${sign}${Math.abs(pct).toFixed(2)}%`,
    positive,
  };
}

interface MARow {
  label: string;
  value: number | null;
  diff: number | null;
  pct: number | null;
}

export default function StockReport({ data }: { data: StockData }) {
  const [watched, setWatched] = useState(false);
  useEffect(() => { setWatched(isInWatchlist(data.ticker)); }, [data.ticker]);

  const handleWatchlist = () => setWatched(toggleWatchlist(data.ticker));

  const up = data.price_change >= 0;
  const volRatio = data.avg_volume_20d > 0 ? data.volume / data.avg_volume_20d : 1;
  const volPct = ((volRatio - 1) * 100).toFixed(0);

  const maRows: MARow[] = [
    { label: "21 EMA", value: data.ema_21, diff: data.ema21_diff, pct: data.ema21_pct },
    { label: "50 SMA", value: data.sma_50, diff: data.sma50_diff, pct: data.sma50_pct },
    { label: "200 SMA", value: data.sma_200, diff: data.sma200_diff, pct: data.sma200_pct },
  ];

  const rsColor =
    data.rs_rating === null ? "text-slate-400"
    : data.rs_rating >= 70 ? "text-green-500"
    : data.rs_rating >= 40 ? "text-amber-500"
    : "text-red-500";

  const sentimentColor =
    data.sentiment.sentiment_label === "Bullish"
      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
      : data.sentiment.sentiment_label === "Bearish"
      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300";

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{data.ticker}</p>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{data.name}</h2>
        </div>
        <div className="flex items-start gap-3">
          <button
            onClick={handleWatchlist}
            className="mt-1 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title={watched ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Star
              size={18}
              className={watched ? "text-amber-400" : "text-slate-300 dark:text-slate-600"}
              fill={watched ? "currentColor" : "none"}
            />
          </button>
          <div className="text-right">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">RS Rating</p>
            {data.rs_rating !== null ? (
              <p className={`text-2xl font-bold ${rsColor}`}>
                {data.rs_rating}<span className="text-sm font-normal text-slate-400 dark:text-slate-500">/99</span>
              </p>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm">N/A</p>
            )}
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-4xl font-bold text-slate-800 dark:text-slate-100">{fmtPrice(data.price)}</span>
          <span className={`text-lg font-semibold ${up ? "text-green-500" : "text-red-500"}`}>
            {up ? "▲" : "▼"} {up ? "+" : "-"}${Math.abs(data.price_change).toFixed(2)}&nbsp;
            ({up ? "+" : ""}{data.price_change_pct.toFixed(2)}%)
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-4">
          <span>Volume: <span className="font-medium text-slate-700 dark:text-slate-200">{fmtVolume(data.volume)}</span></span>
          <span>20d avg: <span className="font-medium text-slate-700 dark:text-slate-200">{fmtVolume(data.avg_volume_20d)}</span></span>
          <span className={volRatio >= 1.5 ? "text-amber-500 font-medium" : volRatio <= 0.5 ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}>
            ({Number(volPct) >= 0 ? "+" : ""}{volPct}% vs avg)
          </span>
        </div>
      </div>

      {/* Technical Signals */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Technical Signals</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-400 dark:text-slate-500 uppercase">
                <th className="text-left pb-3 font-medium">Indicator</th>
                <th className="text-right pb-3 font-medium">Value</th>
                <th className="text-center pb-3 font-medium">Position</th>
                <th className="text-right pb-3 font-medium">Distance $</th>
                <th className="text-right pb-3 font-medium">Distance %</th>
              </tr>
            </thead>
            <tbody>
              {maRows.map((row) => {
                const { diffStr, pctStr, positive } = fmtDiff(row.diff, row.pct);
                return (
                  <tr key={row.label} className="border-t border-slate-50 dark:border-slate-700/60">
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-200">{row.label}</td>
                    <td className="text-right text-slate-600 dark:text-slate-300 py-3">
                      {row.value !== null ? fmtPrice(row.value) : "N/A"}
                    </td>
                    <td className="text-center py-3">
                      {positive !== null ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          positive
                            ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}>
                          {positive ? "Above" : "Below"}
                        </span>
                      ) : <span className="text-slate-400">N/A</span>}
                    </td>
                    <td className={`text-right py-3 font-medium ${positive === null ? "text-slate-400" : positive ? "text-green-500" : "text-red-500"}`}>
                      {diffStr}
                    </td>
                    <td className={`text-right py-3 font-medium ${positive === null ? "text-slate-400" : positive ? "text-green-500" : "text-red-500"}`}>
                      {pctStr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* News & Sentiment */}
      <div className="px-6 py-5">
        <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">News & Sentiment</h3>
        {data.sentiment.sentiment_label !== "N/A" && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sentimentColor}`}>
              {data.sentiment.sentiment_label}
            </span>
            {data.sentiment.bullish_pct !== null && (
              <span className="text-sm text-slate-500 dark:text-slate-400">{data.sentiment.bullish_pct}% bullish</span>
            )}
          </div>
        )}
        {data.sentiment.headlines.length > 0 ? (
          <ul className="space-y-2">
            {data.sentiment.headlines.map((h, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-300 flex gap-2">
                <span className="text-slate-300 dark:text-slate-600 mt-0.5 shrink-0">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500">No recent headlines available.</p>
        )}
      </div>
    </div>
  );
}
