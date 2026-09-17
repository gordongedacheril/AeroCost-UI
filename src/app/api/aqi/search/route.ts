import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/aqi/search?q=Delhi
 * Proxies to WAQI's search API.
 * Returns matching AQI monitoring stations.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || !query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const token = process.env.WAQI_API_TOKEN;
  if (!token || token === 'your_token_here') {
    return NextResponse.json(
      { error: 'WAQI API token not configured' },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.waqi.info/search/?keyword=${encodeURIComponent(query)}&token=${token}`;
    const res = await fetch(url, { next: { revalidate: 300 } }); // Cache 5 min
    const json = await res.json();

    if (json.status !== 'ok') {
      return NextResponse.json(
        { error: json.data || 'WAQI search error' },
        { status: 502 }
      );
    }

    const results = (json.data || []).map(
      (item: {
        uid: number;
        aqi: string;
        station: { name: string; geo: [number, number]; url: string };
        time: { stime: string };
      }) => ({
        uid: item.uid,
        name: item.station?.name || 'Unknown',
        aqi: item.aqi === '-' ? null : parseInt(item.aqi, 10),
        station: {
          lat: item.station?.geo?.[0] ?? 0,
          lng: item.station?.geo?.[1] ?? 0,
        },
        time: item.time?.stime || '',
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    console.error('WAQI search error:', err);
    return NextResponse.json(
      { error: 'Failed to search AQI stations' },
      { status: 502 }
    );
  }
}
