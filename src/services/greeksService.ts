/**
 * Greeks calculation service using Black-Scholes model
 * Handles real-time data updates and caching
 */

export interface GreeksData {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  timestamp: number;
}

/**
 * Full first- and second-order Greeks (Black-Scholes-Merton, dividend-free).
 *
 * Conventions:
 *  - vega is per 1.00 (100%) change in volatility
 *  - theta and charm are reported per calendar day
 *  - color is per day; all others are per unit / per year as standard
 */
export interface FullGreeks {
  delta: number;
  gamma: number;
  theta: number; // per day
  vega: number;
  rho: number;
  lambda: number; // elasticity
  epsilon: number; // dividend rho (psi), q = 0
  charm: number; // dDelta/dTime, per day
  vanna: number; // dDelta/dVol = dVega/dSpot
  volga: number; // dVega/dVol (vomma)
  speed: number; // dGamma/dSpot
  zomma: number; // dGamma/dVol
  color: number; // dGamma/dTime, per day
  price: number; // theoretical option price
  timestamp: number;
}

export interface OptionContract {
  symbol: string;
  strike: number;
  expiration: string;
  type: 'CALL' | 'PUT';
  underlyingPrice: number;
  riskFreeRate: number;
  impliedVolatility: number;
  timeToExpiration: number;
}

class GreeksService {
  private cache = new Map<string, GreeksData>();
  private cacheTTL = 1000; // 1 second TTL
  private websocket: WebSocket | null = null;
  private subscribers = new Set<(data: GreeksData) => void>();

  /**
   * Calculate Greeks using Black-Scholes model
   */
  calculateGreeks(option: OptionContract): GreeksData {
    const { underlyingPrice, strike, timeToExpiration, riskFreeRate, impliedVolatility, type } = option;
    
    if (timeToExpiration <= 0) {
      return {
        delta: type === 'CALL' ? 1 : -1,
        gamma: 0,
        theta: 0,
        vega: 0,
        rho: 0,
        timestamp: Date.now()
      };
    }

    const sqrtT = Math.sqrt(timeToExpiration);
    const d1 = (Math.log(underlyingPrice / strike) + (riskFreeRate + 0.5 * impliedVolatility * impliedVolatility) * timeToExpiration) / (impliedVolatility * sqrtT);
    const d2 = d1 - impliedVolatility * sqrtT;
    
    // Standard normal distribution approximation
    const normCDF = (x: number) => 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    const normPDF = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    
    const delta = type === 'CALL' ? normCDF(d1) : normCDF(d1) - 1;
    const gamma = normPDF(d1) / (underlyingPrice * impliedVolatility * sqrtT);
    const theta = -(underlyingPrice * normPDF(d1) * impliedVolatility) / (2 * sqrtT) - 
                  riskFreeRate * strike * Math.exp(-riskFreeRate * timeToExpiration) * normCDF(d2);
    const vega = underlyingPrice * normPDF(d1) * sqrtT;
    const rho = type === 'CALL' ? 
      strike * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * normCDF(d2) :
      -strike * timeToExpiration * Math.exp(-riskFreeRate * timeToExpiration) * normCDF(-d2);

    return {
      delta,
      gamma,
      theta,
      vega,
      rho,
      timestamp: Date.now()
    };
  }

  /**
   * Calculate the full first- and second-order Greek surface (BSM, q = 0).
   * Used by the options chain panel and the GEX-by-strike computation.
   */
  calculateFullGreeks(option: OptionContract): FullGreeks {
    const { underlyingPrice: S, strike: K, timeToExpiration: T, riskFreeRate: r, impliedVolatility: sigma, type } =
      option;
    const isCall = type === 'CALL';
    const now = Date.now();

    if (T <= 0 || sigma <= 0) {
      const delta = isCall ? (S > K ? 1 : 0) : (S < K ? -1 : 0);
      return {
        delta, gamma: 0, theta: 0, vega: 0, rho: 0, lambda: 0, epsilon: 0,
        charm: 0, vanna: 0, volga: 0, speed: 0, zomma: 0, color: 0,
        price: Math.max(isCall ? S - K : K - S, 0), timestamp: now,
      };
    }

    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
    const d2 = d1 - sigma * sqrtT;

    const N = (x: number) => 0.5 * (1 + this.erf(x / Math.SQRT2));
    const phi = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    const disc = Math.exp(-r * T);
    const YEAR = 365;

    const delta = isCall ? N(d1) : N(d1) - 1;
    const gamma = phi(d1) / (S * sigma * sqrtT);
    const vega = (S * phi(d1) * sqrtT) / 100; // per 1% vol
    const thetaYr = isCall
      ? -(S * phi(d1) * sigma) / (2 * sqrtT) - r * K * disc * N(d2)
      : -(S * phi(d1) * sigma) / (2 * sqrtT) + r * K * disc * N(-d2);
    const theta = thetaYr / YEAR;
    const rho = (isCall ? K * T * disc * N(d2) : -K * T * disc * N(-d2)) / 100;

    const price = isCall ? S * N(d1) - K * disc * N(d2) : K * disc * N(-d2) - S * N(-d1);
    const lambda = price !== 0 ? delta * (S / price) : 0;
    const epsilon = isCall ? -S * T * N(d1) : S * T * N(-d1); // q = 0

    const charmYr = -phi(d1) * ((2 * r * T - d2 * sigma * sqrtT) / (2 * T * sigma * sqrtT));
    const charm = charmYr / YEAR;
    const vanna = -phi(d1) * (d2 / sigma);
    const volga = vega * ((d1 * d2) / sigma);
    const speed = -(gamma / S) * (d1 / (sigma * sqrtT) + 1);
    const zomma = gamma * ((d1 * d2 - 1) / sigma);
    const colorYr =
      -phi(d1) / (2 * S * T * sigma * sqrtT) *
      (2 * r * T + 1 + (d1 * (2 * r * T - d2 * sigma * sqrtT)) / (sigma * sqrtT));
    const color = colorYr / YEAR;

    return {
      delta, gamma, theta, vega, rho, lambda, epsilon,
      charm, vanna, volga, speed, zomma, color, price, timestamp: now,
    };
  }

  /**
   * Error function approximation for normal distribution
   */
  private erf(x: number): number {
    // Abramowitz and Stegun approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Get cached Greeks data or calculate new
   */
  getGreeks(option: OptionContract): GreeksData {
    const cacheKey = `${option.symbol}-${option.strike}-${option.expiration}-${option.type}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached;
    }

    const greeks = this.calculateGreeks(option);
    this.cache.set(cacheKey, greeks);
    return greeks;
  }

  /**
   * Get stocks with highest absolute Delta values
   */
  getHighestDeltaStocks(stocks: any[]): any[] {
    return stocks
      .map(stock => ({
        ...stock,
        delta: this.calculateDeltaFromIV(stock.options.avgIV, stock.volatility)
      }))
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }

  /**
   * Calculate approximate delta from IV and volatility
   */
  private calculateDeltaFromIV(iv: number, volatility: number): number {
    // Simplified delta calculation based on IV
    const baseDelta = Math.min(0.9, Math.max(0.1, iv * 0.8));
    return volatility > 0.5 ? baseDelta * 1.2 : baseDelta;
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  initializeWebSocket(): void {
    if (this.websocket) return;

    // Mock WebSocket - replace with real implementation
    this.websocket = new WebSocket('ws://localhost:8080/greeks');
    
    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.updateGreeks(data);
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };

    this.websocket.onclose = () => {
      this.websocket = null;
      // Reconnect after 5 seconds
      setTimeout(() => this.initializeWebSocket(), 5000);
    };
  }

  /**
   * Update Greeks data and notify subscribers
   */
  private updateGreeks(data: any): void {
    const greeks: GreeksData = {
      delta: data.delta || 0,
      gamma: data.gamma || 0,
      theta: data.theta || 0,
      vega: data.vega || 0,
      rho: data.rho || 0,
      timestamp: Date.now()
    };

    // Update cache
    const cacheKey = `${data.symbol}-${data.strike}-${data.expiration}-${data.type}`;
    this.cache.set(cacheKey, greeks);

    // Notify subscribers
    this.subscribers.forEach(callback => callback(greeks));
  }

  /**
   * Subscribe to Greeks updates
   */
  subscribe(callback: (data: GreeksData) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Close WebSocket connection
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

// Export singleton instance
export const greeksService = new GreeksService();
