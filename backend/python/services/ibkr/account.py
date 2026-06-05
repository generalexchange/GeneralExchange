"""Account summary retrieval."""

from __future__ import annotations

from services.ibkr.client import IBKRClient, get_ib
from services.ibkr.schemas import AccountSummary


def _tag_value(summary: list, tag: str) -> float | None:
    for row in summary:
        if row.tag == tag and row.currency in ("USD", "BASE"):
            try:
                return float(row.value)
            except ValueError:
                return None
    return None


async def get_account_summary() -> AccountSummary:
    client = await IBKRClient.get()
    ib = client.ib
    account = client.account_id()
    if not account:
        raise RuntimeError("No IBKR account available")

    rows = ib.accountSummary(account)
    if not rows:
        ib.reqAccountSummary()
        await ib.sleep(1)
        rows = ib.accountSummary(account)

    return AccountSummary(
        account=account,
        net_liquidation=_tag_value(rows, "NetLiquidation"),
        total_cash=_tag_value(rows, "TotalCashValue"),
        buying_power=_tag_value(rows, "BuyingPower"),
        gross_position_value=_tag_value(rows, "GrossPositionValue"),
        unrealized_pnl=_tag_value(rows, "UnrealizedPnL"),
        realized_pnl=_tag_value(rows, "RealizedPnL"),
        currency="USD",
    )
