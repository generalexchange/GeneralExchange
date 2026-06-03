import { SeededRandom } from '../shared/random';
import { summarize } from '../shared/statistics';
import type { SummaryStatistics } from '../shared/types';

export interface MonteCarloEngineOptions {
  seed?: number;
}

export type TrialFn<T> = (random: SeededRandom, index: number) => T;

/**
 * Generic Monte Carlo runner: owns one seeded RNG for a reproducible run,
 * drives the trial loop, and defers aggregation to the shared statistics layer.
 * The trial loop is the natural shard boundary for future parallelization
 * (worker threads / WASM / Rust via Tauri).
 */
export class MonteCarloEngine {
  readonly random: SeededRandom;

  constructor(options: MonteCarloEngineOptions = {}) {
    this.random = new SeededRandom(options.seed ?? (Date.now() & 0xffffffff));
  }

  run<T>(count: number, trial: TrialFn<T>): T[] {
    if (!Number.isInteger(count) || count <= 0) {
      throw new RangeError(`simulationCount must be a positive integer, received ${count}`);
    }
    const results: T[] = new Array<T>(count);
    for (let i = 0; i < count; i += 1) results[i] = trial(this.random, i);
    return results;
  }

  runScalar(count: number, trial: TrialFn<number>): { samples: number[]; statistics: SummaryStatistics } {
    const samples = this.run(count, trial);
    return { samples, statistics: summarize(samples) };
  }

  aggregate(samples: readonly number[]): SummaryStatistics {
    return summarize(samples);
  }
}
