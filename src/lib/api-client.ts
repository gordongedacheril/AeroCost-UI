// Client-side API fetch helpers
// All calls go to our Next.js API routes (not external APIs directly)

import type {
  AqiResponse,
  AqiSearchResponse,
  GeocodeResponse,
  Hospital,
} from './types';

// ─── Simple TTL cache (prevents duplicate calls within window) ──────────────

const cache = new Map<string, { data: unknown; expires: number }>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttlMs: number) {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

// ─── AQI ────────────────────────────────────────────────────────────────────

const AQI_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export async function fetchAqi(lat: number, lng: number): Promise<AqiResponse> {
  const key = `aqi:${lat.toFixed(4)},${lng.toFixed(4)}`;
  const cached = getCached<AqiResponse>(key);
  if (cached) return cached;

  const res = await fetch(`/api/aqi?lat=${lat}&lng=${lng}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `AQI fetch failed (${res.status})`);
  }
  const data: AqiResponse = await res.json();
  setCache(key, data, AQI_CACHE_TTL);
  return data;
}

// ─── AQI Search ─────────────────────────────────────────────────────────────

export async function searchAqi(query: string): Promise<AqiSearchResponse> {
  if (!query.trim()) return { results: [] };

  const key = `aqi-search:${query.toLowerCase()}`;
  const cached = getCached<AqiSearchResponse>(key);
  if (cached) return cached;

  const res = await fetch(`/api/aqi/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error(`AQI search failed (${res.status})`);
  }
  const data: AqiSearchResponse = await res.json();
  setCache(key, data, 5 * 60 * 1000); // 5 min cache
  return data;
}

// ─── Geocode ────────────────────────────────────────────────────────────────

const GEOCODE_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<GeocodeResponse> {
  const key = `geo:${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = getCached<GeocodeResponse>(key);
  if (cached) return cached;

  const res = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
  if (!res.ok) {
    throw new Error(`Geocode failed (${res.status})`);
  }
  const data: GeocodeResponse = await res.json();
  setCache(key, data, GEOCODE_CACHE_TTL);
  return data;
}

// ─── Hospitals ──────────────────────────────────────────────────────────────

const HOSPITAL_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function fetchNearbyHospitals(
  lat: number,
  lng: number,
  radiusMeters: number = 5000
): Promise<Hospital[]> {
  const key = `hospitals:${lat.toFixed(3)},${lng.toFixed(3)},${radiusMeters}`;
  const cached = getCached<Hospital[]>(key);
  if (cached) return cached;

  const res = await fetch(
    `/api/hospitals?lat=${lat}&lng=${lng}&radius=${radiusMeters}`
  );
  if (!res.ok) {
    throw new Error(`Hospital fetch failed (${res.status})`);
  }
  const data: Hospital[] = await res.json();
  setCache(key, data, HOSPITAL_CACHE_TTL);
  return data;
}
