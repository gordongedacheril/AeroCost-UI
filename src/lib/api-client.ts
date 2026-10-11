import { calculateCPCB_AQI } from './aqi-calculator';
import { Hospital } from '@/data/constants';

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
    
    const currentAQI = aqiData.current;
    const currentWeather = weatherData.current;
    
    // Calculate CPCB AQI
    const pm25 = currentAQI.pm2_5 || 0;
    const pm10 = currentAQI.pm10 || 0;
    const { aqi, dominant } = calculateCPCB_AQI(pm25, pm10);
    
    // Forecast (next 24 hours)
    const forecast = [];
    const nowHour = new Date().getHours();
    
    if (aqiData.hourly && aqiData.hourly.time) {
      for (let i = 0; i < 24; i += 4) { // Every 4 hours
        // Find index closest to current hour + i
        const targetDate = new Date();
        targetDate.setHours(nowHour + i, 0, 0, 0);
        
        // Find closest hour in response
        const timeIndex = aqiData.hourly.time.findIndex((t: string) => new Date(t) >= targetDate);
        if (timeIndex !== -1) {
          const fPm25 = aqiData.hourly.pm2_5[timeIndex];
          const fPm10 = aqiData.hourly.pm10[timeIndex];
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

// Free OSM Overpass API for Hospitals
export async function getNearbyHospitals(lat: number, lng: number, radius = 5000): Promise<Hospital[]> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lng});
        node["healthcare"~"hospital|clinic"](around:${radius},${lat},${lng});
      );
      out body;
      >;
      out skel qt;
    `;
    const res = await fetch(`https://overpass-api.de/api/interpreter`, {
      method: 'POST',
      body: query
    });
    
    const data = await res.json();
    
    // Map OSM nodes to Hospital interface
    return data.elements
      .filter((e: any) => e.tags && e.tags.name)
      .map((e: any) => {
        const type = (e.tags.amenity === 'clinic' || e.tags.healthcare === 'clinic') ? 'clinic' :
                     (e.tags.name.toLowerCase().includes('phc') || e.tags.name.toLowerCase().includes('primary')) ? 'phc' : 'hospital';
                     
        return {
          id: e.id.toString(),
          name: e.tags.name,
          type,
          lat: e.lat,
          lng: e.lon,
          distance: calculateDistance(lat, lng, e.lat, e.lon).toFixed(1) + ' km',
          address: e.tags['addr:full'] || e.tags['addr:street'] || 'Address unavailable',
          phone: e.tags['contact:phone'] || e.tags['phone'] || undefined,
          isVerified: !!e.tags['operator'], // treat operated facilities as verified
          hasEmergency: e.tags['emergency'] === 'yes',
          specialties: ['General Care']
        };
      })
      .slice(0, 20); // Limit to 20 results for UI performance
  } catch (error) {
    console.error("Hospitals fetch failed:", error);
    return [];
  }
}

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

// Aliases and adapters for subagent compatibility
import { AqiResponse } from './types';

export async function fetchAqi(lat: number, lng: number): Promise<AqiResponse> {
  const data = await getAirQualityAndWeather(lat, lng);
  if (!data) throw new Error("Failed to fetch AQI");
  
  // Find dominant pollutant value
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
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
    const data = await res.json();
    return {
      city: data.address?.city || data.address?.town || data.address?.county || '',
      state: data.address?.state || '',
      displayName: data.display_name || ''
    };
  } catch (error) {
    return { city: '', state: '', displayName: `${lat.toFixed(2)}, ${lng.toFixed(2)}` };
  }
}

export const fetchNearbyHospitals = getNearbyHospitals;
