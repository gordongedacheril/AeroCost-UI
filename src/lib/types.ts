// Shared TypeScript interfaces for API responses

// ─── AQI ────────────────────────────────────────────────────────────────────

export interface Pollutant {
  name: string;
  value: number;
  unit: string;
  status: string;
  statusColor: string;
}

export interface ForecastItem {
  time: string;
  aqi: number;
  isNow?: boolean;
}

export interface AqiResponse {
  aqi: number;
  dominantPollutant: string;
  dominantPollutantValue: number;
  dominantPollutantUnit: string;
  station: {
    name: string;
    url: string;
  };
  time: {
    iso: string;
    /** Minutes since last update */
    minutesAgo: number;
  };
  pollutants: Pollutant[];
  forecast: ForecastItem[];
  attribution: { name: string; url: string }[];
}

// ─── AQI Search ─────────────────────────────────────────────────────────────

export interface AqiSearchResult {
  uid: number;
  name: string;
  aqi: string | number; // WAQI sometimes returns "-" for unknown
  station: {
    lat: number;
    lng: number;
  };
  time: string;
}

export interface AqiSearchResponse {
  results: AqiSearchResult[];
}

// ─── Geocode ────────────────────────────────────────────────────────────────

export interface GeocodeResponse {
  city: string;
  state: string;
  district: string;
  displayName: string;
  country: string;
}

// ─── Hospitals ──────────────────────────────────────────────────────────────

export interface Hospital {
  id: string;
  name: string;
  type: 'hospital' | 'phc' | 'clinic' | 'pharmacy' | 'community';
  lat: number;
  lng: number;
  distance: string;
  distanceKm: number;
  address: string;
  phone?: string;
  isVerified: boolean;
  hasEmergency: boolean;
  specialties?: string[];
  source: 'osm' | 'government' | 'community';
}

// ─── Location State ─────────────────────────────────────────────────────────

export interface LocationState {
  lat: number;
  lng: number;
  city: string;
  state: string;
  displayName: string;
}
