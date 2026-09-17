import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/geocode?lat=28.64&lng=77.31
 * Reverse geocodes coordinates via Nominatim (OpenStreetMap).
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
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2&accept-language=en`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'AeroCost/1.0 (school-project; contact: aerocost@example.com)',
      },
      next: { revalidate: 1800 }, // Cache 30 min — Nominatim rate limit is 1 req/sec
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Nominatim error (${res.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error },
        { status: 404 }
      );
    }

    const address = data.address || {};

    // Nominatim returns different fields depending on location precision
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.suburb ||
      address.county ||
      '';

    const state = address.state || address.region || '';
    const district = address.state_district || address.county || '';

    // Build a clean display name (e.g., "Anand Vihar, New Delhi")
    const suburb = address.suburb || address.neighbourhood || '';
    const displayParts = [suburb, city].filter(Boolean);
    const displayName = displayParts.length > 0
      ? displayParts.join(', ')
      : data.display_name?.split(',').slice(0, 2).join(',') || 'Unknown';

    return NextResponse.json({
      city,
      state,
      district,
      displayName,
      country: address.country || 'India',
    });
  } catch (err) {
    console.error('Nominatim error:', err);
    return NextResponse.json(
      { error: 'Failed to reverse geocode' },
      { status: 502 }
    );
  }
}
