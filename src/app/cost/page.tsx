import React from 'react';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function CostNationalContextPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-ink pb-36 font-[var(--font-inter)]">
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <header className="pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            National Health Macroeconomics
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-[var(--font-space-grotesk)] font-bold mb-2 text-ink">
            What air pollution costs India
          </h1>
          <p className="text-xs md:text-sm text-slate">
            Understanding the macroeconomic burden, productivity loss, and household drain of ambient PM2.5 exposure.
          </p>
        </header>

        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
          <span className="material-symbols-outlined text-amber-600 mt-0.5 shrink-0">info</span>
          <p className="text-xs md:text-sm text-amber-900 leading-relaxed">
            Data sourced from Lancet Planetary Health (India State-Level Disease Burden Study) and Global Burden of Disease (GBD 2019) verified baselines.
          </p>
        </div>

        {/* Filter chips bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button className="px-4 py-1.5 rounded-full bg-primary text-white text-xs md:text-sm font-semibold whitespace-nowrap shadow-xs">
            All Impacts
          </button>
          <button className="px-4 py-1.5 rounded-full bg-white text-slate hover:text-ink border border-slate-200 text-xs md:text-sm font-medium whitespace-nowrap">
            Workforce Productivity
          </button>
          <button className="px-4 py-1.5 rounded-full bg-white text-slate hover:text-ink border border-slate-200 text-xs md:text-sm font-medium whitespace-nowrap">
            Household Drain
          </button>
          <div className="ml-auto flex items-center gap-1 text-xs text-slate whitespace-nowrap">
            <span className="font-bold text-ink">4</span> Verified Metrics
          </div>
        </div>

        {/* 2-Column Responsive Card Grid for Tablets & Laptops */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Card 1: National Fiscal Impact */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-slate">
                  <span className="material-symbols-outlined text-primary text-lg">account_balance</span>
                  National Fiscal Impact
                </div>
                <span className="bg-red-50 text-red-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-200 uppercase tracking-wider">
                  Critical
                </span>
              </div>
              <div className="mb-3">
                <div className="text-3xl md:text-4xl font-[var(--font-space-grotesk)] font-bold text-ink">
                  ₹2.6 Lakh Cr
                </div>
                <div className="text-xs md:text-sm text-slate mt-1 font-medium">
                  Approx. $36.8 Billion USD Equivalent (Annual)
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate leading-relaxed mb-4">
                Total economic output lost due to premature mortality and respiratory morbidity attributable to severe air pollution.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium pt-3 border-t border-slate-100">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              Lancet Planetary Health, 2021
            </div>
          </div>

          {/* Card 2: Productivity Loss */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-slate mb-3">
                <span className="material-symbols-outlined text-primary text-lg">trending_down</span>
                Productivity Loss
              </div>
              <div className="text-3xl md:text-4xl font-[var(--font-space-grotesk)] font-bold text-red-600 mb-3">
                1.4% of GDP
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '42%' }}></div>
              </div>
              <p className="text-xs md:text-sm text-slate leading-relaxed mb-4">
                Lost working days, reduced cognitive performance, and outpatient absenteeism across manufacturing and services sectors.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium pt-3 border-t border-slate-100">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              World Bank Economic Analysis &amp; ICMR
            </div>
          </div>

          {/* Card 3: Out of Pocket Drain */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-slate">
                  <span className="material-symbols-outlined text-primary text-lg">payments</span>
                  Out-of-Pocket Drain
                </div>
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-primary/20 uppercase tracking-wider">
                  Per Household
                </span>
              </div>
              <div className="text-3xl md:text-4xl font-[var(--font-space-grotesk)] font-bold text-ink mb-2">
                ₹5,400 / yr
              </div>
              <p className="text-xs md:text-sm text-slate leading-relaxed mb-4">
                Average direct expenditure on bronchodilators, nebulizers, antihistamines, and specialist pulmonologist consults in polluted urban centers.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium pt-3 border-t border-slate-100">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              National Health Accounts &amp; AIIMS Survey
            </div>
          </div>

          {/* Card 4: Public Health Toll */}
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-slate mb-3">
                <span className="material-symbols-outlined text-primary text-lg">vital_signs</span>
                National Public Health Toll
              </div>
              <div className="flex items-center gap-5 mb-4">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-slate-200" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-red-500" strokeDasharray="17.8, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold font-[var(--font-space-grotesk)] text-ink">17.8%</span>
                  </div>
                </div>
                <div>
                  <div className="text-lg md:text-xl font-bold font-[var(--font-space-grotesk)] text-ink">
                    1 in every 5.6 deaths
                  </div>
                  <div className="text-xs text-slate mt-0.5">
                    Attributable to ambient and household particulate matter.
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium pt-3 border-t border-slate-100">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              Global Burden of Disease Study (GBD 2019)
            </div>
          </div>
        </div>
      </div>

      {/* Floating CTA Dock on Bottom (Responsive Centered) */}
      <div className="fixed bottom-16 left-0 right-0 p-4 z-30 pb-safe">
        <div className="max-w-md md:max-w-lg mx-auto bg-white/90 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            <p className="text-xs md:text-sm font-bold text-ink">Calculate your personal exposure?</p>
            <p className="text-[11px] text-slate">Estimate out-of-pocket spend for your city</p>
          </div>
          <Link
            href="/cost/calculator"
            className="w-full sm:w-auto px-5 py-2.5 text-center bg-primary text-white rounded-xl text-xs md:text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-md shrink-0"
          >
            Estimate My Cost
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
