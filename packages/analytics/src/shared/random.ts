/**
 * Deterministic pseudo-random number generator (mulberry32 + Box–Muller).
 * Identical seeds reproduce identical streams — the basis for auditable,
 * unit-testable Monte Carlo runs.
 */
export class SeededRandom {
  private state: number;
  private spareNormal: number | null = null;

  constructor(seed = 0x9e3779b9) {
    this.state = (seed >>> 0) || 0x9e3779b9;
  }

  /** Next uniform float in [0, 1). */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Uniform float in [min, max). */
  uniform(min: number, max: number): number {
    return min + (max - min) * this.next();
  }

  /** Standard-normal draw via Box–Muller (caches the spare). */
  nextNormal(): number {
    if (this.spareNormal !== null) {
      const spare = this.spareNormal;
      this.spareNormal = null;
      return spare;
    }
    const u1 = 1 - this.next();
    const u2 = this.next();
    const mag = Math.sqrt(-2 * Math.log(u1));
    this.spareNormal = mag * Math.sin(2 * Math.PI * u2);
    return mag * Math.cos(2 * Math.PI * u2);
  }

  /** Normal draw with arbitrary mean and standard deviation. */
  normal(meanValue: number, standardDeviation: number): number {
    return meanValue + standardDeviation * this.nextNormal();
  }

  /** Bernoulli trial — true with probability `p`. */
  bernoulli(p: number): boolean {
    return this.next() < p;
  }
}
