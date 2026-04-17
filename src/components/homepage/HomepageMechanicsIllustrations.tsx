/**
 * Institutional “engine mechanics” diagrams for the homepage — inline SVG, no external assets.
 */

import React from 'react';

type Theme = 'light' | 'dark';

function themeStroke(t: Theme) {
  return t === 'light' ? '#6b7c6e' : 'rgba(210, 180, 140, 0.45)';
}
function themeMuted(t: Theme) {
  return t === 'light' ? '#4a4a48' : 'rgba(255,255,255,0.35)';
}
function themeStrong(t: Theme) {
  return t === 'light' ? '#1A1A1A' : 'rgba(255,255,255,0.88)';
}
function accentGreen(_t: Theme) {
  return '#2E5A3A';
}
function accentTan(_t: Theme) {
  return '#D2B48C';
}

export function IllustrationFrame({
  theme,
  title,
  caption,
  children,
  className = '',
}: {
  theme: Theme;
  title: string;
  caption?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const border = theme === 'light' ? 'rgba(46, 90, 58, 0.14)' : 'rgba(255,255,255,0.1)';
  const bg = theme === 'light' ? 'rgba(245, 242, 235, 0.65)' : 'rgba(12, 12, 12, 0.55)';
  return (
    <figure
      className={`rounded-lg border overflow-hidden ${className}`}
      style={{ borderColor: border, backgroundColor: bg }}
    >
      <figcaption className="sr-only">{title}</figcaption>
      <div className="px-4 pt-3 pb-1 flex items-center justify-between gap-2 border-b" style={{ borderColor: border }}>
        <span
          className="text-[10px] font-semibold tracking-[0.14em] uppercase truncate"
          style={{ color: themeMuted(theme) }}
          aria-hidden
        >
          Mechanics
        </span>
        <span className="text-[10px] font-mono tabular-nums shrink-0" style={{ color: accentGreen(theme) }}>
          schematic
        </span>
      </div>
      <div className="p-3 sm:p-4 w-full">{children}</div>
      {caption ? (
        <p className="px-4 pb-3 text-[11px] leading-relaxed font-light" style={{ color: themeMuted(theme) }}>
          {caption}
        </p>
      ) : null}
    </figure>
  );
}

/** Hero — end-to-end system topology */
export function HeroSystemTopologyIllustration() {
  return (
    <svg viewBox="0 0 520 200" className="w-full h-auto max-h-[220px]" role="img" aria-labelledby="hero-topology-title">
      <title id="hero-topology-title">Data flows from market feeds through normalization and risk fabric into GPU pools and smart routing, then to evidence ledger</title>
      <defs>
        <marker id="arrHero" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="rgba(210,180,140,0.55)" />
        </marker>
      </defs>
      <rect x="8" y="72" width="88" height="56" rx="4" stroke="rgba(210,180,140,0.35)" strokeWidth="1.2" fill="rgba(255,255,255,0.03)" />
      <text x="52" y="98" textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10" fontFamily="ui-sans-serif">
        Feeds
      </text>
      <text x="52" y="114" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="ui-monospace">
        tick·OB·macro
      </text>
      <path d="M96,100 H118" stroke="rgba(210,180,140,0.4)" strokeWidth="1.2" markerEnd="url(#arrHero)" />
      <rect x="120" y="68" width="92" height="64" rx="4" stroke="#2E5A3A" strokeWidth="1.4" fill="rgba(46,90,58,0.12)" />
      <text x="166" y="94" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="10" fontFamily="ui-sans-serif">
        Normalize
      </text>
      <text x="166" y="110" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="ui-monospace">
        schema·quality
      </text>
      <text x="166" y="124" textAnchor="middle" fill="#D2B48C" fontSize="8" fontFamily="ui-monospace">
        lineage ids
      </text>
      <path d="M212,100 H232" stroke="rgba(210,180,140,0.4)" strokeWidth="1.2" markerEnd="url(#arrHero)" />
      <rect x="234" y="58" width="100" height="84" rx="4" stroke="#2E5A3A" strokeWidth="1.5" fill="rgba(46,90,58,0.18)" />
      <text x="284" y="84" textAnchor="middle" fill="#D2B48C" fontSize="11" fontWeight="600" fontFamily="ui-sans-serif">
        Risk fabric
      </text>
      <text x="284" y="100" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="ui-monospace">
        VaR·ES·scenarios
      </text>
      <rect x="246" y="108" width="76" height="22" rx="2" stroke="rgba(210,180,140,0.3)" fill="rgba(0,0,0,0.2)" />
      <text x="284" y="123" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="ui-monospace">
        pre-trade gate
      </text>
      <path d="M334,100 H348" stroke="rgba(210,180,140,0.4)" strokeWidth="1.2" markerEnd="url(#arrHero)" />
      <rect x="350" y="70" width="78" height="60" rx="4" stroke="#D2B48C" strokeWidth="1.2" fill="rgba(210,180,140,0.08)" />
      <text x="389" y="94" textAnchor="middle" fill="#D2B48C" fontSize="9" fontFamily="ui-sans-serif">
        Compute grid
      </text>
      <text x="389" y="108" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="ui-monospace">
        tokenized GPU
      </text>
      <text x="389" y="122" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="ui-monospace">
        token queue
      </text>
      <path d="M428,100 H452" stroke="rgba(210,180,140,0.4)" strokeWidth="1.2" markerEnd="url(#arrHero)" />
      <rect x="454" y="66" width="58" height="68" rx="4" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" fill="rgba(255,255,255,0.04)" />
      <text x="483" y="92" textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize="9" fontFamily="ui-sans-serif">
        SOR
      </text>
      <path d="M463,102 L503,102" stroke="#2E5A3A" strokeWidth="0.8" strokeDasharray="3 2" />
      <text x="483" y="116" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="ui-monospace">
        venues
      </text>
      <text x="483" y="128" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="ui-monospace">
        slippage Δ
      </text>
      <path d="M483,134 V154" stroke="rgba(210,180,140,0.35)" strokeWidth="1" markerEnd="url(#arrHero)" />
      <rect x="400" y="156" width="166" height="36" rx="4" stroke="#2E5A3A" strokeWidth="1.2" fill="rgba(46,90,58,0.1)" />
      <text x="483" y="174" textAnchor="middle" fill="rgba(255,255,255,0.75)" fontSize="9" fontFamily="ui-sans-serif">
        Evidence ledger
      </text>
      <text x="483" y="186" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="ui-monospace">
        intent → fill → P&amp;L hash chain
      </text>
    </svg>
  );
}

function PillarRiskScenario({ t }: { t: Theme }) {
  const s = themeStroke(t);
  const m = accentGreen(t);
  const tan = accentTan(t);
  return (
    <svg viewBox="0 0 360 220" className="w-full h-auto" role="img" aria-labelledby="risk-scen-title">
      <title id="risk-scen-title">Tail loss distributions and correlated stress paths converging on a VaR threshold</title>
      <path d="M20,180 Q90,40 180,100 T340,60" stroke={s} strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M20,190 Q100,120 200,150 T340,140" stroke={tan} strokeWidth="1.5" fill="none" opacity="0.85" />
      <path
        d="M30,195 L340,195"
        stroke={m}
        strokeWidth="1"
        strokeDasharray="4 3"
        opacity="0.8"
      />
      <text x="320" y="188" textAnchor="end" fill={m} fontSize="8" fontFamily="ui-monospace">
        VaR₉₉
      </text>
      {[40, 80, 120, 160, 200, 240].map((x, i) => (
        <circle key={i} cx={x + 40} cy={140 - i * 8} r="3" fill={m} opacity={0.25 + i * 0.1} />
      ))}
      <rect x="220" y="24" width="120" height="70" rx="4" stroke={s} fill={t === 'light' ? 'rgba(245,242,235,0.9)' : 'rgba(0,0,0,0.25)'} />
      <text x="280" y="44" textAnchor="middle" fill={themeStrong(t)} fontSize="9" fontFamily="ui-sans-serif">
        Path library
      </text>
      <text x="280" y="60" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-monospace">
        liquidity crunch
      </text>
      <text x="280" y="72" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-monospace">
        margin cascade
      </text>
      <text x="280" y="84" textAnchor="middle" fill={tan} fontSize="7" fontFamily="ui-monospace">
        repro seed · GPU
      </text>
    </svg>
  );
}

function PillarBacktest({ t }: { t: Theme }) {
  const s = themeStroke(t);
  const g = accentGreen(t);
  return (
    <svg viewBox="0 0 360 220" className="w-full h-auto" role="img">
      <title>Parallel backtest grid feeding a fitness frontier and manifest hashes</title>
      {Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 8 }, (_, c) => (
          <rect
            key={`${r}-${c}`}
            x={24 + c * 14}
            y={28 + r * 14}
            width="11"
            height="11"
            rx="1"
            fill={g}
            opacity={0.08 + ((r + c) % 5) * 0.06}
            stroke={s}
            strokeWidth="0.4"
          />
        )),
      ).flat()}
      <path d="M140,118 L260,118 L260,180 L140,180 Z" stroke={g} fill={t === 'light' ? 'rgba(46,90,58,0.06)' : 'rgba(46,90,58,0.15)'} />
      <text x="200" y="136" textAnchor="middle" fill={themeStrong(t)} fontSize="9" fontFamily="ui-sans-serif">
        Fitness surface
      </text>
      <path d="M152,168 Q180,120 210,150 T248,132" stroke={accentTan(t)} strokeWidth="1.5" fill="none" />
      <text x="200" y="176" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-monospace">
        multi-objective · pareto
      </text>
      <rect x="268" y="36" width="80" height="52" rx="3" stroke={s} fill={t === 'light' ? '#F5F2EB' : 'rgba(255,255,255,0.04)'} />
      <text x="308" y="54" textAnchor="middle" fill={themeStrong(t)} fontSize="8" fontFamily="ui-sans-serif">
        Run manifest
      </text>
      <text x="308" y="70" textAnchor="middle" fill={g} fontSize="7" fontFamily="ui-monospace">
        sha256:7f3a…
      </text>
      <text x="308" y="82" textAnchor="middle" fill={themeMuted(t)} fontSize="6" fontFamily="ui-monospace">
        tokens burned
      </text>
    </svg>
  );
}

function PillarBridgeObserver({ t }: { t: Theme }) {
  const s = themeStroke(t);
  const tan = accentTan(t);
  const g = accentGreen(t);
  return (
    <svg viewBox="0 0 360 220" className="w-full h-auto" role="img">
      <title>News and events through NLP encoders into time series signals and route-ready orders</title>
      <rect x="16" y="70" width="56" height="72" rx="3" stroke={tan} fill={t === 'light' ? 'rgba(210,180,140,0.08)' : 'rgba(210,180,140,0.06)'} />
      <text x="44" y="92" textAnchor="middle" fill={themeStrong(t)} fontSize="8" fontFamily="ui-sans-serif">
        Headlines
      </text>
      <line x1="28" y1="104" x2="60" y2="104" stroke={s} strokeWidth="0.8" />
      <line x1="28" y1="114" x2="56" y2="114" stroke={s} strokeWidth="0.8" opacity="0.6" />
      <line x1="28" y1="124" x2="58" y2="124" stroke={s} strokeWidth="0.8" opacity="0.4" />
      <path d="M72,106 H94" stroke={g} strokeWidth="1.2" />
      <polygon points="94,106 88,102 88,110" fill={g} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={100 + i * 22} y={88} width="18" height="36" rx="2" stroke={s} fill={t === 'light' ? '#fff' : 'rgba(255,255,255,0.03)'} />
      ))}
      <text x="129" y="140" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-monospace">
        transformer
      </text>
      <path d="M168,106 H190" stroke={g} strokeWidth="1.2" />
      <polygon points="190,106 184,102 184,110" fill={g} />
      <path d="M196,130 L260,90 L324,130 L260,170 Z" stroke={tan} fill={t === 'light' ? 'rgba(46,90,58,0.06)' : 'rgba(46,90,58,0.12)'} />
      <text x="260" y="124" textAnchor="middle" fill={themeStrong(t)} fontSize="9" fontFamily="ui-sans-serif">
        Signal tensor
      </text>
      <text x="260" y="138" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-monospace">
        z-score · regime
      </text>
      <path d="M260,172 V194" stroke={tan} strokeWidth="1" />
      <rect x="212" y="196" width="96" height="20" rx="2" stroke={g} fill={t === 'light' ? 'rgba(46,90,58,0.1)' : 'rgba(46,90,58,0.2)'} />
      <text x="260" y="210" textAnchor="middle" fill={g} fontSize="8" fontFamily="ui-monospace">
        ROUTE → SOR
      </text>
    </svg>
  );
}

function PillarWorkflow({ t }: { t: Theme }) {
  const s = themeStroke(t);
  const g = accentGreen(t);
  const steps = ['Signal', 'Intent', 'Order', 'Fill', 'PnL'];
  return (
    <svg viewBox="0 0 360 140" className="w-full h-auto" role="img">
      <title>Immutable evidence chain from signal through fills to attribution</title>
      <defs>
        <marker id="wfArr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={themeStroke(t)} />
        </marker>
      </defs>
      {steps.map((label, i) => {
        const x = 20 + i * 68;
        return (
          <g key={label}>
            <rect
              x={x}
              y="40"
              width="58"
              height="44"
              rx="3"
              stroke={g}
              fill={t === 'light' ? 'rgba(245,242,235,0.95)' : 'rgba(46,90,58,0.12)'}
            />
            <text x={x + 29} y="60" textAnchor="middle" fill={themeStrong(t)} fontSize="8" fontFamily="ui-sans-serif">
              {label}
            </text>
            <text x={x + 29} y="74" textAnchor="middle" fill={g} fontSize="6" fontFamily="ui-monospace">
              H{i + 1}
            </text>
            {i < steps.length - 1 ? (
              <path d={`M${x + 58},62 H${x + 68}`} stroke={s} strokeWidth="1.2" markerEnd="url(#wfArr)" />
            ) : null}
          </g>
        );
      })}
      <text x="180" y="110" textAnchor="middle" fill={themeMuted(t)} fontSize="8" fontFamily="ui-sans-serif">
        Each hop appends signed metadata · second-line readable
      </text>
    </svg>
  );
}

function PillarCompute({ t }: { t: Theme }) {
  const s = themeStroke(t);
  const tan = accentTan(t);
  const g = accentGreen(t);
  return (
    <svg viewBox="0 0 360 200" className="w-full h-auto" role="img">
      <title>Wallet staking compute tokens into priority queues and yielding leases</title>
      <rect x="24" y="36" width="72" height="52" rx="4" stroke={tan} fill={t === 'light' ? 'rgba(210,180,140,0.1)' : 'rgba(210,180,140,0.08)'} />
      <text x="60" y="58" textAnchor="middle" fill={themeStrong(t)} fontSize="9" fontFamily="ui-sans-serif">
        Wallet
      </text>
      <text x="60" y="74" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-monospace">
        GE-GPU*
      </text>
      <path d="M96,62 H140" stroke={g} strokeWidth="1.2" />
      <rect x="142" y="40" width="100" height="56" rx="4" stroke={g} fill={t === 'light' ? 'rgba(46,90,58,0.07)' : 'rgba(46,90,58,0.15)'} />
      <text x="192" y="62" textAnchor="middle" fill={themeStrong(t)} fontSize="9" fontFamily="ui-sans-serif">
        Scheduler
      </text>
      <rect x="154" y="68" width="76" height="14" rx="2" fill={g} opacity="0.25" />
      <rect x="154" y="68" width="42" height="14" rx="2" fill={tan} opacity="0.4" />
      <text x="192" y="98" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-monospace">
        priority tier
      </text>
      <path d="M242,62 H280" stroke={g} strokeWidth="1.2" />
      <rect x="282" y="44" width="54" height="48" rx="4" stroke={s} fill={t === 'light' ? '#F5F2EB' : 'rgba(255,255,255,0.04)'} />
      <text x="309" y="66" textAnchor="middle" fill={themeStrong(t)} fontSize="8" fontFamily="ui-sans-serif">
        Yield
      </text>
      <text x="309" y="80" textAnchor="middle" fill={tan} fontSize="7" fontFamily="ui-monospace">
        lease out
      </text>
      <path d="M60,88 V120 Q120,150 192,128 T320,120" stroke={s} strokeWidth="1" fill="none" strokeDasharray="3 2" />
      <text x="180" y="168" textAnchor="middle" fill={themeMuted(t)} fontSize="8" fontFamily="ui-sans-serif">
        Idle capacity returns to the pool; urgent jobs preempt with policy.
      </text>
    </svg>
  );
}

function PillarExecution({ t }: { t: Theme }) {
  const g = accentGreen(t);
  const s = themeStroke(t);
  const venues = [
    { label: 'A', ang: -0.9 },
    { label: 'B', ang: -0.25 },
    { label: 'C', ang: 0.35 },
    { label: 'D', ang: 0.95 },
  ];
  const cx = 180;
  const cy = 100;
  const r = 62;
  return (
    <svg viewBox="0 0 360 220" className="w-full h-auto" role="img">
      <title>Smart order router choosing venues by liquidity cost and latency ellipses</title>
      <circle cx={cx} cy={cy} r="28" stroke={g} strokeWidth="1.5" fill={t === 'light' ? 'rgba(46,90,58,0.08)' : 'rgba(46,90,58,0.2)'} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={themeStrong(t)} fontSize="10" fontFamily="ui-sans-serif">
        SOR
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-monospace">
        planner
      </text>
      {venues.map((v) => {
        const x = cx + Math.cos(v.ang * Math.PI) * r;
        const y = cy + Math.sin(v.ang * Math.PI) * r * 0.85;
        return (
          <g key={v.label}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={s} strokeWidth="0.8" opacity="0.6" />
            <circle cx={x} cy={y} r="16" stroke={accentTan(t)} fill={t === 'light' ? '#F5F2EB' : 'rgba(255,255,255,0.05)'} />
            <text x={x} y={y + 4} textAnchor="middle" fill={themeStrong(t)} fontSize="9" fontFamily="ui-monospace">
              {v.label}
            </text>
          </g>
        );
      })}
      <ellipse cx="260" cy="150" rx="55" ry="22" stroke={s} fill="none" strokeDasharray="2 2" opacity="0.5" />
      <text x="260" y="154" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-sans-serif">
        slippage iso-cost
      </text>
    </svg>
  );
}

function PillarQuant({ t }: { t: Theme }) {
  const s = themeStroke(t);
  const g = accentGreen(t);
  return (
    <svg viewBox="0 0 360 220" className="w-full h-auto" role="img">
      <title>Notebook kernels bound to data lake APIs and strategy marketplace exports</title>
      <rect x="20" y="32" width="120" height="96" rx="4" stroke={s} fill={t === 'light' ? '#fff' : 'rgba(255,255,255,0.03)'} />
      <rect x="28" y="42" width="40" height="8" rx="1" fill={g} opacity="0.3" />
      <rect x="28" y="56" width="104" height="6" rx="1" fill={s} opacity="0.3" />
      <rect x="28" y="68" width="96" height="6" rx="1" fill={s} opacity="0.25" />
      <rect x="28" y="88" width="88" height="28" rx="2" stroke={accentTan(t)} fill={t === 'light' ? 'rgba(210,180,140,0.06)' : 'rgba(210,180,140,0.05)'} />
      <text x="72" y="104" textAnchor="middle" fill={themeStrong(t)} fontSize="7" fontFamily="ui-monospace">
        cell GPU ✓
      </text>
      <path d="M140,80 H168" stroke={g} strokeWidth="1.2" />
      <path d="M172,48 V160" stroke={s} strokeWidth="1" />
      <path d="M172,80 H200" stroke={g} strokeWidth="1.2" />
      <ellipse cx="260" cy="100" rx="70" ry="44" stroke={g} fill={t === 'light' ? 'rgba(46,90,58,0.05)' : 'rgba(46,90,58,0.12)'} />
      <text x="260" y="96" textAnchor="middle" fill={themeStrong(t)} fontSize="9" fontFamily="ui-sans-serif">
        Data lake
      </text>
      <text x="260" y="110" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-monospace">
        tick · alt · macro
      </text>
      <rect
        x="200"
        y="156"
        width="140"
        height="40"
        rx="3"
        stroke={accentTan(t)}
        fill={t === 'light' ? 'rgba(210,180,140,0.08)' : 'rgba(210,180,140,0.06)'}
      />
      <text x="270" y="176" textAnchor="middle" fill={themeStrong(t)} fontSize="8" fontFamily="ui-sans-serif">
        Strategy marketplace
      </text>
      <text x="270" y="190" textAnchor="middle" fill={g} fontSize="7" fontFamily="ui-monospace">
        license + metering
      </text>
    </svg>
  );
}

function PillarGovernance({ t }: { t: Theme }) {
  const g = accentGreen(t);
  const s = themeStroke(t);
  return (
    <svg viewBox="0 0 360 200" className="w-full h-auto" role="img">
      <title>Policy gates attestation limits and role-bound deployment locks</title>
      <path d="M180,28 L210,50 V90 L180,112 L150,90 V50 Z" stroke={g} fill={t === 'light' ? 'rgba(46,90,58,0.08)' : 'rgba(46,90,58,0.15)'} />
      <text x="180" y="78" textAnchor="middle" fill={themeStrong(t)} fontSize="8" fontFamily="ui-sans-serif">
        Policy
      </text>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={60 + i * 80} y="124" width="64" height="28" rx="3" stroke={s} fill={t === 'light' ? '#F5F2EB' : 'rgba(255,255,255,0.04)'} />
      ))}
      <text x="92" y="142" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-sans-serif">
        limits
      </text>
      <text x="172" y="142" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-sans-serif">
        attest
      </text>
      <text x="252" y="142" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-sans-serif">
        export
      </text>
      <path d="M180,112 V118" stroke={g} strokeWidth="1" />
      <path d="M92,124 L92,118 M172,124 L172,118 M252,124 L252,118" stroke={s} strokeWidth="0.8" />
    </svg>
  );
}

function PillarPremium({ t }: { t: Theme }) {
  const g = accentGreen(t);
  const s = themeStroke(t);
  return (
    <svg viewBox="0 0 360 200" className="w-full h-auto" role="img">
      <title>Embedded white-label stack with subscription metering and model audit pass fail gates</title>
      <rect x="24" y="40" width="120" height="56" rx="4" stroke={g} fill={t === 'light' ? 'rgba(46,90,58,0.06)' : 'rgba(46,90,58,0.12)'} />
      <text x="84" y="64" textAnchor="middle" fill={themeStrong(t)} fontSize="9" fontFamily="ui-sans-serif">
        White-label
      </text>
      <text x="84" y="80" textAnchor="middle" fill={themeMuted(t)} fontSize="7" fontFamily="ui-monospace">
        iframe / API
      </text>
      <rect x="160" y="40" width="80" height="56" rx="4" stroke={s} fill={t === 'light' ? '#F5F2EB' : 'rgba(255,255,255,0.04)'} />
      <text x="200" y="66" textAnchor="middle" fill={themeStrong(t)} fontSize="8" fontFamily="ui-sans-serif">
        Metering
      </text>
      <rect x="172" y="72" width="56" height="10" rx="1" fill={accentTan(t)} opacity="0.35" />
      <rect x="256" y="40" width="80" height="56" rx="4" stroke={accentTan(t)} fill={t === 'light' ? 'rgba(210,180,140,0.08)' : 'rgba(210,180,140,0.06)'} />
      <text x="296" y="66" textAnchor="middle" fill={themeStrong(t)} fontSize="8" fontFamily="ui-sans-serif">
        Auditor
      </text>
      <text x="296" y="82" textAnchor="middle" fill={g} fontSize="7" fontFamily="ui-monospace">
        PASS / FAIL
      </text>
      <path d="M40,120 H320" stroke={s} strokeWidth="0.8" strokeDasharray="4 3" opacity="0.6" />
      <text x="180" y="150" textAnchor="middle" fill={themeMuted(t)} fontSize="8" fontFamily="ui-sans-serif">
        Portfolio diagnostics propose hedges; engines stay policy-locked.
      </text>
    </svg>
  );
}

export function PillarMechanicsIllustration({ pillarId, theme }: { pillarId: string; theme: Theme }) {
  switch (pillarId) {
    case 'advanced-risk-scenario':
      return <PillarRiskScenario t={theme} />;
    case 'backtesting-research':
      return <PillarBacktest t={theme} />;
    case 'bridge-observer':
      return <PillarBridgeObserver t={theme} />;
    case 'institutional-workflow':
      return <PillarWorkflow t={theme} />;
    case 'tokenized-compute':
      return <PillarCompute t={theme} />;
    case 'execution-routing':
      return <PillarExecution t={theme} />;
    case 'quant-research':
      return <PillarQuant t={theme} />;
    case 'governance-compliance':
      return <PillarGovernance t={theme} />;
    case 'premium-addons':
      return <PillarPremium t={theme} />;
    default:
      return <PillarRiskScenario t={theme} />;
  }
}

export function ExecutionLoopIllustration() {
  return (
    <svg viewBox="0 0 720 160" className="w-full h-auto" role="img" aria-labelledby="exec-loop-title">
      <title id="exec-loop-title">Four-step cycle from pre-release evaluation through exposure checks violations and desk discipline</title>
      <defs>
        <marker id="elAr" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#6b7c6e" />
        </marker>
      </defs>
      {[
        { x: 20, label: '01', sub: 'Pre-release', w: 150 },
        { x: 190, label: '02', sub: 'Exposure', w: 150 },
        { x: 360, label: '03', sub: 'Violations', w: 150 },
        { x: 530, label: '04', sub: 'Discipline', w: 170 },
      ].map((b, i) => (
        <g key={b.label}>
          <rect x={b.x} y="36" width={b.w} height="88" rx="4" stroke="rgba(46,90,58,0.35)" fill="#F5F2EB" />
          <text x={b.x + 16} y="58" fill="#2E5A3A" fontSize="11" fontWeight="700" fontFamily="ui-monospace">
            {b.label}
          </text>
          <text x={b.x + 16} y="78" fill="#1A1A1A" fontSize="10" fontWeight="600" fontFamily="ui-sans-serif">
            {b.sub}
          </text>
          <line x1={b.x + 16} y1="88" x2={b.x + b.w - 16} y2="88" stroke="#6b7c6e" strokeWidth="0.5" opacity="0.4" />
          <text x={b.x + 16} y="110" fill="#4a4a48" fontSize="8" fontFamily="ui-sans-serif">
            {i === 0 && 'Limits · scenarios · policy map'}
            {i === 1 && 'Live net/gross · ladders'}
            {i === 2 && 'Halts · maker-checker'}
            {i === 3 && 'Aladdin-grade control debt'}
          </text>
          {i < 3 ? (
            <path
              d={`M${b.x + b.w},80 H${b.x + b.w + 18}`}
              stroke="#6b7c6e"
              strokeWidth="1.2"
              markerEnd="url(#elAr)"
            />
          ) : null}
        </g>
      ))}
    </svg>
  );
}

/** Thin schematic strip — one per capability card for visual rhythm */
export function PillarCardMechanicAccent({ index, theme }: { index: number; theme: Theme }) {
  const s = themeStroke(theme);
  const g = accentGreen(theme);
  const tan = accentTan(theme);
  const mod = index % 4;
  return (
    <svg
      viewBox="0 0 200 36"
      className="w-full h-8 sm:h-9 mt-3 shrink-0 opacity-[0.92]"
      role="presentation"
      aria-hidden
    >
      {mod === 0 ? (
        <>
          <circle cx="22" cy="18" r="5" stroke={g} fill={theme === 'light' ? 'rgba(46,90,58,0.08)' : 'rgba(46,90,58,0.2)'} />
          <path d="M28,18 H58" stroke={s} strokeWidth="1" />
          <rect x="62" y="12" width="28" height="12" rx="2" stroke={tan} fill={theme === 'light' ? 'rgba(210,180,140,0.06)' : 'rgba(210,180,140,0.05)'} />
          <path d="M92,18 H122" stroke={s} strokeWidth="1" />
          <path d="M128,24 L142,12 L156,22 L170,10 L184,20" stroke={g} strokeWidth="1.2" fill="none" />
        </>
      ) : null}
      {mod === 1 ? (
        <>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={16 + i * 18}
              y={10 + (i % 2) * 4}
              width="12"
              height="12"
              rx="2"
              stroke={s}
              fill={i % 2 === 0 ? g : 'transparent'}
              fillOpacity={i % 2 === 0 ? 0.15 : 0}
              opacity={0.7 - i * 0.08}
            />
          ))}
          <path d="M88,18 H170" stroke={tan} strokeWidth="1" strokeDasharray="3 2" />
          <text x="178" y="21" fill={themeMuted(theme)} fontSize="8" fontFamily="ui-monospace">
            ∇
          </text>
        </>
      ) : null}
      {mod === 2 ? (
        <>
          <path
            d="M12,26 Q40,8 68,20 T124,14 T180,22"
            stroke={g}
            strokeWidth="1.3"
            fill="none"
            opacity="0.85"
          />
          <line x1="12" y1="28" x2="188" y2="28" stroke={s} strokeWidth="0.6" opacity="0.5" />
        </>
      ) : null}
      {mod === 3 ? (
        <>
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={18 + i * 16} cy="18" r={2 + (i % 3)} fill={g} opacity={0.12 + (i % 4) * 0.1} />
          ))}
          <rect x="150" y="10" width="40" height="16" rx="2" stroke={tan} fill="none" strokeWidth="0.8" />
          <text x="170" y="21" textAnchor="middle" fill={themeMuted(theme)} fontSize="7" fontFamily="ui-monospace">
            log
          </text>
        </>
      ) : null}
    </svg>
  );
}

export function TrustLineageIllustration() {
  return (
    <svg viewBox="0 0 320 100" className="w-full max-w-[320px] h-auto" role="img">
      <title>Attestation chain and segregated duties</title>
      <rect x="12" y="24" width="64" height="52" rx="4" stroke="#2E5A3A" fill="rgba(46,90,58,0.08)" />
      <text x="44" y="48" textAnchor="middle" fill="#1A1A1A" fontSize="8" fontFamily="ui-sans-serif">
        Sign
      </text>
      <text x="44" y="62" textAnchor="middle" fill="#2E5A3A" fontSize="7" fontFamily="ui-monospace">
        HMAC
      </text>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={92 + i * 72} y="32" width="56" height="36" rx="3" stroke="rgba(107,124,110,0.5)" fill="#F5F2EB" />
      ))}
      <text x="120" y="52" textAnchor="middle" fill="#4a4a48" fontSize="7" fontFamily="ui-monospace">
        model
      </text>
      <text x="192" y="52" textAnchor="middle" fill="#4a4a48" fontSize="7" fontFamily="ui-monospace">
        data
      </text>
      <text x="264" y="52" textAnchor="middle" fill="#4a4a48" fontSize="7" fontFamily="ui-monospace">
        run
      </text>
      <path d="M76,50 H88 M148,50 H164 M220,50 H236" stroke="#6b7c6e" strokeWidth="0.9" />
      <text x="160" y="88" textAnchor="middle" fill="#4a4a48" fontSize="8" fontFamily="ui-sans-serif">
        Bundles ship with roles: research ≠ release ≠ attestation
      </text>
    </svg>
  );
}
