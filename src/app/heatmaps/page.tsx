"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import BottomNav from "@/components/BottomNav";
import type { HeatmapCity } from "@/components/HeatmapCityMarkers";

const MapWrapper = dynamic(() => import("@/components/MapWrapper"), {
  ssr: false,
  loading: () => <div className="h-[460px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Loading Geospatial Analytical Canvas...</div>,
});
const HeatmapCityMarkers = dynamic(() => import("@/components/HeatmapCityMarkers"), {
  ssr: false,
});

type TabMode = "aqi" | "cost";

const cities: HeatmapCity[] = [
  { name: "Delhi NCR", lat: 28.6139, lng: 77.2090, aqi: 248, aqiStatus: "Poor", cost: "₹3.8k/mo" },
  { name: "Phagwara / Jalandhar", lat: 31.2240, lng: 75.7708, aqi: 215, aqiStatus: "Poor", cost: "₹3.2k/mo" },
  { name: "Lucknow", lat: 26.8467, lng: 80.9462, aqi: 215, aqiStatus: "Poor", cost: "₹3.1k/mo" },
  { name: "Patna", lat: 25.5941, lng: 85.1376, aqi: 340, aqiStatus: "Very Poor", cost: "₹4.6k/mo" },
  { name: "Kolkata", lat: 22.5726, lng: 88.3639, aqi: 162, aqiStatus: "Moderate", cost: "₹2.2k/mo" },
  { name: "Mumbai", lat: 19.0760, lng: 72.8777, aqi: 92, aqiStatus: "Satisfactory", cost: "₹1.1k/mo" },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946, aqi: 48, aqiStatus: "Good", cost: "₹650/mo" },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867, aqi: 108, aqiStatus: "Moderate", cost: "₹1.5k/mo" },
];

export default function HeatmapsPage() {
  const [activeTab, setActiveTab] = useState<TabMode>("aqi");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([24.5, 80.5]);
  const [mapZoom, setMapZoom] = useState<number>(5);

  const handleZoomIn = () => setMapZoom((z) => Math.min(z + 1, 12));
  const handleZoomOut = () => setMapZoom((z) => Math.max(z - 1, 4));
  const handleRecenter = () => {
    setMapCenter([24.5, 80.5]);
    setMapZoom(5);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 font-[var(--font-inter)]">
      {/* Sticky Segmented Header */}
      <header className="sticky top-0 z-40 p-3 md:p-4 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <h1 className="text-base md:text-lg font-bold text-ink flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">public</span>
              Geospatial Health &amp; Pollution Matrix
            </h1>
            <p className="text-xs text-slate">Live analytical correlation across Indian airsheds</p>
          </div>

          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 items-center w-full sm:w-auto shadow-inner border border-slate-200">
            <button
              onClick={() => setActiveTab("aqi")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "aqi" ? "bg-primary text-white shadow-xs" : "text-slate hover:text-ink"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">air</span>
              AQI Heatmap
            </button>
            <button
              onClick={() => setActiveTab("cost")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "cost" ? "bg-primary text-white shadow-xs" : "text-slate hover:text-ink"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">currency_rupee</span>
              Healthcare Cost Risk
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Contextual Telemetry Banner */}
        <div className="bg-white rounded-xl p-3 md:p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="text-xs md:text-sm font-medium text-slate">
              Active telemetry: <strong className="text-ink">384 CPCB &amp; State CAAQMS nodes</strong>. Indo-Gangetic &amp; Coastal corridors synchronized.
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <span>{drawerOpen ? "Hide Calibration" : "Sensor Calibration"}</span>
            <span className="material-symbols-outlined text-[14px]">tune</span>
          </button>
        </div>

        {/* Collapsible Sensor Calibration Drawer */}
        {drawerOpen && (
          <div className="bg-white rounded-xl p-4 md:p-5 border border-slate-200 shadow-sm transition-all space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate">Sensor Telemetry Specifications</h4>
            <p className="text-xs text-slate leading-relaxed">
              Continuous Ambient Air Quality Monitoring Systems (CAAQMS) utilize Beta Attenuation Monitors (BAM-1020) for particulate matter (PM2.5 / PM10) with automatic volumetric flow controllers. Data syncs at 60-minute intervals and correlates with non-linear health expenditure indices.
            </p>
          </div>
        )}

        {/* Analytical Map Canvas (Responsive Height) */}
        <div className="relative h-[440px] md:h-[540px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
          {/* Leaflet Map with real markers that pan and zoom with user gesture */}
          <MapWrapper center={mapCenter} zoom={mapZoom} height="100%">
            <HeatmapCityMarkers cities={cities} activeTab={activeTab} />
          </MapWrapper>

          {/* Floating On-Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-[10] pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 flex flex-col overflow-hidden">
              <button
                onClick={handleZoomIn}
                aria-label="Zoom In"
                className="p-2 text-slate hover:bg-slate-100 hover:text-ink border-b border-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
              <button
                onClick={handleZoomOut}
                aria-label="Zoom Out"
                className="p-2 text-slate hover:bg-slate-100 hover:text-ink transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
            </div>
            <button
              onClick={handleRecenter}
              aria-label="Recenter India Map"
              className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-slate-200 text-slate hover:text-primary transition-colors"
              title="Reset India view"
            >
              <span className="material-symbols-outlined text-[18px]">my_location</span>
            </button>
          </div>

          {/* Floating Map Mode Badge */}
          <div className="absolute bottom-4 left-4 z-[10] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-ink shadow-sm pointer-events-none flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTab === 'aqi' ? '#ea580c' : '#b91c1c' }} />
            {activeTab === 'aqi' ? 'Air Quality Index Layer (CPCB)' : 'Projected Healthcare Out-of-Pocket Risk'}
          </div>
        </div>

        {/* Dynamic Spectrum Legend */}
        <div className="bg-white p-4 md:p-5 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex justify-between items-center mb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate">
              {activeTab === "aqi" ? "CPCB AQI Health Risk Spectrum" : "Estimated Healthcare Out-of-Pocket Burden Spectrum"}
            </h3>
            <span className="text-xs text-primary font-medium">Drag or zoom map to inspect individual nodes</span>
          </div>

          <div
            className="h-2.5 rounded-full w-full mb-3"
            style={{
              background:
                activeTab === "aqi"
                  ? "linear-gradient(to right, #10b981, #84cc16, #eab308, #ea580c, #b91c1c, #7f1d1d)"
                  : "linear-gradient(to right, #10b981, #84cc16, #eab308, #ea580c, #b91c1c)",
            }}
          />

          <div className="flex justify-between text-[11px] md:text-xs text-slate font-medium font-[var(--font-space-grotesk)]">
            {activeTab === "aqi" ? (
              <>
                <span className="text-emerald-700 font-bold">0–50 (Good)</span>
                <span className="text-yellow-600">101–200 (Moderate)</span>
                <span className="text-orange-600">201–300 (Poor)</span>
                <span className="text-red-700 font-bold">400+ (Severe)</span>
              </>
            ) : (
              <>
                <span className="text-emerald-700 font-bold">₹500/mo (Low)</span>
                <span className="text-yellow-600">₹1,500/mo (Moderate)</span>
                <span className="text-orange-600">₹3,000/mo (Elevated)</span>
                <span className="text-red-700 font-bold">₹5,000+/mo (Acute)</span>
              </>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Insights Grid for Laptop/Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Card 1: Indo-Gangetic Airshed */}
          <div className="bg-white rounded-2xl shadow-xs p-5 md:p-6 border border-slate-200 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-ink text-base md:text-lg">Indo-Gangetic Airshed Corridor</h3>
                  <p className="text-xs text-slate">Punjab, Haryana, Delhi NCR, UP &amp; Bihar</p>
                </div>
                <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
                  Critical Zone
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate leading-relaxed mb-4">
                Trapped particulate matter from winter thermal inversion and agricultural residues causes seasonal AQI spikes above 300, leading to a 3.4× surge in outpatient respiratory consultations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate">Avg Out-of-Pocket Strain</span>
                <p className="text-base md:text-lg font-bold font-[var(--font-space-grotesk)] text-red-600 mt-0.5">
                  ₹3,420 / mo
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate">Exposed Population</span>
                <p className="text-base md:text-lg font-bold font-[var(--font-space-grotesk)] text-ink mt-0.5">
                  ~284 Million
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Coastal & Southern Airshed */}
          <div className="bg-white rounded-2xl shadow-xs p-5 md:p-6 border border-slate-200 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-ink text-base md:text-lg">Peninsular &amp; Coastal Airsheds</h3>
                  <p className="text-xs text-slate">Mumbai, Bengaluru, Chennai, Kerala</p>
                </div>
                <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  Moderate Zone
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate leading-relaxed mb-4">
                Maritime sea-breeze ventilation prevents prolonged PM2.5 stagnation. Healthcare expenditures correlate primarily with seasonal humidity and urban vehicular corridors rather than acute inversion shocks.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate">Avg Out-of-Pocket Strain</span>
                <p className="text-base md:text-lg font-bold font-[var(--font-space-grotesk)] text-emerald-600 mt-0.5">
                  ₹890 / mo
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate">Relative Health Burden</span>
                <p className="text-base md:text-lg font-bold font-[var(--font-space-grotesk)] text-ink mt-0.5">
                  -68% vs Gangetic
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
