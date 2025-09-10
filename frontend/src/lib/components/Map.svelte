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

  /** @type {import('leaflet').GeoJSON | null} */
  let conservationAreasLayer = null;
  /** @type {import('leaflet').GeoJSON | null} */
  let listedBuildingsLayer = null;
  /** @type {any} */
  let layerControl = null;

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

    // Overlay: Listed Buildings (points)
    listedBuildingsLayer = L.geoJSON(null, {
      pointToLayer: (/** @type {any} */ feat, /** @type {any} */ latlng) => {
        const grade = feat?.properties?.grade || '';
        const color = grade === 'I' ? '#dc2626' : grade.includes('II*') ? '#ea580c' : '#8b5cf6';
        return L.circleMarker(latlng, { radius: 6, color, fillColor: color, fillOpacity: 0.8, weight: 2 });
      },
      onEachFeature: (/** @type {any} */ f, /** @type {any} */ layer) => {
        const name = f?.properties?.name || 'Listed building';
        const grade = f?.properties?.grade || '';
        layer.bindPopup(`${name}<br><strong>Grade ${grade}</strong>`);
      }
    });

    // Layer control
    layerControl = L.control.layers(
      { 'OSM': base },
      { 
        'Conservation areas': conservationAreasLayer,
        'Listed buildings': listedBuildingsLayer
      },
      { collapsed: false }
    ).addTo(map);

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
   */
  function setLayerData(layer, rows, propsMapper = (r) => r) {
    if (!layer) return;
    layer.clearLayers();
    if (!Array.isArray(rows) || rows.length === 0) return;
    const features = rows
      .filter((r) => r?.geometry)
      .map((r) => ({
        type: 'Feature',
        geometry: r.geometry,
        properties: propsMapper(r)
      }));
    if (features.length > 0) layer.addData({ type: 'FeatureCollection', features });
  }

  $: if (heritageData?.conservation_areas) {
    setLayerData(conservationAreasLayer, heritageData.conservation_areas, (r) => ({ name: r.name }));
  }

  $: if (heritageData?.listed_buildings) {
    setLayerData(listedBuildingsLayer, heritageData.listed_buildings, (r) => ({ name: r.name, grade: r.grade }));
  }
</script>

<div bind:this={mapContainer} class="map-container"></div>


