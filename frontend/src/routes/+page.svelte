<script>
  import Map from '$lib/components/Map.svelte';
  import AnalysisResults from '$lib/components/AnalysisResults.svelte';
  import { analyzeHeritage } from '$lib/services/api.js';
  
  /** @type {Record<string, any> | null} */
  let result = null;
  /** @type {string} */
  let errorMsg = '';
  /** @type {boolean} */
  let loading = false;

  /** @param {any} geometry */
  async function handlePolygonDrawn(geometry) {
    errorMsg = '';
    result = null;
    loading = true;
    
    try {
      result = await analyzeHeritage(geometry);
    } catch (/** @type {any} */ err) {
      errorMsg = err?.message || String(err);
    } finally {
      loading = false;
    }
  }
</script>

<h1>Draw an area to analyze</h1>
<Map onPolygonDrawn={handlePolygonDrawn} />

<AnalysisResults 
  data={result} 
  title="Heritage Analysis Results"
  {loading}
  error={errorMsg}
/>
