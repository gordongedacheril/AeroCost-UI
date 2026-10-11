"use client";

import React, { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function CostResultPage() {
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-ink pb-28 font-[var(--font-inter)]">
      <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <header className="pt-2 flex flex-col items-center text-center">
          <div className="relative w-12 h-12 mb-2">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="75, 100"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-red-500"
                strokeDasharray="50, 100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-red-600">medical_services</span>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-[var(--font-space-grotesk)] font-bold text-ink">
            Estimated Personal Health Burden
          </h1>
          <p className="text-xs md:text-sm text-slate mt-1 max-w-md">
            Direct out-of-pocket medical expenditure attributable to sustained ambient PM2.5 exposure.
          </p>
        </header>

        {/* 2-Column Responsive Layout for Tablets/Laptops */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (Hero Burden Card & Curve): 7 cols */}
          <div className="lg:col-span-7 space-y-6">
            {/* Hero Burden Card */}
            <div className="bg-white p-6 md:p-7 rounded-3xl border border-slate-200 shadow-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-red-600"></div>

              <div className="text-center mb-6 pt-1">
                <div className="text-xs uppercase font-bold tracking-wider text-slate mb-1">
                  Incremental Annual Out-of-Pocket Cost
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-[var(--font-space-grotesk)] font-bold text-ink mb-2">
                  ₹4,800 <span className="text-2xl text-slate font-normal">–</span> ₹7,400 <span className="text-sm font-normal text-slate">/ year</span>
                </div>
                <div className="text-xs bg-red-50 text-red-700 font-bold inline-block px-3 py-1 rounded-full border border-red-200">
                  Due to persistent particulate exposure exceeding WHO baseline
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                    </div>
                    <span className="text-xs md:text-sm font-medium text-ink">Outpatient consultations &amp; diagnostics</span>
                  </div>
                  <span className="font-[var(--font-space-grotesk)] font-bold text-ink">~₹2,200</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[16px]">medication</span>
                    </div>
                    <span className="text-xs md:text-sm font-medium text-ink">Nebulizers, Inhalers &amp; Bronchodilators</span>
                  </div>
                  <span className="font-[var(--font-space-grotesk)] font-bold text-ink">~₹3,100</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[16px]">masks</span>
                    </div>
                    <span className="text-xs md:text-sm font-medium text-ink">N95 Masks &amp; HEPA Filtration Replacements</span>
                  </div>
                  <span className="font-[var(--font-space-grotesk)] font-bold text-ink">~₹1,500</span>
                </div>
              </div>
            </div>

            {/* Exponential Risk Curve */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-5 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-ink">
                  <span className="material-symbols-outlined text-primary text-[18px]">show_chart</span>
                  Supralinear Concentration-Response Function
                </h2>
                <span className="text-xs bg-slate-100 text-slate px-2 py-0.5 rounded font-medium">Frontiers in Public Health</span>
              </div>

              <div className="relative">
                <svg viewBox="0 0 320 140" className="w-full h-auto drop-shadow-sm">
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.5" />
                      <stop offset="70%" stopColor="#ef4444" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 15 130 L 15 140 L 305 140 L 305 12 C 250 24, 200 64, 160 92 C 120 120, 70 128, 15 130 Z"
                    fill="url(#curveGradient)"
                    opacity="0.3"
                  />
                  <path
                    d="M 15 130 C 70 128, 120 120, 160 92 C 200 64, 250 24, 305 12"
                    fill="none"
                    stroke="url(#curveGradient)"
                    strokeWidth="3"
                  />

                  <circle cx="15" cy="130" r="4" fill="#10b981" />
                  <circle cx="70" cy="125" r="4" fill="#84cc16" />
                  <circle cx="120" cy="115" r="4" fill="#eab308" />
                  <circle cx="160" cy="92" r="6" fill="#f97316" className="animate-pulse" />
                  <circle cx="200" cy="64" r="4" fill="#ef4444" />
                  <circle cx="250" cy="36" r="4" fill="#b91c1c" />
                  <circle cx="305" cy="12" r="4" fill="#7f1d1d" />

                  <g transform="translate(160, 68)">
                    <path d="M 0 0 L -8 -10 L 8 -10 Z" fill="#0f172a" />
                    <rect x="-38" y="-30" width="76" height="20" rx="4" fill="#0f172a" />
                    <text x="0" y="-16" textAnchor="middle" fill="white" className="text-[10px] font-bold">
                      Your Exposure
                    </text>
                  </g>
                </svg>

                <div className="grid grid-cols-6 gap-1 mt-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-full h-1 bg-[#10b981] rounded-full mb-1"></div>
                    <span className="text-[10px] text-slate">Good</span>
                    <span className="text-[10px] font-bold text-ink">₹0</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-1 bg-[#84cc16] rounded-full mb-1"></div>
                    <span className="text-[10px] text-slate">Satisfact.</span>
                    <span className="text-[10px] font-bold text-ink">₹0.5k</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-1 bg-[#eab308] rounded-full mb-1"></div>
                    <span className="text-[10px] text-slate">Moderate</span>
                    <span className="text-[10px] font-bold text-ink">₹1.2k</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-1 bg-[#f97316] rounded-full mb-1"></div>
                    <span className="text-[10px] font-bold text-orange-600">Poor</span>
                    <span className="text-[10px] font-bold text-orange-600">₹6k</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-1 bg-[#ef4444] rounded-full mb-1"></div>
                    <span className="text-[10px] text-slate">V.Poor</span>
                    <span className="text-[10px] font-bold text-red-600">₹15k</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full h-1 bg-[#7f1d1d] rounded-full mb-1"></div>
                    <span className="text-[10px] text-slate">Severe</span>
                    <span className="text-[10px] font-bold text-rose-900">₹28k</span>
                  </div>
                </div>

                <div className="mt-4 bg-orange-50 rounded-xl p-3 flex items-start gap-2 border border-orange-200">
                  <span className="material-symbols-outlined text-orange-600 text-[16px] mt-0.5">warning</span>
                  <p className="text-xs text-orange-900">
                    <strong className="text-ink">Supralinear Acceleration:</strong> Healthcare expenditure does not rise proportionally. A jump from Poor to Severe AQI triggers an estimated 4.5× acceleration in inpatient admissions and outpatient consults.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Methodology & Actions): 5 cols */}
          <div className="lg:col-span-5 space-y-5">
            {/* Methodology Accordion */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <button
                className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">science</span>
                  <span className="text-sm font-bold text-ink">Methodology &amp; Evidence Base</span>
                </div>
                <span
                  className="material-symbols-outlined text-slate transition-transform"
                  style={{ transform: isMethodologyOpen ? 'rotate(180deg)' : 'none' }}
                >
                  expand_more
                </span>
              </button>

              {isMethodologyOpen && (
                <div className="p-5 pt-0 text-xs text-slate border-t border-slate-100 space-y-2.5">
                  <p className="leading-relaxed">
                    This model applies the peer-reviewed concentration-response curve from medical expenditure surveys across 122 cities (Frontiers in Public Health, 2021) combined with Indian baseline expenditure data:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                    <li>Mild (Satisfactory): +3.27% healthcare expenditure</li>
                    <li>Moderate: +7.21% healthcare expenditure</li>
                    <li>Severe (Poor / Very Poor): +8.62% to +18.4%</li>
                    <li>Serious / Extreme (&gt;400 AQI): +42.66% medical expenditure spike</li>
                  </ul>
                  <p className="text-[11px] text-slate italic pt-1">
                    Incorporates a 1.65× vulnerability scalar for children under 12, adults aged 60+, and individuals with pre-existing asthma or cardiovascular disease.
                  </p>
                </div>
              )}
            </div>

            {/* Next Steps Actions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-ink">Actionable Next Steps</h3>

              <Link
                href="/hospitals"
                className="w-full bg-primary text-white py-3.5 px-4 rounded-xl font-bold text-center shadow-md flex justify-center items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all text-xs md:text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                <span>Explore Nearby Hospital &amp; PHC Directory</span>
              </Link>

              <Link
                href="/cost/calculator"
                className="w-full bg-slate-100 hover:bg-slate-200 text-ink py-3 px-4 rounded-xl font-semibold text-center border border-slate-200 flex justify-center items-center gap-2 transition-colors text-xs md:text-sm"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Recalculate or Change Location</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
