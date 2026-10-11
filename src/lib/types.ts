export interface AqiSearchResult {
  uid: number;
  aqi: string | number | null;
  time: string;
  name: string;
  station: {
    lat: number;
    lng: number;
  };
}

export interface LocationState {
  lat: number;
  lng: number;
  city: string;
  state: string;
  displayName: string;
}

export interface Pollutant {
  name: string;
  value: number;
  unit: string;
  status?: string;
  statusColor?: string;
}

export interface ForecastItem {
  time: string;
  aqi: number;
  isNow: boolean;
}

export interface AqiResponse {
  aqi: number;
  dominantPollutant: string;
  dominantPollutantValue: number;
  dominantPollutantUnit: string;
  station: { name: string; url: string };
  time: { minutesAgo: number };
  pollutants: Pollutant[];
  forecast: ForecastItem[];
}

export interface Hospital {
  id: string;
  name: string;
  type: 'hospital' | 'phc' | 'clinic' | 'pharmacy' | 'community';
  lat: number;
  lng: number;
  distance: string;
  address: string;
  phone?: string;
  isVerified: boolean;
  hasEmergency: boolean;
  specialties?: string[];
}
