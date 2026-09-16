"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import BottomNav from "@/components/BottomNav";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), { ssr: false });

type TabMode = "aqi" | "cost";

interface CityMarker {
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  aqiStatus: string;
  cost: string;
  top: string;
  left: string;
}

const cities: CityMarker[] = [
  { name: "Delhi", lat: 28.61, lng: 77.21, aqi: 248, aqiStatus: "Poor", cost: "₹3.8k", top: "30%", left: "38%" },
  { name: "Lucknow", lat: 26.85, lng: 80.95, aqi: 215, aqiStatus: "Poor", cost: "₹3.1k", top: "38%", left: "52%" },
  { name: "Patna", lat: 25.61, lng: 85.14, aqi: 340, aqiStatus: "Very Poor", cost: "₹4.6k", top: "42%", left: "68%" },
  { name: "Kolkata", lat: 22.57, lng: 88.36, aqi: 162, aqiStatus: "Moderate", cost: "₹2.2k", top: "52%", left: "80%" },
  { name: "Mumbai", lat: 19.08, lng: 72.88, aqi: 92, aqiStatus: "Satisfactory", cost: "₹1.1k", top: "65%", left: "28%" },
];

export default function HeatmapsPage() {
  const [activeTab, setActiveTab] = useState<TabMode>("aqi");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-[var(--font-inter)]">
      {/* Sticky Segmented Glass Header */}
      <header className="sticky top-0 z-50 p-4 liquid-glass border-b border-gray-200">
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1 items-center max-w-sm mx-auto shadow-inner">
          <button
            onClick={() => setActiveTab("aqi")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "aqi" ? "bg-primary-container text-white shadow-md" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <span className="material-symbols-outlined text-lg">air</span>
            AQI Heatmap
          </button>
          <button
            onClick={() => setActiveTab("cost")}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "cost" ? "bg-primary-container text-white shadow-md" : "text-gray-600 hover:text-gray-800"
            }`}
          >
            <span className="material-symbols-outlined text-lg">currency_rupee</span>
            Healthcare Cost Risk
          </button>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Contextual Telemetry Banner */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p className="text-xs text-gray-700 font-medium">
              Live telemetry: 384 CPCB & State nodes. Gangetic Corridor active.
            </p>
          </div>
          <button className="text-xs font-semibold px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors">
            Details
          </button>
        </div>

        {/* Map Canvas */}
        <div className="relative h-[380px] rounded-2xl overflow-hidden shadow-card border border-gray-200 bg-gray-100">
          <MapWrapper center={[23.5, 82.0]} zoom={5} />
          
          {/* Gradient Overlay */}
          <div
            className={`absolute inset-0 pointer-events-none opacity-40 transition-colors duration-500 ${
              activeTab === "aqi"
                ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/50 via-red-500/20 to-transparent"
                : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-600/50 via-orange-500/20 to-transparent"
            }`}
          />

          {/* Floating Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button className="bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-md text-gray-700 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">layers</span>
            </button>
            <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-md flex flex-col overflow-hidden">
              <button className="p-2 text-gray-700 hover:bg-gray-100 border-b border-gray-200 transition-colors">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button className="p-2 text-gray-700 hover:bg-gray-100 transition-colors">
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
            <button className="bg-white/90 backdrop-blur-md p-2 rounded-lg shadow-md text-gray-700 hover:text-primary transition-colors mt-2">
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>

          {/* City Markers - Overlaid for visual representation if MapWrapper doesn't render them natively */}
          {cities.map((city) => (
            <div
              key={city.name}
              className="absolute z-10 flex flex-col items-center pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ top: city.top, left: city.left }}
            >
              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-gray-200 text-xs font-semibold text-gray-800 flex flex-col items-center mb-1">
                <span>{city.name}</span>
                <span className="font-[var(--font-space-grotesk)] text-primary">
                  {activeTab === "aqi" ? `${city.aqiStatus} ${city.aqi}` : city.cost}
                </span>
              </div>
              <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: activeTab === "aqi" ? (city.aqi > 300 ? '#ef4444' : city.aqi > 200 ? '#f97316' : city.aqi > 100 ? '#eab308' : '#22c55e') : (parseFloat(city.cost.replace(/[^0-9.]/g, '')) > 3 ? '#ef4444' : '#eab308') }} />
            </div>
          ))}
        </div>

        {/* Dynamic Spectrum Legend */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="h-2 rounded-full w-full mb-3" style={{ background: activeTab === "aqi" ? "linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444, #a855f7)" : "linear-gradient(to right, #22c55e, #eab308, #ef4444)" }} />
          <div className="flex justify-between text-xs text-gray-500 font-medium font-[var(--font-space-grotesk)]">
            {activeTab === "aqi" ? (
              <>
                <span>0 (Good)</span>
                <span>Moderate (101-200)</span>
                <span>Severe (401-500+)</span>
              </>
            ) : (
              <>
                <span>₹500/mo (Low)</span>
                <span>₹2,500/mo (Elevated)</span>
                <span>₹5,000+/mo (Acute)</span>
              </>
            )}
          </div>
        </div>

        {/* Regional Insight Card */}
        <div className="bg-white rounded-xl shadow-card p-5 border border-gray-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Indo-Gangetic Airshed</h3>
              <p className="text-sm text-gray-500">Winter Thermal Inversion Zone</p>
            </div>
            <span className="bg-error-container text-white text-xs font-bold px-2 py-1 rounded-md">
              High Risk
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            Trapped particulate matter due to thermal inversion leads to extreme pollution levels, resulting in significantly elevated healthcare burdens across the region.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Projected Avg Burden</p>
              <p className="font-[var(--font-space-grotesk)] font-bold text-gray-900 text-lg">₹3,420/mo</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Airshed Population</p>
              <p className="font-[var(--font-space-grotesk)] font-bold text-gray-900 text-lg">284M</p>
            </div>
          </div>
          <button className="w-full py-3 text-sm font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
            View Regional Clinic Corridors
          </button>
        </div>

        {/* Sensor Calibration Drawer Toggle */}
        <button 
          onClick={() => setDrawerOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">tune</span>
            <span className="font-medium text-sm">Sensor Calibration Details</span>
          </div>
          <span className="material-symbols-outlined text-gray-400">chevron_right</span>
        </button>

        {/* Collapsible Drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/20 pointer-events-auto transition-opacity" onClick={() => setDrawerOpen(false)} />
            <div className="bg-white w-full max-w-md rounded-t-2xl shadow-xl pointer-events-auto transform transition-transform p-5 border-t border-gray-200 pb-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">CPCB Station Calibration</h3>
                <button onClick={() => setDrawerOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                Our network integrates data from standardized Beta Attenuation Monitors (BAM-1020). These instruments undergo routine multi-point calibration in adherence to CPCB guidelines to ensure high-fidelity reporting of PM2.5 and PM10 concentrations across state nodes.
              </p>
              <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 p-2 rounded-md w-max">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Data validated within past 15 mins
              </div>
            </div>
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
