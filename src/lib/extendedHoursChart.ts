import type { Candle } from '@/components/dashboard/terminal/terminalData';

const ET = 'America/New_York';

export type SessionBand = 'prev-after' | 'overnight' | 'pre' | 'regular' | 'after';

export type ChartPoint = {
  index: number;
  t: number;
  price: number;
  band: SessionBand;
};

function etDateKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ET, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function etMinutes(d: Date): { mins: number; isWeekend: boolean } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: ET,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = fmt.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const weekday = get('weekday');
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  return { mins: hour * 60 + minute, isWeekend: weekday === 'Sat' || weekday === 'Sun' };
}

export function sessionBandForTimestamp(t: number, now = Date.now()): SessionBand {
  const d = new Date(t);
  const { mins, isWeekend } = etMinutes(d);
  const day = etDateKey(d);
  const today = etDateKey(new Date(now));

  if (day < today) {
    if (!isWeekend && mins >= 960) return 'prev-after';
    return 'overnight';
  }
  if (isWeekend) return 'overnight';
  if (mins >= 240 && mins < 570) return 'pre';
  if (mins >= 570 && mins < 960) return 'regular';
  if (mins >= 960 && mins < 1200) return 'after';
  return 'overnight';
}

/** Keep candles from previous-day 4pm ET through now (extended 1D window). */
export function filterExtendedDayCandles(candles: Candle[], now = Date.now()): Candle[] {
  const sorted = [...candles].sort((a, b) => a.t - b.t);
  if (!sorted.length) return sorted;

  const today = etDateKey(new Date(now));
  let startMs = sorted[0].t;

  for (let daysBack = 0; daysBack <= 4; daysBack++) {
    const probe = new Date(now - daysBack * 86_400_000);
    const { isWeekend } = etMinutes(probe);
    if (isWeekend) continue;
    const key = etDateKey(probe);
    if (key >= today) continue;
    const dayCandles = sorted.filter((c) => etDateKey(new Date(c.t)) === key && etMinutes(new Date(c.t)).mins >= 960);
    if (dayCandles.length) {
      startMs = dayCandles[0].t;
      break;
    }
    startMs = probe.getTime();
  }

  const cutoff = Math.min(startMs, now - 30 * 3_600_000);
  return sorted.filter((c) => c.t >= cutoff && c.t <= now);
}

export function toExtendedChartPoints(candles: Candle[], now = Date.now()): ChartPoint[] {
  const filtered = filterExtendedDayCandles(candles, now);
  return filtered.map((c, index) => ({
    index,
    t: c.t,
    price: c.c,
    band: sessionBandForTimestamp(c.t, now),
  }));
}

export type SessionZone = { x1: number; x2: number; band: SessionBand };

export function sessionZones(points: ChartPoint[]): SessionZone[] {
  if (!points.length) return [];
  const zones: SessionZone[] = [];
  let start = 0;
  let band = points[0].band;

  for (let i = 1; i <= points.length; i++) {
    const next = points[i];
    if (!next || next.band !== band) {
      zones.push({ x1: start, x2: i - 1, band });
      if (next) {
        start = i;
        band = next.band;
      }
    }
  }
  return zones;
}

export type TimeMarker = { index: number; label: string };

/** X-axis markers for 4am, 9:30 open, 4pm close, after-hours. */
export function timeMarkers(points: ChartPoint[], now = Date.now()): TimeMarker[] {
  if (!points.length) return [];
  const today = etDateKey(new Date(now));
  const targets = [
    { mins: 240, label: '4am' },
    { mins: 570, label: '9:30am' },
    { mins: 960, label: '4pm' },
    { mins: 1020, label: 'AH' },
  ];

  const markers: TimeMarker[] = [];
  for (const pt of points) {
    if (etDateKey(new Date(pt.t)) !== today) continue;
    const { mins } = etMinutes(new Date(pt.t));
    for (const target of targets) {
      if (Math.abs(mins - target.mins) <= 5 && !markers.some((m) => m.label === target.label)) {
        markers.push({ index: pt.index, label: target.label });
      }
    }
  }
  return markers;
}

export const BAND_FILL: Record<SessionBand, string> = {
  'prev-after': 'rgba(120, 113, 108, 0.12)',
  overnight: 'rgba(68, 64, 60, 0.08)',
  pre: 'rgba(251, 191, 36, 0.08)',
  regular: 'rgba(255, 255, 255, 0.04)',
  after: 'rgba(249, 115, 22, 0.1)',
};
