<script>
  import Map from '$lib/components/Map.svelte';
  import AnalysisResults from '$lib/components/AnalysisResults.svelte';
  import ReportGenerator from '$lib/components/ReportGenerator.svelte';
  import EcologyResults from '$lib/components/EcologyResults.svelte';
  import { analyzeHeritage, analyzeGreenBelt } from '$lib/services/api.js';
  
  /** @type {Record<string, any> | null} */
  let result = null;
  /** @type {any[] | null} */
  let greenBelt = null;
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
    greenBelt = null;
    loading = true;
    
    try {
      // Run heritage and green belt in sequence (could be parallel later)
      result = await analyzeHeritage(geometry);
      greenBelt = await analyzeGreenBelt(geometry);
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
</script>

<h1>Draw an area to analyze</h1>
<Map onPolygonDrawn={handlePolygonDrawn} />

<AnalysisResults 
  data={result} 
  title="Heritage Analysis Results"
  {loading}
  error={errorMsg}
/>

{#if greenBelt}
  <EcologyResults
    {greenBelt}
    title="Ecology Results"
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
    data={{ ...result, green_belt: greenBelt || [] }} 
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
