<script>
  import MapPanel from './MapPanel.svelte';
  import { goto } from '$app/navigation';

  /** @type {any | null} */
  let currentPolygonGeometry = null;

  /** @param {any} geometry */
  async function handlePolygonDrawn(geometry) {
    console.log('🎯 Socioeconomics: Polygon drawn', geometry);
    currentPolygonGeometry = geometry;

    // For now, just log the polygon. You can add API call later
    console.log('📍 Polygon will be sent to socioeconomics schema:', geometry);
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
      <div class="welcome-content">
        <div class="welcome-icon">
          <i class="las la-chart-bar"></i>
        </div>
        <h2>Draw a Polygon to Analyze</h2>
        <p>Use the drawing tools on the map to create a polygon. The polygon will be analyzed against the socioeconomics database.</p>

        {#if currentPolygonGeometry}
          <div class="polygon-info">
            <h3>✅ Polygon Created</h3>
            <p>Polygon coordinates captured and ready for analysis.</p>
            <small>Coordinates: {JSON.stringify(currentPolygonGeometry.coordinates[0].slice(0, 2))}...</small>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Map panel (reused from HLPV) -->
  <MapPanel
    onPolygonDrawn={handlePolygonDrawn}
    loading={false}
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

  .polygon-info small {
    color: #15803d;
    font-family: monospace;
  }
</style>