'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapWrapperProps {
  center: [number, number];
  zoom: number;
  className?: string;
  children?: React.ReactNode;
  height?: string;
}

export default function MapWrapper({
  center,
  zoom,
  className = '',
  children,
  height = '100%',
}: MapWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Leaflet icon fix for Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    setMounted(true);
  }, []);

  if (!mounted) return <div className={`bg-surface-dim animate-pulse ${className}`} style={{ height }} />;

  return (
    <div className={`relative ${className}`} style={{ height, zIndex: 0 }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </MapContainer>
    </div>
  );
}
