<script>
  import Navbar from './NavBar.svelte';
  import FindingsPanel from './FindingsPanel.svelte';
  import MapPanel from './MapPanel.svelte';
  import ReportGenerator from './ReportGenerator.svelte';
  import TRPReportGenerator from './TRPReportGenerator.svelte';
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
  /** @type {boolean} */
  let trpReportVisible = false;

  /** @param {any} geometry */
  async function handlePolygonDrawn(geometry) {
    console.log('🎯 Polygon drawn, starting analysis...', geometry);
    errorMsg = '';
    heritageResult = null;
    landscapeResult = null;
    agLandResult = null;
    renewablesResult = null;
    ecologyResult = null;
    loading = true;
    
    try {
      console.log('🚀 Starting analysis requests...');
      // Run heritage, landscape, agricultural land, renewables, and ecology analysis in parallel
      const [heritageData, landscapeData, agLandData, renewablesData, ecologyData] = await Promise.all([
        analyzeHeritage(geometry).then(data => { console.log('✅ Heritage analysis complete'); return data; }),
        analyzeLandscape(geometry).then(data => { console.log('✅ Landscape analysis complete'); return data; }),
        analyzeAgLand(geometry).then(data => { console.log('✅ AgLand analysis complete'); return data; }),
        analyzeRenewables(geometry).then(data => { console.log('✅ Renewables analysis complete'); return data; }),
        analyzeEcology(geometry).then(data => { console.log('✅ Ecology analysis complete'); return data; })
      ]);
      console.log('🎉 All analyses complete!');
      
      console.log('🔍 API Results:', {
        heritage: heritageData,
        landscape: landscapeData,
        agLand: agLandData,
        renewables: renewablesData,
        ecology: ecologyData
      });

      console.log('🌱 Renewables structure details:', renewablesData);
      if (renewablesData && renewablesData.renewables) {
        console.log('🔍 First renewables item:', renewablesData.renewables[0]);
        console.log('🔍 Renewables item keys:', Object.keys(renewablesData.renewables[0] || {}));
      }

      console.log('🏛️ Heritage structure details:', heritageData);
      if (heritageData && heritageData.scheduled_monuments) {
        console.log('🔍 First heritage monument:', heritageData.scheduled_monuments[0]);
        console.log('🔍 Heritage monument keys:', Object.keys(heritageData.scheduled_monuments[0] || {}));
      }
      if (heritageData && heritageData.listed_buildings) {
        console.log('🔍 First listed building:', heritageData.listed_buildings[0]);
        console.log('🔍 Listed building keys:', Object.keys(heritageData.listed_buildings[0] || {}));
      }
      
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

  function openTRPReport() {
    trpReportVisible = true;
    activeTab = 'trp-report';
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
      {#if trpReportVisible}
        <button
          class="tab-button {activeTab === 'trp-report' ? 'active' : ''}"
          on:click={() => setActiveTab('trp-report')}
        >
          TRP Report
        </button>
      {/if}
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
          onOpenTRPReport={openTRPReport}
        />
      {:else if activeTab === 'trp-report'}
        <TRPReportGenerator
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
    landscapeData={landscapeResult}
    renewablesData={renewablesResult}
  />
</div>
