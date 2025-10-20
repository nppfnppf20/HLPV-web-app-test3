const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';

/**
 * Analyze socioeconomics data for a given polygon
 * @param {Object} polygon - GeoJSON polygon
 * @returns {Promise<Object>} Socioeconomics analysis results
 */
export async function analyzeSocioeconomics(polygon) {
  const response = await fetch(`${BACKEND_URL}/analyze/socioeconomics`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ polygon }),
  });

  if (!response.ok) {
    throw new Error(`Socioeconomics analysis failed: ${response.status}`);
  }

  return response.json();
}