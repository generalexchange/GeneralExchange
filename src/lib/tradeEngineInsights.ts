import type { GexBar, OptionRow } from '@/components/dashboard/terminal/terminalData';

export type TradeInsight = {
  id: string;
  title: string;
  body: string;
  tag: string;
  severity: 'neutral' | 'watch' | 'alert';
  metric?: string;
};

export type GammaSqueezeRead = {
  risk: 'low' | 'elevated' | 'high';
  netGexM: number;
  flipStrike: number | null;
  callOiNearSpot: number;
  putOiNearSpot: number;
  summary: string;
};

function nearSpot(chain: OptionRow[], spot: number, pct = 0.03) {
  const lo = spot * (1 - pct);
  const hi = spot * (1 + pct);
  return chain.filter((r) => r.strike >= lo && r.strike <= hi);
}

export function analyzeGammaSqueeze(chain: OptionRow[], spot: number, gex: GexBar[]): GammaSqueezeRead {
  if (!chain.length || spot <= 0) {
    return {
      risk: 'low',
      netGexM: 0,
      flipStrike: null,
      callOiNearSpot: 0,
      putOiNearSpot: 0,
      summary: 'Options chain not loaded — connect IBKR for gamma exposure.',
    };
  }

  const netGexM = gex.reduce((s, b) => s + b.gex, 0);
  const band = nearSpot(chain, spot);
  const callOiNearSpot = band.filter((r) => r.type === 'CALL').reduce((s, r) => s + r.openInterest, 0);
  const putOiNearSpot = band.filter((r) => r.type === 'PUT').reduce((s, r) => s + r.openInterest, 0);

  let flipStrike: number | null = null;
  for (let i = 1; i < gex.length; i++) {
    if ((gex[i - 1].gex < 0 && gex[i].gex >= 0) || (gex[i - 1].gex > 0 && gex[i].gex <= 0)) {
      flipStrike = gex[i].strike;
      break;
    }
  }

  const oiSkew = callOiNearSpot / Math.max(1, putOiNearSpot);
  let risk: GammaSqueezeRead['risk'] = 'low';
  if (netGexM < -2 && oiSkew > 1.4) risk = 'high';
  else if (netGexM < 0 && oiSkew > 1.1) risk = 'elevated';

  const summary =
    risk === 'high'
      ? `Negative net GEX (${netGexM.toFixed(1)}M) with call-heavy OI near spot — dealers may amplify upside moves (gamma squeeze setup).`
      : risk === 'elevated'
        ? `Dealer gamma is short-ish; elevated call OI near ${spot.toFixed(0)} can tighten ranges into expiry.`
        : `Gamma positioning looks balanced — no acute squeeze pressure at current spot.`;

  return { risk, netGexM, flipStrike, callOiNearSpot, putOiNearSpot, summary };
}

export function buildTradeInsights(input: {
  symbol: string;
  spot: number;
  changePct: number;
  chain: OptionRow[];
  gex: GexBar[];
  beta?: number;
  alphaPct?: number;
  correlation?: number;
  live: boolean;
  source?: string | null;
}): TradeInsight[] {
  const { symbol, spot, changePct, chain, gex, beta, alphaPct, correlation, live, source } = input;
  const gamma = analyzeGammaSqueeze(chain, spot, gex);
  const atm = chain.find((r) => r.moneyness === 'ATM') ?? chain[0];
  const insights: TradeInsight[] = [];

  insights.push({
    id: 'drivers',
    title: 'What is moving price',
    tag: 'Price action',
    severity: Math.abs(changePct) > 1.5 ? 'watch' : 'neutral',
    metric: `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
    body:
      Math.abs(changePct) < 0.15
        ? `${symbol} is trading near unchanged on the session — flow is two-sided with no dominant directional impulse yet.`
        : changePct > 0
          ? `${symbol} is bid — session momentum is positive. ${live ? 'Live IBKR quote' : 'Cached quote'}${source ? ` (${source})` : ''} confirms the tape is holding above prior close.`
          : `${symbol} is offered — sellers are pressing the tape. Watch whether gamma support near ${spot.toFixed(2)} holds on dips.`,
  });

  insights.push({
    id: 'gamma',
    title: 'Gamma & squeeze risk',
    tag: 'GEX',
    severity: gamma.risk === 'high' ? 'alert' : gamma.risk === 'elevated' ? 'watch' : 'neutral',
    metric: gamma.risk.toUpperCase(),
    body: gamma.summary,
  });

  if (atm) {
    insights.push({
      id: 'greeks',
      title: 'Greeks at the surface',
      tag: 'Options',
      severity: 'neutral',
      metric: `Δ ${atm.delta.toFixed(2)}`,
      body: `ATM ${atm.type} · γ ${atm.gamma.toFixed(4)} · θ ${atm.theta.toFixed(3)} · ν ${atm.vega.toFixed(3)}. Inside buyers lift delta when calls trade; market makers hedge gamma into the underlying — that feedback loop is what links options flow to spot velocity.`,
    });
  }

  if (beta != null) {
    insights.push({
      id: 'beta',
      title: 'Beta vs the market',
      tag: 'SPY regime',
      severity: Math.abs(beta - 1) > 0.35 ? 'watch' : 'neutral',
      metric: `β ${beta.toFixed(2)}`,
      body: `β ${beta.toFixed(2)}${correlation != null ? ` · ρ ${correlation.toFixed(2)}` : ''}${alphaPct != null ? ` · α ${alphaPct >= 0 ? '+' : ''}${alphaPct.toFixed(1)}% ann.` : ''}. ${
        beta > 1.15
          ? `${symbol} amplifies broad market moves — when SPY trends, this name should move harder.`
          : beta < 0.85
            ? `${symbol} is relatively defensive vs SPY — idiosyncratic flow matters more than index beta.`
            : `${symbol} tracks the market factor closely; macro tape sets the baseline.`
      }`,
    });
  }

  if (gamma.flipStrike) {
    insights.push({
      id: 'flip',
      title: 'GEX flip level',
      tag: 'Dealers',
      severity: 'watch',
      metric: `$${gamma.flipStrike}`,
      body: `Dealer gamma exposure flips near $${gamma.flipStrike}. Above this strike, hedging flows may dampen moves; below it, hedges can accelerate direction — watch this level in fast tapes.`,
    });
  }

  return insights;
}
