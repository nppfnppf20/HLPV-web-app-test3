<script>
  /** @type {any[] | null} */
  export let greenBelt = null;
  /** @type {{ buffers?: any[], nearest_within_1km?: { name?: string, distance_m?: number, direction?: string } } | null} */
  export let aonb = null;
  /** @type {string} */
  export let title = 'Landscape Results';
  /** @type {boolean} */
  export let loading = false;
  /** @type {string} */
  export let error = '';

  // Helpers
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
   */
  function getStatusBadges(item) {
    /** @type {{ text: string, class: string }[]} */
    const badges = [];

    if (item.on_site) {
      badges.push({ text: 'ON SITE', class: 'badge-on-site' });
    } else if (item.within_100m) {
      badges.push({ text: 'WITHIN 100M', class: 'badge-nearby' });
    } else {
      badges.push({ text: `${item.dist_m}M AWAY`, class: 'badge-distant' });
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

  // State
  let greenBeltExpanded = false;
  let aonbExpanded = false;

  // Computed
  $: items = greenBelt || [];
  $: total = items.length;
  $: onSiteCount = items.filter(i => i.on_site).length;

  // AONB computed
  $: aonbNearest = aonb?.nearest_within_1km || null;
  $: aonbBufferTotals = (() => {
    /** @type {Record<number, number>} */
    const map = {};
    const arr = aonb?.buffers || [];
    for (const row of arr) {
      const d = Number(row?.distance_m) || 0;
      const c = Number(row?.feature_count) || 0;
      map[d] = (map[d] || 0) + c;
    }
    return Object.entries(map)
      .map(([k,v]) => ({ distance_m: Number(k), count: Number(v) }))
      .sort((a,b) => a.distance_m - b.distance_m);
  })();
  $: aonbTotalFeatures = aonbBufferTotals.reduce((sum, row) => sum + row.count, 0);
  $: aonbOnSite = aonbBufferTotals.find(row => row.distance_m === 0)?.count || 0;
</script>

{#if loading}
  <div class="analysis-results">
    <div class="results-loading">
      <p>🔍 Analyzing ecology layers...</p>
    </div>
  </div>
{:else if error}
  <div class="results-error">
    <strong>Analysis Error:</strong> {error}
  </div>
{:else}
  <div class="analysis-results">
    <h2>🌄 {title}</h2>

    <!-- Summary Cards -->
    <div class="results-summary">
      <div class="summary-card">
        <h3>Green Belt</h3>
        <p class="summary-value">{total}</p>
        {#if onSiteCount > 0}
          <p style="font-size: 0.875rem; color: #059669; margin: 0.25rem 0 0 0;">
            {onSiteCount} on site
          </p>
        {/if}
      </div>
      
      <div class="summary-card">
        <h3>AONB</h3>
        <p class="summary-value">{aonbTotalFeatures}</p>
        {#if aonbOnSite > 0}
          <p style="font-size: 0.875rem; color: #059669; margin: 0.25rem 0 0 0;">
            {aonbOnSite} intersecting
          </p>
        {/if}
        {#if aonbNearest && aonbTotalFeatures === 0}
          <p style="font-size: 0.875rem; color: #d97706; margin: 0.25rem 0 0 0;">
            Nearest: {aonbNearest.distance_m}m away
          </p>
        {/if}
      </div>
    </div>

    <!-- Green Belt Section -->
    {#if items.length > 0}
      <div class="results-section">
        <div 
          class="section-header clickable" 
          on:click={() => greenBeltExpanded = !greenBeltExpanded}
          on:keydown={(e) => e.key === 'Enter' && (greenBeltExpanded = !greenBeltExpanded)}
          role="button"
          tabindex="0"
          aria-expanded={greenBeltExpanded}
        >
          <div class="section-header-content">
            <span class="section-icon">🟢</span>
            <h3 class="section-title">Green Belt ({total})</h3>
            {#if onSiteCount > 0}
              <span class="section-subtitle">{onSiteCount} on site</span>
            {/if}
          </div>
          <span class="expand-icon">{greenBeltExpanded ? '▼' : '▶'}</span>
        </div>

        {#if greenBeltExpanded}
          <div class="results-grid">
            {#each items as area}
              <div class="result-item">
                <div class="item-header">
                  <h4 class="item-title">{area.name || `Area #${area.id}`}</h4>
                  <div class="status-badges">
                    {#each getStatusBadges(area) as badge}
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

                  {#if area.within_100m !== undefined}
                    <div class="detail-row">
                      <span class="detail-label">Within 100m</span>
                      <span class="detail-value">{area.within_100m ? 'Yes' : 'No'}</span>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <div class="results-empty">
        <p>🌄 No Green Belt areas found in the analyzed area.</p>
      </div>
    {/if}

    <!-- AONB Section -->
    <div class="results-section" style="margin-top: 1rem;">
      <div 
        class="section-header clickable" 
        on:click={() => aonbExpanded = !aonbExpanded}
        on:keydown={(e) => e.key === 'Enter' && (aonbExpanded = !aonbExpanded)}
        role="button"
        tabindex="0"
        aria-expanded={aonbExpanded}
      >
        <div class="section-header-content">
          <span class="section-icon">🏞️</span>
          <h3 class="section-title">Areas of Outstanding Natural Beauty (AONB)</h3>
          {#if aonbNearest}
            <span class="section-subtitle">Nearest within 1 km: {aonbNearest.name} ({aonbNearest.distance_m} m {aonbNearest.direction})</span>
          {/if}
        </div>
        <span class="expand-icon">{aonbExpanded ? '▼' : '▶'}</span>
      </div>

      {#if aonbExpanded}
        <div class="results-grid">
          <div class="result-item">
            <div class="item-header">
              <h4 class="item-title">Buffer summary</h4>
            </div>
            <div class="item-details">
              {#if aonbBufferTotals.length > 0}
                {#each aonbBufferTotals as row}
                  <div class="detail-row">
                    <span class="detail-label">Within {row.distance_m === 0 ? 'intersect' : `${row.distance_m} m`}</span>
                    <span class="detail-value">{row.count}</span>
                  </div>
                {/each}
              {:else}
                <div class="detail-row">
                  <span class="detail-label">No AONB features found</span>
                  <span class="detail-value">0</span>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}




