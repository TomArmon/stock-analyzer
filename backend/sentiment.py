import finnhub
from datetime import datetime, timedelta


def _sentiment_label(bullish_pct: float) -> str:
    if bullish_pct > 0.60:
        return "Bullish"
    elif bullish_pct < 0.40:
        return "Bearish"
    return "Neutral"


def get_sentiment(ticker: str, api_key: str) -> dict:
    """Fetch news headlines and sentiment score for a single stock."""
    client = finnhub.Client(api_key=api_key)
    today = datetime.now()
    week_ago = today - timedelta(days=7)

    headlines = []
    try:
        news = client.company_news(
            ticker,
            _from=week_ago.strftime("%Y-%m-%d"),
            to=today.strftime("%Y-%m-%d"),
        )
        headlines = [a.get("headline", "") for a in news[:3] if a.get("headline")]
    except Exception:
        pass

    bullish_pct = None
    sentiment_label = "N/A"
    try:
        data = client.news_sentiment(ticker)
        raw = data.get("sentiment", {}).get("bullishPercent")
        if raw is not None:
            bullish_pct = round(raw * 100, 1)
            sentiment_label = _sentiment_label(raw)
    except Exception:
        pass

    return {
        "sentiment_label": sentiment_label,
        "bullish_pct": bullish_pct,
        "headlines": headlines,
    }
