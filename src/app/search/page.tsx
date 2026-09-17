'use client';

import BottomNav from '@/components/BottomNav';
import { POPULAR_CITIES, getAqiBand } from '@/data/constants';
import { searchAqi } from '@/lib/api-client';
import { getCurrentPosition } from '@/lib/geo';
import type { AqiSearchResult } from '@/lib/types';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function Search() {
  const [query, setQuery] = useState('');
  const [liveResults, setLiveResults] = useState<AqiSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Debounced live search via WAQI
  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setLiveResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await searchAqi(q);
      setLiveResults(data.results);
    } catch {
      // Silently fall back to local filter
      setLiveResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setLiveResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => performSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, performSearch]);

  // Handle "Use current location"
  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const coords = await getCurrentPosition();
      // Store location for the home page to pick up
      localStorage.setItem(
        'aerocost_manual_location',
        JSON.stringify({ lat: coords.lat, lng: coords.lng })
      );
      router.push('/');
    } catch {
      // Fall back
    } finally {
      setIsLocating(false);
    }
  };

  // Handle city/station selection
  const handleSelectStation = (lat: number, lng: number) => {
    localStorage.setItem(
      'aerocost_manual_location',
      JSON.stringify({ lat, lng })
    );
    router.push('/');
  };

  // Show live search results if user is typing, else show popular cities
  const showLiveResults = query.trim().length > 0;

  // Local filter for popular cities (before user types — instant)
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
            placeholder="Search city or station name..." 
            className="w-full pl-11 pr-10 py-3.5 rounded-xl border-none ring-1 ring-slate/20 focus:ring-2 focus:ring-primary shadow-sm bg-white text-ink placeholder:text-slate font-[var(--font-inter)] outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-12 w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          )}
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-3.5 text-slate hover:text-ink w-6 h-6 flex items-center justify-center rounded-full bg-slate/10"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <button
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="w-full mt-4 bg-primary/10 text-primary py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 active:bg-primary/20 transition-colors disabled:opacity-50"
        >
          {isLocating ? (
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined">my_location</span>
          )}
          {isLocating ? 'Locating...' : 'Use current location'}
        </button>
      </div>

      <div className="px-4 py-2">
        <div className="bg-sky-paper border border-blue-100 rounded-xl p-3 flex gap-3 mb-6">
          <span className="material-symbols-outlined text-blue-600 mt-0.5 text-xl">info</span>
          <p className="text-xs text-blue-900/80 leading-relaxed pr-2">
            {showLiveResults
              ? 'Showing live WAQI monitoring stations. Tap any station to view its AQI.'
              : 'AeroCost relies on certified CPCB monitoring stations. Some smaller towns might show approximate interpolated data.'}
          </p>
        </div>

        {/* Live search results */}
        {showLiveResults && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">WAQI Stations</h2>
              <span className="text-xs font-medium text-slate bg-slate/10 px-2 py-1 rounded-md">
                {liveResults.length} found
              </span>
            </div>

            {liveResults.length > 0 ? (
              <div className="flex flex-col gap-3">
                {liveResults.map((result) => {
                  const aqiNum = typeof result.aqi === 'number' ? result.aqi : null;
                  const band = aqiNum !== null ? getAqiBand(aqiNum) : null;

                  return (
                    <button
                      key={result.uid}
                      onClick={() => handleSelectStation(result.station.lat, result.station.lng)}
                      className="bg-card-white rounded-xl p-4 shadow-card flex items-center justify-between active:scale-[0.99] transition-transform text-left"
                    >
                      <div className="flex flex-col gap-1 flex-1 min-w-0">
                        <span className="font-semibold text-ink text-base truncate">{result.name}</span>
                        <span className="text-xs text-slate">{result.time}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-2">
                        {aqiNum !== null && band ? (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                              {aqiNum > 200 && (
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: band.hex }} />
                              )}
                              <span className="font-[var(--font-space-grotesk)] font-bold text-lg" style={{ color: band.hex }}>
                                {aqiNum}
                              </span>
                            </div>
                            <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded" style={{ backgroundColor: `${band.hex}15`, color: band.hex }}>
                              {band.label}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate">--</span>
                        )}
                        <span className="material-symbols-outlined text-slate/50">chevron_right</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : !isSearching ? (
              <div className="py-12 flex flex-col items-center justify-center text-center px-6 border-2 border-dashed border-slate/20 rounded-2xl bg-white/50">
                <span className="material-symbols-outlined text-slate text-4xl mb-3">location_off</span>
                <h3 className="font-semibold text-ink mb-1">No monitoring station found</h3>
                <p className="text-sm text-slate">We couldn&apos;t find any WAQI stations matching &quot;{query}&quot;. Try searching for a nearby major city.</p>
              </div>
            ) : null}
          </>
        )}

        {/* Popular cities (shown when not searching) */}
        {!showLiveResults && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-ink">Popular &amp; Monitored Cities</h2>
              <span className="text-xs font-medium text-slate bg-slate/10 px-2 py-1 rounded-md">{filteredCities.length} Cities</span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredCities.map((city, idx) => {
                const band = getAqiBand(city.aqi);
                const isPoorOrWorse = city.aqi > 200;
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectStation(city.lat, city.lng)}
                    className="bg-card-white rounded-xl p-4 shadow-card flex items-center justify-between active:scale-[0.99] transition-transform text-left"
                  >
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
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
