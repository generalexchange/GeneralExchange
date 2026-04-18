import React, { useId } from 'react';

type Theme = 'light' | 'dark';

/**
 * Hero-adjacent strip — refined metallic token (frontal disc, beveled rim, institutional mark).
 * SVG only; not the wallet / Bridge Observer illustration.
 */
export function PositioningCoinIllustration({ theme = 'light' }: { theme?: Theme }) {
  const uid = useId().replace(/:/g, '');
  const isLight = theme === 'light';
  const gold = isLight ? '#c9a86c' : '#b8945c';
  const goldDeep = isLight ? '#8b7349' : '#6b5638';
  const goldHi = isLight ? '#f0e4cc' : '#e8d4b0';
  const edge = isLight ? '#4a4034' : '#3a3228';
  const accent = isLight ? '#2E5A3A' : '#4a7a58';

  const cx = 120;
  const cy = 118;
  const R = 88;

  const milling = Array.from({ length: 64 }, (_, i) => {
    const a = (i / 64) * Math.PI * 2 - Math.PI / 2;
    const r0 = R - 4;
    const r1 = R;
    const x0 = cx + Math.cos(a) * r0;
    const y0 = cy + Math.sin(a) * r0;
    const x1 = cx + Math.cos(a) * r1;
    const y1 = cy + Math.sin(a) * r1;
    return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={edge} strokeWidth="1.1" opacity="0.45" />;
  });

  const innerDots = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const r = 52 + (i % 3) * 4;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    return <circle key={i} cx={x} cy={y} r="1.2" fill={accent} opacity={0.08 + (i % 5) * 0.04} />;
  });

  return (
    <div className="flex items-center justify-center py-2 sm:py-3">
      <svg
        viewBox="0 0 240 220"
        className="h-auto w-full max-w-[140px] sm:max-w-[168px] lg:max-w-[190px]"
        role="img"
        aria-labelledby={`${uid}-coin-title`}
      >
        <title id={`${uid}-coin-title`}>Stylized compute token representing credits and entitlements on the platform</title>
        <defs>
          <radialGradient id={`${uid}-face`} cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor={goldHi} />
            <stop offset="42%" stopColor={gold} />
            <stop offset="100%" stopColor={goldDeep} />
          </radialGradient>
        </defs>
        <ellipse cx={cx} cy={cy + 86} rx="58" ry="10" fill="rgba(0,0,0,0.14)" />
        <circle cx={cx} cy={cy} r={R + 2} fill={goldDeep} opacity="0.35" />
        {milling}
        <circle cx={cx} cy={cy} r={R} fill={`url(#${uid}-face)`} stroke={edge} strokeWidth="1.4" />
        <circle cx={cx} cy={cy} r={R - 9} fill="none" stroke={edge} strokeWidth="0.6" opacity="0.35" />
        <circle cx={cx} cy={cy} r={R - 22} fill="none" stroke={accent} strokeWidth="0.85" opacity="0.35" />
        {innerDots}
        <path
          d={`M ${cx - 28} ${cy - 6} L ${cx} ${cy - 32} L ${cx + 28} ${cy - 6} L ${cx + 18} ${cy + 22} L ${cx - 18} ${cy + 22} Z`}
          fill={accent}
          opacity="0.88"
        />
        <path
          d={`M ${cx - 14} ${cy + 2} L ${cx} ${cy - 12} L ${cx + 14} ${cy + 2} L ${cx + 8} ${cy + 14} L ${cx - 8} ${cy + 14} Z`}
          fill={goldHi}
          opacity="0.35"
        />
        <circle cx={cx - 46} cy={cy - 52} r="18" fill="white" opacity="0.12" />
      </svg>
    </div>
  );
}
