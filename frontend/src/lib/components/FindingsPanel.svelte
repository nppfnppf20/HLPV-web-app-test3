<script>
  import AnalysisResults from './AnalysisResults.svelte';
  import LandscapeResults from './Results ribbons/LandscapeResults.svelte';
  import AgLandResults from './Results ribbons/Ag_landResults.svelte';
  import RenewablesResults from './Results ribbons/RenewablesResults.svelte';
  import EcologyResults from './Results ribbons/EcologyResults.svelte';

  /** @type {Record<string, any> | null} */
  export let heritageResult = null;

  /** @type {Record<string, any> | null} */
  export let landscapeResult = null;

  /** @type {Record<string, any> | null} */
  export let agLandResult = null;

  /** @type {Record<string, any> | null} */
  export let renewablesResult = null;

  /** @type {Record<string, any> | null} */
  export let ecologyResult = null;

  /** @type {boolean} */
  export let loading = false;

  /** @type {string} */
  export let errorMsg = '';

  // Derive AONB data into the shape expected by LandscapeResults (buffers + nearest)
  /** @type {{ buffers?: any[], nearest_within_1km?: { name?: string, distance_m?: number, direction?: string } } | null} */
  $: aonbUi = (() => {
    const arr = landscapeResult?.aonb || [];
    if (!Array.isArray(arr) || arr.length === 0) return null;

    /** @type {any[]} */
    const onSite = arr.filter((/** @type {any} */ a) => a.on_site);
    /** @type {any[]} */
    const within1km = arr.filter((/** @type {any} */ a) => !a.on_site && a.within_1km);

    const nearest = within1km.length > 0
      ? within1km.reduce((/** @type {any} */ min, /** @type {any} */ a) => (a.dist_m < min.dist_m ? a : min), within1km[0])
      : null;

    /** @type {{ distance_m: number, feature_count: number, name?: string }[]} */
    const buffers = [
      { distance_m: 0, feature_count: onSite.length, name: onSite[0]?.name },
      { distance_m: 1000, feature_count: within1km.length }
    ];

    /** @type {{ buffers?: any[], nearest_within_1km?: { name?: string, distance_m?: number, direction?: string } }} */
    const shaped = { buffers };
    if (nearest) {
      shaped.nearest_within_1km = { name: nearest.name, distance_m: nearest.dist_m, direction: nearest.direction };
    }
    return shaped;
  })();

  $: hasAnyResults = !!(heritageResult || landscapeResult || agLandResult || renewablesResult || ecologyResult);
</script>

<div class="findings-panel">
  {#if !hasAnyResults && !loading && !errorMsg}
    <div class="findings-empty">
      <div class="empty-icon">🗺️</div>
      <h3>Ready to Analyze</h3>
      <p>Draw an area on the map to start your planning assessment.</p>
      <div class="instruction-steps">
        <div class="step">
          <span class="step-number">1</span>
          <span class="step-text">Use the drawing tools on the map</span>
        </div>
        <div class="step">
          <span class="step-number">2</span>
          <span class="step-text">Draw a polygon around your site</span>
        </div>
        <div class="step">
          <span class="step-number">3</span>
          <span class="step-text">View analysis results here</span>
        </div>
      </div>
    </div>
  {:else}
    <div class="findings-content">
      <!-- Heritage Analysis -->
      <AnalysisResults 
        data={heritageResult} 
        title="Heritage Analysis"
        {loading}
        error={errorMsg}
      />

      <!-- Landscape Analysis -->
      {#if landscapeResult}
        <LandscapeResults 
          greenBelt={landscapeResult?.green_belt}
          aonb={landscapeResult?.aonb}
          title="Landscape Analysis"
          {loading}
          error={errorMsg}
        />
      {/if}

      <!-- Agricultural Land Analysis -->
      {#if agLandResult}
        <AgLandResults 
          agLand={agLandResult?.ag_land}
          title="Agricultural Land Classification"
          {loading}
          error={errorMsg}
        />
      {/if}

      <!-- Renewables Analysis -->
      {#if renewablesResult}
        <RenewablesResults 
          renewables={renewablesResult?.renewables}
          title="Cumulative Development"
          {loading}
          error={errorMsg}
        />
      {/if}

      <!-- Ecology Analysis -->
      {#if ecologyResult}
        <EcologyResults
          osPriorityPonds={ecologyResult?.os_priority_ponds}
          ramsar={ecologyResult?.ramsar}
          gcn={ecologyResult?.gcn}
          title="Ecology Assessment"
          {loading}
          error={errorMsg}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  .findings-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    padding: 2rem;
    color: #64748b;
  }

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }

  .findings-empty h3 {
    margin: 0 0 0.5rem 0;
    color: #374151;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .findings-empty p {
    margin: 0 0 2rem 0;
    font-size: 1rem;
    line-height: 1.5;
  }

  .instruction-steps {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 280px;
  }

  .step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-align: left;
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    background: #3b82f6;
    color: white;
    border-radius: 50%;
    font-weight: 600;
    font-size: 0.875rem;
    flex-shrink: 0;
  }

  .step-text {
    font-size: 0.875rem;
    color: #4b5563;
  }

  .findings-content {
    padding-bottom: 2rem;
  }

  /* Scroll styling for findings panel */
  .findings-panel {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
  }

  .findings-panel::-webkit-scrollbar {
    width: 6px;
  }

  .findings-panel::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  .findings-panel::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .findings-panel::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
</style>
