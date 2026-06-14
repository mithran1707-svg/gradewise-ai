"use client";

import { useId } from "react";

interface GradeRingProps {
  value: number;
  max: number;
  label: string;
  sublabel?: string;
  size?: number;
  formatValue?: (v: number) => string;
  accent?: "gold" | "teal" | "crimson";
}

const ACCENTS: Record<string, [string, string]> = {
  gold: ["#D4A24E", "#B5832E"],
  teal: ["#3FA796", "#2C7A6D"],
  crimson: ["#C1554D", "#8E3A34"],
};

/**
 * A radial gauge styled like an instrument dial on a ledger page: a ring of
 * fine tick marks (one per unit, like rulings on a page) with a sweeping
 * progress arc and a large tabular-figure value at the centre.
 */
export default function GradeRing({
  value,
  max,
  label,
  sublabel,
  size = 168,
  formatValue,
  accent = "gold",
}: GradeRingProps) {
  const gradId = useId();
  const radius = size / 2 - 14;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const offset = circumference * (1 - pct);
  const [from, to] = ACCENTS[accent];

  // Tick marks around the dial
  const tickCount = 40;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / tickCount) * 2 * Math.PI - Math.PI / 2;
    const major = i % 5 === 0;
    const r1 = radius + 6;
    const r2 = major ? radius + 12 : radius + 9;
    const cx = size / 2;
    const cy = size / 2;
    return {
      x1: cx + r1 * Math.cos(angle),
      y1: cy + r1 * Math.sin(angle),
      x2: cx + r2 * Math.cos(angle),
      y2: cy + r2 * Math.sin(angle),
      major,
      lit: i / tickCount <= pct,
    };
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-0">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          </defs>

          {/* ticks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              strokeWidth={t.major ? 2 : 1}
              stroke={t.lit ? from : "currentColor"}
              className={t.lit ? "" : "text-ink-line dark:text-ink-line opacity-40"}
            />
          ))}

          {/* track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={8}
            className="text-paper-line dark:text-ink-line"
            stroke="currentColor"
            opacity={0.5}
          />

          {/* progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={8}
            strokeLinecap="round"
            stroke={`url(#${gradId})`}
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="animate-ring-draw"
            style={
              {
                "--ring-circumference": circumference,
                "--ring-offset": offset,
              } as React.CSSProperties
            }
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono-num text-2xl font-semibold tabular-nums">
            {formatValue ? formatValue(value) : value.toFixed(2)}
          </span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-slate-muted mt-0.5">
            / {max}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="font-display text-sm font-medium">{label}</p>
        {sublabel && <p className="text-xs text-slate-muted mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}
