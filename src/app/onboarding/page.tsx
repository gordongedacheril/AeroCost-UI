'use client';

import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

export default function OnboardingPage() {
  const handleAllowLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { /* success – redirect to home */ },
        () => { /* error – stay on page */ },
        { timeout: 8000 }
      );
    }
  };

  return (
    <>
      <main className="flex flex-col relative w-full bg-sky-paper flex-1 min-h-screen">
        <div className="flex flex-col w-full px-[20px] pb-[32px] space-y-[24px] pb-24">

          {/* Visual Hero — Radar Coordinate Badge */}
          <div className="flex flex-col items-center justify-center pt-[24px]">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-mist/60 scale-95 animate-pulse" />
              <svg className="w-full h-full transform -rotate-45" fill="none" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="62" stroke="#E7EAEC" strokeLinecap="round" strokeWidth="8" />
                <circle cx="80" cy="80" r="62" stroke="#3A8564" strokeDasharray="389.5" strokeDashoffset="290" strokeLinecap="round" strokeWidth="8" />
                <circle cx="134" cy="50" fill="#3A8564" r="6" />
                <line stroke="#2D6A4F" strokeLinecap="round" strokeWidth="8" x1="80" x2="80" y1="36" y2="124" />
                <line stroke="#2D6A4F" strokeLinecap="round" strokeWidth="8" x1="36" x2="124" y1="80" y2="80" />
                <circle cx="80" cy="80" fill="#16324A" r="10" />
              </svg>
            </div>
          </div>

          {/* Header & Narrative */}
          <div className="flex flex-col text-center space-y-[8px] px-[4px]">
            <div className="inline-flex items-center justify-center space-x-1.5 self-center px-[12px] py-1 bg-mist/70 rounded-full mb-1">
              <span className="material-symbols-outlined text-aqi-good text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>my_location</span>
              <span className="text-[11px] leading-[14px] font-medium font-[var(--font-inter)] text-slate uppercase tracking-wider">Clinical Geolocation</span>
            </div>
            <h1 className="font-[var(--font-space-grotesk)] text-[24px] leading-[32px] font-medium text-ink">
              AeroCost needs your location
            </h1>
            <p className="text-[15px] leading-[24px] font-[var(--font-inter)] text-slate max-w-sm mx-auto">
              We use your precise position to calculate real-time local air quality (AQI), predict personal health risks, and map verified neighborhood health centers.
            </p>
          </div>

          {/* Value Propositions */}
          <div className="bg-card-white rounded-xl p-[16px] shadow-sm space-y-[16px]">
            {[
              { icon: 'air', title: 'Hyper-local CPCB Telemetry', desc: 'Real-time data stream synced from nearest Central Pollution Control Board stations.', bg: 'bg-surface-container' },
              { icon: 'calculate', title: 'Annual Healthcare Cost Modeling', desc: 'Peer-reviewed health risk curves translated into projected personal medical expenses.', bg: 'bg-secondary-container/60' },
              { icon: 'local_hospital', title: 'Verified PHCs & Hospital Index', desc: 'Direct routing to government Primary Health Centers and pulmonary care clinics.', bg: 'bg-tertiary-fixed/40' },
            ].map((item) => (
              <div key={item.icon} className="flex items-start space-x-[12px]">
                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center text-primary-container shrink-0`}>
                  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <div className="flex flex-col min-w-0 pt-0.5">
                  <span className="text-[16px] leading-[24px] font-semibold font-[var(--font-inter)] text-ink truncate">{item.title}</span>
                  <span className="text-[14px] leading-[22px] font-[var(--font-inter)] text-slate line-clamp-2">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Banner */}
          <div className="rounded-xl bg-mist/50 p-[12px] flex items-center space-x-[8px] text-slate">
            <span className="material-symbols-outlined text-lg shrink-0 text-slate">verified_user</span>
            <p className="text-[12px] leading-[16px] font-[var(--font-inter)] text-slate">
              Your coordinates remain on-device and are strictly processed for epidemiological telemetry lookup.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-[12px] pt-[4px]">
            <button
              onClick={handleAllowLocation}
              className="w-full h-12 bg-primary-container text-card-white text-[15px] leading-[20px] font-medium font-[var(--font-inter)] rounded-lg flex items-center justify-center space-x-2 shadow-sm active:scale-[0.99] transition-transform"
            >
              <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>near_me</span>
              <span>Allow Location Access</span>
            </button>
            <Link
              href="/search"
              className="w-full py-2.5 text-center text-[15px] leading-[20px] font-medium font-[var(--font-inter)] text-primary-container active:opacity-75 transition-opacity"
            >
              Enter city manually instead
            </Link>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
