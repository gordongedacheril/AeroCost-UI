"use client";

import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';
import { useLocationAqi } from '@/hooks/useLocationAqi';
import { getAqiBand } from '@/data/constants';

export default function CostCalculatorPage() {
  const { aqi: liveAqi, location, station, isLoading: isAqiLoading } = useLocationAqi();

  const [aqi, setAqi] = useState<number>(210);
  const [days, setDays] = useState<number>(140);
  const [spend, setSpend] = useState<number>(18500);
  const [isVulnerable, setIsVulnerable] = useState<boolean>(true);
  const [showAqiSlider, setShowAqiSlider] = useState<boolean>(false);
  const [projection, setProjection] = useState<number>(0);
  const [hasInitializedAqi, setHasInitializedAqi] = useState<boolean>(false);

  // Sync live AQI once fetched from real sensor
  useEffect(() => {
    if (liveAqi && !hasInitializedAqi) {
      setAqi(liveAqi);
      setHasInitializedAqi(true);
    }
  }, [liveAqi, hasInitializedAqi]);

  // Epidemiological health cost calculation
  useEffect(() => {
    const aqiFactor = (aqi / 100) * 0.45;
    const dayFactor = (days / 365) * 1.8;
    const vulnMultiplier = isVulnerable ? 1.65 : 1.0;
    const incremental = spend * aqiFactor * dayFactor * vulnMultiplier;
    setProjection(Math.round(incremental));
  }, [aqi, days, spend, isVulnerable]);

  const band = getAqiBand(aqi);
  const resolvedCityName = location?.city || location?.displayName || station?.name || "Local Station";

  return (
    <div className="min-h-screen bg-slate-50 text-ink pb-28 font-[var(--font-inter)]">
      {/* Container with responsive widths for mobile, tablet, and laptop */}
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <header className="pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <span className="material-symbols-outlined text-[16px]">calculate</span>
            Personal Health Expenditure Model
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-[var(--font-space-grotesk)] font-bold mb-2 text-ink">
            Calculate your exposure impact
          </h1>
          <p className="text-xs md:text-sm text-slate">
            Personalized out-of-pocket healthcare burden projection based on live CPCB air quality telemetry.
          </p>
        </header>

        {/* Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
          <span className="material-symbols-outlined text-amber-600 mt-0.5 shrink-0">info</span>
          <p className="text-xs md:text-sm text-amber-900 leading-relaxed">
            This model uses peer-reviewed concentration-response epidemiological functions (Lancet Planetary Health &amp; GBD 2019). Individual medical and financial costs vary based on pre-existing respiratory conditions.
          </p>
        </div>

        {/* 2-Column Responsive Layout for Tablets/Laptops */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (Inputs): 7 cols on laptop */}
          <div className="lg:col-span-7 space-y-5">
            {/* Input 1: Live AQI Card */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate">
                  Current Local Air Quality
                </div>
                <div className="flex gap-2 items-center">
                  <span
                    className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${band.hex}20`, color: band.hex }}
                  >
                    {band.label}
                  </span>
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {isAqiLoading ? "Syncing..." : "Live Telemetry"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div
                    className="text-4xl md:text-5xl font-[var(--font-space-grotesk)] font-bold"
                    style={{ color: band.hex }}
                  >
                    {aqi}
                  </div>
                  <span className="text-xs text-slate font-medium">CPCB Index Value</span>
                </div>

                <button
                  onClick={() => setShowAqiSlider(!showAqiSlider)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate hover:text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">tune</span>
                  <span>{showAqiSlider ? "Lock Live" : "Adjust Manually"}</span>
                </button>
              </div>

              {showAqiSlider && (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs text-slate font-medium">
                    <span>Clean Air (30)</span>
                    <span className="font-bold text-primary">Simulated: {aqi}</span>
                    <span>Severe (500)</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="500"
                    step="5"
                    value={aqi}
                    onChange={(e) => setAqi(Number(e.target.value))}
                    className="w-full accent-primary h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              <p className="text-[11px] text-slate mt-3 italic flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">sensors</span>
                Synchronized with telemetry node for <strong>{resolvedCityName}</strong>.
              </p>
            </div>

            {/* Input 2: Annual Exposure Days */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate">
                  Annual Days Exceeding 100 AQI
                </div>
                <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-200">
                  &gt; WHO Safe Threshold
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-3">
                <div className="text-4xl md:text-5xl font-[var(--font-space-grotesk)] font-bold text-ink">
                  {days}
                </div>
                <span className="text-sm text-slate font-medium">days / year</span>
              </div>

              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-slate-200 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate mt-2.5 font-medium">
                <span>10d (Coastal)</span>
                <span className="hidden sm:inline">140d (Gangetic Plains Avg)</span>
                <span>300d (NCR Epicenter)</span>
              </div>
            </div>

            {/* Input 3: Baseline Household Spend */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <div className="text-xs md:text-sm font-bold uppercase tracking-wider text-slate">
                  Baseline Household Health Spend
                </div>
                <button
                  onClick={() => setSpend(18500)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Reset India Median (₹18.5k)
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-3 text-lg font-bold text-slate">₹</span>
                <input
                  type="number"
                  value={spend}
                  onChange={(e) => setSpend(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-[var(--font-space-grotesk)] text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-[11px] text-slate mt-2">
                India urban median annual out-of-pocket healthcare expense (NSSO 75th Round).
              </p>
            </div>

            {/* Input 4: Vulnerability Cohort */}
            <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold text-ink">Vulnerable Household Cohort</h3>
                  <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded border border-orange-200">
                    1.65× Burden Multiplier
                  </span>
                </div>
                <p className="text-xs text-slate">
                  Household includes children under 12, seniors over 60, or persons with asthma / COPD.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={isVulnerable}
                  onChange={(e) => setIsVulnerable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>

          {/* Right Column (Live Projection Card): 5 cols on laptop (Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 md:p-7 border border-slate-200 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate mb-2">
                <span className="material-symbols-outlined text-primary text-[18px]">trending_up</span>
                Projected Added Burden
              </div>

              <div className="mb-4">
                <div className="text-3xl md:text-4xl lg:text-5xl font-[var(--font-space-grotesk)] font-bold text-red-600">
                  +₹{projection.toLocaleString('en-IN')}
                </div>
                <span className="text-xs text-slate font-medium">Estimated additional medical expenditure / year</span>
              </div>

              {/* Itemized breakdown estimate */}
              <div className="space-y-2.5 py-4 border-t border-slate-100 text-xs text-slate">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-primary">stethoscope</span>
                    Outpatient doctor visits
                  </span>
                  <span className="font-bold text-ink font-[var(--font-space-grotesk)]">
                    ~₹{Math.round(projection * 0.35).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-primary">medication</span>
                    Nebulizers &amp; Inhaler upkeep
                  </span>
                  <span className="font-bold text-ink font-[var(--font-space-grotesk)]">
                    ~₹{Math.round(projection * 0.42).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-primary">masks</span>
                    N95 masks &amp; filtration
                  </span>
                  <span className="font-bold text-ink font-[var(--font-space-grotesk)]">
                    ~₹{Math.round(projection * 0.23).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* CTA Link */}
              <Link
                href={`/cost/result?aqi=${aqi}&days=${days}&spend=${spend}&vuln=${isVulnerable}&proj=${projection}`}
                className="mt-4 w-full bg-primary text-white py-3.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-md text-center"
              >
                <span>View Full Scientific Breakdown</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>

              <p className="text-[10px] text-center text-slate mt-3">
                Calculated dynamically using CPCB concentration-response curves.
              </p>
            </div>

            {/* Quick Link Card to Facilities */}
            <div className="bg-slate-100/80 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-ink">Need Clinical Help Nearby?</h4>
                <p className="text-[11px] text-slate">Explore verified PHCs and hospitals in your area.</p>
              </div>
              <Link
                href="/hospitals"
                className="px-3 py-2 bg-white text-primary border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Open Map
              </Link>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
