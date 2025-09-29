<script>
  import Navbar from './NavBar.svelte';
  import FindingsPanel from './FindingsPanel.svelte';
  import MapPanel from './MapPanel.svelte';
  import ReportGenerator from './ReportGenerator.svelte';
  import { analyzeHeritage, analyzeLandscape, analyzeAgLand, analyzeRenewables, analyzeEcology } from '$lib/services/api.js';

  /** @type {Record<string, any> | null} */
  let heritageResult = null;
  /** @type {Record<string, any> | null} */
  let landscapeResult = null;
  /** @type {Record<string, any> | null} */
  let agLandResult = null;
  /** @type {Record<string, any> | null} */
  let renewablesResult = null;
  /** @type {Record<string, any> | null} */
  let ecologyResult = null;
  /** @type {string} */
  let errorMsg = '';
  /** @type {boolean} */
  let loading = false;
  /** @type {string} */
  let activeTab = 'analysis';

  /** @param {any} geometry */
  async function handlePolygonDrawn(geometry) {
    errorMsg = '';
    heritageResult = null;
    landscapeResult = null;
    agLandResult = null;
    renewablesResult = null;
    ecologyResult = null;
    loading = true;
    
    try {
      // Run heritage, landscape, agricultural land, renewables, and ecology analysis in parallel
      const [heritageData, landscapeData, agLandData, renewablesData, ecologyData] = await Promise.all([
        analyzeHeritage(geometry),
        analyzeLandscape(geometry),
        analyzeAgLand(geometry),
        analyzeRenewables(geometry),
        analyzeEcology(geometry)
      ]);
      
      console.log('🔍 API Results:', {
        heritage: heritageData,
        landscape: landscapeData,
        agLand: agLandData,
        renewables: renewablesData,
        ecology: ecologyData
      });
      
      heritageResult = heritageData;
      landscapeResult = landscapeData;
      agLandResult = agLandData;
      renewablesResult = renewablesData;
      ecologyResult = ecologyData;
    } catch (/** @type {any} */ err) {
      errorMsg = err?.message || String(err);
    } finally {
      loading = false;
    }
  }

  function openReport() {
    console.log('🔍 Opening report with data:', {
      heritage: !!heritageResult,
      landscape: !!landscapeResult,
      renewables: !!renewablesResult,
      ecology: !!ecologyResult,
      agLand: !!agLandResult,
      heritageData: heritageResult,
      landscapeData: landscapeResult,
      renewablesData: renewablesResult,
      ecologyData: ecologyResult,
      agLandData: agLandResult
    });
    activeTab = 'report';
  }

  function setActiveTab(tab) {
    activeTab = tab;
  }

  // Check if we have any results for the Generate Report button
  $: hasResults = !!(heritageResult || landscapeResult || agLandResult || renewablesResult || ecologyResult);
</script>

<div class="dashboard">
  <div class="findings-section">
    <Navbar />

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button
        class="tab-button {activeTab === 'analysis' ? 'active' : ''}"
        on:click={() => setActiveTab('analysis')}
      >
        Site Analysis
      </button>
      <button
        class="tab-button {activeTab === 'report' ? 'active' : ''}"
        on:click={() => setActiveTab('report')}
        disabled={!hasResults}
      >
        Report
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      {#if activeTab === 'analysis'}
        <FindingsPanel
          {heritageResult}
          {landscapeResult}
          {agLandResult}
          {renewablesResult}
          {ecologyResult}
          {loading}
          {errorMsg}
        />
      {:else if activeTab === 'report'}
        <ReportGenerator
          heritageData={heritageResult}
          landscapeData={landscapeResult}
          renewablesData={renewablesResult}
          ecologyData={ecologyResult}
          agLandData={agLandResult}
        />
      {/if}
    </div>
  </div>

  <MapPanel
    onPolygonDrawn={handlePolygonDrawn}
    {loading}
    heritageData={heritageResult}
  />
</div>
