'use client';

import React, { useEffect, useRef } from 'react';
import { CHART } from '@/components/charts/chartTokens';
import { usePulseClock } from '@/hooks/usePulseClock';

type Props = {
  symbol: string;
  mode?: 'calm' | 'hero';
  height?: number;
  className?: string;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hexToRgb(h: string): [number, number, number] {
  const x = h.replace('#', '');
  return [parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16)];
}

export function MarketPulseVisualizer({ symbol, mode = 'hero', height = 120, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleRef = usePulseClock(symbol);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pulseRef = sampleRef;
    let raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const up = hexToRgb(CHART.up);
    const down = hexToRgb(CHART.down);
    const brass = hexToRgb(CHART.brass);

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const s = pulseRef.current;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      if (s) {
        const dir = s.direction;
        const base = dir > 0 ? up : dir < 0 ? down : brass;
        const t = Math.min(1, s.amplitude / 3);
        const r = Math.round(lerp(brass[0], base[0], t));
        const g = Math.round(lerp(brass[1], base[1], t));
        const b = Math.round(lerp(brass[2], base[2], t));
        const col = (a: number) => `rgba(${r},${g},${b},${a})`;
        const cx = w / 2;
        const cy = h * 0.45;
        const bars = mode === 'hero' ? 56 : 32;
        const baseR = Math.min(w, h) * (mode === 'hero' ? 0.14 : 0.1);
        const bloom = 1 + s.energy * (mode === 'hero' ? 1.6 : 0.7);
        for (let i = 0; i < bars; i += 1) {
          const ang = (i / bars) * Math.PI * 2;
          const band = s.bands[i % 3];
          const len = baseR * (0.3 + band * 1.5 * bloom);
          ctx.strokeStyle = col(0.12 + 0.45 * band);
          ctx.lineWidth = mode === 'hero' ? 2 : 1.2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * baseR, cy + Math.sin(ang) * baseR);
          ctx.lineTo(cx + Math.cos(ang) * (baseR + len), cy + Math.sin(ang) * (baseR + len));
          ctx.stroke();
        }
        const wave = s.waveform;
        ctx.strokeStyle = col(0.5);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < wave.length; i += 1) {
          const x = (i / (wave.length - 1)) * w;
          const y = h - 12 - wave[i] * 12;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [mode, symbol, sampleRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none w-full ${className}`}
      style={{ height, display: 'block', background: 'transparent' }}
      aria-hidden
    />
  );
}
