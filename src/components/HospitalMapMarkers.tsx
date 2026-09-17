'use client';

import { Marker } from 'react-leaflet';
import L from 'leaflet';
import type { Hospital } from '@/lib/types';

interface HospitalMapMarkersProps {
  center: [number, number];
  onSelect: (hospital: Hospital) => void;
  hospitals?: Hospital[];
}

const createIcon = (type: string) => {
  let bgClass = 'bg-primary';
  let borderClass = 'border-white';

  if (type === 'phc' || type === 'clinic') {
    bgClass = 'bg-primary border-teal-400 border-2';
  } else if (type === 'community') {
    bgClass = 'bg-surface border-primary border-dashed border-2';
  } else if (type === 'pharmacy') {
    bgClass = 'bg-green-500 border-white border-2';
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

export default function HospitalMapMarkers({ center, onSelect, hospitals = [] }: HospitalMapMarkersProps) {
  return (
    <>
      <Marker position={center} icon={userIcon} />
      {hospitals.map((hospital) => (
        <Marker
          key={hospital.id}
          position={[hospital.lat, hospital.lng]}
          icon={createIcon(hospital.type || 'hospital')}
          eventHandlers={{ click: () => onSelect(hospital) }}
        />
      ))}
    </>
  );
}
