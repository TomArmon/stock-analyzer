import asyncio
import os
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from fetch import get_stock_data
from rs_cache import get_universe_scores, rate_ticker
from sentiment import get_sentiment

executor = ThreadPoolExecutor(max_workers=4)
FINNHUB_KEY = os.getenv("FINNHUB_API_KEY", "")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm RS cache in background on startup so first request is fast
    loop = asyncio.get_event_loop()
    loop.run_in_executor(executor, get_universe_scores)
    yield


app = FastAPI(title="Stock Analyzer API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/analyze/{ticker}")
def analyze(ticker: str):
    ticker = ticker.upper().strip()

    # Validate: only A-Z letters, 1-5 chars
    if not ticker.isalpha() or not (1 <= len(ticker) <= 5):
        raise HTTPException(status_code=400, detail="Invalid ticker format. Use 1-5 English letters only.")

    # Fetch price + technical data
    data = get_stock_data(ticker)
    if data is None:
        raise HTTPException(status_code=404, detail=f"No data found for '{ticker}'. Check the symbol and try again.")

    hist = data.pop("hist")  # Remove DataFrame before JSON serialisation

    # RS Rating (uses cached universe — instant after first daily refresh)
    universe = get_universe_scores()
    rs_rating = rate_ticker(hist, universe)

    # News sentiment
    sentiment = get_sentiment(ticker, FINNHUB_KEY) if FINNHUB_KEY else {
        "sentiment_label": "N/A",
        "bullish_pct": None,
        "headlines": [],
    }

    return {
        **data,
        "rs_rating": rs_rating,
        "sentiment": sentiment,
    }
