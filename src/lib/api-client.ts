import { calculateCPCB_AQI } from './aqi-calculator';
import { Hospital, AqiResponse } from '@/lib/types';
import { fetchMultiStreamHospitals, MultiStreamResult } from './multi-stream-hospitals';

// Free Geocoding API (Open-Meteo)
export async function searchCities(query: string) {
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&format=json`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error("Geocoding failed:", error);
    return [];
  }
}

// Free Air Quality & Weather API (Open-Meteo)
export async function getAirQualityAndWeather(lat: number, lng: number) {
  try {
    // Fetch Air Quality
    const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone&hourly=pm10,pm2_5&timezone=auto`);
    const aqiData = await aqiRes.json();
    
    // Fetch Weather
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`);
    const weatherData = await weatherRes.json();
    
    const currentAQI = aqiData.current || {};
    const currentWeather = weatherData.current || {};
    
    // Calculate CPCB AQI
    const pm25 = currentAQI.pm2_5 || 0;
    const pm10 = currentAQI.pm10 || 0;
    const { aqi, dominant } = calculateCPCB_AQI(pm25, pm10);
    
    // Forecast (next 24 hours)
    const forecast = [];
    const nowHour = new Date().getHours();
    
    if (aqiData.hourly && aqiData.hourly.time) {
      for (let i = 0; i < 24; i += 4) { // Every 4 hours
        const targetDate = new Date();
        targetDate.setHours(nowHour + i, 0, 0, 0);
        
        const timeIndex = aqiData.hourly.time.findIndex((t: string) => new Date(t) >= targetDate);
        if (timeIndex !== -1) {
          const fPm25 = aqiData.hourly.pm2_5[timeIndex] || 0;
          const fPm10 = aqiData.hourly.pm10[timeIndex] || 0;
          const fAqi = calculateCPCB_AQI(fPm25, fPm10).aqi;
          const timeStr = targetDate.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
          
          forecast.push({
            time: i === 0 ? 'Now' : timeStr,
            aqi: fAqi,
            isNow: i === 0
          });
        }
      }
    }
    
    return {
      aqi,
      dominant,
      pollutants: [
        { name: 'PM2.5', value: pm25, unit: 'µg/m³' },
        { name: 'PM10', value: pm10, unit: 'µg/m³' },
        { name: 'NO2', value: currentAQI.nitrogen_dioxide || 0, unit: 'µg/m³' },
        { name: 'SO2', value: currentAQI.sulphur_dioxide || 0, unit: 'µg/m³' },
        { name: 'CO', value: currentAQI.carbon_monoxide || 0, unit: 'µg/m³' },
        { name: 'O3', value: currentAQI.ozone || 0, unit: 'µg/m³' },
      ],
      weather: {
        temp: currentWeather.temperature_2m || 0,
        humidity: currentWeather.relative_humidity_2m || 0,
        wind: currentWeather.wind_speed_10m || 0
      },
      forecast
    };
  } catch (error) {
    console.error("AQI/Weather fetch failed:", error);
    return null;
  }
}

// ─── Free Multi-Stream Nearby Hospitals Fetcher ──────────────────────────────
export async function getNearbyHospitals(
  lat: number,
  lng: number,
  radius = 5000
): Promise<Hospital[]> {
  const result = await fetchNearbyHospitalsMultiStream(lat, lng, radius);
  return result.hospitals;
}

export async function fetchNearbyHospitalsMultiStream(
  lat: number,
  lng: number,
  radius = 5000
): Promise<MultiStreamResult> {
  // 1. Try Next.js server-side endpoint first (faster, avoids client CORS/rate limits)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/hospitals?lat=${lat}&lng=${lng}&radius=${radius}`);
      if (res.ok) {
        const data = await res.json();
        if (data.hospitals && Array.isArray(data.hospitals)) {
          return data as MultiStreamResult;
        }
        if (Array.isArray(data)) {
          return {
            hospitals: data,
            totalFound: data.length,
            effectiveRadiusKm: radius / 1000,
            sourcesUsed: ['OpenStreetMap Multi-Stream'],
          };
        }
      }
    } catch (e) {
      console.warn('API route /api/hospitals unreachable, falling back to direct multi-stream:', e);
    }
  }

  // 2. Direct client fallback via multi-stream engine (Photon, Overpass, Nominatim, Pre-cached Registry)
  try {
    return await fetchMultiStreamHospitals(lat, lng, radius);
  } catch (error) {
    console.error('Multi-stream hospital fetch failed completely:', error);
    return {
      hospitals: [],
      totalFound: 0,
      effectiveRadiusKm: radius / 1000,
      sourcesUsed: [],
    };
  }
}

export const fetchNearbyHospitals = getNearbyHospitals;

export async function fetchAqi(lat: number, lng: number): Promise<AqiResponse> {
  const data = await getAirQualityAndWeather(lat, lng);
  if (!data) throw new Error("Failed to fetch AQI");
  
  const dominant = data.pollutants.find(p => p.name === data.dominant);
  
  return {
    aqi: data.aqi,
    dominantPollutant: data.dominant,
    dominantPollutantValue: dominant ? dominant.value : 0,
    dominantPollutantUnit: dominant ? dominant.unit : '',
    station: { name: 'Open-Meteo', url: 'https://open-meteo.com' },
    time: { minutesAgo: 0 },
    pollutants: data.pollutants,
    forecast: data.forecast
  };
}

export async function reverseGeocode(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`, {
      headers: { 'User-Agent': 'AeroCost-App/1.0' },
    });
    const data = await res.json();
    return {
      city: data.address?.city || data.address?.town || data.address?.county || data.address?.state_district || '',
      state: data.address?.state || '',
      displayName: data.display_name || ''
    };
  } catch (error) {
    return { city: '', state: '', displayName: `${lat.toFixed(2)}, ${lng.toFixed(2)}` };
  }
}
