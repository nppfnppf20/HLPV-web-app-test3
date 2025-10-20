<script>
  import MapPanel from './MapPanel.svelte';
  import SocioeconomicsSpreadsheet from './SocioeconomicsSpreadsheet.svelte';
  import { goto } from '$app/navigation';
  import { analyzeSocioeconomics } from '$lib/services/socioeconomicsApi.js';

  /** @type {any | null} */
  let currentPolygonGeometry = null;
  /** @type {any | null} */
  let socioeconomicsResult = null;
  /** @type {boolean} */
  let loading = false;
  /** @type {string} */
  let errorMsg = '';

  /** @param {any} geometry */
  async function handlePolygonDrawn(geometry) {
    console.log('🎯 Socioeconomics: Polygon drawn', geometry);
    currentPolygonGeometry = geometry;

    // Reset state
    socioeconomicsResult = null;
    errorMsg = '';
    loading = true;

    try {
      console.log('🚀 Starting socioeconomics analysis...');
      const result = await analyzeSocioeconomics(geometry);
      console.log('✅ Socioeconomics analysis complete:', result);
      socioeconomicsResult = result;
    } catch (error) {
      console.error('❌ Socioeconomics analysis failed:', error);
      errorMsg = error.message || 'Analysis failed';
    } finally {
      loading = false;
    }
  }

  function goHome() {
    goto('/');
  }
</script>

<div class="dashboard">
  <!-- Simple left panel -->
  <div class="findings-section">
    <!-- Simple navbar -->
    <nav class="navbar">
      <div class="navbar-content">
        <button
          class="home-button"
          on:click={goHome}
          title="Back to Home">
          <i class="las la-home"></i>
          <span>Home</span>
        </button>
        <h1 class="navbar-title">Socioeconomics Tool</h1>
      </div>
    </nav>

    <!-- Simple content area -->
    <div class="findings-panel">
      {#if loading}
        <div class="loading-state">
          <div class="loading-icon">
            <i class="las la-spinner"></i>
          </div>
          <h2>Analyzing Socioeconomics Data...</h2>
          <p>Running spatial analysis on the Socioeconomics schema</p>
        </div>
      {:else if errorMsg}
        <div class="error-state">
          <div class="error-icon">
            <i class="las la-exclamation-triangle"></i>
          </div>
          <h2>Analysis Error</h2>
          <p>{errorMsg}</p>
        </div>
      {:else if socioeconomicsResult}
        <div class="results-content">
          <div class="results-header">
            <div class="results-icon">
              <i class="las la-chart-bar"></i>
            </div>
            <h2>Socioeconomics Analysis Results</h2>
            <p>Generated: {new Date(socioeconomicsResult.metadata?.generatedAt).toLocaleString()}</p>
            <div class="results-summary">
              <span class="summary-stat">
                <strong>{socioeconomicsResult.metadata?.totalLayers || 0}</strong> layers analyzed
              </span>
              <span class="summary-stat">
                <strong>{socioeconomicsResult.metadata?.layersWithData || 0}</strong> layers with data
              </span>
            </div>
          </div>

          <SocioeconomicsSpreadsheet {socioeconomicsResult} />
        </div>
      {:else}
        <div class="welcome-content">
          <div class="welcome-icon">
            <i class="las la-chart-bar"></i>
          </div>
          <h2>Draw a Polygon to Analyze</h2>
          <p>Use the drawing tools on the map to create a polygon. The polygon will be analyzed against the socioeconomics database.</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Map panel (reused from HLPV) -->
  <MapPanel
    onPolygonDrawn={handlePolygonDrawn}
    loading={loading}
    heritageData={null}
    landscapeData={null}
    renewablesData={null}
  />
</div>

<style>
  .navbar-content {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .home-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 0.375rem;
    color: white;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .home-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .home-button i {
    font-size: 1.125rem;
  }

  .welcome-content {
    padding: 2rem;
    text-align: center;
  }

  .welcome-icon {
    width: 4rem;
    height: 4rem;
    background: #dcfce7;
    color: #16a34a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }

  .welcome-icon i {
    font-size: 2rem;
  }

  .welcome-content h2 {
    color: #1e293b;
    margin-bottom: 1rem;
  }

  .welcome-content p {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 2rem;
  }

  .polygon-info {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    padding: 1rem;
    margin-top: 2rem;
    text-align: left;
  }

  .polygon-info h3 {
    color: #16a34a;
    margin: 0 0 0.5rem 0;
  }

  .polygon-info p {
    margin: 0 0 0.5rem 0;
    color: #166534;
  }

  .loading-state, .error-state {
    padding: 2rem;
    text-align: center;
  }

  .loading-icon, .error-icon {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
  }

  .loading-icon {
    background: #dbeafe;
    color: #3b82f6;
  }

  .loading-icon i {
    font-size: 2rem;
    animation: spin 1s linear infinite;
  }

  .error-icon {
    background: #fef2f2;
    color: #dc2626;
  }

  .error-icon i {
    font-size: 2rem;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .results-content {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .results-header {
    text-align: center;
    margin-bottom: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .results-icon {
    width: 3rem;
    height: 3rem;
    background: #dcfce7;
    color: #16a34a;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 0.75rem;
  }

  .results-icon i {
    font-size: 1.5rem;
  }

  .results-header h2 {
    color: #1e293b;
    margin-bottom: 0.5rem;
    font-size: 1.25rem;
  }

  .results-header p {
    color: #64748b;
    font-size: 0.875rem;
    margin-bottom: 0.75rem;
  }

  .results-summary {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
  }

  .summary-stat {
    color: #64748b;
    font-size: 0.875rem;
  }

  .summary-stat strong {
    color: #1e293b;
    font-weight: 600;
  }
</style>