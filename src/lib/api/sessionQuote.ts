const ET = 'America/New_York';

export function etMinutes(d: Date): { mins: number; isWeekend: boolean } {
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

export function etDateKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ET, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export function regularSessionCloseFromMinuteBars(
  bars: Array<{ timestamp: string; close: number }>,
  now = Date.now(),
): number | undefined {
  const today = etDateKey(new Date(now));
  let close: number | undefined;
  for (const b of bars) {
    const d = new Date(b.timestamp);
    if (etDateKey(d) !== today) continue;
    const { mins } = etMinutes(d);
    if (mins >= 570 && mins <= 960) close = b.close;
  }
  return close;
}

export function afterHoursFromPrice(
  price: number,
  sessionClose: number | undefined,
  now = Date.now(),
): { afterHoursChange?: number; afterHoursChangePct?: number } {
  const { mins, isWeekend } = etMinutes(new Date(now));
  if (isWeekend || !sessionClose || sessionClose <= 0) return {};
  if (mins < 960 || mins >= 1440) return {};
  const ah = price - sessionClose;
  return {
    afterHoursChange: ah,
    afterHoursChangePct: (ah / sessionClose) * 100,
  };
}
