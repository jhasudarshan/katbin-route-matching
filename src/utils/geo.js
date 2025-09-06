// haversine + path helpers
const R = 6371000;

function toRad(x) { return (x * Math.PI) / 180; }

export function haversineM(a, b) {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function pathLengthM(points) {
  let s = 0;
  for (let i = 1; i < points.length; i++) s += haversineM(points[i - 1], points[i]);
  return s;
}

// resample roughly every stepM meters along segments
export function resample(points, stepM = 200) {
  if (!points || points.length < 2) return points || [];
  const out = [points[0]];
  let acc = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const segLen = haversineM(a, b);
    let t = stepM - acc;
    while (t <= segLen) {
      const r = t / segLen;
      out.push([a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r]);
      t += stepM;
    }
    acc = (segLen - ((stepM - acc) % stepM)) % stepM;
  }
  const last = points[points.length - 1];
  const lastOut = out[out.length - 1];
  if (!lastOut || lastOut[0] !== last[0] || lastOut[1] !== last[1]) out.push(last);
  return out;
}

// overlap %: symmetric average of fraction of points within tolM
export function overlapPercent(aPoints, bPoints, tolM = 150) {
  const A = resample(aPoints, 250);
  const B = resample(bPoints, 250);
  if (A.length === 0 || B.length === 0) return 0;

  function inTol(p, arr) {
    for (let i = 0; i < arr.length; i++) {
      if (haversineM(p, arr[i]) <= tolM) return true;
    }
    return false;
  }

  const aCount = A.filter(p => inTol(p, B)).length / A.length;
  const bCount = B.filter(p => inTol(p, A)).length / B.length;
  return 100 * (aCount + bCount) / 2;
}