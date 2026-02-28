"use client";
import { useState, KeyboardEvent } from "react";

interface Props {
  onSearch: (ticker: string) => void;
  loading: boolean;
}

export default function TickerInput({ onSearch, loading }: Props) {
  const [ticker, setTicker] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Detect any character that is not A-Z (case-insensitive)
    if (/[^a-zA-Z]/.test(raw)) {
      setError("Only English letters A-Z are allowed. No numbers or special characters.");
    } else {
      setError("");
    }

    // Strip invalid chars and force uppercase
    setTicker(raw.replace(/[^a-zA-Z]/g, "").toUpperCase());
  };

  const handleSubmit = () => {
    if (!ticker) {
      setError("Please enter a ticker symbol.");
      return;
    }
    if (error) return;
    onSearch(ticker);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full max-w-md gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={ticker}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="e.g. AAPL"
            maxLength={5}
            autoFocus
            disabled={loading}
            className={`w-full px-4 py-3 text-2xl font-mono tracking-widest border-2 rounded-xl outline-none transition-colors bg-white text-slate-800 placeholder-slate-300
              ${error
                ? "border-red-400 focus:border-red-500"
                : "border-slate-200 focus:border-blue-500"
              }`}
          />
          {error && (
            <p className="mt-1.5 text-sm text-red-500 pl-1">{error}</p>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !!error || !ticker}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          Analyze
        </button>
      </div>
    </div>
  );
}
