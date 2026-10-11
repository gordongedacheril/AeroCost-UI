'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { fetchNearbyHospitalsMultiStream } from '@/lib/api-client';
import { getCurrentPosition, DEFAULT_LOCATION } from '@/lib/geo';
import type { Hospital } from '@/lib/types';

const MapWrapper = dynamic(() => import('@/components/MapWrapper'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>,
});
const HospitalMapMarkers = dynamic(() => import('@/components/HospitalMapMarkers'), {
  ssr: false,
});

type FilterKey = 'all' | 'hospital' | 'phc' | 'pharmacy' | 'community';
type ViewMode = 'map' | 'list';

export default function HospitalsMapPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [center, setCenter] = useState<[number, number]>([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
  const [locationName, setLocationName] = useState('your location');
  const [effectiveRadius, setEffectiveRadius] = useState<number>(5);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch hospitals using multi-stream pipeline
  const loadHospitals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let lat = DEFAULT_LOCATION.lat;
    let lng = DEFAULT_LOCATION.lng;
    let resolvedName = 'your area';

    // 1. Check manual location selected from city search
    try {
      const manual = localStorage.getItem('aerocost_manual_location');
      if (manual) {
        const parsed = JSON.parse(manual);
        if (parsed.lat && parsed.lng) {
          lat = parsed.lat;
          lng = parsed.lng;
          resolvedName = parsed.name || 'Selected City';
        }
      } else {
        // 2. Check last cached location
        const stored = localStorage.getItem('aerocost_last_location');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.lat && parsed.lng) {
            lat = parsed.lat;
            lng = parsed.lng;
            resolvedName = parsed.displayName || parsed.city || 'your area';
          }
        } else {
          // 3. Try GPS geolocation
          try {
            const coords = await getCurrentPosition();
            lat = coords.lat;
            lng = coords.lng;
          } catch {
            // Geolocation fallback
          }
        }
      }
    } catch {
      // ignore
    }

    setCenter([lat, lng]);
    setLocationName(resolvedName);

    try {
      const streamResult = await fetchNearbyHospitalsMultiStream(lat, lng, 5000);
      setHospitals(streamResult.hospitals);
      setEffectiveRadius(streamResult.effectiveRadiusKm || 5);

      if (streamResult.hospitals.length > 0) {
        setSelectedHospital(streamResult.hospitals[0]);
        setSelectedIndex(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load hospitals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHospitals();
  }, [loadHospitals]);

  // Compute filter counts
  const counts = {
    all: hospitals.length,
    hospital: hospitals.filter((h) => h.type === 'hospital').length,
    phc: hospitals.filter((h) => h.type === 'phc' || h.type === 'clinic').length,
    pharmacy: hospitals.filter((h) => h.type === 'pharmacy').length,
    community: hospitals.filter((h) => h.type === 'community').length,
  };

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'hospital', label: `Hospitals (${counts.hospital})` },
    { key: 'phc', label: `PHC / Clinics (${counts.phc})` },
    { key: 'pharmacy', label: `Pharmacies (${counts.pharmacy})` },
    ...(counts.community > 0
      ? [{ key: 'community' as FilterKey, label: `Community (${counts.community})` }]
      : []),
  ];

  // Filter hospitals for display
  const filteredHospitals = useMemo(() => {
    let list = activeFilter === 'all'
      ? hospitals
      : hospitals.filter((h) => {
          if (activeFilter === 'phc') return h.type === 'phc' || h.type === 'clinic';
          return h.type === activeFilter;
        });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.address?.toLowerCase().includes(q) ||
          h.specialties?.some((s) => s.toLowerCase().includes(q))
      );
    }

    return list;
  }, [hospitals, activeFilter, searchQuery]);

  const handleSelectHospital = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    const idx = filteredHospitals.findIndex((h) => h.id === hospital.id);
    if (idx !== -1) setSelectedIndex(idx);
  };

  const handleNextHospital = () => {
    if (filteredHospitals.length === 0) return;
    const nextIdx = (selectedIndex + 1) % filteredHospitals.length;
    setSelectedIndex(nextIdx);
    setSelectedHospital(filteredHospitals[nextIdx]);
  };

  const handlePrevHospital = () => {
    if (filteredHospitals.length === 0) return;
    const prevIdx = (selectedIndex - 1 + filteredHospitals.length) % filteredHospitals.length;
    setSelectedIndex(prevIdx);
    setSelectedHospital(filteredHospitals[prevIdx]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-[var(--font-inter)] relative">
      {/* ── Top Header Bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-ink flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">local_hospital</span>
                Nearby Health Facilities
              </h1>
              <p className="text-xs text-slate truncate max-w-xs md:max-w-md">
                Showing verified emergency nodes around {locationName}
              </p>
            </div>

            {/* View Mode Toggle Button */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-slate hover:text-ink'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">map</span>
                Map
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-primary shadow-xs'
                    : 'text-slate hover:text-ink'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">list</span>
                List ({filteredHospitals.length})
              </button>
            </div>
          </div>

          {/* Sub-badge: Clean verified count without source names */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full text-xs text-emerald-800 font-medium">
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning local facilities...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    <strong>{filteredHospitals.length} verified facilities</strong> within {effectiveRadius.toFixed(0)} km of {locationName}
                  </span>
                </>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    activeFilter === f.key
                      ? 'bg-primary text-white shadow-xs font-semibold'
                      : 'bg-white text-slate border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── VIEW 1: MAP VIEW ── */}
      {viewMode === 'map' && (
        <div className="flex-1 relative w-full" style={{ height: 'calc(100vh - 128px)', minHeight: '500px' }}>
          {/* Leaflet Map with automatic resize and marker binding */}
          <MapWrapper center={center} zoom={13} className="h-full w-full">
            <HospitalMapMarkers
              center={center}
              onSelect={handleSelectHospital}
              hospitals={filteredHospitals}
            />
          </MapWrapper>

          {/* Map Floating Actions Top Left */}
          <div className="absolute top-4 left-4 z-[10] flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setViewMode('list')}
              className="bg-white/95 backdrop-blur-md text-ink text-xs font-bold px-3.5 py-2 rounded-full shadow-md border border-slate-200 flex items-center gap-1.5 hover:bg-white active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">format_list_bulleted</span>
              Browse All ({filteredHospitals.length})
            </button>
          </div>

          {/* Selected Facility Interactive Card Slider (Bottom of Map) */}
          {selectedHospital && (
            <div className="absolute bottom-20 left-3 right-3 md:left-6 md:right-auto md:w-[480px] z-[10] pointer-events-auto transition-transform duration-300">
              <div className="bg-white/98 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-2xl border border-slate-200/80 flex flex-col gap-3">
                {/* Header & Navigation */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {selectedHospital.type || 'HOSPITAL'}
                      </span>
                      <span className="text-xs font-bold text-slate">
                        {selectedHospital.distance} away
                      </span>
                      {filteredHospitals.length > 1 && (
                        <span className="text-[11px] text-slate/70 ml-auto font-[var(--font-space-grotesk)]">
                          {selectedIndex + 1} of {filteredHospitals.length}
                        </span>
                      )}
                    </div>
                    <h2 className="text-base md:text-lg font-bold text-ink leading-snug truncate">
                      {selectedHospital.name}
                    </h2>
                    {selectedHospital.address && (
                      <p className="text-xs text-slate mt-0.5 line-clamp-1">
                        {selectedHospital.address}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Carousel Prev / Next controls */}
                    {filteredHospitals.length > 1 && (
                      <div className="flex items-center gap-1 mr-1">
                        <button
                          onClick={handlePrevHospital}
                          aria-label="Previous hospital"
                          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate hover:bg-slate-200 active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                        </button>
                        <button
                          onClick={handleNextHospital}
                          aria-label="Next hospital"
                          className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate hover:bg-slate-200 active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                        </button>
                      </div>
                    )}
                    <Link
                      href={`/hospitals/${selectedHospital.id}`}
                      className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                      title="View details"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  {selectedHospital.hasEmergency && (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                      <span className="material-symbols-outlined text-[12px]">emergency</span>
                      24/7 Emergency
                    </span>
                  )}
                  {selectedHospital.specialties?.slice(0, 3).map((s: string) => (
                    <span key={s} className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                      {s}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    Verified Node
                  </span>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-primary text-white py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">directions</span>
                    Get Directions
                  </a>
                  {selectedHospital.phone && (
                    <a
                      href={`tel:${selectedHospital.phone}`}
                      className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-primary hover:bg-slate-200 active:scale-95 transition-all"
                      title={`Call ${selectedHospital.phone}`}
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add Clinic FAB */}
          <Link
            href="/hospitals/add"
            className="absolute bottom-24 right-4 z-[10] pointer-events-auto bg-primary text-white px-4 py-2.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all text-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Clinic
          </Link>
        </div>
      )}

      {/* ── VIEW 2: FULL RESPONSIVE LIST VIEW ── */}
      {viewMode === 'list' && (
        <div className="flex-1 max-w-6xl w-full mx-auto p-4 pb-28">
          {/* Search bar inside list */}
          <div className="relative mb-4">
            <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate">search</span>
            <input
              type="text"
              placeholder="Search by facility name, address, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-ink placeholder:text-slate focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate hover:text-ink text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Hospital Cards Grid */}
          {filteredHospitals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center my-6">
              <span className="material-symbols-outlined text-4xl text-slate mb-2">local_hospital</span>
              <h3 className="text-base font-bold text-ink">No facilities match your filter</h3>
              <p className="text-xs text-slate mt-1">Try switching filter tabs or clearing your search query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHospitals.map((hospital, index) => (
                <div
                  key={hospital.id}
                  className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Distance & Type */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {hospital.type || 'HOSPITAL'}
                      </span>
                      <span className="text-xs font-bold text-primary font-[var(--font-space-grotesk)]">
                        {hospital.distance} away
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-ink group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {hospital.name}
                    </h3>

                    {/* Address */}
                    {hospital.address && (
                      <p className="text-xs text-slate line-clamp-2 mb-3">
                        {hospital.address}
                      </p>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {hospital.hasEmergency && (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">emergency</span>
                          24/7 Emergency
                        </span>
                      )}
                      {hospital.specialties?.slice(0, 2).map((s: string) => (
                        <span key={s} className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[10px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-primary text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-all shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[15px]">directions</span>
                      Directions
                    </a>
                    {hospital.phone && (
                      <a
                        href={`tel:${hospital.phone}`}
                        className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-primary hover:bg-slate-200 transition-all shrink-0"
                        title={hospital.phone}
                      >
                        <span className="material-symbols-outlined text-[16px]">call</span>
                      </a>
                    )}
                    <Link
                      href={`/hospitals/${hospital.id}`}
                      className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate hover:text-ink hover:bg-slate-200 transition-all shrink-0"
                      title="View full facility sheet"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
