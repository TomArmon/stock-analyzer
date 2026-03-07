"use client";
import { useEffect, useState } from "react";

const KEY = "recentTickers";
const MAX = 5;

export function saveRecent(ticker: string) {
  try {
    const stored: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const updated = [ticker, ...stored.filter((t) => t !== ticker)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

interface Props {
  onSelect: (ticker: string) => void;
  exclude: string;
}

export default function RecentSearches({ onSelect, exclude }: Props) {
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      setRecents(stored);
    } catch {}
  }, [exclude]); // re-read whenever a new search completes

  if (recents.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {recents.map((ticker) => {
        const isCurrent = ticker === exclude;
        return (
          <button
            key={ticker}
            onClick={() => onSelect(ticker)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              isCurrent
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {ticker}
          </button>
        );
      })}
    </div>
  );
}
