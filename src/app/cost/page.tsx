import React from 'react';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function CostNationalContextPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-[var(--font-inter)]">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <header className="pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-variant/30 text-xs font-medium mb-3">
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            National Health Macroeconomics
          </div>
          <h1 className="text-3xl font-[var(--font-space-grotesk)] font-bold mb-2">
            What air pollution costs India
          </h1>
          <p className="text-muted-foreground text-sm">
            Understanding the macroeconomic burden and household impact of PM2.5 exposure.
          </p>
        </header>

        <div className="bg-estimate-flag/5 border border-estimate-flag/20 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-estimate-flag mt-0.5">info</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Data sourced from Lancet Planetary Health study and Global Burden of Disease (GBD) 2019 baseline metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium whitespace-nowrap">
            All Impacts
          </button>
          <button className="px-4 py-1.5 rounded-full bg-surface-variant/30 text-foreground text-sm font-medium whitespace-nowrap">
            Workforce
          </button>
          <button className="px-4 py-1.5 rounded-full bg-surface-variant/30 text-foreground text-sm font-medium whitespace-nowrap">
            Households
          </button>
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <span className="font-bold">4</span> Verified Metrics
          </div>
        </div>

        <div className="space-y-4">
          {/* Card 1 */}
          <div className="bg-surface rounded-2xl p-5 border border-outline/10 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="material-symbols-outlined">account_balance</span>
                NATIONAL FISCAL IMPACT
              </div>
              <span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                Severe
              </span>
            </div>
            <div className="mb-3">
              <div className="text-4xl font-[var(--font-space-grotesk)] font-bold text-foreground">₹2.6 Lakh Cr</div>
              <div className="text-sm text-muted-foreground mt-1">$36.8 Billion USD (2019)</div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Total economic loss due to premature deaths and morbidity from air pollution.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-primary/80 pt-3 border-t border-outline/10">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              Lancet Planetary Health, 2021
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-surface rounded-2xl p-5 border border-outline/10 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
              <span className="material-symbols-outlined">trending_down</span>
              Productivity Loss
            </div>
            <div className="text-3xl font-[var(--font-space-grotesk)] font-bold text-foreground mb-4">1.4% of GDP</div>
            <div className="h-3 bg-surface-variant/50 rounded-full overflow-hidden mb-4">
              <div className="h-full bg-aqi-poor rounded-full" style={{ width: '42%' }}></div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary/80 pt-3 border-t border-outline/10">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              World Bank Estimates
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-surface rounded-2xl p-5 border border-outline/10 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span className="material-symbols-outlined">payments</span>
                Out-of-Pocket Drain
              </div>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                Per Household
              </span>
            </div>
            <div className="text-4xl font-[var(--font-space-grotesk)] font-bold text-foreground mb-3">₹5,400</div>
            <p className="text-sm text-muted-foreground mb-4">
              Average annual direct medical spending on respiratory illnesses in urban centers.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-primary/80 pt-3 border-t border-outline/10">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              National Health Accounts
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-surface rounded-2xl p-5 border border-outline/10 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-4">
              <span className="material-symbols-outlined">vital_signs</span>
              Public Health Toll
            </div>
            <div className="flex items-center gap-6 mb-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-surface-variant/30" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-error" strokeDasharray="17.8, 100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold font-[var(--font-space-grotesk)]">17.8%</span>
                </div>
              </div>
              <div>
                <div className="text-xl font-bold font-[var(--font-space-grotesk)] text-foreground">1 in every 5.6 deaths</div>
                <div className="text-xs text-muted-foreground mt-1">Attributable to air pollution in India.</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-primary/80 pt-3 border-t border-outline/10">
              <span className="material-symbols-outlined text-[14px]">menu_book</span>
              GBD 2019
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 z-40 pb-safe">
        <div className="max-w-md mx-auto backdrop-blur-md bg-white/70 dark:bg-black/70 border border-white/20 dark:border-white/10 p-4 rounded-2xl shadow-lg">
          <p className="text-sm text-center font-medium mb-3">Ready to calculate your zip code?</p>
          <Link href="/cost/calculator" className="block w-full text-center bg-primary text-on-primary py-3 rounded-xl font-semibold shadow-md">
            Estimate My Personal Cost
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
