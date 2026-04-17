import React from 'react';

type Theme = 'light' | 'dark';

/** Hero-adjacent strip — single institutional coin mark (no pipeline labels). */
export function PositioningCoinIllustration({ theme = 'light' }: { theme?: Theme }) {
  const isLight = theme === 'light';
  const rim = isLight ? '#8a7a62' : '#6a5c4a';
  const faceOuter = isLight ? '#e8dcc8' : '#2a2824';
  const faceInner = isLight ? '#f5f0e8' : '#36322c';
  const accent = isLight ? '#2E5A3A' : '#4a7a58';
  const accentSoft = isLight ? 'rgba(46, 90, 58, 0.35)' : 'rgba(74, 122, 88, 0.45)';
  const stroke = isLight ? '#6b7c6e' : '#5a6b5e';
  const innerLine = isLight ? 'rgba(46, 90, 58, 0.2)' : 'rgba(255,255,255,0.12)';

  return (
    <div className="flex items-center justify-center py-2 sm:py-4">
      <svg
        viewBox="0 0 200 200"
        className="h-auto w-full max-w-[200px] sm:max-w-[220px]"
        role="img"
        aria-labelledby="positioning-coin-title"
      >
        <title id="positioning-coin-title">Stylized token coin representing platform-issued compute credits</title>
        <defs>
          <radialGradient id="pc-face" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={isLight ? '#fffefb' : '#4a4640'} />
            <stop offset="55%" stopColor={faceInner} />
            <stop offset="100%" stopColor={faceOuter} />
          </radialGradient>
          <linearGradient id="pc-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLight ? '#d4c4a8' : '#5c5246'} />
            <stop offset="50%" stopColor={rim} />
            <stop offset="100%" stopColor={isLight ? '#c4b498' : '#4a4036'} />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="172" rx="56" ry="10" fill="rgba(0,0,0,0.07)" />
        <circle cx="100" cy="100" r="92" fill="url(#pc-rim)" stroke={stroke} strokeWidth="1" />
        <circle cx="100" cy="100" r="82" fill="url(#pc-face)" stroke={accentSoft} strokeWidth="1.2" />
        <circle cx="100" cy="100" r="72" fill="none" stroke={innerLine} strokeWidth="0.75" />
        <circle cx="100" cy="100" r="58" fill="none" stroke={accent} strokeWidth="0.9" opacity="0.45" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 100 + Math.cos(rad) * 66;
          const y1 = 100 + Math.sin(rad) * 66;
          const x2 = 100 + Math.cos(rad) * 74;
          const y2 = 100 + Math.sin(rad) * 74;
          return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={accent} strokeWidth="1.2" opacity="0.35" />;
        })}
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fill={accent}
          fontSize="22"
          fontWeight="600"
          fontFamily="ui-serif, Georgia, serif"
          letterSpacing="0.06em"
        >
          GE
        </text>
        <text
          x="100"
          y="128"
          textAnchor="middle"
          fill={stroke}
          fontSize="7"
          fontFamily="ui-monospace, monospace"
          letterSpacing="0.28em"
          opacity="0.85"
        >
          COMPUTE
        </text>
      </svg>
    </div>
  );
}
