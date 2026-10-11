'use client';

import React from 'react';
import { Marker, Circle } from 'react-leaflet';
import L from 'leaflet';

export interface HeatmapCity {
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  aqiStatus: string;
  cost: string;
}

interface HeatmapCityMarkersProps {
  cities: HeatmapCity[];
  activeTab: 'aqi' | 'cost';
}

function getAqiColor(aqi: number): { hex: string; bg: string; text: string } {
  if (aqi > 400) return { hex: '#7f1d1d', bg: 'bg-rose-950', text: 'text-rose-100' };
  if (aqi > 300) return { hex: '#b91c1c', bg: 'bg-red-700', text: 'text-white' };
  if (aqi > 200) return { hex: '#ea580c', bg: 'bg-orange-600', text: 'text-white' };
  if (aqi > 100) return { hex: '#eab308', bg: 'bg-yellow-500', text: 'text-slate-900' };
  if (aqi > 50) return { hex: '#84cc16', bg: 'bg-lime-500', text: 'text-slate-900' };
  return { hex: '#10b981', bg: 'bg-emerald-500', text: 'text-white' };
}

function getCostColor(costStr: string): { hex: string; bg: string; text: string } {
  const num = parseFloat(costStr.replace(/[^0-9.]/g, '')) || 1;
  if (num >= 4.0) return { hex: '#b91c1c', bg: 'bg-red-700', text: 'text-white' };
  if (num >= 2.5) return { hex: '#ea580c', bg: 'bg-orange-600', text: 'text-white' };
  if (num >= 1.5) return { hex: '#eab308', bg: 'bg-yellow-500', text: 'text-slate-900' };
  return { hex: '#10b981', bg: 'bg-emerald-500', text: 'text-white' };
}

function createCityIcon(city: HeatmapCity, activeTab: 'aqi' | 'cost') {
  const isAqi = activeTab === 'aqi';
  const color = isAqi ? getAqiColor(city.aqi) : getCostColor(city.cost);
  const label = isAqi ? `${city.aqiStatus} ${city.aqi}` : city.cost;

  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); pointer-events: auto;">
      <div style="background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); padding: 4px 8px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.08); display: flex; flex-direction: column; align-items: center; white-space: nowrap; font-family: sans-serif;">
        <span style="font-size: 11px; font-weight: 700; color: #0f172a;">${city.name}</span>
        <span style="font-size: 10px; font-weight: 800; color: ${color.hex};">${label}</span>
      </div>
      <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${color.hex}; border: 2px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3); margin-top: 3px;"></div>
    </div>
  `;

  return L.divIcon({
    className: 'heatmap-city-pin',
    html,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

export default function HeatmapCityMarkers({ cities, activeTab }: HeatmapCityMarkersProps) {
  return (
    <>
      {cities.map((city) => {
        const color = activeTab === 'aqi' ? getAqiColor(city.aqi) : getCostColor(city.cost);
        return (
          <React.Fragment key={city.name}>
            {/* Heat aura circle anchored to city coordinates */}
            <Circle
              center={[city.lat, city.lng]}
              radius={city.aqi > 250 ? 120000 : 70000}
              pathOptions={{
                color: color.hex,
                fillColor: color.hex,
                fillOpacity: 0.22,
                weight: 1,
              }}
            />
            {/* City label and pin marker */}
            <Marker
              position={[city.lat, city.lng]}
              icon={createCityIcon(city, activeTab)}
            />
          </React.Fragment>
        );
      })}
    </>
  );
}
