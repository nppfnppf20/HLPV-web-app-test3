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
  $: within1kmCount = items.filter(i => i.dist_m <= 1000).length;
  $: greenBeltStatus = onSiteCount > 0 ? 'Yes' : (within1kmCount > 0 ? 'Nearby' : 'No');

  // AONB computed
  $: aonbNearest = (() => {
    // Support both legacy buffered shape and direct feature array
    if (Array.isArray(aonb)) {
      const candidates = aonb.filter((/** @type {any} */ a) => !a.on_site);
      if (candidates.length === 0) return null;
      const nearest = candidates.reduce((/** @type {any} */ min, /** @type {any} */ a) => (a.dist_m < min.dist_m ? a : min), candidates[0]);
      return { name: nearest.name, distance_m: nearest.dist_m, direction: nearest.direction };
    }
    return aonb?.nearest_within_1km || null;
  })();
  $: aonbBufferTotals = (() => {
    /** @type {Record<number, number>} */
    const map = {};
    if (Array.isArray(aonb)) {
      const onSiteCount = aonb.filter((/** @type {any} */ a) => a.on_site).length;
      const within1kmCount = aonb.filter((/** @type {any} */ a) => !a.on_site && a.within_1km).length;
      map[0] = onSiteCount;
      map[1000] = within1kmCount;
    } else {
      const arr = aonb?.buffers || [];
      for (const row of arr) {
        const d = Number(row?.distance_m) || 0;
        const c = Number(row?.feature_count) || 0;
        map[d] = (map[d] || 0) + c;
      }
    }
    return Object.entries(map)
      .map(([k,v]) => ({ distance_m: Number(k), count: Number(v) }))
      .sort((a,b) => a.distance_m - b.distance_m);
  })();
  $: aonbOnSite = aonbBufferTotals.find(row => row.distance_m === 0)?.count || 0;
  $: aonbWithin1km = aonbBufferTotals.find(row => row.distance_m === 1000)?.count || 0;
  $: aonbStatus = aonbOnSite > 0 ? 'Yes' : (aonbWithin1km > 0 ? 'Nearby' : 'No');
  $: aonbOnSiteName = aonbOnSite > 0 && aonb?.buffers ? aonb.buffers.find(row => row.distance_m === 0)?.name : null;
  $: aonbItems = Array.isArray(aonb) ? aonb : [];
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
        <p class="summary-value">{greenBeltStatus}</p>
        {#if greenBeltStatus === 'Yes'}
          <p style="font-size: 0.875rem; color: #059669; margin: 0.25rem 0 0 0;">
            On site
          </p>
        {:else if greenBeltStatus === 'Nearby'}
          <p style="font-size: 0.875rem; color: #d97706; margin: 0.25rem 0 0 0;">
            Within 1km
          </p>
        {/if}
      </div>
      
      <div class="summary-card">
        <h3>AONB</h3>
        <p class="summary-value">{aonbStatus}</p>
        {#if aonbStatus === 'Yes'}
          <p style="font-size: 0.875rem; color: #059669; margin: 0.25rem 0 0 0;">
            On site
          </p>
        {:else if aonbStatus === 'Nearby'}
          <p style="font-size: 0.875rem; color: #d97706; margin: 0.25rem 0 0 0;">
            Within 1km
          </p>
        {:else if aonbNearest}
          <p style="font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0 0 0;">
            Nearest: {aonbNearest.distance_m}m away
          </p>
        {/if}
      </div>
    </div>

    <!-- Green Belt Section -->
    {#if greenBeltStatus !== 'No'}
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
    {#if aonbStatus !== 'No' || aonbNearest}
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
            <h3 class="section-title">Areas of Outstanding Natural Beauty</h3>
            {#if aonbStatus === 'Yes'}
              <span class="section-subtitle">On site</span>
            {:else if aonbStatus === 'Nearby'}
              <span class="section-subtitle">Within 1km</span>
            {:else if aonbNearest}
              <span class="section-subtitle">{aonbNearest.name} - {aonbNearest.distance_m}m {aonbNearest.direction || ''}</span>
            {/if}
          </div>
          <span class="expand-icon">{aonbExpanded ? '▼' : '▶'}</span>
        </div>

        {#if aonbExpanded}
          <div class="results-grid">
            {#if aonbItems.length > 0}
              {#each aonbItems as area}
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
                  </div>
                </div>
              {/each}
            {:else if aonbStatus === 'Yes' && aonbOnSiteName}
              <div class="result-item">
                <div class="item-header">
                  <h4 class="item-title">{aonbOnSiteName}</h4>
                </div>
                <div class="item-details">
                  <div class="detail-row">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">On site</span>
                  </div>
                </div>
              </div>
            {:else if aonbNearest && aonbStatus === 'No'}
              <div class="result-item">
                <div class="item-header">
                  <h4 class="item-title">{aonbNearest.name}</h4>
                </div>
                <div class="item-details">
                  <div class="detail-row">
                    <span class="detail-label">Distance</span>
                    <span class="detail-value">{aonbNearest.distance_m}m</span>
                  </div>
                  {#if aonbNearest.direction}
                    <div class="detail-row">
                      <span class="detail-label">Direction</span>
                      <span class="detail-value">{aonbNearest.direction}</span>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/if}




