import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/geocode?lat=28.64&lng=77.31
 * Reverse geocodes coordinates via BigDataCloud.
 * Returns city, state, district, displayName.
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

  try {
    // BigDataCloud is free, doesn't block Vercel IPs, and requires no API key for this basic endpoint
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`;

    const res = await fetch(url, {
      next: { revalidate: 86400 }, // Cache 24 hours
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Geocode error (${res.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();

    const city = data.city || data.locality || '';
    const state = data.principalSubdivision || '';
    const district = '';

    // Build a clean display name (e.g., "Phagwara, Punjab")
    const displayParts = [city, state].filter(Boolean);
    const displayName = displayParts.length > 0
      ? displayParts.join(', ')
      : data.countryName || 'Unknown Location';

    return NextResponse.json({
      city,
      state,
      district,
      displayName,
      country: data.countryName || 'India',
    });
  } catch (err) {
    console.error('Geocode error:', err);
    return NextResponse.json(
      { error: 'Failed to reverse geocode' },
      { status: 502 }
    );
  }
}

