/**
 * MarketSignalAnalyser — audio-style envelope from tick deltas for the pulse visualizer.
 */
export interface PulseSample {
  amplitude: number;
  energy: number;
  direction: number;
  bands: [number, number, number];
  waveform: number[];
}

export class MarketSignalAnalyser {
  private last = NaN;
  private ewmaVar = 1e-6;
  private readonly varLambda = 0.94;
  private ampEnv = 0;
  private readonly attack = 0.6;
  private readonly decay = 0.08;
  private slow = 0;
  private mid = 0;
  private fast = 0;
  private readonly wave: number[];
  private wi = 0;
  private maxSize = 1;
  private micro = 0;
  private _lastDir = 0;
  private _lastSize = 0;

  constructor(private waveLen = 96) {
    this.wave = new Array(waveLen).fill(0);
  }

  push(price: number, size = 0): void {
    if (Number.isNaN(this.last)) {
      this.last = price;
      return;
    }
    const d = price - this.last;
    this.last = price;
    this.ewmaVar = this.varLambda * this.ewmaVar + (1 - this.varLambda) * d * d;
    const sigma = Math.sqrt(this.ewmaVar) || 1e-6;
    const norm = d / sigma;
    const mag = Math.min(3, Math.abs(norm));
    this.ampEnv =
      mag > this.ampEnv
        ? this.ampEnv + (mag - this.ampEnv) * this.attack
        : this.ampEnv + (mag - this.ampEnv) * this.decay;
    this.slow += (mag - this.slow) * 0.02;
    this.mid += (mag - this.mid) * 0.12;
    this.fast += (mag - this.fast) * 0.45;
    this.maxSize = Math.max(this.maxSize * 0.999, size, 1);
    this.wave[this.wi] = Math.max(-1, Math.min(1, norm / 3));
    this.wi = (this.wi + 1) % this.waveLen;
    this._lastDir = d > 0 ? 1 : d < 0 ? -1 : 0;
    this._lastSize = size;
  }

  pushMicro(signedVol: number, impact: number): void {
    const e = Math.min(1, Math.abs(signedVol) * Math.max(0, impact));
    this.micro += (e - this.micro) * 0.3;
  }

  sample(): PulseSample {
    const sizeNorm = Math.min(1, this._lastSize / this.maxSize);
    const priceEnergy = Math.min(1, (this.ampEnv / 3) * (0.4 + 0.6 * sizeNorm));
    const energy = Math.min(1, 0.6 * priceEnergy + 0.4 * this.micro);
    const out: number[] = [];
    for (let i = 0; i < this.waveLen; i += 1) {
      out.push(this.wave[(this.wi + i) % this.waveLen]);
    }
    return {
      amplitude: this.ampEnv,
      energy,
      direction: this._lastDir,
      bands: [Math.min(1, this.slow / 3), Math.min(1, this.mid / 3), Math.min(1, this.fast / 3)],
      waveform: out,
    };
  }

  idle(): void {
    this.ampEnv *= 0.92;
    this.slow *= 0.98;
    this.mid *= 0.95;
    this.fast *= 0.9;
    this.micro *= 0.9;
  }
}
