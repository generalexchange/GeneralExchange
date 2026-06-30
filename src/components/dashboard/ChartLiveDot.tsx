'use client';

import React from 'react';

/** Robinhood-style pulsing dot anchored to the last chart point. */
export function ChartLiveDot({
  cx,
  cy,
  stroke,
  strokeBg,
}: {
  cx?: number;
  cy?: number;
  stroke: string;
  strokeBg: string;
}) {
  if (cx == null || cy == null || Number.isNaN(cx) || Number.isNaN(cy)) return null;

  return (
    <g aria-hidden>
      <circle cx={cx} cy={cy} r={6} fill={stroke} opacity={0.2}>
        <animate attributeName="r" values="6;18;6" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r={4.5} fill={stroke} stroke={strokeBg} strokeWidth={2.5} />
    </g>
  );
}
