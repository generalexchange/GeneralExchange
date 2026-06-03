"""Lightweight, dependency-free NLP primitives for the news worker.

Lexicon sentiment, keyword-driven impact scoring, symbol tagging, and a
deterministic hashing embedding (the feature-hashing trick). These are
intentionally simple and self-contained — a transformer model can be swapped in
behind the same interface later without touching the worker.
"""

from __future__ import annotations

import hashlib
import re

import numpy as np

EMBED_DIM = 64

_POSITIVE = {
    "beat", "beats", "surge", "surges", "soar", "rally", "record", "growth", "strong", "upgrade",
    "upgraded", "outperform", "bullish", "gain", "gains", "jumps", "tops", "raises", "expands",
    "profit", "wins", "approval", "breakthrough", "optimistic", "rebound",
}
_NEGATIVE = {
    "miss", "misses", "plunge", "plunges", "slump", "selloff", "weak", "downgrade", "downgraded",
    "underperform", "bearish", "loss", "losses", "falls", "drops", "cuts", "warning", "warns",
    "probe", "lawsuit", "recall", "bankruptcy", "fraud", "investigation", "slowdown", "layoffs",
}
# events that move markets regardless of valence
_IMPACT_KEYWORDS = {
    "earnings": 0.4, "guidance": 0.4, "fed": 0.5, "fomc": 0.5, "rate": 0.35, "cpi": 0.45,
    "inflation": 0.4, "sec": 0.4, "merger": 0.45, "acquisition": 0.45, "bankruptcy": 0.6,
    "downgrade": 0.4, "upgrade": 0.35, "recall": 0.4, "lawsuit": 0.35, "halt": 0.5,
}
_SOURCE_WEIGHT = {
    "Bloomberg": 1.0, "Reuters": 1.0, "WSJ": 0.95, "CNBC": 0.8, "MarketWatch": 0.7,
    "Benzinga": 0.6, "Seeking Alpha": 0.5, "PR Newswire": 0.4,
}

# symbol -> recognizable aliases used for tagging free text
SYMBOL_ALIASES: dict[str, list[str]] = {
    "SPY": ["s&p 500", "s&p500", "spx", "sp500"],
    "QQQ": ["nasdaq", "qqq"],
    "NVDA": ["nvidia"],
    "AAPL": ["apple"],
    "TSLA": ["tesla"],
    "AMD": ["advanced micro", "amd"],
}

_TOKEN = re.compile(r"[a-z0-9&]+")


def tokenize(text: str) -> list[str]:
    return _TOKEN.findall(text.lower())


def sentiment(text: str) -> float:
    """Return a sentiment score in [-1, 1]."""
    toks = tokenize(text)
    pos = sum(1 for t in toks if t in _POSITIVE)
    neg = sum(1 for t in toks if t in _NEGATIVE)
    if pos + neg == 0:
        return 0.0
    return round((pos - neg) / (pos + neg), 4)


def tag_symbols(text: str, universe: list[str]) -> list[str]:
    low = text.lower()
    found: list[str] = []
    for sym in universe:
        aliases = SYMBOL_ALIASES.get(sym, []) + [sym.lower()]
        if any(re.search(rf"\b{re.escape(a)}\b", low) for a in aliases):
            found.append(sym)
    return found


def impact(text: str, source: str, sentiment_score: float, n_symbols: int) -> float:
    toks = set(tokenize(text))
    kw = max((w for k, w in _IMPACT_KEYWORDS.items() if k in toks), default=0.0)
    src = _SOURCE_WEIGHT.get(source, 0.5)
    base = 0.5 * kw + 0.3 * abs(sentiment_score) + 0.2 * min(n_symbols, 3) / 3
    return round(float(np.clip(base * (0.6 + 0.4 * src), 0.0, 1.0)), 4)


def regime_impact(sentiment_score: float, impact_score: float) -> str:
    if impact_score < 0.35:
        return "NEUTRAL"
    if sentiment_score <= -0.3:
        return "RISK_OFF"
    if sentiment_score >= 0.3:
        return "RISK_ON"
    return "NEUTRAL"


def embed(text: str, dim: int = EMBED_DIM) -> list[float]:
    """Deterministic feature-hashing embedding, L2-normalized."""
    vec = np.zeros(dim, dtype=np.float32)
    for tok in tokenize(text):
        h = int(hashlib.md5(tok.encode()).hexdigest(), 16)
        idx = h % dim
        sign = 1.0 if (h >> 8) & 1 else -1.0
        vec[idx] += sign
    norm = float(np.linalg.norm(vec))
    if norm > 0:
        vec /= norm
    return [round(float(x), 6) for x in vec]
