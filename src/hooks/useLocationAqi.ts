'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentPosition, DEFAULT_LOCATION } from '@/lib/geo';
import { fetchAqi, reverseGeocode } from '@/lib/api-client';
import type { AqiResponse, LocationState, Pollutant, ForecastItem } from '@/lib/types';

const STORAGE_KEY = 'aerocost_last_location';
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

interface UseLocationAqiReturn {
  // Location
  location: LocationState | null;
  isLocating: boolean;

  // AQI data
  aqi: number | null;
  dominantPollutant: string | null;
  dominantPollutantValue: number | null;
  dominantPollutantUnit: string | null;
  station: { name: string; url: string } | null;
  minutesAgo: number | null;
  pollutants: Pollutant[];
  forecast: ForecastItem[];

  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  refetch: () => void;
  setManualLocation: (lat: number, lng: number) => void;
}

export function useLocationAqi(): UseLocationAqiReturn {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [aqiData, setAqiData] = useState<AqiResponse | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latRef = useRef<number>(DEFAULT_LOCATION.lat);
  const lngRef = useRef<number>(DEFAULT_LOCATION.lng);

  // Fetch AQI + geocode for given coordinates
  const fetchData = useCallback(async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch AQI and geocode in parallel
      const [aqiResult, geoResult] = await Promise.allSettled([
        fetchAqi(lat, lng),
        reverseGeocode(lat, lng),
      ]);

      if (aqiResult.status === 'fulfilled') {
        setAqiData(aqiResult.value);
      } else {
        setError(aqiResult.reason?.message || 'Failed to fetch AQI');
      }

      if (geoResult.status === 'fulfilled') {
        const geo = geoResult.value;
        const loc: LocationState = {
          lat,
          lng,
          city: geo.city,
          state: geo.state,
          displayName: geo.displayName,
        };
        setLocation(loc);

        // Persist for instant display on next visit
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
        } catch {
          // localStorage might be unavailable
        }
      } else {
        // Geocode failed but AQI might be fine — set basic location
        setLocation((prev) =>
          prev || { lat, lng, city: '', state: '', displayName: `${lat.toFixed(2)}, ${lng.toFixed(2)}` }
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load: GPS → fetch
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Try to load last-known location for instant display
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as LocationState;
          setLocation(parsed);
          latRef.current = parsed.lat;
          lngRef.current = parsed.lng;
        }
      } catch {
        // ignore
      }

      setIsLocating(true);
      const coords = await getCurrentPosition();
      if (cancelled) return;

      latRef.current = coords.lat;
      lngRef.current = coords.lng;
      setIsLocating(false);

      await fetchData(coords.lat, coords.lng);
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchData(latRef.current, lngRef.current);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  // Manual refetch
  const refetch = useCallback(() => {
    fetchData(latRef.current, lngRef.current);
  }, [fetchData]);

  // Set a manual location (from search page city selection)
  const setManualLocation = useCallback(
    (lat: number, lng: number) => {
      latRef.current = lat;
      lngRef.current = lng;
      fetchData(lat, lng);
    },
    [fetchData]
  );

  return {
    location,
    isLocating,

    aqi: aqiData?.aqi ?? null,
    dominantPollutant: aqiData?.dominantPollutant ?? null,
    dominantPollutantValue: aqiData?.dominantPollutantValue ?? null,
    dominantPollutantUnit: aqiData?.dominantPollutantUnit ?? null,
    station: aqiData?.station ?? null,
    minutesAgo: aqiData?.time?.minutesAgo ?? null,
    pollutants: aqiData?.pollutants ?? [],
    forecast: aqiData?.forecast ?? [],

    isLoading,
    error,

    refetch,
    setManualLocation,
  };
}
