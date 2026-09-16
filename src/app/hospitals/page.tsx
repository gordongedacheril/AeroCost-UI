'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import BottomNav from '@/components/BottomNav';
import { MOCK_HOSPITALS, Hospital } from '@/data/constants';

const MapWrapper = dynamic(() => import('@/components/MapWrapper'), { ssr: false, loading: () => <div className="h-full w-full bg-surface-dim animate-pulse" /> });

const FILTERS = ['All (14)', 'Hospitals (6)', 'PHC / Clinics (5)', 'Pharmacies (3)', 'Community-added (2)'];

// Create custom icons using DivIcon for styling flexibility
const createIcon = (type: string) => {
  let bgClass = 'bg-primary';
  let borderClass = 'border-white';
  
  if (type === 'PHC') {
    bgClass = 'bg-primary border-teal-400 border-2';
  } else if (type === 'Community') {
    bgClass = 'bg-surface border-primary border-dashed border-2';
  }

  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div class="w-4 h-4 rounded-full ${bgClass} ${borderClass} shadow-md"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const userIcon = L.divIcon({
  className: 'user-location-icon',
  html: `<div class="relative flex items-center justify-center w-6 h-6">
          <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-75"></div>
          <div class="relative w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function HospitalsMapPage() {
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(MOCK_HOSPITALS[0] || null);

  const center: [number, number] = [28.6469, 77.3164];

  return (
    <div className="flex flex-col min-h-screen bg-surface font-[var(--font-inter)] relative">
      {/* Map Container */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 4rem)' }}>
        <MapWrapper center={center} zoom={14}>
          {/* User Location */}
          <Marker position={center} icon={userIcon} />
          
          {/* Hospital Markers */}
          {MOCK_HOSPITALS.map((hospital, index) => (
            <Marker 
              key={hospital.id} 
              position={[hospital.lat, hospital.lng]} 
              icon={createIcon(hospital.type || 'Hospital')}
              eventHandlers={{
                click: () => setSelectedHospital(hospital),
              }}
            />
          ))}
        </MapWrapper>

        {/* Floating Top UI */}
        <div className="absolute top-0 left-0 right-0 z-[10] pointer-events-none p-4 flex flex-col gap-3">
          {/* Filters Row */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide pointer-events-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md transition-all ${
                  activeFilter === f 
                    ? 'bg-primary/90 text-on-primary shadow-lg border border-primary/20' 
                    : 'bg-surface/70 text-on-surface border border-outline-variant/50 hover:bg-surface/90'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sub-badge */}
          <div className="self-start inline-flex items-center gap-2 bg-surface/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-outline-variant/30 shadow-sm pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium text-on-surface-variant">14 verified facilities within 5 km of Anand Vihar</span>
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
                    {selectedHospital.type || 'Hospital'} • <span className="font-[var(--font-space-grotesk)] font-medium">0.8 km</span> away
                  </p>
                </div>
                <Link href={`/hospitals/${selectedHospital.id}`} className="shrink-0 w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-dim transition-colors">
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </Link>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                  24/7 Emergency
                </span>
                <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
                  <span className="material-symbols-outlined text-[14px]">air</span>
                  Oxygen Support
                </span>
              </div>
              
              {/* Availability Banner */}
              <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
                <span className="text-sm font-medium text-green-800">Currently accepting patients. OPD open.</span>
              </div>

              <div className="flex gap-3 mt-1">
                <button className="flex-1 bg-primary text-on-primary py-3 rounded-full text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">directions</span>
                  Get Directions
                </button>
                <button className="w-12 h-12 shrink-0 rounded-full border border-outline flex items-center justify-center text-primary hover:bg-surface-variant transition-colors">
                  <span className="material-symbols-outlined">call</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Action Button */}
        <Link href="/hospitals/add" className="absolute bottom-24 right-4 z-[10] pointer-events-auto bg-primary-container/90 backdrop-blur-md text-on-primary-container px-4 py-3 rounded-full shadow-lg border border-primary/20 flex items-center gap-2 hover:bg-primary-container transition-all">
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="text-label-lg font-bold pr-1">Add Clinic</span>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}
