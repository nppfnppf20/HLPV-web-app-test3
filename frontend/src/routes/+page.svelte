<script>
  import Map from '$lib/components/Map.svelte';
  import AnalysisResults from '$lib/components/AnalysisResults.svelte';
  import LandscapeResults from '$lib/components/Results ribbons/LandscapeResults.svelte';
  import ReportGenerator from '$lib/components/ReportGenerator.svelte';
  import { analyzeHeritage, analyzeLandscape } from '$lib/services/api.js';
  
  /** @type {Record<string, any> | null} */
  let result = null;
  /** @type {Record<string, any> | null} */
  let landscapeResult = null;
  /** @type {string} */
  let errorMsg = '';
  /** @type {boolean} */
  let loading = false;
  /** @type {boolean} */
  let showReport = false;

  /** @param {any} geometry */
  async function handlePolygonDrawn(geometry) {
    errorMsg = '';
    result = null;
    landscapeResult = null;
    loading = true;
    
    try {
      // Run both heritage and landscape analysis in parallel
      const [heritageData, landscapeData] = await Promise.all([
        analyzeHeritage(geometry),
        analyzeLandscape(geometry)
      ]);
      result = heritageData;
      landscapeResult = landscapeData;
    } catch (/** @type {any} */ err) {
      errorMsg = err?.message || String(err);
    } finally {
      loading = false;
    }
  }

  function openReport() {
    showReport = true;
  }

  function closeReport() {
    showReport = false;
  }

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
</script>

<h1>Draw an area to analyze</h1>
<Map onPolygonDrawn={handlePolygonDrawn} />

<AnalysisResults 
  data={result} 
  title="Heritage Analysis Results"
  {loading}
  error={errorMsg}
/>

{#if landscapeResult}
  <LandscapeResults 
    greenBelt={landscapeResult?.green_belt}
    aonb={landscapeResult?.aonb}
    title="Landscape Analysis Results"
    {loading}
    error={errorMsg}
  />
{/if}

{#if result && !loading && !errorMsg}
  <div class="report-button-container">
    <button class="generate-report-btn" on:click={openReport}>
      📄 Generate Report
    </button>
  </div>
{/if}

{#if showReport}
  <ReportGenerator 
    data={result} 
    onClose={closeReport}
  />
{/if}

<style>
  .report-button-container {
    display: flex;
    justify-content: center;
    margin: 2rem 0;
  }

  .generate-report-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .generate-report-btn:hover {
    background: #2563eb;
  }

  .generate-report-btn:active {
    transform: translateY(1px);
  }
</style>
