'use client';

import React, { use } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import L from 'leaflet';
import { Marker } from 'react-leaflet';

const MapWrapper = dynamic(() => import('@/components/MapWrapper'), { ssr: false });

const hospitalPin = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="w-5 h-5 rounded-full bg-primary border-white border-2 shadow-lg flex items-center justify-center">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
         </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Fallback hospital data — this page will be enhanced with live lookup later
const FALLBACK_HOSPITAL = {
  id: '1',
  name: 'Dr. Hedgewar Arogya Sansthan',
  type: 'hospital' as const,
  lat: 28.6380,
  lng: 77.3100,
  distance: '0.8 km',
  address: 'Karkardooma, Institutional Area, Near District Court, Delhi 110032',
  phone: '+91 11 2230 4200',
  isVerified: true,
  hasEmergency: true,
};

export default function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  // Using fallback hospital data — live lookup by ID will be added later
  const hospital = FALLBACK_HOSPITAL;
  const center: [number, number] = [hospital.lat, hospital.lng];

  return (
    <div className="min-h-screen bg-surface font-[var(--font-inter)] flex flex-col relative pb-20">
      
      {/* Top half: Map */}
      <div className="h-72 w-full relative z-0">
        <MapWrapper center={center} zoom={15}>
           <Marker position={center} icon={hospitalPin} />
        </MapWrapper>
        {/* Scrim Overlay */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none z-10" />
        
        {/* Back Button */}
        <Link href="/hospitals" className="absolute top-4 left-4 z-20 w-10 h-10 bg-surface/90 backdrop-blur-sm rounded-full flex items-center justify-center text-on-surface shadow-md">
           <span className="material-symbols-outlined">arrow_back</span>
        </Link>
      </div>

      {/* Bottom half: Overlapping Sheet */}
      <div className="bg-surface rounded-t-[24px] -mt-6 z-20 flex-1 px-5 pt-4 pb-8 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Pull Handle */}
        <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto mb-6" />

        {/* Badge Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-surface-variant text-on-surface-variant px-2.5 py-1 rounded-md text-xs font-bold tracking-wide">
            Government Hospital
          </span>
          <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Verified CPCB/MoHFW Node
          </span>
        </div>

        {/* Header Info */}
        <h1 className="text-headline-lg font-bold text-on-surface mb-2 leading-tight">
          {hospital.name}
        </h1>
        <p className="text-body-md text-on-surface-variant flex items-center gap-1.5 mb-8">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span className="font-[var(--font-space-grotesk)] font-medium">0.8 km</span> away • Karkardooma, East Delhi
        </p>

        {/* 3-Column Capability Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-surface-variant/50 p-3 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/30">
             <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
               <span className="material-symbols-outlined">pulmonology</span>
             </div>
             <div>
               <p className="text-[11px] font-bold text-on-surface uppercase tracking-wide">Pulmonology Ward</p>
               <p className="text-xs text-green-600 font-medium mt-0.5">Active</p>
             </div>
          </div>
          <div className="bg-surface-variant/50 p-3 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/30">
             <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
               <span className="material-symbols-outlined">air</span>
             </div>
             <div>
               <p className="text-[11px] font-bold text-on-surface uppercase tracking-wide">O₂ Beds</p>
               <p className="text-xs text-green-600 font-medium mt-0.5">Available</p>
             </div>
          </div>
          <div className="bg-surface-variant/50 p-3 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/30">
             <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
               <span className="material-symbols-outlined">local_hospital</span>
             </div>
             <div>
               <p className="text-[11px] font-bold text-on-surface uppercase tracking-wide">Emergency OPD</p>
               <p className="text-xs text-on-surface-variant font-medium mt-0.5">24 Hours</p>
             </div>
          </div>
        </div>

        {/* Hospital Ambient AQI Alert */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-4 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-full pointer-events-none" />
          <div className="shrink-0 w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center z-10">
            <span className="material-symbols-outlined">air</span>
          </div>
          <div className="z-10">
            <h4 className="text-title-md font-bold text-orange-900 mb-1">
              Hospital Ambient AQI: <span className="font-[var(--font-space-grotesk)]">242</span> (Poor)
            </h4>
            <p className="text-body-sm text-orange-800">
              This facility uses HEPA air scrubbing in wards. Wait times in non-AC corridors may expose you to poor air quality. Wear a mask (N95 recommended).
            </p>
          </div>
        </div>

        {/* Facility Info Card */}
        <div className="bg-surface border border-outline-variant/50 rounded-2xl p-5 mb-8 shadow-sm">
          <h3 className="text-title-md font-bold text-on-surface mb-4">Facility Information</h3>
          
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5">map</span>
              <div>
                <p className="text-label-md font-medium text-on-surface-variant mb-0.5">Address</p>
                <p className="text-body-md text-on-surface">Karkardooma, Institutional Area, Near District Court, Delhi 110032</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5">schedule</span>
              <div>
                <p className="text-label-md font-medium text-on-surface-variant mb-0.5">Operating Schedule</p>
                <p className="text-body-md text-on-surface">Open 24 hours<br/>OPD: 8:00 AM - 1:00 PM</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5">phone</span>
              <div className="flex-1">
                <p className="text-label-md font-medium text-on-surface-variant mb-0.5">Emergency Helpline</p>
                <p className="text-body-md font-[var(--font-space-grotesk)] text-on-surface">+91 11 2230 4200</p>
              </div>
              <button className="shrink-0 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-label-sm font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">call</span>
                Call Now
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-8">
          <button className="w-full bg-primary text-on-primary py-4 rounded-full text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-md">
            <span className="material-symbols-outlined">directions</span>
            Get Directions (4 mins drive)
          </button>
          <button className="w-full bg-surface text-primary border-2 border-primary/20 py-4 rounded-full text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors">
            <span className="material-symbols-outlined">support_agent</span>
            Call Hospital Helpdesk
          </button>
        </div>

        {/* Footer Utilities */}
        <div className="flex justify-center gap-6 border-t border-outline-variant/30 pt-6">
          <button className="flex flex-col items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">share</span>
            <span className="text-xs font-medium">Share Facility</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 text-on-surface-variant hover:text-error transition-colors">
            <span className="material-symbols-outlined">report</span>
            <span className="text-xs font-medium">Report Inaccuracy</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
