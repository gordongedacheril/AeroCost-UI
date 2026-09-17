import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/aqi?lat=28.64&lng=77.31
 * Proxies to WAQI's geo-based feed API.
 * Returns normalized AQI data matching AqiResponse interface.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing lat/lng parameters' },
      { status: 400 }
    );
  }

  const token = process.env.WAQI_API_TOKEN;
  if (!token || token === 'your_token_here') {
    return NextResponse.json(
      {
        error:
          'WAQI API token not configured. Get one free at https://aqicn.org/data-platform/token/ and add it to .env.local',
      },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${token}`;
    const res = await fetch(url, { next: { revalidate: 600 } }); // Cache 10 min
    const json = await res.json();

    if (json.status !== 'ok') {
      return NextResponse.json(
        { error: json.data || 'WAQI returned an error' },
        { status: 502 }
      );
    }

    const data = json.data;

    // Map WAQI's iaqi (individual AQI) to our pollutant format
    const pollutantMap: Record<string, { label: string; unit: string; safeLimit: number }> = {
      pm25: { label: 'PM2.5', unit: 'µg/m³', safeLimit: 60 },
      pm10: { label: 'PM10', unit: 'µg/m³', safeLimit: 100 },
      no2: { label: 'NO2', unit: 'µg/m³', safeLimit: 80 },
      so2: { label: 'SO2', unit: 'µg/m³', safeLimit: 80 },
      co: { label: 'CO', unit: 'mg/m³', safeLimit: 4 },
      o3: { label: 'O3', unit: 'µg/m³', safeLimit: 100 },
    };

    const pollutants = Object.entries(data.iaqi || {})
      .filter(([key]) => key in pollutantMap)
      .map(([key, val]) => {
        const info = pollutantMap[key];
        const v = (val as { v: number }).v;
        let status = 'Safe';
        let statusColor = 'aqi-good';
        if (v > info.safeLimit * 1.5) {
          status = 'Above Limit';
          statusColor = 'aqi-poor';
        } else if (v > info.safeLimit) {
          status = 'Elevated';
          statusColor = 'aqi-moderate';
        } else if (v > info.safeLimit * 0.75) {
          status = 'Permissible';
          statusColor = 'aqi-satisfactory';
        } else {
          status = 'Optimal';
          statusColor = 'aqi-good';
        }
        return {
          name: info.label,
          value: v,
          unit: info.unit,
          status,
          statusColor,
        };
      })
      .sort((a, b) => {
        // Put PM2.5 and PM10 first
        const order = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3'];
        return order.indexOf(a.name) - order.indexOf(b.name);
      });

    // Build forecast from WAQI's daily forecast data (if available)
    const forecast = buildForecast(data);

    // Identify dominant pollutant
    const dominantKey = data.dominentpol || 'pm25'; // WAQI spells it "dominentpol"
    const dominantInfo = pollutantMap[dominantKey] || { label: dominantKey.toUpperCase(), unit: 'µg/m³' };
    const dominantValue = data.iaqi?.[dominantKey]?.v ?? data.aqi;

    // Calculate minutes since last update
    const updatedAt = new Date(data.time?.iso || Date.now());
    const minutesAgo = Math.round((Date.now() - updatedAt.getTime()) / 60000);

    const response = {
      aqi: data.aqi,
      dominantPollutant: dominantInfo.label,
      dominantPollutantValue: dominantValue,
      dominantPollutantUnit: dominantInfo.unit,
      station: {
        name: data.city?.name || 'Unknown Station',
        url: data.city?.url || '',
      },
      time: {
        iso: data.time?.iso || new Date().toISOString(),
        minutesAgo: Math.max(0, minutesAgo),
      },
      pollutants,
      forecast,
      attribution: (data.attributions || []).map(
        (a: { name: string; url: string }) => ({
          name: a.name,
          url: a.url,
        })
      ),
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('WAQI API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch AQI data' },
      { status: 502 }
    );
  }
}

/**
 * Build hourly-style forecast from WAQI's daily forecast data.
 * WAQI provides daily min/avg/max for pm25, pm10, o3 etc.
 * We synthesize hourly-ish entries from these + the current AQI for the bar chart.
 */
function buildForecast(data: Record<string, unknown>): { time: string; aqi: number; isNow?: boolean }[] {
  const currentAqi = (data as { aqi: number }).aqi;
  const forecastData = (data as { forecast?: { daily?: Record<string, { day: string; avg: number; min: number; max: number }[]> } }).forecast?.daily;

  if (!forecastData?.pm25 || forecastData.pm25.length === 0) {
    // No forecast available — return a simple spread around current value
    const hours = ['6 AM', 'Now', '12 PM', '3 PM', '6 PM', '9 PM', '12 AM'];
    const jitter = [-15, 0, -30, -40, 10, 30, 50];
    return hours.map((time, i) => ({
      time,
      aqi: Math.max(10, Math.round(currentAqi + jitter[i])),
      ...(time === 'Now' ? { isNow: true } : {}),
    }));
  }

  // Use pm25 forecast days — show today + next days
  const entries: { time: string; aqi: number; isNow?: boolean }[] = [];
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Add current "Now" entry
  entries.push({ time: 'Now', aqi: currentAqi, isNow: true });

  // Add forecast days
  for (const day of forecastData.pm25.slice(0, 6)) {
    if (day.day === todayStr) continue; // Skip today, we have "Now"
    const date = new Date(day.day);
    const label = date.toLocaleDateString('en-IN', { weekday: 'short' });
    entries.push({ time: label, aqi: Math.round(day.avg) });
  }

  return entries.slice(0, 7); // Max 7 bars
}
