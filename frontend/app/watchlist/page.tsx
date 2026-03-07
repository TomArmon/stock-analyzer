"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, X, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { fetchStockData, StockData } from "@/lib/api";
import { getWatchlist, saveWatchlist } from "@/lib/watchlist";

interface Card {
  ticker: string;
  data: StockData | null;
  loading: boolean;
  error: boolean;
}

export default function WatchlistPage() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const tickers = getWatchlist();
    setCards(tickers.map((t) => ({ ticker: t, data: null, loading: true, error: false })));
    tickers.forEach(fetchCard);
  }, []);

  const fetchCard = async (ticker: string) => {
    try {
      const data = await fetchStockData(ticker);
      setCards((prev) => prev.map((c) => c.ticker === ticker ? { ...c, data, loading: false } : c));
    } catch {
      setCards((prev) => prev.map((c) => c.ticker === ticker ? { ...c, loading: false, error: true } : c));
    }
  };

  const add = async () => {
    const t = input.trim().toUpperCase();
    if (!t || cards.some((c) => c.ticker === t)) { setInput(""); return; }
    const updated = [...cards, { ticker: t, data: null, loading: true, error: false }];
    setCards(updated);
    saveWatchlist(updated.map((c) => c.ticker));
    setInput("");
    fetchCard(t);
  };

  const remove = (ticker: string) => {
    setCards((prev) => {
      const next = prev.filter((c) => c.ticker !== ticker);
      saveWatchlist(next.map((c) => c.ticker));
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Star size={22} className="text-amber-400" fill="currentColor" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Watchlist</h1>
      </div>

      {/* Add */}
      <div className="flex gap-2 mb-10">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add ticker (e.g. AAPL)"
          maxLength={5}
          className="max-w-xs px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={add}
          disabled={!input.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="text-center py-24 text-slate-400">
          <Star size={44} className="mx-auto mb-4 text-slate-200 dark:text-slate-700" />
          <p className="font-medium text-slate-500 dark:text-slate-400">Your watchlist is empty</p>
          <p className="text-sm mt-1 text-slate-400 dark:text-slate-500">Add tickers above, or star a stock from the Search page</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ ticker, data, loading, error }) => (
          <div
            key={ticker}
            onClick={() => router.push(`/?ticker=${ticker}`)}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 cursor-pointer hover:shadow-md transition-shadow relative group"
          >
            <button
              onClick={(e) => { e.stopPropagation(); remove(ticker); }}
              className="absolute top-3 right-3 p-1 rounded-lg text-slate-200 dark:text-slate-600 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 opacity-0 group-hover:opacity-100 transition-all"
            >
              <X size={14} />
            </button>

            {loading && (
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-28 bg-slate-100 dark:bg-slate-700/60 rounded" />
                <div className="h-7 w-20 bg-slate-200 dark:bg-slate-700 rounded mt-4" />
                <div className="h-3 w-14 bg-slate-100 dark:bg-slate-700/60 rounded" />
              </div>
            )}

            {error && (
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">{ticker}</p>
                <p className="text-sm text-red-400 mt-2">Failed to load</p>
              </div>
            )}

            {data && !loading && (
              <>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">{data.ticker}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{data.name}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-3">
                  ${data.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${data.price_change >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {data.price_change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {data.price_change >= 0 ? "+" : ""}{data.price_change_pct.toFixed(2)}%
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
