/** US equity session helpers (America/New_York). */

export type MarketSession = 'regular' | 'pre' | 'after' | 'closed';

const ET = 'America/New_York';

function etParts(now: Date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: ET,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const weekday = get('weekday');
  const hour = Number(get('hour'));
  const minute = Number(get('minute'));
  const mins = hour * 60 + minute;
  const isWeekend = weekday === 'Sat' || weekday === 'Sun';
  return { mins, isWeekend };
}

/** Regular = 9:30–16:00 ET Mon–Fri. Pre 4:00–9:30, after 16:00–20:00. */
export function getMarketSession(now = new Date()): MarketSession {
  const { mins, isWeekend } = etParts(now);
  if (isWeekend) return 'closed';
  if (mins >= 570 && mins < 960) return 'regular'; // 9:30–16:00
  if (mins >= 240 && mins < 570) return 'pre'; // 4:00–9:30
  if (mins >= 960 && mins < 1200) return 'after'; // 16:00–20:00
  return 'closed';
}

export function isRegularSession(now = new Date()): boolean {
  return getMarketSession(now) === 'regular';
}

/** Tan card during regular hours; black card after-hours / closed. */
export function quoteCardTheme(session: MarketSession): 'tan' | 'dark' {
  return session === 'regular' ? 'tan' : 'dark';
}
