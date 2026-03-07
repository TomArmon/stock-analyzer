"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const KEY = "recentTickers";
const MAX = 5;

interface RecentEntry {
  ticker: string;
  count: number;
  name: string;
}

export function saveRecent(ticker: string, name = "") {
  try {
    const stored: RecentEntry[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const existing = stored.find((e) => e.ticker === ticker);
    if (existing) {
      existing.count += 1;
      if (name) existing.name = name;
      localStorage.setItem(
        KEY,
        JSON.stringify([existing, ...stored.filter((e) => e.ticker !== ticker)].slice(0, MAX))
      );
    } else {
      localStorage.setItem(
        KEY,
        JSON.stringify([{ ticker, count: 1, name }, ...stored].slice(0, MAX))
      );
    }
  } catch {}
}

interface Props {
  onSelect: (ticker: string) => void;
  exclude: string;
}

export default function RecentSearches({ onSelect, exclude }: Props) {
  const [recents, setRecents] = useState<RecentEntry[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      // Migrate old format (plain string array)
      if (typeof parsed[0] === "string") {
        setRecents(parsed.map((t: string) => ({ ticker: t, count: 1, name: "" })));
      } else {
        setRecents(parsed);
      }
    } catch {}
  }, [exclude]);

  const clearHistory = () => {
    localStorage.removeItem(KEY);
    setRecents([]);
    setShowConfirm(false);
  };

  if (recents.length === 0) return null;

  return (
    <>
      <div className="mt-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide font-medium">Recent</p>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 hover:text-red-400 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 size={11} />
            Clear
          </button>
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-2">
          {recents.map(({ ticker, count, name }) => {
            const isCurrent = ticker === exclude;
            return (
              <div
                key={ticker}
                className="relative"
                onMouseEnter={() => setHovered(ticker)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Count badge */}
                {count > 1 && (
                  <span className="absolute -top-1.5 -right-1.5 z-10 flex items-center justify-center min-w-[16px] h-4 px-0.5 rounded-full bg-slate-500 text-white text-[9px] font-bold leading-none">
                    {count > 99 ? "99+" : count}
                  </span>
                )}

                {/* Chip */}
                <button
                  onClick={() => onSelect(ticker)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    isCurrent
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {ticker}
                </button>

                {/* Name tooltip */}
                {hovered === ticker && name && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap pointer-events-none z-20 shadow-lg">
                    {name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-80 mx-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 mx-auto mb-4">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 text-center mb-1">
              Clear search history?
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center mb-6">
              This will remove all {recents.length} recent search{recents.length !== 1 ? "es" : ""}. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearHistory}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Clear history
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
