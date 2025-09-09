<script>
  /** @type {any[] | null} */
  export let greenBelt = null;
  /** @type {string} */
  export let title = 'Ecology Results';
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

  // Computed
  $: items = greenBelt || [];
  $: total = items.length;
  $: onSiteCount = items.filter(i => i.on_site).length;
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
    <h2>🌿 {title}</h2>

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
        <p>🌿 No Green Belt areas found in the analyzed area.</p>
      </div>
    {/if}
  </div>
{/if}

<style>
  .analysis-results {
    margin-top: 1rem;
  }

  .results-loading,
  .results-error,
  .results-empty {
    padding: 1rem;
    border-radius: 8px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
  }

  .results-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    margin: 1rem 0 1.5rem 0;
  }

  .summary-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
  }

  .summary-card h3 {
    margin: 0 0 0.25rem 0;
    color: #374151;
  }
  .summary-value {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 0;
    color: #111827;
  }

  .results-section {
    margin-top: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    background: white;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #e5e7eb;
    background: #f9fafb;
  }
  .section-header.clickable { cursor: pointer; }
  .section-header-content { display: flex; align-items: center; gap: 0.5rem; }
  .section-icon { font-size: 1.25rem; }
  .section-title { margin: 0; font-size: 1rem; color: #111827; }
  .section-subtitle { font-size: 0.875rem; color: #6b7280; }
  .expand-icon { color: #6b7280; }

  .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; padding: 1rem; }
  .result-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; }

  .item-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
  .item-title { margin: 0; font-size: 1rem; color: #111827; }
  .status-badges { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; }
  .badge-on-site { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
  .badge-nearby { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
  .badge-distant { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
  .badge-direction { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }

  .item-details { margin-top: 0.75rem; display: grid; gap: 0.5rem; }
  .detail-row { display: flex; justify-content: space-between; }
  .detail-label { color: #6b7280; }
  .detail-value { color: #111827; font-weight: 600; }
  .detail-value.distance.on-site { color: #059669; }
  .detail-value.distance.nearby { color: #d97706; }
  .detail-value.distance.distant { color: #2563eb; }
</style>



