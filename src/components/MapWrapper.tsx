'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface MapWrapperProps {
  center: [number, number];
  zoom: number;
  className?: string;
  children?: React.ReactNode;
  height?: string;
}

// Controller to dynamically pan, zoom, and force Leaflet tile render on mount/update
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
    // Invalidate size forces Leaflet to calculate container dimensions and load tiles immediately
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [center, zoom, map]);

  return null;
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
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`bg-slate-100 animate-pulse ${className}`} style={{ height, minHeight: '320px' }} />;
  }

  return (
    <div className={`relative w-full ${className}`} style={{ height, minHeight: '320px', zIndex: 0 }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '320px', zIndex: 0, backgroundColor: '#e2e8f0' }}
        zoomControl={false}
      >
        <MapController center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {children}
      </MapContainer>
    </div>
  );
}
