export type GreekSeries = {
  name: 'delta' | 'theta' | 'vega';
  predicted: number[];
  live: number[];
  divergence: 'none' | 'moderate' | 'extreme';
};

function walk(n: number, start: number, vol: number, seed: number): number[] {
  let s = seed >>> 0;
  const out: number[] = [start];
  let v = start;
  for (let i = 1; i < n; i++) {
    s = (s + 0x9e3779b9) | 0;
    const r = ((s >>> 0) / 4294967296 - 0.5) * 2;
    v += r * vol;
    out.push(v);
  }
  return out;
}

function divergence(predicted: number[], live: number[]): 'none' | 'moderate' | 'extreme' {
  const p = predicted[predicted.length - 1];
  const l = live[live.length - 1];
  const span = Math.max(Math.abs(p), 0.01);
  const pct = Math.abs(l - p) / span;
  if (pct > 0.35) return 'extreme';
  if (pct > 0.15) return 'moderate';
  return 'none';
}

/** Mock dual-path Greeks — wire predicted to MC, live to options feed. */
export function mockGreekSeries(symbol: string, live?: { delta: number; theta: number; vega: number }): GreekSeries[] {
  const seed = symbol.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const n = 24;
  const d0 = live?.delta ?? 0.42;
  const t0 = live?.theta ?? -0.05;
  const v0 = live?.vega ?? 0.14;

  const names: GreekSeries['name'][] = ['delta', 'theta', 'vega'];
  const starts = [d0, t0, v0];
  const vols = [0.04, 0.008, 0.02];

  return names.map((name, i) => {
    const predicted = walk(n, starts[i], vols[i] * 0.6, seed + i);
    const livePath = walk(n, starts[i], vols[i], seed + i + 99);
    livePath[livePath.length - 1] = starts[i];
    return {
      name,
      predicted,
      live: livePath,
      divergence: divergence(predicted, livePath),
    };
  });
}

export const GREEK_DIVERGENCE_THRESHOLD = 0.15;
