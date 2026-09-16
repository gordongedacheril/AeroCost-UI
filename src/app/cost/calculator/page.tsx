"use client";

import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function CostCalculatorPage() {
  const [aqi, setAqi] = useState(248);
  const [days, setDays] = useState(140);
  const [spend, setSpend] = useState(18500);
  const [isVulnerable, setIsVulnerable] = useState(true);
  const [showAqiSlider, setShowAqiSlider] = useState(false);
  const [projection, setProjection] = useState(0);

  useEffect(() => {
    const aqiFactor = (aqi / 100) * 0.45;
    const dayFactor = (days / 365) * 1.8;
    const vulnMultiplier = isVulnerable ? 1.65 : 1.0;
    const incremental = spend * aqiFactor * dayFactor * vulnMultiplier;
    setProjection(Math.round(incremental));
  }, [aqi, days, spend, isVulnerable]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-[var(--font-inter)]">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <header className="pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            Personal Cost Calculator
          </div>
          <h1 className="text-3xl font-[var(--font-space-grotesk)] font-bold mb-2">
            Calculate your exposure impact
          </h1>
        </header>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This model uses epidemiological health burden equations. Individual health and financial impacts vary widely.
          </p>
        </div>

        <div className="space-y-5">
          {/* Input 1 */}
          <div className="bg-surface p-5 rounded-2xl border border-outline/10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium">Current Local AQI</div>
              <div className="flex gap-2 items-center">
                <span className="bg-aqi-poor/20 text-aqi-poor text-xs font-bold px-2 py-0.5 rounded-sm">Poor</span>
                <span className="bg-surface-variant/50 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Live Sensor
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-5xl font-[var(--font-space-grotesk)] font-bold text-foreground">{aqi}</div>
              <button 
                onClick={() => setShowAqiSlider(!showAqiSlider)}
                className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-foreground hover:bg-surface-variant/80"
              >
                <span className="material-symbols-outlined">tune</span>
              </button>
            </div>
            
            {showAqiSlider && (
              <div className="mt-4 pt-4 border-t border-outline/10">
                <input 
                  type="range" 
                  min="30" max="480" step="5"
                  value={aqi}
                  onChange={(e) => setAqi(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>30</span>
                  <span>480</span>
                </div>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground mt-3 italic">
              * Auto-filled from nearest station (Anand Vihar).
            </p>
          </div>

          {/* Input 2 */}
          <div className="bg-surface p-5 rounded-2xl border border-outline/10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium">Annual Exposure Days &gt; 100 AQI</div>
              <span className="bg-error-container/50 text-error text-[10px] px-2 py-0.5 rounded-full">
                &gt; WHO threshold
              </span>
            </div>
            <div className="text-5xl font-[var(--font-space-grotesk)] font-bold text-foreground mb-4">{days}</div>
            
            <input 
              type="range" 
              min="10" max="300" step="5"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-primary mb-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground relative h-8">
              <span className="absolute left-0">10d (Coastal)</span>
              <span className="absolute left-1/2 -translate-x-1/2">150d (Gangetic Plains avg)</span>
              <span className="absolute right-0 text-right">300d (NCR Epicenter)</span>
            </div>
          </div>

          {/* Input 3 */}
          <div className="bg-surface p-5 rounded-2xl border border-outline/10 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm font-medium">Household Health Spend (Base/yr)</div>
              <button 
                onClick={() => setSpend(18500)}
                className="text-xs text-primary font-medium hover:underline"
              >
                Reset median
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-xl font-medium text-muted-foreground">₹</span>
              </div>
              <input 
                type="number"
                value={spend}
                onChange={(e) => setSpend(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 bg-surface-variant/30 border border-outline/20 rounded-xl text-xl font-[var(--font-space-grotesk)] font-bold focus:outline-none focus:border-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              India urban median household baseline medical expenditure.
            </p>
          </div>

          {/* Input 4 */}
          <div className="bg-surface p-5 rounded-2xl border border-outline/10 shadow-sm flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-sm font-medium">Vulnerable Household Cohort</div>
                <span className="bg-error/10 text-error text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                  1.65× Curve
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Children &lt;5, Seniors &gt;65, or asthma history
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isVulnerable} onChange={(e) => setIsVulnerable(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <div className="fixed bottom-[88px] left-0 right-0 p-4 z-40 pb-safe">
          <div className="max-w-md mx-auto">
            <div className="bg-surface border border-outline/10 rounded-t-2xl p-4 pb-6 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">Estimated Incremental Burden</span>
                <span className="text-xl font-[var(--font-space-grotesk)] font-bold text-error">+₹{projection.toLocaleString()}/yr</span>
              </div>
              <Link href="/cost/result" className="block w-full text-center bg-primary text-on-primary py-3 rounded-xl font-semibold shadow-md">
                Calculate Estimated Impact
              </Link>
              <p className="text-[10px] text-center text-muted-foreground mt-3">
                Projection includes outpatient visits, medications, and air filtration costs.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
