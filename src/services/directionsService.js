import axios from 'axios';
import { getCache, setCache } from './cacheService.js';

// Generate cache key
function keyStr(pickup_lat, pickup_lng, drop_lat, drop_lng) {
  return `route:${pickup_lat.toFixed(5)},${pickup_lng.toFixed(5)}->${drop_lat.toFixed(5)},${drop_lng.toFixed(5)}`;
}

// Main function (same name as before)
export async function getOrFetchRoute({ pickup_lat, pickup_lng, drop_lat, drop_lng }) {
  const key = keyStr(pickup_lat, pickup_lng, drop_lat, drop_lng);

  // 1. Try cache first
  const cached = await getCache(key);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.warn('Failed to parse cached route:', err);
    }
  }

  // 2. Build OSRM API URL
  const url = `https://router.project-osrm.org/route/v1/driving/${pickup_lng},${pickup_lat};${drop_lng},${drop_lat}?overview=full&geometries=polyline`;

  // 3. Call OSRM API
  let resp;
  try {
    resp = await axios.get(url);
  } catch (err) {
    console.error('OSRM request failed:', err.message);
    throw new Error('Failed to fetch route from OSRM');
  }

  // 4. Validate response
  if (!resp.data || !Array.isArray(resp.data.routes) || resp.data.routes.length === 0) {
    console.error('Invalid OSRM response:', resp.data);
    throw new Error('No route found from OSRM');
  }

  const route = resp.data.routes[0];

  // 5. Build result object
  const result = {
    polyline: route.geometry || null,   // encoded polyline
    distanceM: route.distance ?? null,  // meters
    durationS: route.duration ?? null   // seconds
  };

  // 6. Save to cache
  try {
    await setCache(key, JSON.stringify(result));
  } catch (err) {
    console.warn('Failed to cache route:', err.message);
  }

  return result;
}