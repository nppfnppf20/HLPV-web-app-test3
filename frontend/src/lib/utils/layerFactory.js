// Layer factory functions for creating Leaflet layers with standardized styling
// Each function creates a properly configured layer for different data types

/**
 * Create conservation areas layer
 * @param {import('leaflet')} L - Leaflet instance
 * @returns {import('leaflet').GeoJSON}
 */
export function createConservationAreasLayer(L) {
  return L.geoJSON(null, {
    style: { color: '#0ea5e9', weight: 2, fillOpacity: 0.15 },
    onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
      const n = f?.properties?.name || 'Conservation area';
      layer.bindPopup(n);
    }
  });
}

/**
 * Create listed buildings layer for a specific grade
 * @param {import('leaflet')} L - Leaflet instance
 * @param {'I' | 'II*' | 'II'} grade - Building grade
 * @returns {import('leaflet').GeoJSON}
 */
export function createListedBuildingsLayer(L, grade) {
  const styles = {
    'I': { color: '#dc2626', fillColor: '#dc2626' },
    'II*': { color: '#ea580c', fillColor: '#ea580c' },
    'II': { color: '#8b5cf6', fillColor: '#8b5cf6' }
  };

  const style = styles[grade];

  return L.geoJSON(null, {
    pointToLayer: (/** @type {any} */ feat, /** @type {any} */ latlng) => {
      return L.circleMarker(latlng, {
        radius: 6,
        color: style.color,
        fillColor: style.fillColor,
        fillOpacity: 0.8,
        weight: 2
      });
    },
    onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
      const name = f?.properties?.name || 'Listed building';
      layer.bindPopup(`${name}<br><strong>Grade ${grade}</strong>`);
    }
  });
}

/**
 * Create scheduled monuments layer
 * @param {import('leaflet')} L - Leaflet instance
 * @returns {import('leaflet').GeoJSON}
 */
export function createScheduledMonumentsLayer(L) {
  return L.geoJSON(null, {
    pointToLayer: (/** @type {any} */ feat, /** @type {any} */ latlng) => {
      const size = 12;
      const points = [
        [latlng.lng, latlng.lat + size/111000],
        [latlng.lng - size/111000, latlng.lat - size/111000],
        [latlng.lng + size/111000, latlng.lat - size/111000]
      ];
      return L.polygon(points.map(p => [p[1], p[0]]), {
        color: '#f59e0b',
        fillColor: '#f59e0b',
        fillOpacity: 0.8,
        weight: 2
      });
    },
    onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
      const name = f?.properties?.name || 'Scheduled Monument';
      layer.bindPopup(`${name}<br><strong>Scheduled Monument</strong>`);
    }
  });
}

/**
 * Create green belt layer
 * @param {import('leaflet')} L - Leaflet instance
 * @returns {import('leaflet').GeoJSON}
 */
export function createGreenBeltLayer(L) {
  return L.geoJSON(null, {
    style: { color: '#22c55e', weight: 3, fillOpacity: 0.2 },
    onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
      const name = f?.properties?.name || 'Green Belt';
      layer.bindPopup(`${name}<br><strong>Green Belt Area</strong>`);
    }
  });
}

/**
 * Create AONB layer
 * @param {import('leaflet')} L - Leaflet instance
 * @returns {import('leaflet').GeoJSON}
 */
export function createAONBLayer(L) {
  return L.geoJSON(null, {
    style: { color: '#3b82f6', weight: 3, fillOpacity: 0.2 },
    onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
      const name = f?.properties?.name || 'AONB';
      layer.bindPopup(`${name}<br><strong>Area of Outstanding Natural Beauty</strong>`);
    }
  });
}