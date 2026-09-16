'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import type { DivIcon } from 'leaflet';

const MapWrapper = dynamic(() => import('@/components/MapWrapper'), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(({ Marker }) => Marker), { ssr: false });

const FACILITY_TYPES = [
  'Hospital',
  'Primary Health Centre',
  'Specialist Clinic',
  'Pharmacy/Oxygen Supply'
];

export default function AddFacilityPage() {
  const [centerPin, setCenterPin] = useState<DivIcon | null>(null);
  const [name, setName] = useState('');
  const [facilityType, setFacilityType] = useState('Hospital');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  const [services, setServices] = useState({
    respiratory: true,
    emergency: true,
    nebulizer: false,
    pediatric: false,
  });

  const center: [number, number] = [28.6469, 77.3164];

  useEffect(() => {
    import('leaflet').then(({ default: L }) => {
      setCenterPin(L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div class="relative flex items-center justify-center w-8 h-8">
                <div class="absolute w-6 h-6 bg-primary rounded-full opacity-30 animate-ping"></div>
                <div class="relative w-4 h-4 bg-primary rounded-full border-2 border-white shadow-md"></div>
                <div class="absolute top-4 w-0.5 h-4 bg-primary"></div>
               </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      }));
    });
  }, []);

  return (
    <div className="min-h-screen bg-surface font-[var(--font-inter)] flex flex-col pb-24">
      {/* Header */}
      <div className="bg-surface px-4 py-6 border-b border-outline-variant/30 sticky top-0 z-30">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">add_location_alt</span>
          <span className="text-xs font-bold tracking-widest text-primary uppercase bg-primary/5 px-2 py-1 rounded">Citizen Health Registry</span>
        </div>
        <h1 className="text-headline-sm font-bold text-on-surface">Add a Health Facility</h1>
      </div>

      <div className="p-4 flex flex-col gap-8">
        {/* Disclaimer */}
        <div className="bg-surface-variant/40 rounded-xl p-3 flex gap-3 text-sm text-on-surface-variant border border-outline-variant/50">
          <span className="material-symbols-outlined text-on-surface-variant shrink-0 text-[20px]">info</span>
          <p>Community submissions are marked as <span className="font-bold text-on-surface">unverified</span> until reviewed by our moderation team.</p>
        </div>

        {/* Section 1 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-title-md font-bold text-on-surface flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
            Facility Overview
          </h2>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-label-md font-medium text-on-surface">Facility Name *</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., City Hospital" 
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3.5 text-body-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <label className="text-label-md font-medium text-on-surface">Facility Classification</label>
            <div className="grid grid-cols-2 gap-2">
              {FACILITY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setFacilityType(type)}
                  className={`px-3 py-3 rounded-xl text-sm font-medium text-left border transition-all ${
                    facilityType === type 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'bg-surface border-outline-variant/50 text-on-surface-variant hover:bg-surface-variant'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-title-md font-bold text-on-surface flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
            Geospatial Placement
          </h2>
          
          <div className="rounded-2xl overflow-hidden border border-outline-variant/50 relative shadow-sm h-44">
            <MapWrapper center={center} zoom={15}>
              {centerPin && <Marker position={center} icon={centerPin} />}
            </MapWrapper>
            
            {/* Crosshair target overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
              <span className="material-symbols-outlined text-primary/30 text-4xl">add</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <span className="font-[var(--font-space-grotesk)] text-xs font-medium text-on-surface-variant bg-surface-variant px-2 py-1 rounded">28.6469° N, 77.3164° E</span>
            <button className="text-primary text-label-md font-bold flex items-center gap-1.5 hover:underline">
              <span className="material-symbols-outlined text-[16px]">my_location</span>
              Use Current GPS
            </button>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <label className="text-label-md font-medium text-on-surface">Street Address</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter complete address" 
              className="w-full bg-surface border border-outline-variant rounded-xl px-4 py-3.5 text-body-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </section>

        {/* Section 3 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-title-md font-bold text-on-surface flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
            Available Services
          </h2>
          
          <div className="flex flex-col gap-3 bg-surface border border-outline-variant/50 rounded-xl p-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${services.respiratory ? 'bg-primary border-primary text-on-primary' : 'border-outline group-hover:border-primary'}`}>
                {services.respiratory && <span className="material-symbols-outlined text-[16px]">check</span>}
              </div>
              <input type="checkbox" className="hidden" checked={services.respiratory} onChange={() => setServices({...services, respiratory: !services.respiratory})} />
              <span className="text-body-md text-on-surface">Respiratory Care</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${services.emergency ? 'bg-primary border-primary text-on-primary' : 'border-outline group-hover:border-primary'}`}>
                {services.emergency && <span className="material-symbols-outlined text-[16px]">check</span>}
              </div>
              <input type="checkbox" className="hidden" checked={services.emergency} onChange={() => setServices({...services, emergency: !services.emergency})} />
              <span className="text-body-md text-on-surface">24/7 Emergency Triage</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${services.nebulizer ? 'bg-primary border-primary text-on-primary' : 'border-outline group-hover:border-primary'}`}>
                {services.nebulizer && <span className="material-symbols-outlined text-[16px]">check</span>}
              </div>
              <input type="checkbox" className="hidden" checked={services.nebulizer} onChange={() => setServices({...services, nebulizer: !services.nebulizer})} />
              <span className="text-body-md text-on-surface">Nebulizer Setup</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${services.pediatric ? 'bg-primary border-primary text-on-primary' : 'border-outline group-hover:border-primary'}`}>
                {services.pediatric && <span className="material-symbols-outlined text-[16px]">check</span>}
              </div>
              <input type="checkbox" className="hidden" checked={services.pediatric} onChange={() => setServices({...services, pediatric: !services.pediatric})} />
              <span className="text-body-md text-on-surface">Pediatric Pulmonology</span>
            </label>
          </div>
        </section>

        {/* Section 4 */}
        <section className="flex flex-col gap-4">
          <h2 className="text-title-md font-bold text-on-surface flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">4</span>
            Contact
          </h2>
          
          <div className="flex gap-3">
            <div className="bg-surface-variant flex items-center justify-center px-4 rounded-xl border border-outline-variant font-[var(--font-space-grotesk)] font-bold text-on-surface">
              +91
            </div>
            <input 
              type="tel" 
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="10-digit number" 
              className="flex-1 bg-surface border border-outline-variant rounded-xl px-4 py-3.5 text-body-lg font-[var(--font-space-grotesk)] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </section>

        <hr className="border-outline-variant/30 my-2" />

        {/* Submit Actions */}
        <div className="flex flex-col gap-4">
          <p className="text-xs text-center text-on-surface-variant max-w-[280px] mx-auto">
            <span className="material-symbols-outlined text-[14px] inline-block align-text-bottom mr-1">verified_user</span>
            Submitted pins undergo peer verification within 48 hours
          </p>
          
          <button className="w-full bg-primary-container text-on-primary-container py-4 rounded-full text-label-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container/90 transition-colors shadow-sm">
            <span className="material-symbols-outlined">send</span>
            Submit for Verification
          </button>
          
          <Link href="/hospitals" className="text-center text-label-md font-bold text-primary hover:underline">
            Cancel and return to map
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
