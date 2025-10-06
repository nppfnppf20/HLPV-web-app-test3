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
      const radius = 6; // Circle radius (same size as listed buildings)
      return L.circleMarker(latlng, {
        radius: radius,
        color: '#000000',        // Black border
        fillColor: '#ffed4e',    // Bright yellow fill
        fillOpacity: 0.8,
        weight: 3
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

/**
 * Create renewables layer
 * @param {import('leaflet')} L - Leaflet instance
 * @returns {import('leaflet').GeoJSON}
 */
export function createRenewablesLayer(L) {
  return L.geoJSON(null, {
    pointToLayer: (/** @type {any} */ feat, /** @type {any} */ latlng) => {
      const props = feat.properties;
      const tech = props.technology_type;
      const status = props.development_status_short;

      // Size based on capacity (2/3 of original size)
      const capacity = props.installed_capacity_mw || 0;
      let radius = 4; // Default size (2/3 of 6)
      if (capacity > 100) radius = 8; // 2/3 of 12
      else if (capacity > 50) radius = 7; // 2/3 of 10 (rounded)
      else if (capacity > 10) radius = 5; // 2/3 of 8 (rounded)

      // Color and fill based on status
      let color, backgroundColor, fillOpacity;

      if (status === 'Operational' || status === 'Under Construction' || status === 'Awaiting Construction') {
        // Red for built/approved
        color = '#dc2626'; // Red border
        backgroundColor = '#dc2626'; // Red fill
        fillOpacity = 1.0; // Solid
      } else if (status === 'Application Submitted' || status === 'Revised') {
        // Orange for pending decision/revised
        color = '#f59e0b'; // Orange border
        backgroundColor = '#f59e0b'; // Orange fill
        fillOpacity = 1.0; // Solid
      } else if (status === 'Appeal Refused' || status === 'Application Refused') {
        // Orange border, no fill for refused
        color = '#f59e0b'; // Orange border
        backgroundColor = 'transparent'; // No fill
        fillOpacity = 0; // No fill
      } else {
        // Default fallback
        color = '#10b981'; // Green
        backgroundColor = '#10b981'; // Green fill
        fillOpacity = 0.7;
      }

      // Create a square marker using DivIcon
      const squareIcon = L.divIcon({
        className: 'renewables-square-marker',
        html: '',
        iconSize: [radius * 2, radius * 2],
        iconAnchor: [radius, radius]
      });

      const marker = L.marker(latlng, { icon: squareIcon });

      // Add custom styling to the marker element after it's added to the map
      marker.on('add', function() {
        const element = this.getElement();
        if (element) {
          element.style.backgroundColor = backgroundColor;
          element.style.border = `2px solid ${color}`;
          element.style.opacity = fillOpacity === 0 ? 1 : fillOpacity; // Ensure border is visible for refused applications
          element.style.borderRadius = '2px'; // Slightly rounded corners
        }
      });

      return marker;
    },
    onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
      const props = f.properties;
      const name = props.site_name || 'Renewable Development';
      const tech = props.technology_type || 'Unknown';
      const capacity = props.installed_capacity_mw || 'Unknown';
      const status = props.development_status_short || 'Unknown';
      const planningAuth = props.planning_authority || 'Unknown';
      const planningRef = props.planning_application_reference || 'Unknown';

      layer.bindPopup(`
        <strong>${name}</strong><br>
        Technology: ${tech}<br>
        Capacity: ${capacity}MW<br>
        Status: ${status}<br>
        Planning Authority: ${planningAuth}<br>
        Planning Application Reference: ${planningRef}
      `);
    }
  });
}