/**
 * Server-side market data routing — IBKR is opt-in (desktop/dev only).
 * Public web uses the API gateway and/or pipeline synth, never localhost IBKR.
 */

export function canUseIbkrDirect(): boolean {
  return process.env.USE_IBKR_DIRECT === 'true' && Boolean(process.env.IBKR_API_URL?.trim());
}

export function canUseGateway(): boolean {
  return Boolean(process.env.GE_API_URL?.trim());
}

/** Pipeline synth for public web when IBKR and gateway are unavailable. */
export function canUseWebSynth(): boolean {
  if (canUseIbkrDirect() || canUseGateway()) return false;
  return process.env.WEB_SYNTH_MARKET !== 'false';
}
