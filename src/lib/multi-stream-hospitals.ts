import { Hospital } from '@/lib/types';
import { PRECACHED_INDIA_HOSPITALS } from '@/data/india-hospitals';

export interface MultiStreamResult {
  hospitals: Hospital[];
  totalFound: number;
  effectiveRadiusKm: number;
  sourcesUsed: string[];
}

// In-memory cache for fast repeated lookups (server & client runtime)
const MEMORY_CACHE = new Map<string, { timestamp: number; data: MultiStreamResult }>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Multi-Stream Free Hospital Aggregator for India
 * Combines 4 100% free streams:
 * 1. Photon API (Komoot OSM Global Index - high availability, zero key)
 * 2. Overpass API (OSM Turbo with multi-mirror automatic rotation)
 * 3. Nominatim OSM Bounded Viewbox Stream
 * 4. Pre-cached All-India Master Registry (NHP & State Health Directories)
 */
export async function fetchMultiStreamHospitals(
  lat: number,
  lng: number,
  requestedRadiusMeters: number = 5000
): Promise<MultiStreamResult> {
  const cacheKey = `${lat.toFixed(3)}_${lng.toFixed(3)}_${requestedRadiusMeters}`;
  
  // Check in-memory cache
  const cached = MEMORY_CACHE.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // Check client localStorage cache if in browser
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(`aerocost_hospitals_${cacheKey}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          MEMORY_CACHE.set(cacheKey, { timestamp: parsed.timestamp, data: parsed.data });
          return parsed.data;
        }
      }
    } catch {
      // ignore
    }
  }

  let radiusKm = requestedRadiusMeters / 1000;
  let allCandidates: Hospital[] = [];
  const sourcesUsed: string[] = [];

  // Stream 4: Always add pre-cached master registry candidates immediately (zero latency)
  const precached = getPrecachedHospitals(lat, lng, radiusKm);
  if (precached.length > 0) {
    allCandidates.push(...precached);
    sourcesUsed.push('India Health Registry');
  }

  // Run external free streams in parallel with timeouts
  const streamPromises: Promise<void>[] = [];

  // ─── STREAM 1: Photon OSM Komoot API ───────────────────────────────────────
  streamPromises.push(
    (async () => {
      try {
        const photonResults = await fetchPhotonHospitals(lat, lng, radiusKm);
        if (photonResults.length > 0) {
          allCandidates.push(...photonResults);
          sourcesUsed.push('Photon OSM');
        }
      } catch (err) {
        console.warn('Photon stream warning:', err);
      }
    })()
  );

  // ─── STREAM 2: Overpass API with Mirror Failover ───────────────────────────
  streamPromises.push(
    (async () => {
      try {
        const overpassResults = await fetchOverpassWithMirrors(lat, lng, radiusKm * 1000);
        if (overpassResults.length > 0) {
          allCandidates.push(...overpassResults);
          sourcesUsed.push('Overpass OSM');
        }
      } catch (err) {
        console.warn('Overpass stream warning:', err);
      }
    })()
  );

  // ─── STREAM 3: Nominatim OSM Bounded Search ───────────────────────────────
  streamPromises.push(
    (async () => {
      try {
        const nomResults = await fetchNominatimHospitals(lat, lng, radiusKm);
        if (nomResults.length > 0) {
          allCandidates.push(...nomResults);
          sourcesUsed.push('Nominatim OSM');
        }
      } catch (err) {
        console.warn('Nominatim stream warning:', err);
      }
    })()
  );

  // Wait for all external streams to finish or settle
  await Promise.allSettled(streamPromises);

  // Initial deduplication & distance filtering
  let deduplicated = deduplicateAndSortHospitals(allCandidates, lat, lng, radiusKm);

  // Adaptive Radius Expansion:
  // If fewer than 3 hospitals are found within standard radius (e.g. 5km in smaller towns like Phagwara),
  // automatically expand radius to 12 km and re-gather from pre-cache and Photon!
  if (deduplicated.length < 3 && radiusKm < 15) {
    radiusKm = 12;
    const expandedPrecache = getPrecachedHospitals(lat, lng, radiusKm);
    allCandidates.push(...expandedPrecache);

    try {
      const expandedPhoton = await fetchPhotonHospitals(lat, lng, radiusKm);
      allCandidates.push(...expandedPhoton);
    } catch {
      // ignore
    }

    deduplicated = deduplicateAndSortHospitals(allCandidates, lat, lng, radiusKm);
  }

  const result: MultiStreamResult = {
    hospitals: deduplicated,
    totalFound: deduplicated.length,
    effectiveRadiusKm: radiusKm,
    sourcesUsed: Array.from(new Set(sourcesUsed)),
  };

  // Cache in memory
  MEMORY_CACHE.set(cacheKey, { timestamp: Date.now(), data: result });

  // Cache in client storage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(
        `aerocost_hospitals_${cacheKey}`,
        JSON.stringify({ timestamp: Date.now(), data: result })
      );
    } catch {
      // ignore
    }
  }

  return result;
}

// ─── STREAM 1: Photon Komoot OSM Stream ──────────────────────────────────────
async function fetchPhotonHospitals(lat: number, lng: number, radiusKm: number): Promise<Hospital[]> {
  const url = `https://photon.komoot.io/api/?q=hospital&lat=${lat}&lon=${lng}&limit=35`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = await res.json();
    const list: Hospital[] = [];

    for (const f of data.features || []) {
      const props = f.properties || {};
      const [lon, la] = f.geometry?.coordinates || [];
      if (!la || !lon) continue;

      const name = props.name;
      if (!name) continue;

      // Filter out non-hospital names that matched "hospital" in street or park names
      const osmVal = (props.osm_value || '').toLowerCase();
      if (['tree_row', 'school', 'park', 'residential', 'road'].includes(osmVal)) {
        continue;
      }

      const dist = haversineDistance(lat, lng, la, lon);
      if (dist > radiusKm * 1.3) continue; // within radius cushion

      const type = mapTypeFromName(name, osmVal);

      list.push({
        id: `photon-${props.osm_id || Math.random().toString(36).substr(2, 9)}`,
        name: cleanHospitalName(name),
        type,
        lat: la,
        lng: lon,
        distance: formatDist(dist),
        address: [props.street, props.district || props.city, props.state, props.postcode].filter(Boolean).join(', ') || 'Address via OpenStreetMap',
        isVerified: true,
        hasEmergency: isEmergencyLikely(name, type),
        specialties: extractSpecialtiesFromName(name),
      });
    }

    return list;
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

// ─── STREAM 2: Overpass Multi-Mirror Stream ──────────────────────────────────
async function fetchOverpassWithMirrors(lat: number, lng: number, radiusMeters: number): Promise<Hospital[]> {
  const overpassQuery = `[out:json][timeout:12];(nwr["amenity"~"hospital|clinic|doctors|pharmacy|health_post|dispensary"](around:${radiusMeters},${lat},${lng});nwr["healthcare"~"hospital|clinic|doctor|centre"](around:${radiusMeters},${lat},${lng}););out center 40;`;

  const mirrors = [
    'https://overpass-api.de/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ];

  for (const mirror of mirrors) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

    try {
      const res = await fetch(mirror, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'AeroCost-Health-Utility/1.0',
        },
        body: 'data=' + encodeURIComponent(overpassQuery),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!res.ok) continue;

      const data = await res.json();
      const list: Hospital[] = [];

      for (const el of data.elements || []) {
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;
        if (!elLat || !elLng) continue;

        const tags = el.tags || {};
        const name = tags.name || tags['name:en'] || tags.operator;
        if (!name) continue;

        const dist = haversineDistance(lat, lng, elLat, elLng);
        const type = tags.amenity === 'pharmacy' ? 'pharmacy'
                   : (tags.amenity === 'clinic' || tags.amenity === 'doctors' || name.toLowerCase().includes('clinic') || name.toLowerCase().includes('phc')) ? 'clinic'
                   : 'hospital';

        list.push({
          id: `osm-${el.id}`,
          name: cleanHospitalName(name),
          type,
          lat: elLat,
          lng: elLng,
          distance: formatDist(dist),
          address: [tags['addr:street'], tags['addr:city'], tags['addr:postcode']].filter(Boolean).join(', ') || tags['addr:full'] || 'OpenStreetMap Verified Node',
          phone: tags.phone || tags['contact:phone'] || undefined,
          isVerified: true,
          hasEmergency: tags.emergency === 'yes' || type === 'hospital',
          specialties: extractSpecialtiesFromName(name),
        });
      }

      if (list.length > 0) return list;
    } catch {
      clearTimeout(timeoutId);
      continue;
    }
  }

  return [];
}

// ─── STREAM 3: Nominatim Bounded Viewbox Stream ──────────────────────────────
async function fetchNominatimHospitals(lat: number, lng: number, radiusKm: number): Promise<Hospital[]> {
  const delta = (radiusKm / 111) * 1.1; // ~1 deg is 111km
  const left = lng - delta;
  const top = lat + delta;
  const right = lng + delta;
  const bottom = lat - delta;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${left},${top},${right},${bottom}&bounded=1&limit=15`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AeroCost-India/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = await res.json();
    const list: Hospital[] = [];

    for (const d of data || []) {
      const dLat = parseFloat(d.lat);
      const dLng = parseFloat(d.lon);
      if (isNaN(dLat) || isNaN(dLng)) continue;

      const name = d.display_name?.split(',')[0];
      if (!name || !isMedicalName(name)) continue;

      const dist = haversineDistance(lat, lng, dLat, dLng);
      if (dist > radiusKm * 1.2) continue;

      list.push({
        id: `nom-${d.place_id || Math.random().toString(36).substr(2, 9)}`,
        name: cleanHospitalName(name),
        type: name.toLowerCase().includes('clinic') ? 'clinic' : 'hospital',
        lat: dLat,
        lng: dLng,
        distance: formatDist(dist),
        address: d.display_name,
        isVerified: true,
        hasEmergency: true,
        specialties: ['General OPD', 'Emergency Care'],
      });
    }

    return list;
  } catch {
    clearTimeout(timeoutId);
    return [];
  }
}

// ─── STREAM 4: Pre-cached Master Registry Query ──────────────────────────────
function getPrecachedHospitals(lat: number, lng: number, radiusKm: number): Hospital[] {
  return PRECACHED_INDIA_HOSPITALS
    .map((h) => {
      const dist = haversineDistance(lat, lng, h.lat, h.lng);
      return {
        ...h,
        distance: formatDist(dist),
        _rawDist: dist,
      };
    })
    .filter((h) => (h as any)._rawDist <= radiusKm * 1.25)
    .map(({ _rawDist, ...h }) => h as Hospital);
}

// ─── Deduplication & Merging Engine ──────────────────────────────────────────
export function deduplicateAndSortHospitals(
  candidates: Hospital[],
  userLat: number,
  userLng: number,
  maxRadiusKm: number
): Hospital[] {
  const merged: Hospital[] = [];

  for (const candidate of candidates) {
    const dist = haversineDistance(userLat, userLng, candidate.lat, candidate.lng);
    if (dist > maxRadiusKm * 1.3) continue; // Outside boundary

    // Check if duplicate exists within 150m with similar name or exact coordinate
    const existingIndex = merged.findIndex((m) => {
      const pointDist = haversineDistance(m.lat, m.lng, candidate.lat, candidate.lng);

      // Same location within 60 meters (same building / campus)
      if (pointDist < 0.06) return true;

      const normA = normalizeName(m.name);
      const normB = normalizeName(candidate.name);

      // Within 250m with clearly matching name
      if (pointDist < 0.25) {
        if (normA && normB && normA.length >= 4 && normB.length >= 4) {
          if (normA === normB || normA.includes(normB) || normB.includes(normA)) {
            return true;
          }
        }
      }

      return false;
    });

    if (existingIndex >= 0) {
      // Merge with existing
      const existing = merged[existingIndex];
      // Prefer longer, more descriptive name
      const preferredName = candidate.name.length > existing.name.length ? candidate.name : existing.name;
      // Prefer available phone
      const phone = existing.phone || candidate.phone;
      // Prefer richer address
      const address = (existing.address && existing.address.length > (candidate.address?.length || 0))
        ? existing.address
        : candidate.address;
      // Merge specialties
      const specialties = Array.from(
        new Set([...(existing.specialties || []), ...(candidate.specialties || [])])
      );

      merged[existingIndex] = {
        ...existing,
        name: preferredName,
        phone,
        address,
        hasEmergency: existing.hasEmergency || candidate.hasEmergency,
        specialties: specialties.length > 0 ? specialties : undefined,
      };
    } else {
      merged.push({
        ...candidate,
        distance: formatDist(dist),
      });
    }
  }

  // Sort by proximity ascending
  return merged.sort((a, b) => {
    const distA = haversineDistance(userLat, userLng, a.lat, a.lng);
    const distB = haversineDistance(userLat, userLng, b.lat, b.lng);
    return distA - distB;
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function normalizeName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\b(hospital|clinic|pvt|ltd|centre|center|care|dr|doctor|shri|general|multi|speciality)\b/g, '')
    .trim();
}

function cleanHospitalName(name: string): string {
  let cleaned = name.trim();
  // Capitalize if all lowercase
  if (cleaned === cleaned.toLowerCase()) {
    cleaned = cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return cleaned;
}

function mapTypeFromName(name: string, osmVal: string): 'hospital' | 'phc' | 'clinic' | 'pharmacy' | 'community' {
  const n = name.toLowerCase();
  if (n.includes('pharmacy') || n.includes('chemist') || osmVal === 'pharmacy') return 'pharmacy';
  if (n.includes('phc') || n.includes('primary health') || n.includes('dispensary')) return 'phc';
  if (n.includes('clinic') || n.includes('eye care') || n.includes('dental') || osmVal === 'clinic' || osmVal === 'doctors') return 'clinic';
  return 'hospital';
}

function isMedicalName(name: string): boolean {
  const n = name.toLowerCase();
  const keywords = [
    'hospital', 'clinic', 'dispensary', 'health', 'care', 'medical', 'eye', 'child',
    'maternity', 'doctor', 'arogya', 'nursing', 'blood bank', 'heart', 'dental', 'phc',
    'chc', 'sansthan', 'trauma', 'icu', 'physio', 'surgeon', 'ayurved', 'homeo', 'pharma', 'chemist'
  ];
  return keywords.some((k) => n.includes(k));
}

function isEmergencyLikely(name: string, type: string): boolean {
  const n = name.toLowerCase();
  if (n.includes('civil') || n.includes('general') || n.includes('mission') || n.includes('medical college') || n.includes('aiims')) return true;
  return type === 'hospital';
}

function extractSpecialtiesFromName(name: string): string[] {
  const n = name.toLowerCase();
  const specs: string[] = [];
  if (n.includes('child') || n.includes('pediatric')) specs.push('Pediatrics');
  if (n.includes('heart') || n.includes('cardiac')) specs.push('Cardiology');
  if (n.includes('eye') || n.includes('vision') || n.includes('retina')) specs.push('Ophthalmology');
  if (n.includes('maternity') || n.includes('women') || n.includes('mother')) specs.push('Maternity');
  if (n.includes('chest') || n.includes('pulmon') || n.includes('asthma')) specs.push('Pulmonology');
  if (n.includes('civil') || n.includes('aiims') || n.includes('medical college')) {
    specs.push('Emergency ICU', 'Oxygen Plant', 'Pulmonology');
  }
  if (specs.length === 0) specs.push('General Medicine', 'Outpatient OPD');
  return specs;
}
