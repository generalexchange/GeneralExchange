import { RECONNECT } from '@/lib/constants';

/**
 * Exponential backoff with full jitter. Delay = min(max, base * factor^attempt),
 * then randomized within +/- jitterRatio to avoid thundering-herd reconnects.
 */
export class Backoff {
  private attempt = 0;

  next(): number {
    const raw = RECONNECT.baseDelayMs * Math.pow(RECONNECT.factor, this.attempt);
    const capped = Math.min(raw, RECONNECT.maxDelayMs);
    this.attempt += 1;
    const jitter = capped * RECONNECT.jitterRatio;
    const delta = (Math.random() * 2 - 1) * jitter;
    return Math.max(0, Math.round(capped + delta));
  }

  reset(): void {
    this.attempt = 0;
  }

  get attempts(): number {
    return this.attempt;
  }
}
