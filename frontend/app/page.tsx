"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TickerInput from "@/components/TickerInput";
import StockReport from "@/components/StockReport";
import PriceChart from "@/components/PriceChart";
import SkeletonReport from "@/components/SkeletonReport";
import RecentSearches, { saveRecent } from "@/components/RecentSearches";
import { fetchStockData, StockData } from "@/lib/api";

function HomeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentTicker, setCurrentTicker] = useState("");

  const handleSearch = async (ticker: string, silent = false) => {
    setLoading(true);
    setErrorMsg("");
    setData(null);

    try {
      const result = await fetchStockData(ticker);
      setData(result);
      setCurrentTicker(ticker);
      if (!silent) {
        saveRecent(ticker, result.name);
        router.replace("?ticker=" + ticker);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Restore from URL on mount — silent so it doesn't increment count or touch the URL
  useEffect(() => {
    const ticker = searchParams.get("ticker");
    if (ticker) handleSearch(ticker.toUpperCase(), true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main>
      <div className="max-w-6xl mx-auto px-4 py-14">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">Stock Analyzer</h1>
          <p className="text-slate-400 dark:text-slate-500">Enter any US stock ticker for a full technical analysis</p>
        </div>

        {/* Input + Recent Searches */}
        <div className="max-w-xl mx-auto">
          <TickerInput onSearch={handleSearch} loading={loading} />
          <RecentSearches onSelect={handleSearch} exclude={currentTicker} />
        </div>

        {/* Error */}
        {errorMsg && !loading && (
          <div className="max-w-xl mx-auto mt-8 px-5 py-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* Skeleton loader */}
        {loading && (
          <div className="mt-10 grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
              <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
            <SkeletonReport />
          </div>
        )}

        {/* 2-column layout: chart left, report right */}
        {data && !loading && (
          <div className="mt-10 grid lg:grid-cols-2 gap-6">
            <PriceChart data={data.chart_data} />
            <StockReport data={data} />
          </div>
        )}

      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
