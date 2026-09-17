'use client';

import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import AqiRing from '@/components/AqiRing';
import { getAqiBand } from '@/data/constants';
import { useLocationAqi } from '@/hooks/useLocationAqi';

export default function HomePage() {
  const {
    location,
    aqi,
    dominantPollutant,
    dominantPollutantValue,
    dominantPollutantUnit,
    station,
    minutesAgo,
    pollutants,
    forecast,
    isLoading,
    error,
    refetch,
  } = useLocationAqi();

  const currentAqi = aqi ?? 0;
  const band = getAqiBand(currentAqi);

  // Loading skeleton
  if (isLoading && !aqi) {
    return (
      <>
        <main className="flex flex-col relative w-full pb-28 bg-sky-paper min-h-screen pt-safe pt-[8px]">
          <div className="flex flex-col w-full px-[20px] pb-[32px] max-w-md md:max-w-2xl mx-auto">
            <div className="flex items-center justify-between py-[8px]">
              <div className="flex flex-col gap-2">
                <div className="h-7 w-48 bg-slate/10 rounded-lg animate-pulse" />
                <div className="h-4 w-32 bg-slate/10 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="my-[24px] flex flex-col items-center justify-center">
              <div className="w-44 h-44 rounded-full bg-slate/10 animate-pulse" />
            </div>
            <div className="h-24 bg-slate/10 rounded-xl animate-pulse mb-4" />
            <div className="h-48 bg-slate/10 rounded-xl animate-pulse mb-4" />
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <main className="flex flex-col relative w-full pb-28 bg-sky-paper min-h-screen pt-safe pt-[8px]">
        <div className="flex flex-col w-full px-[20px] pb-[32px] max-w-md md:max-w-2xl mx-auto">

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
              <p className="text-[13px] text-red-700 flex-1">{error}</p>
              <button onClick={refetch} className="text-red-600 font-medium text-[13px] px-2">Retry</button>
            </div>
          )}

          {/* Location Selector & Telemetry Station Header */}
          <div className="flex items-center justify-between py-[8px]">
            <div className="flex flex-col">
              <Link href="/search" className="group flex items-center gap-1.5 text-left active:opacity-75 transition-opacity">
                <span className="font-[var(--font-space-grotesk)] text-[20px] leading-[28px] font-semibold text-primary tracking-tight flex items-center gap-1">
                  {location?.displayName || 'Loading...'}
                  <span className="material-symbols-outlined text-[18px] text-slate group-hover:text-primary transition-colors">expand_more</span>
                </span>
              </Link>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[12px] leading-[16px] font-[var(--font-inter)] text-slate">
                  <span className={`w-1.5 h-1.5 rounded-full bg-${band.color} animate-pulse`} />
                  Live station: {station?.name || 'CPCB'}
                </span>
                <span className="text-mist text-[12px]">•</span>
                <span className="text-[12px] leading-[16px] font-[var(--font-inter)] text-secondary">
                  {minutesAgo !== null ? (minutesAgo === 0 ? 'Just now' : `Updated ${minutesAgo}m ago`) : ''}
                </span>
              </div>
            </div>
            <button
              onClick={refetch}
              aria-label="Refresh live telemetry"
              className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-primary active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </button>
          </div>

          {/* AQI Ring */}
          <div className="my-[24px] flex flex-col items-center justify-center relative">
            <AqiRing aqi={currentAqi} />
            {/* Dominant pollutant */}
            <div className="mt-2 px-2.5 py-0.5 rounded-full bg-sky-paper/90 border border-slate/10">
              <span className="text-[12px] leading-[16px] font-[var(--font-inter)] text-slate font-medium">
                Dominant: <span className="text-ink font-semibold">
                  {dominantPollutant || 'PM2.5'} ({dominantPollutantValue ?? '--'} {dominantPollutantUnit || 'µg/m³'})
                </span>
              </span>
            </div>

            {/* Telemetry Badges */}
            <div className="flex items-center gap-[8px] mt-3">
              {[
                { icon: 'thermostat', value: '28°C', iconColor: 'text-aqi-poor' },
                { icon: 'water_drop', value: '62% RH', iconColor: 'text-primary' },
                { icon: 'air', value: '4.8 km/h NW', iconColor: 'text-slate' },
              ].map((badge) => (
                <span key={badge.icon} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-sm border border-slate/10 text-[11px] leading-[14px] font-medium font-[var(--font-inter)] text-slate transition-all hover:shadow">
                  <span className={`material-symbols-outlined text-[16px] ${badge.iconColor}`}>{badge.icon}</span>
                  <span className="font-medium text-ink">{badge.value}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Health Impact Card */}
          <div className={`rounded-xl bg-${band.color}/10 p-[16px] mb-[16px] shadow-sm`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full bg-${band.color} flex-shrink-0 flex items-center justify-center text-white mt-0.5`}>
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] leading-[20px] font-semibold font-[var(--font-inter)] text-primary">Advisory for Current Zone</span>
                <p className="text-[14px] leading-[22px] font-[var(--font-inter)] text-on-surface-variant mt-1 leading-relaxed">
                  {band.healthImpact} {currentAqi > 200 ? 'Sensitive groups should wear N95 masks and avoid morning exertion.' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* 24-Hour Forecast */}
          <div className="bg-card-white rounded-xl p-[16px] shadow-sm mb-[16px] border border-slate/10">
            <div className="flex items-center justify-between mb-[12px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">schedule</span>
                <span className="text-[16px] leading-[24px] font-semibold font-[var(--font-inter)] text-primary">AQI Trend &amp; Forecast</span>
              </div>
              <span className="text-[12px] leading-[16px] font-medium font-[var(--font-inter)] text-slate px-2 py-0.5 rounded bg-sky-paper border border-slate/10">WAQI Live</span>
            </div>

            {/* Reference legend */}
            <div className="flex items-center justify-between text-[12px] leading-[16px] font-[var(--font-inter)] text-slate pb-2 border-b border-mist/80 mb-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-slate/40 inline-block" /> CPCB Poor Threshold (200)
              </span>
              <span className="text-secondary font-medium">Live Telemetry</span>
            </div>

            {/* Hourly/daily bars */}
            <div className="relative pt-2 pb-1">
              <div className="absolute left-0 right-0 top-[46px] border-b border-dashed border-slate/25 pointer-events-none z-0" />
              <div className={`grid gap-2 relative z-10`} style={{ gridTemplateColumns: `repeat(${Math.min(forecast.length || 7, 7)}, 1fr)` }}>
                {(forecast.length > 0 ? forecast : [{ time: '--', aqi: 0 }]).slice(0, 7).map((item) => {
                  const b = getAqiBand(item.aqi);
                  const height = `${Math.min((item.aqi / 400) * 100, 100)}%`;
                  return (
                    <div key={item.time} className={`flex flex-col items-center ${item.isNow ? 'relative' : 'group'}`}>
                      {item.isNow && (
                        <div className="absolute -top-3 px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold shadow-sm ring-2 ring-white flex items-center gap-0.5 z-20">
                          <span className="w-1 h-1 rounded-full bg-aqi-poor animate-ping" />
                          <span>Live</span>
                        </div>
                      )}
                      <span className={`text-[12px] leading-[16px] font-medium font-[var(--font-inter)] ${item.isNow ? 'text-primary font-bold mt-1' : 'text-secondary'} mb-1.5`}>
                        {item.aqi || '--'}
                      </span>
                      <div className={`w-full h-20 rounded-lg flex items-end p-1 ${
                        item.isNow
                          ? 'bg-primary/5 shadow-inner border-2 border-primary/30 ring-2 ring-primary/10'
                          : 'bg-sky-paper border border-mist'
                      }`}>
                        <div
                          className="w-full rounded transition-all duration-300"
                          style={{ height, backgroundColor: b.hex }}
                        />
                      </div>
                      <span className={`text-[11px] leading-[14px] font-[var(--font-inter)] mt-2 ${item.isNow ? 'text-primary font-bold' : 'text-slate'}`}>
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Key Pollutants Grid */}
          {pollutants.length > 0 && (
            <div className="mb-[16px]">
              <div className="flex items-center justify-between mb-[8px]">
                <span className="text-[16px] leading-[24px] font-semibold font-[var(--font-inter)] text-primary">Key Pollutants</span>
                <span className="text-[12px] leading-[16px] font-[var(--font-inter)] text-slate">Standard µg/m³</span>
              </div>
              <div className="grid grid-cols-2 gap-[8px]">
                {pollutants.slice(0, 4).map((p) => (
                  <div key={p.name} className="bg-card-white rounded-xl p-[12px] shadow-sm flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[12px] leading-[16px] font-[var(--font-inter)] text-slate font-medium">{p.name}{p.unit === 'mg/m³' ? ' (mg/m³)' : ''}</span>
                      <span className="font-[var(--font-space-grotesk)] text-[20px] leading-[28px] font-semibold text-primary mt-0.5">{p.value}</span>
                      <span className={`text-[11px] leading-[14px] font-[var(--font-inter)] text-${p.statusColor}`}>{p.status}</span>
                    </div>
                    <div className={`w-3 h-3 rounded-full bg-${p.statusColor}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feature Action Cards */}
          <div className="flex flex-col gap-[12px] mb-[16px]">
            <Link
              href="/cost"
              className="bg-card-white rounded-xl p-[16px] shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-white flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">cardiology</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[16px] leading-[24px] font-semibold font-[var(--font-inter)] text-primary truncate">Healthcare Cost Impact</span>
                    <span className="px-1.5 py-0.5 rounded bg-mist text-slate text-[12px] leading-[16px] font-[var(--font-inter)] font-medium">Lancet GBD</span>
                  </div>
                  <p className="text-[14px] leading-[22px] font-[var(--font-inter)] text-secondary mt-0.5 line-clamp-2">
                    Estimated annual outpatient &amp; medication load backed by Lancet GBD data
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-slate group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2">chevron_right</span>
            </Link>

            <Link
              href="/hospitals"
              className="bg-card-white rounded-xl p-[16px] shadow-sm hover:shadow-md active:scale-[0.99] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-white flex-shrink-0">
                  <span className="material-symbols-outlined text-[24px]">local_hospital</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[16px] leading-[24px] font-semibold font-[var(--font-inter)] text-primary truncate">Nearby Health Facilities</span>
                  <p className="text-[14px] leading-[22px] font-[var(--font-inter)] text-secondary mt-0.5 line-clamp-2">
                    Find hospitals, clinics &amp; PHCs from OpenStreetMap
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[20px] text-slate group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2">chevron_right</span>
            </Link>
          </div>

          {/* Indoor Air Tip */}
          <div className="bg-card-white rounded-xl p-[12px] shadow-sm flex items-center gap-3 mb-[8px]">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-primary-container flex-shrink-0">
              <span className="material-symbols-outlined text-[20px]">filter_vintage</span>
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[13px] leading-[18px] font-semibold font-[var(--font-inter)] text-primary">Indoor Air Tip</span>
              <span className="text-[12px] leading-[16px] font-[var(--font-inter)] text-secondary truncate">Seal windward windows during peak vehicular traffic (8–11 AM).</span>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
