const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

// Legacy analysis function (simple counts)
export async function analyzePolygon(/** @type {any} */ polygonGeoJSON) {
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
export async function analyzeHeritage(/** @type {any} */ polygonGeoJSON) {
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
export async function analyzeListedBuildings(/** @type {any} */ polygonGeoJSON) {
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
export async function analyzeConservationAreas(/** @type {any} */ polygonGeoJSON) {
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

// Scheduled monuments analysis
export async function analyzeScheduledMonuments(/** @type {any} */ polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze/scheduled-monuments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Scheduled monuments analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Landscape analysis (Green Belt, AONB, etc.)
export async function analyzeLandscape(/** @type {any} */ polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze/landscape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Landscape analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Agricultural land analysis (ALC grades and coverage)
export async function analyzeAgLand(/** @type {any} */ polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze/ag-land`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Agricultural land analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Renewables analysis (Solar, Wind, Battery developments)
export async function analyzeRenewables(/** @type {any} */ polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze/renewables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Renewables analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Ecology analysis (OS Priority Ponds and other ecological features)
export async function analyzeEcology(/** @type {any} */ polygonGeoJSON) {
  const res = await fetch(`${BASE_URL}/analyze/ecology`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ polygon: polygonGeoJSON })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ecology analysis failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Save site analysis for TRP Report
export async function saveSite(/** @type {any} */ siteData) {
  const res = await fetch(`${BASE_URL}/save-site`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(siteData)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Save site failed: ${res.status} ${text}`);
  }
  return res.json();
}


