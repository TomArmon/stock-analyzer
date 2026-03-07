const KEY = "watchlist";

export function getWatchlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveWatchlist(tickers: string[]): void {
  localStorage.setItem(KEY, JSON.stringify(tickers));
}

export function isInWatchlist(ticker: string): boolean {
  return getWatchlist().includes(ticker);
}

export function toggleWatchlist(ticker: string): boolean {
  const list = getWatchlist();
  const inList = list.includes(ticker);
  if (inList) {
    saveWatchlist(list.filter((t) => t !== ticker));
  } else {
    saveWatchlist([ticker, ...list]);
  }
  return !inList; // true = now added
}
