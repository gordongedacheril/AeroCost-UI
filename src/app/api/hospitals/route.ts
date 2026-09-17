import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/hospitals?lat=28.64&lng=77.31&radius=5000
 * Queries OpenStreetMap via the Overpass API for nearby health facilities.
 * No API key needed — 100% free, open data.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '5000'; // meters

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing lat/lng parameters' },
      { status: 400 }
    );
  }

  // Overpass QL query for health facilities
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      node["amenity"="doctors"](around:${radius},${lat},${lng});
      node["amenity"="pharmacy"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="clinic"](around:${radius},${lat},${lng});
    );
    out center body;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 1800 }, // Cache 30 min
    });

    if (!res.ok) {
      // Overpass returns 429 if rate-limited
      if (res.status === 429) {
        return NextResponse.json(
          { error: 'Overpass API rate limited. Try again in a minute.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Overpass API error (${res.status})` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Map OSM elements to our Hospital interface
    const hospitals = (data.elements || [])
      .map((el: OverpassElement, index: number) => {
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;

        if (!elLat || !elLng) return null;

        const tags = el.tags || {};
        const name = tags.name || tags['name:en'] || inferName(tags);
        if (!name) return null; // Skip unnamed facilities

        const distKm = haversineDistance(userLat, userLng, elLat, elLng);
        const type = mapOsmType(tags.amenity, tags);

        return {
          id: `osm-${el.id}`,
          name,
          type,
          lat: elLat,
          lng: elLng,
          distance: formatDist(distKm),
          distanceKm: Math.round(distKm * 100) / 100,
          address: buildAddress(tags),
          phone: tags.phone || tags['contact:phone'] || undefined,
          isVerified: true, // OSM data is community-verified
          hasEmergency: tags.emergency === 'yes' || type === 'hospital',
          specialties: extractSpecialties(tags),
          source: 'osm' as const,
        };
      })
      .filter(Boolean)
      .sort((a: { distanceKm: number }, b: { distanceKm: number }) => a.distanceKm - b.distanceKm);

    return NextResponse.json(hospitals);
  } catch (err) {
    console.error('Overpass API error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch nearby hospitals' },
      { status: 502 }
    );
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface OverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function mapOsmType(amenity: string | undefined, tags: Record<string, string>): 'hospital' | 'phc' | 'clinic' | 'pharmacy' | 'community' {
  if (amenity === 'pharmacy') return 'pharmacy';
  if (amenity === 'doctors' || amenity === 'clinic') {
    // Check if it's a government health centre (PHC/CHC)
    const name = (tags.name || '').toLowerCase();
    if (
      name.includes('phc') ||
      name.includes('primary health') ||
      name.includes('community health') ||
      name.includes('chc') ||
      name.includes('dispensary') ||
      tags.operator_type === 'government'
    ) {
      return 'phc';
    }
    return 'clinic';
  }
  if (amenity === 'hospital') return 'hospital';
  return 'clinic';
}

function inferName(tags: Record<string, string>): string {
  return (
    tags.name ||
    tags['name:en'] ||
    tags.operator ||
    tags.brand ||
    ''
  );
}

function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:street'],
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city'],
    tags['addr:postcode'],
  ].filter(Boolean);
  return parts.join(', ') || tags['addr:full'] || '';
}

function extractSpecialties(tags: Record<string, string>): string[] | undefined {
  const specialties: string[] = [];
  if (tags.healthcare === 'hospital' || tags.amenity === 'hospital') {
    if (tags.emergency === 'yes') specialties.push('Emergency');
    if (tags.beds) specialties.push(`${tags.beds} beds`);
  }
  if (tags['healthcare:speciality']) {
    specialties.push(
      ...tags['healthcare:speciality'].split(';').map((s) => s.trim())
    );
  }
  return specialties.length > 0 ? specialties : undefined;
}
