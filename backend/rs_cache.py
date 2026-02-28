"""
RS Rating cache.
Downloads S&P 500 universe scores once per day and caches them to disk.
Individual ticker ratings are then computed instantly against the cached scores.
"""
import json
import os
import pandas as pd
import yfinance as yf
from datetime import date

CACHE_FILE = os.path.join(os.path.dirname(__file__), "universe_cache.json")

SP500_UNIVERSE = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "META", "NVDA", "TSLA", "BRK-B", "JPM",
    "JNJ", "V", "UNH", "XOM", "PG", "HD", "MA", "BAC", "CVX", "ABBV", "MRK",
    "LLY", "PEP", "KO", "TMO", "COST", "AVGO", "MCD", "WMT", "ACN", "DHR",
    "ABT", "CSCO", "NEE", "TXN", "NFLX", "QCOM", "PM", "RTX", "INTU", "AMD",
    "UPS", "SPGI", "MS", "GS", "BLK", "AMGN", "ISRG", "SBUX", "GE", "DE",
    "CAT", "BA", "IBM", "CRM", "NOW", "ADBE", "INTC", "T", "VZ", "DIS",
    "CMCSA", "PFE", "BMY", "GILD", "MO", "SO", "DUK", "WFC", "C", "AXP",
    "BK", "COF", "ALL", "MET", "PRU", "EOG", "COP", "FDX", "UNP", "LMT",
    "NOC", "GD", "TRV", "CB", "USB", "OXY", "HAL", "MPC", "VLO", "PSX",
    "PYPL", "UBER", "ABNB", "COIN", "HOOD", "RBLX", "SNAP", "DASH", "SQ", "LYFT",
]


def _ibd_score(close_series: pd.Series) -> float | None:
    n = len(close_series)
    if n < 20:
        return None
    q = max(1, n // 4)

    def qret(end_offset, start_offset):
        end_idx = -(end_offset + 1) if end_offset > 0 else -1
        start_idx = -(start_offset + 1)
        if abs(start_idx) > n:
            return 0.0
        p_end = close_series.iloc[end_idx]
        p_start = close_series.iloc[start_idx]
        return float((p_end / p_start) - 1) if p_start != 0 else 0.0

    q1 = qret(0, q)
    q2 = qret(q, 2 * q)
    q3 = qret(2 * q, 3 * q)
    q4 = qret(3 * q, 4 * q)
    return (q1 * 2 + q2 + q3 + q4) / 5


def _refresh() -> list:
    print("Refreshing RS universe cache...", flush=True)
    try:
        raw = yf.download(SP500_UNIVERSE, period="1y", progress=False, auto_adjust=True)
        closes = raw["Close"] if isinstance(raw.columns, pd.MultiIndex) else raw
    except Exception as e:
        print(f"[!] RS cache refresh failed: {e}")
        return []

    scores = []
    for t in SP500_UNIVERSE:
        if t in closes.columns:
            series = closes[t].dropna()
            score = _ibd_score(series)
            if score is not None:
                scores.append(score)
    scores.sort()

    try:
        with open(CACHE_FILE, "w") as f:
            json.dump({"date": date.today().isoformat(), "scores": scores}, f)
        print(f"RS cache saved: {len(scores)} universe scores", flush=True)
    except Exception as e:
        print(f"[!] Could not save RS cache: {e}")

    return scores


def get_universe_scores() -> list:
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE) as f:
                cache = json.load(f)
            if cache.get("date") == date.today().isoformat() and cache.get("scores"):
                return cache["scores"]
        except Exception:
            pass
    return _refresh()


def rate_ticker(hist: pd.DataFrame, universe_scores: list) -> int | None:
    if hist is None or hist.empty or not universe_scores:
        return None
    score = _ibd_score(hist["Close"])
    if score is None:
        return None
    total = len(universe_scores)
    below = sum(1 for s in universe_scores if s < score)
    return max(1, min(99, int((below / total) * 98) + 1))
