<script>
  /**
   * @typedef {Object} RenewableItem
   * @property {number} id - Development ID
   * @property {string} site_name - Site name
   * @property {string} development_status_short - Development status (short)
   * @property {string} technology_type - Technology type
   * @property {string} installed_capacity_mw - Installed capacity in MW
   * @property {number} dist_m - Distance in meters
   * @property {boolean} on_site - Whether on site
   * @property {boolean} within_50m - Within 50m buffer
   * @property {boolean} within_100m - Within 100m buffer
   * @property {boolean} within_250m - Within 250m buffer
   * @property {boolean} within_500m - Within 500m buffer
   * @property {boolean} within_1km - Within 1km buffer
   * @property {boolean} within_3km - Within 3km buffer
   * @property {boolean} within_5km - Within 5km buffer
   * @property {string} direction - Compass direction
   */

  /** @type {RenewableItem[] | undefined} */
  export let renewables = [];
  /** @type {string} */
  export let title = 'Renewables Results';
  /** @type {boolean} */
  export let loading = false;
  /** @type {string} */
  export let error = '';

  $: developmentsFound = (renewables || []).length;
  $: safeRenewables = renewables || [];
  $: onSiteDevelopments = safeRenewables.filter(r => r.on_site);
  $: nearbyDevelopments = safeRenewables.filter(r => !r.on_site);

  /** @param {RenewableItem} item */
  function getClosestBuffer(item) {
    if (item.on_site) return 'On-site';
    if (item.within_50m) return '50m';
    if (item.within_100m) return '100m';
    if (item.within_250m) return '250m';
    if (item.within_500m) return '500m';
    if (item.within_1km) return '1km';
    if (item.within_3km) return '3km';
    if (item.within_5km) return '5km';
    return 'Beyond 5km';
  }

  /** @param {string} techType */
  function getTechIcon(techType) {
    if (techType === 'Solar Photovoltaics') return '☀️';
    if (techType === 'Wind Onshore') return '💨';
    if (techType === 'Battery') return '🔋';
    return '⚡';
  }
</script>

{#if loading}
  <div class="analysis-results">
    <div class="results-loading">
      <p>🔍 Analyzing renewable energy developments…</p>
    </div>
  </div>
{:else if error}
  <div class="results-error">
    <strong>Analysis Error:</strong> {error}
  </div>
{:else}
  <div class="analysis-results">
    <h2>⚡ {title}</h2>

    <!-- Summary cards -->
    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-label">Total Found</div>
        <div class="summary-value">{developmentsFound}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">On-site</div>
        <div class="summary-value">{onSiteDevelopments.length}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Nearby</div>
        <div class="summary-value">{nearbyDevelopments.length}</div>
      </div>
    </div>

    <!-- Individual development cards -->
    <div class="results-grid">
      {#each safeRenewables as item}
        <div class="result-item">
          <div class="item-header">
            <h4 class="item-title">
              {getTechIcon(item.technology_type)} {item.site_name || `Development ${item.id}`}
            </h4>
            <span class="item-distance">{getClosestBuffer(item)}</span>
          </div>
          <div class="item-details">
            <div class="detail-row">
              <span class="detail-label">Technology</span>
              <span class="detail-value">{item.technology_type}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span class="detail-value">{item.development_status_short || 'Unknown'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Capacity</span>
              <span class="detail-value">{item.installed_capacity_mw || 'Unknown'} MW</span>
            </div>
            {#if !item.on_site}
              <div class="detail-row">
                <span class="detail-label">Distance</span>
                <span class="detail-value">{item.dist_m}m {item.direction}</span>
              </div>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
