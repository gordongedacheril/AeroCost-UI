import { NextRequest, NextResponse } from 'next/server';
import { fetchMultiStreamHospitals } from '@/lib/multi-stream-hospitals';

/**
 * GET /api/hospitals?lat=31.224&lng=75.770&radius=5000
 * Multi-stream health facilities aggregator:
 * 1. Photon OpenStreetMap Global Index
 * 2. Overpass API with multi-mirror automatic rotation
 * 3. Nominatim OSM Bounded Viewbox Stream
 * 4. Pre-cached All-India Master Hospital Registry (National Health Portal + OSM)
 * 100% Free, keyless open-source APIs.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lngStr = searchParams.get('lng');
  const radiusStr = searchParams.get('radius') || '5000';

  if (!latStr || !lngStr) {
    return NextResponse.json(
      { error: 'Missing lat/lng parameters' },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);
  const radius = parseInt(radiusStr, 10) || 5000;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'Invalid lat/lng numbers' },
      { status: 400 }
    );
  }

  try {
    const result = await fetchMultiStreamHospitals(lat, lng, radius);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Multi-stream hospital fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nearby hospitals', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
