const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface StockData {
  ticker: string;
  name: string;
  price: number;
  prev_price: number;
  price_change: number;
  price_change_pct: number;
  volume: number;
  avg_volume_20d: number;
  ema_21: number;
  ema21_diff: number;
  ema21_pct: number;
  sma_50: number | null;
  sma50_diff: number | null;
  sma50_pct: number | null;
  sma_200: number | null;
  sma200_diff: number | null;
  sma200_pct: number | null;
  rs_rating: number | null;
  sentiment: {
    sentiment_label: string;
    bullish_pct: number | null;
    headlines: string[];
  };
}

export async function fetchStockData(ticker: string): Promise<StockData> {
  const res = await fetch(`${API_URL}/analyze/${ticker}`);
  if (!res.ok) {
    const err: any = new Error("Request failed");
    err.status = res.status;
    try {
      const body = await res.json();
      err.message = body.detail || "Request failed";
    } catch {}
    throw err;
  }
  return res.json();
}
