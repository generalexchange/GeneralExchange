"""Unit tests for market engine indicators and state."""

from services.ibkr.market_engine.indicators import IncrementalRSI, SessionVWAP, momentum_score
from services.ibkr.market_engine.state import SymbolState


def test_incremental_rsi_warmup():
    rsi = IncrementalRSI(period=3)
    for px in [100, 101, 102, 103]:
        rsi.update(px)
    assert 50 <= rsi.value <= 100


def test_vwap_running():
    v = SessionVWAP()
    v.update(100, 10)
    v.update(110, 10)
    assert v.value == 105.0


def test_symbol_state_tick_updates_price():
    st = SymbolState(symbol="TSLA")
    st.on_tick(250.0, 1000)
    st.on_tick(251.0, 1100)
    assert st.last_price == 251.0
    assert st.seq == 2
    payload = st.stream_payload()
    assert payload["symbol"] == "TSLA"
    assert "rsi" in payload
    assert "momentum_score" in payload


def test_momentum_score_bounds():
    assert 0 <= momentum_score(0, 1) <= 1
    assert momentum_score(10, 5) == 1.0
