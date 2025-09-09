<script>
  import Map from '$lib/components/Map.svelte';
  import HeritageResults from '$lib/components/Results ribbons/HeritageResults.svelte';
  import LandscapeResults from '$lib/components/Results ribbons/LandscapeResults.svelte';
  import ReportGeneratorModal from '$lib/components/Modals/reportgeneratormodal.svelte';
  import { analyzeHeritage, analyzeGreenBelt, analyzeMulti } from '$lib/services/api.js';
  
  /** @type {Record<string, any> | null} */
  let result = null;
  /** @type {any[] | null} */
  let greenBelt = null;
  /** @type {{ buffers?: any[], nearest_within_1km?: { name?: string, distance_m?: number, direction?: string } } | null} */
  let aonb = null;
  /** @type {string} */
  let errorMsg = '';
  /** @type {boolean} */
  let loading = false;

  let showReportModal = false;
  function openReport() { showReportModal = true; }
  function closeReport() { showReportModal = false; }

  /** @param {any} geometry */
  async function handlePolygonDrawn(geometry) {
    errorMsg = '';
    result = null;
    greenBelt = null;
    loading = true;
    
    try {
      // Run heritage and multi-layer landscape (AONB via multi) + Green Belt
      const [heritageRes, multiRes, greenBeltRes] = await Promise.all([
        analyzeHeritage(geometry),
        analyzeMulti(geometry, ['aonb']),
        analyzeGreenBelt(geometry)
      ]);
      result = heritageRes;
      greenBelt = greenBeltRes;
      aonb = multiRes?.aonb || null;
    } catch (/** @type {any} */ err) {
      errorMsg = err?.message || String(err);
    } finally {
      loading = false;
    }
  }

</script>

<h1>Draw an area to analyze</h1>
<Map onPolygonDrawn={handlePolygonDrawn} />

<div style="margin-top: 1rem; display: flex; justify-content: flex-end;">
  <button class="btn btn--primary btn--lg" on:click={openReport} disabled={!result || loading}>Generate Report</button>
</div>

<HeritageResults 
  data={result} 
  title="Heritage Analysis Results"
  {loading}
  error={errorMsg}
/>

{#if greenBelt || aonb}
  <LandscapeResults
    {greenBelt}
    {aonb}
    title="Landscape Results"
    {loading}
    error={errorMsg}
  />
{/if}

{#if showReportModal}
  <ReportGeneratorModal data={result} onClose={closeReport} />
{/if}


