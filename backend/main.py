import asyncio
import os
import time
from collections import defaultdict
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

load_dotenv()

from fetch import get_stock_data
from rs_cache import get_universe_scores, rate_ticker
from sentiment import get_sentiment

executor = ThreadPoolExecutor(max_workers=4)
FINNHUB_KEY = os.getenv("FINNHUB_API_KEY", "")
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "https://stock-analyzer-sand-nu.vercel.app")

# ── Rate limiting ─────────────────────────────────────────────────────────────
# Tracks (ip -> list of request timestamps within the window)
RATE_LIMIT_REQUESTS = 10       # max requests per IP
RATE_LIMIT_WINDOW   = 60       # per N seconds
BLOCK_AFTER_STRIKES = 3        # strikes before longer block
BLOCK_DURATION      = 300      # 5 minutes block after too many violations

_request_log: dict[str, list[float]] = defaultdict(list)
_strikes:     dict[str, int]         = defaultdict(int)
_blocked:     dict[str, float]       = {}


def _check_rate_limit(ip: str):
    now = time.time()

    # Check if IP is in hard block
    if ip in _blocked:
        if now < _blocked[ip]:
            retry = int(_blocked[ip] - now)
            raise HTTPException(
                status_code=429,
                detail=f"Too many requests. Try again in {retry} seconds."
            )
        else:
            del _blocked[ip]

    # Prune old timestamps outside the window
    _request_log[ip] = [t for t in _request_log[ip] if now - t < RATE_LIMIT_WINDOW]

    if len(_request_log[ip]) >= RATE_LIMIT_REQUESTS:
        _strikes[ip] += 1
        if _strikes[ip] >= BLOCK_AFTER_STRIKES:
            _blocked[ip] = now + BLOCK_DURATION
            raise HTTPException(
                status_code=429,
                detail=f"Repeated abuse detected. Blocked for {BLOCK_DURATION // 60} minutes."
            )
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit exceeded. Max {RATE_LIMIT_REQUESTS} requests per {RATE_LIMIT_WINDOW} seconds."
        )

    _request_log[ip].append(now)
# ─────────────────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    loop = asyncio.get_event_loop()
    loop.run_in_executor(executor, get_universe_scores)
    yield


app = FastAPI(title="Stock Analyzer API", lifespan=lifespan)

# ── CORS — only allow requests from the Vercel frontend ──────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[ALLOWED_ORIGIN],
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _get_ip(request: Request) -> str:
    """Extract real client IP, accounting for Render's proxy headers."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/analyze/{ticker}")
def analyze(ticker: str, request: Request):
    ip = _get_ip(request)
    _check_rate_limit(ip)

    ticker = ticker.upper().strip()

    # Strict input validation
    if not ticker.isalpha() or not (1 <= len(ticker) <= 5):
        raise HTTPException(
            status_code=400,
            detail="Invalid ticker. Use 1-5 English letters only."
        )

    data = get_stock_data(ticker)
    if data is None:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for '{ticker}'. Check the symbol and try again."
        )

    hist = data.pop("hist")

    universe = get_universe_scores()
    rs_rating = rate_ticker(hist, universe)

    sentiment = get_sentiment(ticker, FINNHUB_KEY) if FINNHUB_KEY else {
        "sentiment_label": "N/A",
        "bullish_pct": None,
        "headlines": [],
    }

    return {**data, "rs_rating": rs_rating, "sentiment": sentiment}
