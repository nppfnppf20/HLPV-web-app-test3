<script>
  import Header from '$lib/components/Header.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Map from '$lib/components/Map.svelte';
  import ReportGenerator from '$lib/components/ReportGenerator.svelte';
  import { analyzeHeritage, analyzeLandscape, analyzeAgLand } from '$lib/services/api.js';
  
  /** @type {Record<string, any> | null} */
  let result = null;
  /** @type {Record<string, any> | null} */
  let landscapeResult = null;
  /** @type {Record<string, any> | null} */
  let agLandResult = null;
  /** @type {string} */
  let errorMsg = '';
  /** @type {boolean} */
  let loading = false;
  /** @type {boolean} */
  let showReport = false;
  /** @type {boolean} */
  let sidebarCollapsed = false;

  /** @param {any} geometry */
  async function handlePolygonDrawn(geometry) {
    errorMsg = '';
    result = null;
    landscapeResult = null;
    agLandResult = null;
    loading = true;
    
    try {
      // Run heritage, landscape, and agricultural land analysis in parallel
      const [heritageData, landscapeData, agLandData] = await Promise.all([
        analyzeHeritage(geometry),
        analyzeLandscape(geometry),
        analyzeAgLand(geometry)
      ]);
      result = heritageData;
      landscapeResult = landscapeData;
      agLandResult = agLandData;
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

  function handleSidebarToggle(/** @type {CustomEvent<boolean>} */ event) {
    sidebarCollapsed = event.detail;
  }

  function handleNewAnalysis() {
    // Clear current results and reset map
    result = null;
    landscapeResult = null;
    agLandResult = null;
    errorMsg = '';
    loading = false;
  }

  function handleGenerateReport() {
    showReport = true;
  }

  function handleSearch(/** @type {CustomEvent<{query: string}>} */ event) {
    // Handle location search - could integrate with geocoding service
    console.log('Search query:', event.detail.query);
  }

  function handleFiltersChanged(/** @type {CustomEvent<any>} */ event) {
    // Handle filter changes - could update map visibility
    console.log('Filters changed:', event.detail);
  }
</script>

<div class="app-layout">
  <!-- Header -->
  <Header on:search={handleSearch} />
  
  <!-- Main Content Area -->
  <div class="main-content">
    <!-- Sidebar -->
    <Sidebar
      bind:isCollapsed={sidebarCollapsed}
      heritageData={result}
      landscapeData={landscapeResult}
      agLandData={agLandResult}
      {loading}
      error={errorMsg}
      on:toggle={handleSidebarToggle}
      on:new-analysis={handleNewAnalysis}
      on:generate-report={handleGenerateReport}
      on:filters-changed={handleFiltersChanged}
    />
    
    <!-- Map Container -->
    <div class="map-container" class:expanded={sidebarCollapsed}>
      <Map onPolygonDrawn={handlePolygonDrawn} heritageData={result} />
    </div>
  </div>
</div>

{#if showReport}
  <ReportGenerator
    heritageData={result}
    landscapeData={landscapeResult}
    agLandData={agLandResult}
    onClose={closeReport}
  />
{/if}

<style>
  .app-layout {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f8fafc;
  }

  .main-content {
    flex: 1;
    display: flex;
    height: calc(100vh - 64px); /* Adjust for header height */
    overflow: hidden;
  }

  .map-container {
    flex: 1;
    background: white;
    transition: all 0.3s ease;
    position: relative;
  }

  .map-container.expanded {
    margin-left: -350px; /* Compensate for collapsed sidebar */
  }

  /* Global layout adjustments */
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    background: #f8fafc;
  }

  :global(#app) {
    height: 100vh;
  }

  /* Map styling adjustments */
  :global(.map-container .leaflet-container) {
    height: 100% !important;
    width: 100% !important;
  }

  :global(.leaflet-control-container) {
    z-index: 100;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .main-content {
      flex-direction: column;
    }
    
    .map-container {
      height: 60vh;
    }
    
    .map-container.expanded {
      margin-left: 0;
      height: 80vh;
    }
  }
</style>
