'use client';

import BottomNav from '@/components/BottomNav';
import { POPULAR_CITIES, getAqiBand } from '@/data/constants';
import { useState } from 'react';

export default function Search() {
  const [query, setQuery] = useState('');

  const filteredCities = POPULAR_CITIES.filter(
    (city) => 
      city.name.toLowerCase().includes(query.toLowerCase()) || 
      city.state.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-mist pb-28">
      <div className="sticky top-0 z-40 bg-mist/90 backdrop-blur-xl px-4 py-4 pt-6">
        <h1 className="text-2xl font-bold text-ink mb-4">Find Location</h1>
        
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-slate">search</span>
          <input 
            type="text" 
            placeholder="Search city or zip code..." 
            className="w-full pl-11 pr-10 py-3.5 rounded-xl border-none ring-1 ring-slate/20 focus:ring-2 focus:ring-primary shadow-sm bg-white text-ink placeholder:text-slate font-[var(--font-inter)] outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-3.5 text-slate hover:text-ink w-6 h-6 flex items-center justify-center rounded-full bg-slate/10"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <button className="w-full mt-4 bg-primary/10 text-primary py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 active:bg-primary/20 transition-colors">
          <span className="material-symbols-outlined">my_location</span>
          Use current location
        </button>
      </div>

      <div className="px-4 py-2">
        <div className="bg-sky-paper border border-blue-100 rounded-xl p-3 flex gap-3 mb-6">
          <span className="material-symbols-outlined text-blue-600 mt-0.5 text-xl">info</span>
          <p className="text-xs text-blue-900/80 leading-relaxed pr-2">
            AeroCost relies on certified CPCB monitoring stations. Some smaller towns might show approximate interpolated data.
          </p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink">Popular & Monitored Cities</h2>
          <span className="text-xs font-medium text-slate bg-slate/10 px-2 py-1 rounded-md">{filteredCities.length} Telemetry Nodes</span>
        </div>

        {filteredCities.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredCities.map((city, idx) => {
              const band = getAqiBand(city.aqi);
              const isPoorOrWorse = city.aqi > 200;
              
              return (
                <button key={idx} className="bg-card-white rounded-xl p-4 shadow-card flex items-center justify-between active:scale-[0.99] transition-transform text-left">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-ink text-base">{city.name}</span>
                    <span className="text-xs text-slate">{city.state}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5">
                        {isPoorOrWorse && (
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: band.hex }}></span>
                        )}
                        <span className="font-[var(--font-space-grotesk)] font-bold text-lg" style={{ color: band.hex }}>
                          {city.aqi}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: `${band.hex}15`, color: band.hex }}>
                        {band.label}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-slate/50">chevron_right</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center px-6 border-2 border-dashed border-slate/20 rounded-2xl bg-white/50">
            <span className="material-symbols-outlined text-slate text-4xl mb-3">location_off</span>
            <h3 className="font-semibold text-ink mb-1">No monitoring station found</h3>
            <p className="text-sm text-slate">We couldn't find any CPCB stations matching "{query}". Try searching for a nearby major city.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
