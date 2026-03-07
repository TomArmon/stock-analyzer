"use client";
import { useEffect, useState } from "react";

const KEY = "recentTickers";
const MAX = 5;

interface RecentEntry {
  ticker: string;
  count: number;
  name: string;
}

export function saveRecent(ticker: string, name = "") {
  try {
    const raw = localStorage.getItem(KEY) || "[]";
    const stored: RecentEntry[] = JSON.parse(raw);
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

  if (recents.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Recent</p>
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
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
  );
}
