<script>
  /** @type {{ listed_buildings?: any[], conservation_areas?: any[] } | null} */
  export let data = null;
  
  /** @type {string} */
  export let title = "Analysis Results";
  
  /** @type {boolean} */
  export let loading = false;
  
  /** @type {string} */
  export let error = '';

  // Helper functions
  /**
   * @param {number} distance
   * @param {boolean} onSite
   */
  function getDistanceClass(distance, onSite) {
    if (onSite) return 'on-site';
    if (distance <= 100) return 'nearby';
    return 'distant';
  }

  /**
   * @param {any} item
   * @param {string} type
   */
  function getStatusBadges(item, type) {
    /** @type {{ text: string, class: string }[]} */
    const badges = [];
    
    if (item.on_site) {
      badges.push({ text: 'ON SITE', class: 'badge-on-site' });
    } else {
      const distance = item.dist_m;
      if (type === 'listed_buildings') {
        if (distance <= 100) badges.push({ text: 'WITHIN 100M', class: 'badge-nearby' });
        else badges.push({ text: `${distance}M AWAY`, class: 'badge-distant' });
      } else if (type === 'conservation_areas') {
        if (item.within_250m) badges.push({ text: 'WITHIN 250M', class: 'badge-nearby' });
        else badges.push({ text: `${distance}M AWAY`, class: 'badge-distant' });
      }
    }
    
    if (item.grade) {
      badges.push({ text: `GRADE ${item.grade}`, class: 'badge-grade' });
    }
    
    if (item.direction && item.direction !== 'N/A') {
      badges.push({ text: item.direction, class: 'badge-direction' });
    }
    
    return badges;
  }

  /**
   * @param {number} distance
   * @param {boolean} onSite
   */
  function formatDistance(distance, onSite) {
    if (onSite) return 'On Site';
    if (distance < 1000) return `${distance}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  }

  // State for expandable sections
  let listedBuildingsExpanded = false;
  let conservationAreasExpanded = false;

  // Computed values
  $: listedBuildings = data?.listed_buildings || [];
  $: conservationAreas = data?.conservation_areas || [];
  $: totalListedBuildings = listedBuildings.length;
  $: totalConservationAreas = conservationAreas.length;
  $: onSiteBuildings = listedBuildings.filter(b => b.on_site).length;
  $: onSiteAreas = conservationAreas.filter(a => a.on_site).length;
</script>

{#if loading}
  <div class="analysis-results">
    <div class="results-loading">
      <p>Analysing site...</p>
    </div>
  </div>
{:else if error}
  <div class="results-error">
    <strong>Analysis Error:</strong> {error}
  </div>
{:else if data}
  <div class="analysis-results">
    <h2>{title}</h2>
    
    <!-- Summary Cards -->
    <div class="results-summary">
      <div class="summary-card">
        <h3>Listed Buildings</h3>
        <p class="summary-value">{totalListedBuildings}</p>
        {#if onSiteBuildings > 0}
          <p style="font-size: 0.875rem; color: #059669; margin: 0.25rem 0 0 0;">
            {onSiteBuildings} on site
          </p>
        {/if}
      </div>
      
      <div class="summary-card">
        <h3>Conservation Areas</h3>
        <p class="summary-value">{totalConservationAreas}</p>
        {#if onSiteAreas > 0}
          <p style="font-size: 0.875rem; color: #059669; margin: 0.25rem 0 0 0;">
            {onSiteAreas} intersecting
          </p>
        {/if}
      </div>
    </div>

    <!-- Listed Buildings Section -->
    {#if listedBuildings.length > 0}
      <div class="results-section">
        <div 
          class="section-header clickable" 
          on:click={() => listedBuildingsExpanded = !listedBuildingsExpanded}
          on:keydown={(e) => e.key === 'Enter' && (listedBuildingsExpanded = !listedBuildingsExpanded)}
          role="button"
          tabindex="0"
          aria-expanded={listedBuildingsExpanded}
        >
          <div class="section-header-content">
            <span class="section-icon"></span>
            <h3 class="section-title">Listed Buildings ({totalListedBuildings})</h3>
            {#if onSiteBuildings > 0}
              <span class="section-subtitle">{onSiteBuildings} on site</span>
            {/if}
          </div>
          <span class="expand-icon">{listedBuildingsExpanded ? '▼' : '▶'}</span>
        </div>
        
        {#if listedBuildingsExpanded}
          <div class="results-grid">
            {#each listedBuildings as building}
              <div class="result-item">
                <div class="item-header">
                  <h4 class="item-title">{building.name || `Building #${building.id}`}</h4>
                  <div class="status-badges">
                    {#each getStatusBadges(building, 'listed_buildings') as badge}
                      <span class="badge {badge.class}">{badge.text}</span>
                    {/each}
                  </div>
                </div>
                
                <div class="item-details">
                  {#if building.grade}
                    <div class="detail-row">
                      <span class="detail-label">Heritage Grade</span>
                      <span class="detail-value">Grade {building.grade}</span>
                    </div>
                  {/if}
                  
                  <div class="detail-row">
                    <span class="detail-label">Distance</span>
                    <span class="detail-value distance {getDistanceClass(building.dist_m, building.on_site)}">
                      {formatDistance(building.dist_m, building.on_site)}
                    </span>
                  </div>
                  
                  {#if building.direction && building.direction !== 'N/A'}
                    <div class="detail-row">
                      <span class="detail-label">Direction</span>
                      <span class="detail-value">{building.direction}</span>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Conservation Areas Section -->
    {#if conservationAreas.length > 0}
      <div class="results-section">
        <div 
          class="section-header clickable" 
          on:click={() => conservationAreasExpanded = !conservationAreasExpanded}
          on:keydown={(e) => e.key === 'Enter' && (conservationAreasExpanded = !conservationAreasExpanded)}
          role="button"
          tabindex="0"
          aria-expanded={conservationAreasExpanded}
        >
          <div class="section-header-content">
            <span class="section-icon"></span>
            <h3 class="section-title">Conservation Areas ({totalConservationAreas})</h3>
            {#if onSiteAreas > 0}
              <span class="section-subtitle">{onSiteAreas} intersecting</span>
            {/if}
          </div>
          <span class="expand-icon">{conservationAreasExpanded ? '▼' : '▶'}</span>
        </div>
        
        {#if conservationAreasExpanded}
          <div class="results-grid">
            {#each conservationAreas as area}
              <div class="result-item">
                <div class="item-header">
                  <h4 class="item-title">{area.name || `Area #${area.id}`}</h4>
                  <div class="status-badges">
                    {#each getStatusBadges(area, 'conservation_areas') as badge}
                      <span class="badge {badge.class}">{badge.text}</span>
                    {/each}
                  </div>
                </div>
                
                <div class="item-details">
                  <div class="detail-row">
                    <span class="detail-label">Distance</span>
                    <span class="detail-value distance {getDistanceClass(area.dist_m, area.on_site)}">
                      {formatDistance(area.dist_m, area.on_site)}
                    </span>
                  </div>
                  
                  {#if area.direction && area.direction !== 'N/A'}
                    <div class="detail-row">
                      <span class="detail-label">Direction</span>
                      <span class="detail-value">{area.direction}</span>
                    </div>
                  {/if}
                  
                  {#if area.within_250m !== undefined}
                    <div class="detail-row">
                      <span class="detail-label">Within 250m</span>
                      <span class="detail-value">{area.within_250m ? 'Yes' : 'No'}</span>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Empty state -->
    {#if listedBuildings.length === 0 && conservationAreas.length === 0}
      <div class="results-empty">
        <p>No heritage assets found in the analyzed area.</p>
        <p style="font-size: 0.875rem; margin-top: 0.5rem;">Try drawing a larger polygon or a different location.</p>
      </div>
    {/if}
  </div>
{/if}
