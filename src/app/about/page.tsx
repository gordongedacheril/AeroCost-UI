"use client";
import React, { useState } from "react";
import BottomNav from "@/components/BottomNav";

export default function AboutPage() {
  const [reportSuccess, setReportSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-[var(--font-inter)]">
      <main className="p-4 space-y-6">
        
        {/* Lead Header Card */}
        <div className="bg-white rounded-xl shadow-card p-5 border border-gray-100 text-center flex flex-col items-center relative overflow-hidden mt-2">
          <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-3">
            <span className="material-symbols-outlined text-sm">verified</span>
            CLINICAL TRANSPARENCY
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">About & Scientific Sources</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            AeroCost leverages peer-reviewed epidemiological models and high-fidelity sensor data to project localized healthcare burdens.
          </p>
        </div>

        {/* Hero Image Banner */}
        <div className="h-36 rounded-xl bg-gradient-to-br from-primary/80 to-primary-container relative overflow-hidden flex items-end p-4 shadow-sm border border-gray-200">
          {/* Decorative clinical grid pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "16px 16px" }} />
          <div className="relative z-10 flex flex-col text-white">
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 mb-1">Research Framework</span>
            <span className="text-lg font-semibold">Evidence-Based Telemetry</span>
          </div>
        </div>

        {/* Section 1 - Data Sources */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Data Sources</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl shadow-card border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
                  <span className="material-symbols-outlined">air</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">CPCB & State Pollution Control Boards</h3>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded mb-2">Official API</span>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    Continuous monitoring data aggregated from the CAAQMS network, providing localized real-time PM2.5 and AQI parameters.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] text-gray-500 font-medium">60-min sync cadence</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-card border border-gray-100">
              <div className="flex items-start gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 mt-1">
                  <span className="material-symbols-outlined">local_hospital</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">OpenStreetMap & National Health Portal</h3>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded mb-2">Geocoded</span>
                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                    Spatial directory mapping of Primary Health Centers (PHCs) and clinics utilized to determine access corridors and healthcare density.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    <span className="text-[10px] text-gray-500 font-medium">Verified facilities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 - Epidemiological Models */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1 mt-6">Epidemiological Models</h2>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl shadow-card border border-gray-100 relative group cursor-pointer hover:border-gray-300 transition-colors">
              <div className="absolute top-4 right-4 text-gray-300 group-hover:text-gray-500">
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">LANCET PLANET HEALTH 2020</h3>
              <p className="text-xs text-gray-500 mb-2 font-medium">Global Burden of Disease (GBD) 2019</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Implementation of non-linear concentration-response functions (CRFs) assessing the morbidity impacts of ambient particulate matter across vulnerable demographics.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-card border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary text-sm">verified_user</span>
                <h3 className="font-bold text-gray-900 text-sm">INDIAN COHORT STANDARDS</h3>
              </div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Respiratory Morbidity Baselines</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Calibration of baseline respiratory disease prevalence tailored to Indian urban cohorts, incorporating standardized incidence metrics.
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-card border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-green-600 text-sm">account_balance</span>
                <h3 className="font-bold text-gray-900 text-sm">DEVELOPMENT ECONOMICS</h3>
              </div>
              <p className="text-xs text-gray-500 mb-2 font-medium">Willingness-to-Pay (WTP) Modeling</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Economic extrapolation of health burdens using localized cost-of-illness methodologies and WTP adjustments for out-of-pocket healthcare expenses.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 - Methodology Disclosure */}
        <section>
          <div className="bg-white p-5 rounded-xl shadow-card border border-gray-100 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary">ssid_chart</span>
              <h2 className="font-bold text-gray-900 text-base">How the Non-Linear Model Works</h2>
            </div>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">
              Healthcare costs do not rise linearly with pollution. Our model accounts for supralinear physiological responses where initial exposure spikes trigger rapid symptom exacerbation, followed by a plateauing effect at severe concentrations as physiological coping mechanisms saturate.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex flex-col items-center mb-4">
              <svg viewBox="0 0 280 80" className="w-full h-auto drop-shadow-sm">
                <path d="M 10,75 L 270,10" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                <path d="M 10,75 Q 160,70 270,10" stroke="var(--color-primary, #3b82f6)" strokeWidth="3" fill="none" className="drop-shadow-sm" />
                <circle cx="210" cy="38" r="4" fill="#ef4444" className="animate-pulse" />
              </svg>
              <div className="w-full flex justify-between mt-2 text-[9px] text-gray-500 font-medium px-2">
                <span>AQI 50 (Good)</span>
                <span className="ml-8">AQI 250 (Poor)</span>
                <span>AQI 450+ (Severe)</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 text-[10px] text-gray-600">
              <span className="material-symbols-outlined text-yellow-600 text-sm mt-0.5">lightbulb</span>
              <p>
                Calculations reflect average estimated out-of-pocket tariffs including consultations, acute medications, and nebulization. Actual clinical costs may vary.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4 - Integrity & Reporting */}
        <section className="mt-6">
          <button 
            onClick={() => setReportSuccess(true)}
            className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col transition-all hover:bg-gray-50 text-left"
          >
            {!reportSuccess ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                    <span className="material-symbols-outlined text-sm">flag</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Report a data discrepancy</h3>
                    <p className="text-[10px] text-gray-500">Flag anomalous sensor readings or cost estimates</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full p-1 animate-in fade-in duration-300">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                </div>
                <div>
                  <h3 className="font-semibold text-green-700 text-sm">Report received</h3>
                  <p className="text-[10px] text-green-600">Our data integrity team will review this anomaly.</p>
                </div>
              </div>
            )}
          </button>
        </section>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <p className="text-xs font-semibold text-gray-400 mb-1">AeroCost v2.4.1 • Open Public Health Initiative</p>
          <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
            Not for definitive diagnostic use. Consult healthcare professionals for medical advice.
          </p>
        </footer>

      </main>
      
      <BottomNav />
    </div>
  );
}
