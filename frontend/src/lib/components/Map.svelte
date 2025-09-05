<script>
  import { onMount } from 'svelte';

  /** @type {HTMLDivElement | null} */
  let mapContainer = null;
  /** @type {import('leaflet').Map | null} */
  let map = null;

  /** @type {(geojson: any) => void} */
  export let onPolygonDrawn = (geojson) => {};

  /** @param {string} href */
  onMount(async () => {
    // Lazy-import Leaflet only on client
    const L = (await import('leaflet')).default;
    // Bring in leaflet-draw for side effects (no typings)
    await import('leaflet-draw');

    map = L.map(mapContainer).setView([51.505, -0.09], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

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
</script>

<div bind:this={mapContainer} class="map-container"></div>


