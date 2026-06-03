export type SignalDirection = 'bullish' | 'bearish' | 'neutral';
export type SignalStrength = 'low' | 'medium' | 'high';

export interface SignalEvent {
  id: string;
  symbol: string;
  name: string;
  direction: SignalDirection;
  strength: SignalStrength;
  /** model confidence, 0..1 */
  confidence: number;
  description: string;
  at: number; // epoch ms
}

export type VolRegime = 'compressed' | 'normal' | 'elevated' | 'stressed';
export type TrendRegime = 'trending_up' | 'trending_down' | 'mean_reverting' | 'choppy';
export type NewsSentiment = 'positive' | 'neutral' | 'negative';

export interface RegimeState {
  symbol: string;
  volRegime: VolRegime;
  trendRegime: TrendRegime;
  newsSentiment: NewsSentiment;
  /** realized vs implied vol spread, in vol points */
  rvIvSpread: number;
  /** narrative summary from the backend */
  summary: string;
  asOf: number; // epoch ms
}

export interface NewsItem {
  id: string;
  symbol: string;
  headline: string;
  source: string;
  sentiment: NewsSentiment;
  at: number; // epoch ms
}

export interface DarkPoolPrint {
  id: string;
  symbol: string;
  size: number; // shares
  price: number;
  /** fraction of the print that lifted the offer (buy pressure), 0..1 */
  buyRatio: number;
  at: number; // epoch ms
}
