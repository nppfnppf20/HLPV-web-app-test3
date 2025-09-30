<script>
  import { onMount } from 'svelte';

  /** @type {HTMLDivElement | null} */
  let mapContainer = null;
  /** @type {import('leaflet').Map | null} */
  let map = null;

  /** @type {(geojson: any) => void} */
  export let onPolygonDrawn = (geojson) => {};
  /** @type {Record<string, any> | null} */
  export let heritageData = null;
  /** @type {Record<string, any> | null} */
  export let landscapeData = null;

  $: console.log('🔍 Map received landscapeData:', landscapeData);

  /** @type {import('leaflet').GeoJSON | null} */
  let conservationAreasLayer = null;
  /** @type {import('leaflet').GeoJSON | null} */
  let listedBuildingsGradeILayer = null;
  /** @type {import('leaflet').GeoJSON | null} */
  let listedBuildingsGradeIIStarLayer = null;
  /** @type {import('leaflet').GeoJSON | null} */
  let listedBuildingsGradeIILayer = null;
  /** @type {import('leaflet').GeoJSON | null} */
  let scheduledMonumentsLayer = null;
  /** @type {import('leaflet').GeoJSON | null} */
  let greenBeltLayer = null;
  let aonbLayer = null;
  /** @type {any} */
  let layerControl = null;
  /** @type {any} */
  let legend = null;
  /** @type {any} */
  let riskFilterControl = null;

  // Risk level filter state
  /** @type {Record<string, boolean>} */
  let riskFilters = {
    'showstopper': true,
    'extremely_high_risk': true,
    'high_risk': true,
    'medium_high_risk': true,
    'medium_risk': true,
    'medium_low_risk': true,
    'low_risk': true
  };

  /**
   * Determine risk level for a listed building based on its properties
   * @param {any} building
   */
  function getBuildingRiskLevel(building) {
    if (building.on_site) {
      if (building.grade === 'I') return 'showstopper';
      if (building.grade === 'II*' || building.grade === 'II') return 'high_risk';
    }

    if (!building.on_site && building.dist_m <= 100) {
      if (building.grade === 'I') return 'high_risk';
      return 'medium_high_risk';
    }

    if (!building.on_site && building.dist_m <= 500 && building.grade === 'I') {
      return 'high_risk';
    }

    return 'low_risk';
  }

  /**
   * Determine risk level for a conservation area based on its properties
   * @param {any} area
   */
  function getConservationAreaRiskLevel(area) {
    if (area.on_site) return 'high_risk';
    if (area.within_250m) return 'medium_risk';
    return 'low_risk';
  }

  /**
   * Determine risk level for scheduled monuments based on its properties
   * @param {any} monument
   */
  function getScheduledMonumentRiskLevel(monument) {
    if (monument.on_site) return 'high_risk';
    if (monument.within_250m) return 'medium_high_risk';
    if (monument.within_500m) return 'medium_risk';
    return 'low_risk';
  }

  /**
   * Determine risk level for Green Belt based on its properties
   * @param {any} greenBelt
   */
  function getGreenBeltRiskLevel(greenBelt) {
    if (greenBelt.on_site) return 'medium_high_risk';
    if (greenBelt.within_1km) return 'low_risk';
    return 'low_risk';
  }

  /**
   * Determine risk level for AONB based on its properties
   * @param {any} aonb
   */
  function getAONBRiskLevel(aonb) {
    if (aonb.on_site) return 'medium_high_risk';
    if (aonb.within_1km) return 'low_risk';
    return 'low_risk';
  }

  /**
   * Check if a feature should be visible based on current risk filters
   * @param {string} riskLevel
   */
  function isRiskLevelVisible(riskLevel) {
    return riskFilters[riskLevel] === true;
  }


  /**
   * Update layer visibility based on current risk filter settings
   */
  function updateLayerVisibility() {
    if (!conservationAreasLayer || !listedBuildingsGradeILayer || !listedBuildingsGradeIIStarLayer || !listedBuildingsGradeIILayer || !scheduledMonumentsLayer) return;
    console.log('🔄 Updating layer visibility...');

    // Refresh layers with current filter settings
    if (heritageData?.conservation_areas) {
      setLayerData(conservationAreasLayer, heritageData.conservation_areas, (r) => ({
        name: r.name,
        riskLevel: getConservationAreaRiskLevel(r)
      }), true);
    }

    if (heritageData?.listed_buildings) {
      // Filter buildings by grade and apply to appropriate layers
      const gradeIBuildings = heritageData.listed_buildings.filter(b => b.grade === 'I');
      const gradeIIStarBuildings = heritageData.listed_buildings.filter(b => b.grade === 'II*');
      const gradeIIBuildings = heritageData.listed_buildings.filter(b => b.grade === 'II');

      setLayerData(listedBuildingsGradeILayer, gradeIBuildings, (r) => ({
        name: r.name,
        grade: r.grade,
        riskLevel: getBuildingRiskLevel(r)
      }), true);

      setLayerData(listedBuildingsGradeIIStarLayer, gradeIIStarBuildings, (r) => ({
        name: r.name,
        grade: r.grade,
        riskLevel: getBuildingRiskLevel(r)
      }), true);

      setLayerData(listedBuildingsGradeIILayer, gradeIIBuildings, (r) => ({
        name: r.name,
        grade: r.grade,
        riskLevel: getBuildingRiskLevel(r)
      }), true);
    }

    if (heritageData?.scheduled_monuments) {
      setLayerData(scheduledMonumentsLayer, heritageData.scheduled_monuments, (r) => ({
        name: r.name,
        riskLevel: getScheduledMonumentRiskLevel(r)
      }), true);
    }

    if (landscapeData?.green_belt) {
      setLayerData(greenBeltLayer, landscapeData.green_belt, (r) => ({
        name: r.name || 'Green Belt',
        riskLevel: getGreenBeltRiskLevel(r)
      }), true);
    }

    if (landscapeData?.aonb) {
      setLayerData(aonbLayer, landscapeData.aonb, (r) => ({
        name: r.name || 'AONB',
        riskLevel: getAONBRiskLevel(r)
      }), true);
    }
  }

  /** @param {string} href */
  onMount(async () => {
    // Lazy-import Leaflet only on client
    const L = (await import('leaflet')).default;
    // Bring in leaflet-draw for side effects (no typings)
    await import('leaflet-draw');

    map = L.map(mapContainer).setView([51.505, -0.09], 13);

    const base = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Overlay: Conservation Areas
    conservationAreasLayer = L.geoJSON(null, {
      style: { color: '#0ea5e9', weight: 2, fillOpacity: 0.15 },
      onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
        const n = f?.properties?.name || 'Conservation area';
        layer.bindPopup(n);
      }
    });

    // Overlay: Grade I Listed Buildings
    listedBuildingsGradeILayer = L.geoJSON(null, {
      pointToLayer: (/** @type {any} */ feat, /** @type {any} */ latlng) => {
        return L.circleMarker(latlng, { radius: 6, color: '#dc2626', fillColor: '#dc2626', fillOpacity: 0.8, weight: 2 });
      },
      onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
        const name = f?.properties?.name || 'Listed building';
        layer.bindPopup(`${name}<br><strong>Grade I</strong>`);
      }
    });

    // Overlay: Grade II* Listed Buildings
    listedBuildingsGradeIIStarLayer = L.geoJSON(null, {
      pointToLayer: (/** @type {any} */ feat, /** @type {any} */ latlng) => {
        return L.circleMarker(latlng, { radius: 6, color: '#ea580c', fillColor: '#ea580c', fillOpacity: 0.8, weight: 2 });
      },
      onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
        const name = f?.properties?.name || 'Listed building';
        layer.bindPopup(`${name}<br><strong>Grade II*</strong>`);
      }
    });

    // Overlay: Grade II Listed Buildings
    listedBuildingsGradeIILayer = L.geoJSON(null, {
      pointToLayer: (/** @type {any} */ feat, /** @type {any} */ latlng) => {
        return L.circleMarker(latlng, { radius: 6, color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.8, weight: 2 });
      },
      onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
        const name = f?.properties?.name || 'Listed building';
        layer.bindPopup(`${name}<br><strong>Grade II</strong>`);
      }
    });

    // Overlay: Scheduled Monuments
    scheduledMonumentsLayer = L.geoJSON(null, {
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

    // Overlay: Green Belt
    greenBeltLayer = L.geoJSON(null, {
      style: { color: '#22c55e', weight: 3, fillOpacity: 0.2 },
      onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
        const name = f?.properties?.name || 'Green Belt';
        layer.bindPopup(`${name}<br><strong>Green Belt Area</strong>`);
      }
    });

    // Overlay: AONB
    aonbLayer = L.geoJSON(null, {
      style: { color: '#3b82f6', weight: 3, fillOpacity: 0.2 },
      onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
        const name = f?.properties?.name || 'AONB';
        layer.bindPopup(`${name}<br><strong>Area of Outstanding Natural Beauty</strong>`);
      }
    });

    // Layer control with symbols
    layerControl = L.control.layers(
      { 'OSM': base },
      {
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 16px; height: 12px; background: rgba(14, 165, 233, 0.15); border: 2px solid #0ea5e9; margin-right: 8px; border-radius: 3px;"></span>Conservation areas</span>': conservationAreasLayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; background: #dc2626; border-radius: 50%; margin-right: 8px;"></span>Grade I Listed</span>': listedBuildingsGradeILayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; background: #ea580c; border-radius: 50%; margin-right: 8px;"></span>Grade II* Listed</span>': listedBuildingsGradeIIStarLayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 12px; height: 12px; background: #8b5cf6; border-radius: 50%; margin-right: 8px;"></span>Grade II Listed</span>': listedBuildingsGradeIILayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 10px solid #f59e0b; margin-right: 8px; margin-left: 3px;"></span>Scheduled Monuments</span>': scheduledMonumentsLayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 16px; height: 12px; background: rgba(34, 197, 94, 0.2); border: 3px solid #22c55e; margin-right: 8px; border-radius: 3px;"></span>Green Belt</span>': greenBeltLayer,
        '<span style="display: inline-flex; align-items: center;"><span style="display: inline-block; width: 16px; height: 12px; background: rgba(59, 130, 246, 0.2); border: 3px solid #3b82f6; margin-right: 8px; border-radius: 3px;"></span>AONB</span>': aonbLayer
      },
      { collapsed: false }
    ).addTo(map);


    // Create risk filter control
    riskFilterControl = L.control({ position: 'topright' });
    riskFilterControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'risk-filter-control');
      div.innerHTML = `
        <div class="risk-filter-content">
          <h4>Risk Level Filter</h4>
          <div class="risk-filter-options">
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-showstopper" checked>
              <span class="risk-label showstopper">Showstopper</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-extremely_high_risk" checked>
              <span class="risk-label extremely-high">Extremely High</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-high_risk" checked>
              <span class="risk-label high">High Risk</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-medium_high_risk" checked>
              <span class="risk-label medium-high">Medium-High</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-medium_risk" checked>
              <span class="risk-label medium">Medium Risk</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-medium_low_risk" checked>
              <span class="risk-label medium-low">Medium-Low</span>
            </label>
            <label class="risk-filter-item">
              <input type="checkbox" id="risk-low_risk" checked>
              <span class="risk-label low">Low Risk</span>
            </label>
          </div>
        </div>
      `;

      // Add event listeners for checkboxes
      Object.keys(riskFilters).forEach(riskLevel => {
        const checkbox = div.querySelector(`#risk-${riskLevel}`);
        if (checkbox) {
          checkbox.addEventListener('change', () => {
            riskFilters[riskLevel] = checkbox.checked;
            updateLayerVisibility();
          });
        }
      });

      // Prevent map interaction when clicking on control
      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      return div;
    };
    riskFilterControl.addTo(map);

    // leaflet-draw types aren't available, cast to any to access Draw
    const Lany = /** @type {any} */ (L);
    const drawControl = new Lany.Control.Draw({
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems
      }
    });

    map.addControl(drawControl);

    map.on(Lany.Draw.Event.CREATED, function (/** @type {any} */ e) {
      const layer = e.layer;
      drawnItems.clearLayers();
      drawnItems.addLayer(layer);
      const geojson = layer.toGeoJSON().geometry;
      onPolygonDrawn(geojson);
    });

    // Ensure tiles render fully if container size changed during mount
    setTimeout(() => {
      map?.invalidateSize();
    }, 0);
  });

  /**
   * @param {import('leaflet').GeoJSON | null} layer
   * @param {any[]} rows
   * @param {(r: any) => Record<string, any>} propsMapper
   * @param {boolean} applyRiskFilter
   */
  function setLayerData(layer, rows, propsMapper = (r) => r, applyRiskFilter = false) {
    if (!layer) {
      console.log('❌ setLayerData called with null layer');
      return;
    }
    console.log('📊 setLayerData called with', rows.length, 'rows, applyRiskFilter:', applyRiskFilter);
    layer.clearLayers();
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log('⚠️ No rows to add to layer');
      return;
    }

    let filteredRows = rows.filter((r) => r?.geometry);
    console.log('📍 After geometry filter:', filteredRows.length, 'rows');

    // Apply risk level filtering if requested
    if (applyRiskFilter) {
      const beforeRiskFilter = filteredRows.length;
      filteredRows = filteredRows.filter((r) => {
        const props = propsMapper(r);
        const visible = props.riskLevel ? isRiskLevelVisible(props.riskLevel) : true;
        if (!visible) console.log('🚫 Filtering out', r.name || 'feature', 'with risk level:', props.riskLevel);
        return visible;
      });
      console.log('⚡ After risk filter:', filteredRows.length, 'rows (was', beforeRiskFilter, ')');
    }

    const features = filteredRows.map((r) => ({
      type: 'Feature',
      geometry: r.geometry,
      properties: propsMapper(r)
    }));

    console.log('🗺️ Adding', features.length, 'features to layer');
    if (features.length > 0) {
      layer.addData({ type: 'FeatureCollection', features });
      console.log('✅ Features added to layer successfully');
    }
  }

  $: if (heritageData?.conservation_areas) {
    console.log('🏛️ First conservation area structure:', heritageData.conservation_areas[0]);
    setLayerData(conservationAreasLayer, heritageData.conservation_areas, (r) => ({
      name: r.name,
      riskLevel: getConservationAreaRiskLevel(r)
    }), true);
  }

  $: if (heritageData?.listed_buildings) {
    // Filter buildings by grade and apply to appropriate layers
    const gradeIBuildings = heritageData.listed_buildings.filter(b => b.grade === 'I');
    const gradeIIStarBuildings = heritageData.listed_buildings.filter(b => b.grade === 'II*');
    const gradeIIBuildings = heritageData.listed_buildings.filter(b => b.grade === 'II');

    setLayerData(listedBuildingsGradeILayer, gradeIBuildings, (r) => ({
      name: r.name,
      grade: r.grade,
      riskLevel: getBuildingRiskLevel(r)
    }), true);

    setLayerData(listedBuildingsGradeIIStarLayer, gradeIIStarBuildings, (r) => ({
      name: r.name,
      grade: r.grade,
      riskLevel: getBuildingRiskLevel(r)
    }), true);

    setLayerData(listedBuildingsGradeIILayer, gradeIIBuildings, (r) => ({
      name: r.name,
      grade: r.grade,
      riskLevel: getBuildingRiskLevel(r)
    }), true);
  }

  $: if (heritageData?.scheduled_monuments) {
    console.log('🏛️ Scheduled monuments data received:', heritageData.scheduled_monuments);
    console.log('🏛️ Scheduled monuments count:', heritageData.scheduled_monuments.length);
    console.log('🔍 First scheduled monument structure:', heritageData.scheduled_monuments[0]);

    // Convert lat/lng strings to geometry objects for map display
    const monumentsWithGeometry = heritageData.scheduled_monuments.map(monument => ({
      ...monument,
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(monument.lng), parseFloat(monument.lat)]
      }
    }));

    console.log('🔧 Converted scheduled monuments with geometry:', monumentsWithGeometry[0]);
    setLayerData(scheduledMonumentsLayer, monumentsWithGeometry, (r) => ({
      name: r.name,
      riskLevel: getScheduledMonumentRiskLevel(r)
    }), true);
  }

  $: if (landscapeData?.green_belt) {
    console.log('🟢 Green Belt data received:', landscapeData.green_belt);
    console.log('🟢 Green Belt count:', landscapeData.green_belt.length);
    console.log('🔍 First Green Belt feature structure:', landscapeData.green_belt[0]);
    // Green Belt data doesn't have geometry, so we skip the geometry filter
    setLayerData(greenBeltLayer, landscapeData.green_belt, (r) => ({
      name: r.name || 'Green Belt',
      riskLevel: getGreenBeltRiskLevel(r)
    }), false); // false = don't apply risk filter which requires geometry
  }

  $: if (landscapeData?.aonb) {
    console.log('🔵 AONB data received:', landscapeData.aonb);
    console.log('🔵 AONB count:', landscapeData.aonb.length);
    console.log('🔍 First AONB feature structure:', landscapeData.aonb[0]);
    // AONB data now has geometry, so we can apply the geometry filter
    setLayerData(aonbLayer, landscapeData.aonb, (r) => ({
      name: r.name || 'AONB',
      riskLevel: getAONBRiskLevel(r)
    }), true); // true = apply risk filter using geometry
  }
</script>

<div bind:this={mapContainer} class="map-container"></div>

<style>
  .map-container {
    height: 100%;
    width: 100%;
    min-height: 400px;
    position: relative;
  }


  /* Risk Filter Control Styles */
  :global(.risk-filter-control) {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 12px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    line-height: 1.4;
    min-width: 160px;
    margin-top: 10px;
  }

  :global(.risk-filter-control .risk-filter-content h4) {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 4px;
  }

  :global(.risk-filter-control .risk-filter-options) {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  :global(.risk-filter-control .risk-filter-item) {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 11px;
    color: #6b7280;
  }

  :global(.risk-filter-control .risk-filter-item input[type="checkbox"]) {
    margin-right: 6px;
    margin-top: 0;
    cursor: pointer;
  }

  :global(.risk-filter-control .risk-label) {
    font-weight: 500;
  }

  :global(.risk-filter-control .risk-label.showstopper) {
    color: #dc2626;
  }

  :global(.risk-filter-control .risk-label.extremely-high) {
    color: #b91c1c;
  }

  :global(.risk-filter-control .risk-label.high) {
    color: #ea580c;
  }

  :global(.risk-filter-control .risk-label.medium-high) {
    color: #d97706;
  }

  :global(.risk-filter-control .risk-label.medium) {
    color: #f59e0b;
  }

  :global(.risk-filter-control .risk-label.medium-low) {
    color: #84cc16;
  }

  :global(.risk-filter-control .risk-label.low) {
    color: #059669;
  }
</style>


