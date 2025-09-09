const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// Legacy analysis function (simple counts)
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

// New detailed heritage analysis
export async function analyzeHeritage(polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze/heritage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Heritage analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Listed buildings analysis
export async function analyzeListedBuildings(polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze/listed-buildings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Listed buildings analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Conservation areas analysis
export async function analyzeConservationAreas(polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze/conservation-areas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Conservation areas analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Green Belt analysis
export async function analyzeGreenBelt(polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze/green-belt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Green Belt analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Multi-layer analysis
export async function analyzeMulti(polygonGeoJSON, layers) {
  const res = await fetch(`${BASE_URL}/analyze/multi`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON, layers })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Multi-layer analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Convenience helper: run heritage + landscape (green belt + AONB) together
export async function analyzeHeritageAndLandscape(polygonGeoJSON) {
  const res = await analyzeMulti(polygonGeoJSON, ['aonb']);
  // Green Belt still uses its own endpoint for now
  const gb = await analyzeGreenBelt(polygonGeoJSON);
  return { multi: res, greenBelt: gb };
}

// Enhanced analysis with risk assessment
export async function analyzeEnhanced(polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze/enhanced`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Enhanced analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}


