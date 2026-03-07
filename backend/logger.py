import logging
import os
from datetime import date
from supabase import create_client, Client

log = logging.getLogger(__name__)

_client: Client | None = None


def _get_client() -> Client | None:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        if url and key:
            try:
                _client = create_client(url, key)
                log.info("Supabase client created successfully")
            except Exception as e:
                log.error("Supabase create_client failed: %s", e)
        else:
            log.error("Supabase env vars missing: URL=%s KEY=%s", bool(url), bool(key))
    return _client


def log_search(
    ticker: str,
    ip_hash: str,
    success: bool,
    response_time_ms: int,
    error_type: str | None = None,
) -> None:
    try:
        client = _get_client()
        if client is None:
            return
        client.table("search_log").insert({
            "ticker": ticker,
            "ip_hash": ip_hash,
            "success": success,
            "response_time_ms": response_time_ms,
            "error_type": error_type,
        }).execute()
    except Exception as e:
        log.error("Supabase log_search failed: %s", e)


def get_stats() -> dict:
    client = _get_client()
    if client is None:
        return {"error": "Supabase not configured"}

    rows = client.table("search_log").select("*").execute().data

    total = len(rows)
    successes = sum(1 for r in rows if r["success"])
    success_rate = round(successes / total * 100, 1) if total else 0

    today_str = date.today().isoformat()
    today_count = sum(1 for r in rows if r.get("searched_at", "").startswith(today_str))

    ticker_counts: dict[str, int] = {}
    for r in rows:
        ticker_counts[r["ticker"]] = ticker_counts.get(r["ticker"], 0) + 1
    top_tickers = sorted(ticker_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    last_10 = sorted(rows, key=lambda r: r["searched_at"], reverse=True)[:10]

    return {
        "total_searches": total,
        "success_rate_pct": success_rate,
        "today_searches": today_count,
        "top_tickers": [{"ticker": t, "count": c} for t, c in top_tickers],
        "last_10_searches": [
            {"ticker": r["ticker"], "searched_at": r["searched_at"]} for r in last_10
        ],
    }
