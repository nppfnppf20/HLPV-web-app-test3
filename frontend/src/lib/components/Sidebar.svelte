<script>
  import { createEventDispatcher } from 'svelte';
  import AnalysisCard from './AnalysisCard.svelte';
  
  const dispatch = createEventDispatcher();
  
  export let isCollapsed = false;
  export let heritageData = null;
  export let landscapeData = null;
  export let agLandData = null;
  export let loading = false;
  export let error = '';
  
  // Filter state
  let activeFilters = {
    heritage: true,
    landscape: true,
    agricultural: true
  };
  
  let riskFilters = {
    showstopper: true,
    high_risk: true,
    medium_risk: true,
    low_risk: true
  };
  
  function toggleSidebar() {
    isCollapsed = !isCollapsed;
    dispatch('toggle', isCollapsed);
  }
  
  function startNewAnalysis() {
    dispatch('new-analysis');
  }
  
  function generateReport() {
    dispatch('generate-report');
  }
  
  function applyFilters() {
    dispatch('filters-changed', { activeFilters, riskFilters });
  }
  
  // Compute results summary
  $: hasResults = heritageData || landscapeData || agLandData;
  $: totalFeatures = [
    (heritageData as any)?.conservation_areas?.length || 0,
    (heritageData as any)?.listed_buildings?.length || 0,
    (landscapeData as any)?.aonb?.length || 0,
    (landscapeData as any)?.green_belt?.length || 0,
    (agLandData as any)?.ag_land?.length || 0
  ].reduce((sum, count) => sum + count, 0);
</script>

<aside class="sidebar" class:collapsed={isCollapsed}>
  <!-- Toggle Button -->
  <button class="toggle-btn" on:click={toggleSidebar}>
    <span class="toggle-icon">{isCollapsed ? '▶' : '◀'}</span>
  </button>
  
  <!-- Sidebar Content -->
  <div class="sidebar-content" class:hidden={isCollapsed}>
    <!-- Header -->
    <div class="sidebar-header">
      <h2 class="sidebar-title">Analysis Tools</h2>
      <button class="new-analysis-btn" on:click={startNewAnalysis}>
        <span class="btn-icon">➕</span>
        New Analysis
      </button>
    </div>
    
    <!-- Quick Stats -->
    {#if hasResults && !loading}
      <div class="stats-card">
        <div class="stats-header">
          <h3>Current Analysis</h3>
          <span class="feature-count">{totalFeatures} features found</span>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{((heritageData as any)?.conservation_areas?.length || 0) + ((heritageData as any)?.listed_buildings?.length || 0)}</span>
            <span class="stat-label">Heritage</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{((landscapeData as any)?.aonb?.length || 0) + ((landscapeData as any)?.green_belt?.length || 0)}</span>
            <span class="stat-label">Landscape</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{(agLandData as any)?.ag_land?.length || 0}</span>
            <span class="stat-label">Agricultural</span>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Analysis Instructions -->
    {#if !hasResults && !loading}
      <div class="instruction-card">
        <div class="instruction-icon">🗺️</div>
        <h3>Start Analysis</h3>
        <p>Draw a polygon on the map to analyze heritage assets, landscape designations, and agricultural land within your area of interest.</p>
        <div class="instruction-steps">
          <div class="step">
            <span class="step-number">1</span>
            <span>Click the polygon tool on the map</span>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <span>Draw your area of interest</span>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <span>View analysis results here</span>
          </div>
        </div>
      </div>
    {/if}
    
    <!-- Loading State -->
    {#if loading}
      <div class="loading-card">
        <div class="loading-spinner"></div>
        <h3>Analyzing Area</h3>
        <p>Processing heritage, landscape, and agricultural data...</p>
      </div>
    {/if}
    
    <!-- Error State -->
    {#if error}
      <div class="error-card">
        <div class="error-icon">⚠️</div>
        <h3>Analysis Error</h3>
        <p>{error}</p>
        <button class="retry-btn" on:click={startNewAnalysis}>Try Again</button>
      </div>
    {/if}
    
    <!-- Filters Section -->
    {#if hasResults && !loading}
      <div class="filters-section">
        <h3>Filters</h3>
        
        <!-- Analysis Type Filters -->
        <div class="filter-group">
          <h4>Analysis Types</h4>
          <label class="filter-checkbox">
            <input type="checkbox" bind:checked={activeFilters.heritage} on:change={applyFilters} />
            <span class="checkmark"></span>
            Heritage Assets
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" bind:checked={activeFilters.landscape} on:change={applyFilters} />
            <span class="checkmark"></span>
            Landscape Designations
          </label>
          <label class="filter-checkbox">
            <input type="checkbox" bind:checked={activeFilters.agricultural} on:change={applyFilters} />
            <span class="checkmark"></span>
            Agricultural Land
          </label>
        </div>
        
        <!-- Risk Level Filters -->
        <div class="filter-group">
          <h4>Risk Levels</h4>
          <label class="filter-checkbox risk-showstopper">
            <input type="checkbox" bind:checked={riskFilters.showstopper} on:change={applyFilters} />
            <span class="checkmark"></span>
            Showstopper
          </label>
          <label class="filter-checkbox risk-high">
            <input type="checkbox" bind:checked={riskFilters.high_risk} on:change={applyFilters} />
            <span class="checkmark"></span>
            High Risk
          </label>
          <label class="filter-checkbox risk-medium">
            <input type="checkbox" bind:checked={riskFilters.medium_risk} on:change={applyFilters} />
            <span class="checkmark"></span>
            Medium Risk
          </label>
          <label class="filter-checkbox risk-low">
            <input type="checkbox" bind:checked={riskFilters.low_risk} on:change={applyFilters} />
            <span class="checkmark"></span>
            Low Risk
          </label>
        </div>
      </div>
    {/if}
    
    <!-- Results Section -->
    {#if hasResults && !loading}
      <div class="results-section">
        <div class="results-header">
          <h3>Analysis Results</h3>
          <button class="report-btn" on:click={generateReport}>
            📄 Generate Report
          </button>
        </div>
        
        <!-- Heritage Results -->
        {#if heritageData && activeFilters.heritage}
          <AnalysisCard
            title="Heritage Assets"
            type="heritage"
            data={heritageData}
            icon="🏛️"
          />
        {/if}
        
        <!-- Landscape Results -->
        {#if landscapeData && activeFilters.landscape}
          <AnalysisCard
            title="Landscape Designations"
            type="landscape"
            data={landscapeData}
            icon="🌳"
          />
        {/if}
        
        <!-- Agricultural Results -->
        {#if agLandData && activeFilters.agricultural}
          <AnalysisCard
            title="Agricultural Land"
            type="agricultural"
            data={agLandData}
            icon="🚜"
          />
        {/if}
      </div>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    background: white;
    border-right: 1px solid #e5e7eb;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
    height: 100%;
    width: 400px;
    position: relative;
    transition: width 0.3s ease;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .sidebar.collapsed {
    width: 50px;
  }
  
  .toggle-btn {
    position: absolute;
    top: 50%;
    right: -15px;
    transform: translateY(-50%);
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
  }
  
  .toggle-btn:hover {
    background: #f9fafb;
    transform: translateY(-50%) scale(1.05);
  }
  
  .toggle-icon {
    font-size: 12px;
    color: #6b7280;
  }
  
  .sidebar-content {
    padding: 1.5rem;
    height: 100%;
    overflow-y: auto;
    transition: opacity 0.3s ease;
  }
  
  .sidebar-content.hidden {
    opacity: 0;
    pointer-events: none;
  }
  
  .sidebar-header {
    margin-bottom: 1.5rem;
  }
  
  .sidebar-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1rem 0;
  }
  
  .new-analysis-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    transition: background-color 0.2s ease;
  }
  
  .new-analysis-btn:hover {
    background: #2563eb;
  }
  
  .btn-icon {
    font-size: 0.875rem;
  }
  
  .stats-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .stats-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
  
  .feature-count {
    font-size: 0.75rem;
    color: #6b7280;
    background: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
  }
  
  .stat-item {
    text-align: center;
  }
  
  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
    margin-bottom: 0.25rem;
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .instruction-card {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .instruction-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .instruction-card h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: #0c4a6e;
    margin: 0 0 0.5rem 0;
  }
  
  .instruction-card p {
    color: #075985;
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    line-height: 1.5;
  }
  
  .instruction-steps {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .step {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    text-align: left;
  }
  
  .step-number {
    background: #0284c7;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 600;
    flex-shrink: 0;
  }
  
  .loading-card {
    background: #fefce8;
    border: 1px solid #fde047;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #fde047;
    border-top: 3px solid #ca8a04;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-card h3 {
    color: #a16207;
    margin: 0 0 0.5rem 0;
  }
  
  .loading-card p {
    color: #ca8a04;
    margin: 0;
    font-size: 0.875rem;
  }
  
  .error-card {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .error-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .error-card h3 {
    color: #dc2626;
    margin: 0 0 0.5rem 0;
  }
  
  .error-card p {
    color: #ef4444;
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
  }
  
  .retry-btn {
    background: #dc2626;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .filters-section {
    margin-bottom: 1.5rem;
  }
  
  .filters-section h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 1rem 0;
  }
  
  .filter-group {
    margin-bottom: 1.5rem;
  }
  
  .filter-group h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #4b5563;
    margin: 0 0 0.75rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  
  .filter-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #374151;
  }
  
  .filter-checkbox input[type="checkbox"] {
    width: 16px;
    height: 16px;
    margin: 0;
  }
  
  .risk-showstopper {
    color: #dc2626;
  }
  
  .risk-high {
    color: #ea580c;
  }
  
  .risk-medium {
    color: #f59e0b;
  }
  
  .risk-low {
    color: #059669;
  }
  
  .results-section {
    margin-bottom: 1.5rem;
  }
  
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .results-header h3 {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
  
  .report-btn {
    background: #10b981;
    color: white;
    border: none;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .report-btn:hover {
    background: #059669;
  }
  
  /* Scrollbar Styling */
  .sidebar-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .sidebar-content::-webkit-scrollbar-track {
    background: #f1f5f9;
  }
  
  .sidebar-content::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
  
  .sidebar-content::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Mobile Responsive Design */
  @media (max-width: 768px) {
    .sidebar {
      position: fixed;
      top: 64px; /* Header height */
      left: 0;
      z-index: 1000;
      width: 100vw;
      height: calc(100vh - 64px);
      transform: translateX(0);
      transition: transform 0.3s ease;
    }
    
    .sidebar.collapsed {
      transform: translateX(-100%);
      width: 100vw;
    }
    
    .toggle-btn {
      top: 20px;
      right: 20px;
      z-index: 1001;
    }
    
    .sidebar-content {
      padding: 1rem;
    }
    
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .new-analysis-btn {
      font-size: 0.8rem;
      padding: 0.5rem 0.75rem;
    }
    
    .sidebar-title {
      font-size: 1.1rem;
    }
  }
</style>
