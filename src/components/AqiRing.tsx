'use client';

import { useEffect, useState } from 'react';
import { getAqiBand } from '@/data/constants';

interface AqiRingProps {
  aqi: number;
  size?: number; // width/height in px
  animate?: boolean;
}

export default function AqiRing({ aqi, size = 288, animate = true }: AqiRingProps) {
  const [offset, setOffset] = useState(animate ? 489.84 : 0);
  const band = getAqiBand(aqi);

  // Calculate the progress arc offset
  // Arc spans 270 degrees (from 135° to 405°) = 75% of circumference
  // Circumference at r=104 = 2 * PI * 104 ≈ 653.12
  // But dasharray is set to 489.84 (which is 75% of 653.12)
  // dashoffset of 163.28 hides 25% (the gap at bottom)
  const maxArc = 489.84; // total visible arc length
  const gapOffset = 163.28; // the gap at the bottom
  const progress = Math.min(aqi / 500, 1);
  const targetOffset = maxArc - (maxArc - gapOffset) * progress + gapOffset;

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setOffset(targetOffset);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setOffset(targetOffset);
    }
  }, [aqi, animate, targetOffset]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* SVG Radial Meter */}
      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
        {/* Background track arc */}
        <circle
          cx="130"
          cy="130"
          r="104"
          fill="none"
          stroke="#E7EAEC"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="489.84"
          strokeDashoffset="163.28"
        />
        {/* Active progress arc */}
        <circle
          cx="130"
          cy="130"
          r="104"
          fill="none"
          stroke={band.hex}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="489.84"
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        {/* Inner decorative perimeter track */}
        <circle
          cx="130"
          cy="130"
          r="90"
          fill="none"
          stroke="#F1F4F6"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      </svg>

      {/* Center display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pt-2">
        <span
          className="font-[var(--font-space-grotesk)] text-[56px] leading-[60px] font-semibold text-primary tracking-tight drop-shadow-sm"
          style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}
        >
          {aqi}
        </span>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mt-2"
          style={{ backgroundColor: `${band.hex}15`, border: `1px solid ${band.hex}30` }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: band.hex }}
          />
          <span
            className="text-[13px] leading-[18px] font-semibold tracking-wide uppercase font-[var(--font-inter)]"
            style={{ color: band.hex }}
          >
            {band.label} ({band.range[0]}–{band.range[1]})
          </span>
        </div>
      </div>
    </div>
  );
}
