import { decodePolyline } from '../utils/polyline.js';
import { pathLengthM, overlapPercent, haversineM } from '../utils/geo.js';

const TIME_WINDOW_MIN = 30;       // ±30 min
const MAX_DEVIATION_PCT = 15;     // ≤15% deviation allowed
const MIN_OVERLAP_PCT = 15;       // ≥15% overlap required

export async function findMatchesForTrip(base, candidates) {
  const basePts = decodePolyline(base.routePolyline);
  const baseLenM = pathLengthM(basePts) || base.totalDistanceM || 1;
  const baseDepart = new Date(base.departureTime).getTime();

  const results = [];

  for (const c of candidates) {
    if (String(c._id) === String(base._id)) continue; // skip self

    const cDepart = new Date(c.departureTime).getTime();
    const deltaMin = Math.abs(cDepart - baseDepart) / 60000;
    if (deltaMin > TIME_WINDOW_MIN) {
      console.log(`❌ Rejected ${c._id}: time delta ${deltaMin} > ${TIME_WINDOW_MIN}`);
      continue;
    }

    const candPts = decodePolyline(c.routePolyline);
    const candLenM = pathLengthM(candPts) || c.totalDistanceM || 1;

    const overlap = overlapPercent(basePts, candPts); // 0..100
    if (overlap < MIN_OVERLAP_PCT) {
      console.log(`❌ Rejected ${c._id}: overlap ${overlap.toFixed(2)}% < ${MIN_OVERLAP_PCT}%`);
      continue;
    }

    const approxExtraM = approximateExtraDistance(base, c);
    const deviationPct = (approxExtraM / Math.min(baseLenM, candLenM)) * 100;
    if (deviationPct > MAX_DEVIATION_PCT) {
      console.log(`❌ Rejected ${c._id}: deviation ${deviationPct.toFixed(2)}% > ${MAX_DEVIATION_PCT}%`);
      continue;
    }

    // scoring weights
    const scoreOverlap = overlap * 0.6;
    const scoreDeviation = Math.max(0, 100 - deviationPct * 6); 
    const scoreTime = Math.max(0, (TIME_WINDOW_MIN - deltaMin) * 1.0);

    const matchScore = Math.round(scoreOverlap + scoreDeviation + scoreTime);

    console.log("✅ Candidate accepted:", {
      candidateId: c._id,
      deltaMin,
      overlap,
      deviationPct,
      approxExtraM,
      matchScore
    });

    results.push({
      matchedTripId: c._id,
      overlapPercentage: Number(overlap.toFixed(2)),
      additionalDistanceM: Math.round(approxExtraM),
      additionalTimeS: Math.round(approxExtraM / 12), // rough conversion
      deviationPercentage: Number(deviationPct.toFixed(2)),
      timeDeltaMinutes: Math.round(deltaMin),
      matchScore
    });
  }

  results.sort(
    (a, b) => b.matchScore - a.matchScore || b.overlapPercentage - a.overlapPercentage
  );
  return results;
}

function approximateExtraDistance(a, b) {
  const A = [a.pickupLat, a.pickupLng];
  const A2 = [a.dropLat, a.dropLng];
  const B = [b.pickupLat, b.pickupLng];
  const B2 = [b.dropLat, b.dropLng];

  const route1 = haversineM(A, B) + haversineM(B, B2) + haversineM(B2, A2);
  const route2 = haversineM(A, B2) + haversineM(B2, B) + haversineM(B, A2);

  const proxyCombined = Math.min(route1, route2);
  const aLenProxy = haversineM(A, A2);
  const extra = Math.max(0, proxyCombined - aLenProxy);

  const scale = (a.totalDistanceM && aLenProxy > 0)
    ? (a.totalDistanceM / aLenProxy)
    : 1;

  return extra * scale;
}