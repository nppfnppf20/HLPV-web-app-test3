const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

export async function analyzePolygon(polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analyze failed: ${res.status} ${text}`);
  }
  return res.json();
}


