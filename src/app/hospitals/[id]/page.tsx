'use client';

import React, { use, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { PRECACHED_INDIA_HOSPITALS } from '@/data/india-hospitals';
import type { Hospital } from '@/lib/types';

const MapWrapper = dynamic(() => import('@/components/MapWrapper'), { ssr: false });

const hospitalPin = L.divIcon({
  className: 'custom-leaflet-icon',
  html: `<div class="w-6 h-6 rounded-full bg-primary border-white border-2 shadow-lg flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function HospitalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const hospitalId = resolvedParams.id;

  const [hospital, setHospital] = useState<Hospital>(() => {
    const found = PRECACHED_INDIA_HOSPITALS.find((h) => h.id === hospitalId);
    return found || PRECACHED_INDIA_HOSPITALS[0];
  });

  useEffect(() => {
    // 1. Try finding in pre-cached registry
    const fromPrecache = PRECACHED_INDIA_HOSPITALS.find((h) => h.id === hospitalId);
    if (fromPrecache) {
      setHospital(fromPrecache);
      return;
    }

    // 2. Try looking in localStorage multi-stream cache
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('aerocost_hospitals_')) {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            const found = parsed.data?.hospitals?.find((h: Hospital) => h.id === hospitalId);
            if (found) {
              setHospital(found);
              return;
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }, [hospitalId]);

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
        <Link
          href="/hospitals"
          className="absolute top-4 left-4 z-20 w-10 h-10 bg-surface/90 backdrop-blur-sm rounded-full flex items-center justify-center text-on-surface shadow-md hover:bg-surface transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
      </div>

      {/* Bottom half: Overlapping Sheet */}
      <div className="bg-surface rounded-t-[24px] -mt-6 z-20 flex-1 px-5 pt-4 pb-8 flex flex-col shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        {/* Pull Handle */}
        <div className="w-12 h-1.5 bg-outline-variant/50 rounded-full mx-auto mb-6" />

        {/* Badge Row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-surface-variant text-on-surface-variant px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase">
            {hospital.type || 'HOSPITAL'}
          </span>
          <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-bold tracking-wide flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Verified Public Health Node
          </span>
          {hospital.hasEmergency && (
            <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">emergency</span>
              24/7 Emergency
            </span>
          )}
        </div>

        {/* Header Info */}
        <h1 className="text-headline-lg font-bold text-on-surface mb-2 leading-tight">
          {hospital.name}
        </h1>
        <p className="text-body-md text-on-surface-variant flex items-center gap-1.5 mb-6">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          {hospital.distance && (
            <span className="font-[var(--font-space-grotesk)] font-bold text-primary">
              {hospital.distance} away •{' '}
            </span>
          )}
          <span>{hospital.address || 'Verified OpenStreetMap Location'}</span>
        </p>

        {/* 3-Column Capability Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface-variant/40 p-3 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined">pulmonology</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface uppercase tracking-wide">Pulmonology</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">Active</p>
            </div>
          </div>

          <div className="bg-surface-variant/40 p-3 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <span className="material-symbols-outlined">air</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface uppercase tracking-wide">O₂ Support</p>
              <p className="text-xs text-green-600 font-medium mt-0.5">Available</p>
            </div>
          </div>

          <div className="bg-surface-variant/40 p-3 rounded-2xl flex flex-col items-center text-center gap-2 border border-outline-variant/30">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
              <span className="material-symbols-outlined">local_hospital</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-on-surface uppercase tracking-wide">Emergency OPD</p>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">24 Hours</p>
            </div>
          </div>
        </div>

        {/* Ambient AQI Advisory */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex gap-4 mb-6 relative overflow-hidden">
          <div className="shrink-0 w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center z-10">
            <span className="material-symbols-outlined">air</span>
          </div>
          <div className="z-10">
            <h4 className="text-title-md font-bold text-orange-900 mb-1">
              Respiratory Patient Advisory
            </h4>
            <p className="text-body-sm text-orange-800">
              High particulate matter detected in ambient atmosphere. When visiting outpatient clinics or triage, N95 masks are advised to prevent acute bronchial flare-ups.
            </p>
          </div>
        </div>

        {/* Facility Info Card */}
        <div className="bg-surface border border-outline-variant/40 rounded-2xl p-5 mb-6 shadow-sm">
          <h3 className="text-title-md font-bold text-on-surface mb-4">Facility Information</h3>

          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5">pin_drop</span>
              <div>
                <p className="text-label-md font-medium text-on-surface-variant mb-0.5">Address</p>
                <p className="text-body-md text-on-surface">{hospital.address || 'Address provided via OpenStreetMap records'}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="material-symbols-outlined text-on-surface-variant shrink-0 mt-0.5">schedule</span>
              <div>
                <p className="text-label-md font-medium text-on-surface-variant mb-0.5">Operating Hours</p>
                <p className="text-body-md text-on-surface">Emergency: 24/7 • OPD: 8:00 AM – 2:00 PM</p>
              </div>
            </div>

            {hospital.phone && (
              <div className="flex gap-4 items-center">
                <span className="material-symbols-outlined text-on-surface-variant shrink-0">phone</span>
                <div className="flex-1">
                  <p className="text-label-md font-medium text-on-surface-variant mb-0.5">Helpline</p>
                  <p className="text-body-md font-[var(--font-space-grotesk)] font-bold text-on-surface">{hospital.phone}</p>
                </div>
                <a
                  href={`tel:${hospital.phone}`}
                  className="shrink-0 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-label-sm font-bold flex items-center gap-1.5 hover:bg-primary/20 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">call</span>
                  Call Now
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 mb-6">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-primary text-on-primary py-4 rounded-full text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-md"
          >
            <span className="material-symbols-outlined">directions</span>
            Get Directions in Google Maps
          </a>
          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              className="w-full bg-surface text-primary border-2 border-primary/20 py-4 rounded-full text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary/5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">call</span>
              Call Hospital Reception ({hospital.phone})
            </a>
          )}
        </div>

        {/* Footer Utilities */}
        <div className="flex justify-center gap-6 border-t border-outline-variant/30 pt-6">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: hospital.name,
                  text: `Healthcare facility: ${hospital.name} located at ${hospital.address}`,
                  url: window.location.href,
                }).catch(() => {});
              }
            }}
            className="flex flex-col items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">share</span>
            <span className="text-xs font-medium">Share Facility</span>
          </button>
          <Link
            href="/hospitals/add"
            className="flex flex-col items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">edit_location</span>
            <span className="text-xs font-medium">Update Facility Details</span>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
