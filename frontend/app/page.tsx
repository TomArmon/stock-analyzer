"use client";
import { useState } from "react";
import TickerInput from "@/components/TickerInput";
import StockReport from "@/components/StockReport";
import { fetchStockData, StockData } from "@/lib/api";

export default function Home() {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (ticker: string) => {
    setLoading(true);
    setErrorMsg("");
    setData(null);

    try {
      const result = await fetchStockData(ticker);
      setData(result);
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-14">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Stock Analyzer</h1>
          <p className="text-slate-400">Enter any US stock ticker for a full technical analysis</p>
        </div>

        {/* Input */}
        <TickerInput onSearch={handleSearch} loading={loading} />

        {/* Loading */}
        {loading && (
          <div className="text-center mt-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-slate-400 text-sm">Fetching data...</p>
          </div>
        )}

        {/* Error */}
        {errorMsg && !loading && (
          <div className="mt-8 px-5 py-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* Report */}
        {data && !loading && <StockReport data={data} />}

      </div>
    </main>
  );
}
