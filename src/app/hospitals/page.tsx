'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { fetchNearbyHospitalsMultiStream } from '@/lib/api-client';
import { getCurrentPosition, DEFAULT_LOCATION } from '@/lib/geo';
import type { Hospital } from '@/lib/types';

const MapWrapper = dynamic(() => import('@/components/MapWrapper'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-surface-dim animate-pulse" />,
});
const HospitalMapMarkers = dynamic(() => import('@/components/HospitalMapMarkers'), {
  ssr: false,
});

type FilterKey = 'all' | 'hospital' | 'phc' | 'pharmacy' | 'community';

export default function HospitalsMapPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [center, setCenter] = useState<[number, number]>([DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng]);
  const [locationName, setLocationName] = useState('your location');
  const [effectiveRadius, setEffectiveRadius] = useState<number>(5);
  const [sources, setSources] = useState<string[]>([]);

  // Fetch hospitals using multi-stream pipeline
  const loadHospitals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let lat = DEFAULT_LOCATION.lat;
    let lng = DEFAULT_LOCATION.lng;
    let resolvedName = 'your location';

    // 1. First check manual location selected from city search
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
            // Geolocation fallback to default Delhi or last known
          }
        }
      }
    } catch {
      // ignore storage errors
    }

    setCenter([lat, lng]);
    setLocationName(resolvedName);

    try {
      const streamResult = await fetchNearbyHospitalsMultiStream(lat, lng, 5000);
      setHospitals(streamResult.hospitals);
      setEffectiveRadius(streamResult.effectiveRadiusKm || 5);
      setSources(streamResult.sourcesUsed || []);

      if (streamResult.hospitals.length > 0) {
        setSelectedHospital(streamResult.hospitals[0]);
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

  // Compute filter counts from real multi-stream data
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
  const filteredHospitals = activeFilter === 'all'
    ? hospitals
    : hospitals.filter((h) => {
        if (activeFilter === 'phc') return h.type === 'phc' || h.type === 'clinic';
        return h.type === activeFilter;
      });

  return (
    <div className="flex flex-col min-h-screen bg-surface font-[var(--font-inter)] relative">
      {/* Map Container */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 4rem)' }}>
        <MapWrapper center={center} zoom={14}>
          <HospitalMapMarkers center={center} onSelect={setSelectedHospital} hospitals={filteredHospitals} />
        </MapWrapper>

        {/* Floating Top UI */}
        <div className="absolute top-0 left-0 right-0 z-[10] pointer-events-none p-4 flex flex-col gap-3">
          {/* Filters Row */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide pointer-events-auto">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md transition-all ${
                  activeFilter === f.key 
                    ? 'bg-primary/90 text-on-primary shadow-lg border border-primary/20' 
                    : 'bg-surface/70 text-on-surface border border-outline-variant/50 hover:bg-surface/90'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sub-badge with multi-stream telemetry info */}
          <div className="self-start inline-flex items-center gap-2 bg-surface/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-outline-variant/30 shadow-md pointer-events-auto max-w-[95%]">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
                <span className="text-xs font-medium text-on-surface-variant">Scanning OpenStreetMap &amp; Health Streams...</span>
              </>
            ) : error ? (
              <>
                <span className="material-symbols-outlined text-red-500 text-[14px]">error</span>
                <span className="text-xs font-medium text-red-600">{error}</span>
                <button onClick={loadHospitals} className="text-xs font-bold text-primary ml-1">Retry</button>
              </>
            ) : (
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0"></span>
                <span className="text-xs font-medium text-on-surface-variant truncate">
                  <strong className="text-primary font-semibold">{filteredHospitals.length} verified facilities</strong> within {effectiveRadius.toFixed(0)} km of {locationName}
                </span>
                {sources.length > 0 && (
                  <span className="hidden sm:inline-block text-[10px] bg-slate/10 text-slate px-2 py-0.5 rounded-full font-medium shrink-0">
                    {sources.slice(0, 2).join(' + ')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected Facility Bottom Card */}
        {selectedHospital && (
          <div className="absolute bottom-20 left-4 right-4 z-[10] pointer-events-auto transition-transform duration-300">
            <div className="bg-surface rounded-[24px] p-5 shadow-xl border border-outline-variant/20 flex flex-col gap-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-title-lg font-bold text-on-surface mb-1">{selectedHospital.name}</h3>
                  <p className="text-body-sm text-on-surface-variant">
                    {selectedHospital.type ? selectedHospital.type.toUpperCase() : 'HOSPITAL'} • <span className="font-[var(--font-space-grotesk)] font-medium text-primary">{selectedHospital.distance}</span> away
                  </p>
                  {selectedHospital.address && (
                    <p className="text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">{selectedHospital.address}</p>
                  )}
                </div>
                <Link href={`/hospitals/${selectedHospital.id}`} className="shrink-0 w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-dim transition-colors">
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {selectedHospital.hasEmergency && (
                  <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[14px]">emergency</span>
                    24/7 Emergency
                  </span>
                )}
                {selectedHospital.specialties?.slice(0, 3).map((s: string) => (
                  <span key={s} className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
                    {s}
                  </span>
                ))}
                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  Verified Node
                </span>
              </div>

              <div className="flex gap-3 mt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-primary text-on-primary py-3 rounded-full text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">directions</span>
                  Get Directions
                </a>
                {selectedHospital.phone && (
                  <a
                    href={`tel:${selectedHospital.phone}`}
                    className="w-12 h-12 shrink-0 rounded-full border border-outline flex items-center justify-center text-primary hover:bg-surface-variant active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">call</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <Link href="/hospitals/add" className="absolute bottom-24 right-4 z-[10] pointer-events-auto bg-primary-container text-on-primary-container px-4 py-3 rounded-full shadow-lg border border-primary/20 flex items-center gap-2 hover:bg-primary-container/90 active:scale-95 transition-all">
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="text-label-lg font-bold pr-1">Add Clinic</span>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
