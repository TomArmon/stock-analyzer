import yfinance as yf
import pandas as pd


def get_stock_data(ticker: str) -> dict | None:
    """Fetch price, volume, and technical indicators for a single US stock ticker."""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1y", auto_adjust=True)

        if hist.empty or len(hist) < 2:
            return None

        current_price = float(hist["Close"].iloc[-1])
        prev_price = float(hist["Close"].iloc[-2])
        price_change = current_price - prev_price
        price_change_pct = (price_change / prev_price) * 100

        current_volume = float(hist["Volume"].iloc[-1])
        avg_volume_20d = float(hist["Volume"].tail(20).mean())

        ema_21 = float(hist["Close"].ewm(span=21, adjust=False).mean().iloc[-1])
        sma_50 = float(hist["Close"].tail(50).mean()) if len(hist) >= 50 else None
        sma_200 = float(hist["Close"].tail(200).mean()) if len(hist) >= 200 else None

        def ma_diff(price, ma):
            if ma is None:
                return None, None
            diff = price - ma
            pct = (diff / ma) * 100
            return round(diff, 4), round(pct, 2)

        ema21_diff, ema21_pct = ma_diff(current_price, ema_21)
        sma50_diff, sma50_pct = ma_diff(current_price, sma_50)
        sma200_diff, sma200_pct = ma_diff(current_price, sma_200)

        try:
            info = stock.info
            name = info.get("longName") or info.get("shortName") or ticker
        except Exception:
            name = ticker

        return {
            "ticker": ticker,
            "name": name,
            "price": round(current_price, 4),
            "prev_price": round(prev_price, 4),
            "price_change": round(price_change, 4),
            "price_change_pct": round(price_change_pct, 2),
            "volume": current_volume,
            "avg_volume_20d": avg_volume_20d,
            "ema_21": round(ema_21, 4),
            "ema21_diff": ema21_diff,
            "ema21_pct": ema21_pct,
            "sma_50": round(sma_50, 4) if sma_50 else None,
            "sma50_diff": sma50_diff,
            "sma50_pct": sma50_pct,
            "sma_200": round(sma_200, 4) if sma_200 else None,
            "sma200_diff": sma200_diff,
            "sma200_pct": sma200_pct,
            "hist": hist,
        }
    except Exception as e:
        print(f"[!] Error fetching {ticker}: {e}")
        return None
