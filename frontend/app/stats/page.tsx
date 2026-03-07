"use client";
import { useEffect, useState } from "react";
import { Search, CheckCircle, Calendar } from "lucide-react";
import { fetchStats, StatsData } from "@/lib/api";

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats()
      .then(setData)
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 animate-pulse space-y-6">
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-white dark:bg-slate-800 rounded-2xl shadow-sm" />)}
        </div>
        <div className="h-64 bg-white dark:bg-slate-800 rounded-2xl shadow-sm" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-12 text-red-500 text-sm">{error || "No data"}</div>;
  }

  const maxCount = data.top_tickers[0]?.count ?? 1;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8">Stats</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Searches", value: data.total_searches.toLocaleString(), icon: Search,       color: "text-blue-500"  },
          { label: "Success Rate",   value: `${data.success_rate_pct}%`,           icon: CheckCircle,  color: "text-green-500" },
          { label: "Today",          value: data.today_searches.toLocaleString(),   icon: Calendar,     color: "text-amber-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-5">
            <Icon size={20} className={`${color} mb-3`} />
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Top tickers */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">Top Tickers</h2>
        <div className="space-y-3">
          {data.top_tickers.map(({ ticker, count }) => (
            <div key={ticker} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 w-14 shrink-0">{ticker}</span>
              <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-sm text-slate-400 dark:text-slate-500 w-8 text-right shrink-0">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent searches */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-5">Recent Searches</h2>
        <div className="space-y-2.5">
          {data.last_10_searches.map(({ ticker, searched_at }, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{ticker}</span>
              <span className="text-slate-400 dark:text-slate-500">
                {new Date(searched_at).toLocaleString("en-US", {
                  month: "short", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
