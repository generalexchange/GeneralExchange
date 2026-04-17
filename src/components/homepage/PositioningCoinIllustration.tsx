import React, { useId } from 'react';

type Theme = 'light' | 'dark';

/** Hero-adjacent strip — US penny–style copper token (compact: rim, reeding, legends, cameo field). */
export function PositioningCoinIllustration({ theme = 'light' }: { theme?: Theme }) {
  const uid = useId().replace(/:/g, '');
  const isLight = theme === 'light';
  const copperHi = isLight ? '#d4a574' : '#c9955e';
  const copperMid = isLight ? '#b87333' : '#a06428';
  const copperLo = isLight ? '#6b3d18' : '#4a2810';
  const rimDark = isLight ? '#3d2414' : '#2a1810';
  const faceSheen = isLight ? '#e8c9a0' : '#d4a574';

  const cx = 100;
  const cy = 100;

  const reeding = Array.from({ length: 96 }, (_, i) => {
    const a = (i / 96) * Math.PI * 2 - Math.PI / 2;
    const r1 = 86;
    const r2 = 93.5;
    const x1 = cx + Math.cos(a) * r1;
    const y1 = cy + Math.sin(a) * r1;
    const x2 = cx + Math.cos(a) * r2;
    const y2 = cy + Math.sin(a) * r2;
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={rimDark} strokeWidth="0.85" opacity="0.55" />;
  });

  const microGrooves = Array.from({ length: 48 }, (_, i) => {
    const a = (i / 48) * Math.PI * 2;
    const r1 = 58;
    const r2 = 61;
    const x1 = cx + Math.cos(a) * r1;
    const y1 = cy + Math.sin(a) * r1;
    const x2 = cx + Math.cos(a) * r2;
    const y2 = cy + Math.sin(a) * r2;
    return <line key={`g-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={copperLo} strokeWidth="0.35" opacity="0.25" />;
  });

  return (
    <div className="flex items-center justify-center py-1 sm:py-2">
      <svg
        viewBox="0 0 200 200"
        className="h-auto w-full max-w-[88px] sm:max-w-[100px]"
        role="img"
        aria-labelledby={`${uid}-coin-title`}
      >
        <title id={`${uid}-coin-title`}>Copper one-cent style token for General Exchange compute credits</title>
        <defs>
          <radialGradient id={`${uid}-penny-face`} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor={faceSheen} />
            <stop offset="35%" stopColor={copperHi} />
            <stop offset="70%" stopColor={copperMid} />
            <stop offset="100%" stopColor={copperLo} />
          </radialGradient>
          <linearGradient id={`${uid}-penny-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={copperHi} />
            <stop offset="45%" stopColor={copperMid} />
            <stop offset="100%" stopColor={copperLo} />
          </linearGradient>
        </defs>
        <ellipse cx={cx} cy={cy + 78} rx="42" ry="7" fill="rgba(0,0,0,0.12)" />
        <circle cx={cx} cy={cy} r="96" fill={copperLo} opacity="0.35" />
        {reeding}
        <circle cx={cx} cy={cy} r="94" fill={`url(#${uid}-penny-rim)`} stroke={rimDark} strokeWidth="1.2" />
        <circle cx={cx} cy={cy} r="86" fill={`url(#${uid}-penny-face)`} stroke={rimDark} strokeWidth="0.6" opacity="0.9" />
        <circle cx={cx} cy={cy} r="80" fill="none" stroke={rimDark} strokeWidth="0.5" opacity="0.35" />
        {microGrooves}
        <text
          x={cx}
          y={54}
          textAnchor="middle"
          fill={rimDark}
          fontSize="6.5"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
          letterSpacing="0.22em"
          opacity="0.88"
        >
          GENERAL EXCHANGE
        </text>
        <ellipse cx={cx} cy={cy + 4} rx="38" ry="46" fill="none" stroke={rimDark} strokeWidth="0.75" opacity="0.45" />
        <ellipse cx={cx} cy={cy + 4} rx="34" ry="42" fill="rgba(60,35,20,0.08)" stroke={copperLo} strokeWidth="0.4" opacity="0.6" />
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          fill={rimDark}
          fontSize="19"
          fontWeight="700"
          fontFamily="ui-serif, Georgia, 'Times New Roman', serif"
          letterSpacing="0.02em"
          opacity="0.92"
        >
          GE
        </text>
        <text
          x={cx}
          y={cy + 36}
          textAnchor="middle"
          fill={rimDark}
          fontSize="6.5"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          letterSpacing="0.32em"
          opacity="0.78"
        >
          ONE CREDIT
        </text>
        <text x="52" y={cy + 56} textAnchor="start" fill={rimDark} fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.7">
          2026
        </text>
        <text x="148" y={cy + 56} textAnchor="end" fill={rimDark} fontSize="6.5" fontFamily="ui-monospace, monospace" opacity="0.7">
          USA
        </text>
        <path
          d="M 62 148 Q 100 132 138 148"
          fill="none"
          stroke={rimDark}
          strokeWidth="0.45"
          opacity="0.35"
        />
        <path
          d="M 72 154 L 68 168 M 100 150 L 100 172 M 128 154 L 132 168"
          fill="none"
          stroke={rimDark}
          strokeWidth="0.5"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
