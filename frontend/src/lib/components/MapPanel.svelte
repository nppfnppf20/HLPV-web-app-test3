<script>
  import Map from './Map.svelte';

  /** @type {(geometry: any) => void} */
  export let onPolygonDrawn;

  /** @type {boolean} */
  export let loading = false;

  /** @type {Record<string, any> | null} */
  export let heritageData = null;
  /** @type {Record<string, any> | null} */
  export let landscapeData = null;
  /** @type {Record<string, any> | null} */
  export let renewablesData = null;
</script>

<div class="map-panel">
  <div class="map-panel-content">
    <Map {onPolygonDrawn} {heritageData} {landscapeData} {renewablesData} />
    
    {#if loading}
      <div class="map-loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Analysing site constraints...</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .map-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid #f3f4f6;
    border-top: 3px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-spinner p {
    margin: 0;
    color: #374151;
    font-weight: 500;
    font-size: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>
