"use client";

import React, { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import Link from 'next/link';

export default function CostResultPage() {
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-[var(--font-inter)]">
      <div className="max-w-md mx-auto p-4 space-y-6">
        <header className="pt-4 flex flex-col items-center text-center">
          <div className="relative w-12 h-12 mb-3">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path className="text-surface-variant/30" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-error" strokeDasharray="50, 100" strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px] text-error">medical_services</span>
            </div>
          </div>
          <h1 className="text-2xl font-[var(--font-space-grotesk)] font-bold">Estimated Health Impact</h1>
        </header>

        <div className="bg-surface p-6 rounded-3xl border border-outline/10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-error to-error-container"></div>
          
          <div className="text-center mb-6">
            <div className="text-sm text-muted-foreground mb-1">Incremental Annual Cost</div>
            <div className="text-4xl font-[var(--font-space-grotesk)] font-bold text-foreground mb-2">₹4,800 <span className="text-2xl text-muted-foreground font-normal">–</span> ₹7,400</div>
            <div className="text-xs bg-error/10 text-error inline-block px-2 py-1 rounded-full">
              Due to persistent PM2.5 exposure
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-outline/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-variant/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                </div>
                <span className="text-sm font-medium">Outpatient visits</span>
              </div>
              <span className="font-[var(--font-space-grotesk)] font-bold">~₹2,200</span>
            </div>
            
            <div className="flex justify-between items-center pb-3 border-b border-outline/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-variant/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">inhaler</span>
                </div>
                <span className="text-sm font-medium">Nebulizer & Inhalers</span>
              </div>
              <span className="font-[var(--font-space-grotesk)] font-bold">~₹3,100</span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-surface-variant/50 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">masks</span>
                </div>
                <span className="text-sm font-medium">N95 Masks & Meds</span>
              </div>
              <span className="font-[var(--font-space-grotesk)] font-bold">~₹1,500</span>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline/10">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">show_chart</span>
              Exponential Risk Curve
            </h2>
          </div>
          
          <div className="p-4 relative">
            <svg viewBox="0 0 320 140" className="w-full h-auto drop-shadow-md">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                  <stop offset="30%" stopColor="#f59e0b" stopOpacity="0.5"/>
                  <stop offset="70%" stopColor="#ef4444" stopOpacity="0.7"/>
                  <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.9"/>
                </linearGradient>
              </defs>
              <path d="M 15 130 L 15 140 L 305 140 L 305 12 C 250 24, 200 64, 160 92 C 120 120, 70 128, 15 130 Z" fill="url(#curveGradient)" opacity="0.3" />
              <path d="M 15 130 C 70 128, 120 120, 160 92 C 200 64, 250 24, 305 12" fill="none" stroke="url(#curveGradient)" strokeWidth="3" />
              
              <circle cx="15" cy="130" r="4" fill="#10b981" />
              <circle cx="70" cy="125" r="4" fill="#84cc16" />
              <circle cx="120" cy="115" r="4" fill="#eab308" />
              <circle cx="160" cy="92" r="6" fill="#f97316" className="animate-pulse" />
              <circle cx="200" cy="64" r="4" fill="#ef4444" />
              <circle cx="250" cy="36" r="4" fill="#b91c1c" />
              <circle cx="305" cy="12" r="4" fill="#7f1d1d" />

              <g transform="translate(160, 68)">
                <path d="M 0 0 L -8 -10 L 8 -10 Z" fill="#1e293b" className="dark:fill-white" />
                <rect x="-35" y="-30" width="70" height="20" rx="4" fill="#1e293b" className="dark:fill-white" />
                <text x="0" y="-16" textAnchor="middle" fill="white" className="dark:fill-black text-[10px] font-bold">You are here</text>
              </g>
            </svg>
            
            <div className="grid grid-cols-6 gap-1 mt-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-full h-1 bg-[#10b981] rounded-full mb-1"></div>
                <span className="text-[9px] text-muted-foreground">Good</span>
                <span className="text-[9px] font-bold">₹0</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full h-1 bg-[#84cc16] rounded-full mb-1"></div>
                <span className="text-[9px] text-muted-foreground">Satisfact.</span>
                <span className="text-[9px] font-bold">₹0.5k</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full h-1 bg-[#eab308] rounded-full mb-1"></div>
                <span className="text-[9px] text-muted-foreground">Mod</span>
                <span className="text-[9px] font-bold">₹1.2k</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full h-1 bg-[#f97316] rounded-full mb-1"></div>
                <span className="text-[9px] font-bold text-foreground">Poor</span>
                <span className="text-[9px] font-bold text-error">₹6k</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full h-1 bg-[#ef4444] rounded-full mb-1"></div>
                <span className="text-[9px] text-muted-foreground">V.Poor</span>
                <span className="text-[9px] font-bold">₹15k</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-full h-1 bg-[#7f1d1d] rounded-full mb-1"></div>
                <span className="text-[9px] text-muted-foreground">Severe</span>
                <span className="text-[9px] font-bold">₹28k</span>
              </div>
            </div>

            <div className="mt-4 bg-error/5 rounded-lg p-3 flex items-start gap-2 border border-error/10">
              <span className="material-symbols-outlined text-error text-[16px] mt-0.5">warning</span>
              <p className="text-[11px] text-muted-foreground">
                <strong className="text-foreground">Exponential Acceleration:</strong> Costs do not rise linearly. Moving from Poor to Severe increases health expenditure by ~4.5x.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-outline/10 shadow-sm overflow-hidden">
          <button 
            className="w-full p-4 flex items-center justify-between text-left"
            onClick={() => setIsMethodologyOpen(!isMethodologyOpen)}
          >
            <span className="text-sm font-medium">How we calculated this</span>
            <span className="material-symbols-outlined transition-transform" style={{ transform: isMethodologyOpen ? 'rotate(180deg)' : 'none' }}>expand_more</span>
          </button>
          
          {isMethodologyOpen && (
            <div className="p-4 pt-0 text-xs text-muted-foreground border-t border-outline/10 mt-2 pt-3">
              <p className="mb-2">The model estimates direct OOP (out-of-pocket) healthcare expenses based on:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Baseline AQI-health morbidity curves from major epidemiological studies.</li>
                <li>Adjustment factor for days exceeding WHO safe limits (15 µg/m³ 24h avg).</li>
                <li>Multiplier for vulnerable groups (children, elderly, pre-existing conditions).</li>
              </ul>
              <p className="mt-2 text-[10px] italic">Note: Excludes indirect costs like lost wages or long-term chronic disease management.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link href="/hospitals" className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-semibold text-center shadow-md flex justify-center items-center gap-2">
            Explore Hospital & PHC Directory
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
          <Link href="/cost/calculator" className="w-full bg-surface-variant/50 text-foreground py-3.5 rounded-xl font-semibold text-center border border-outline/10">
            Recalculate or Change Location
          </Link>
        </div>
      </div>
      
      <BottomNav />
    </div>
  );
}
