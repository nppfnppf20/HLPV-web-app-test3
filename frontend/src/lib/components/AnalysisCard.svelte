<script>
  export let title = '';
  export let type = '';
  export let data = null;
  export let icon = '';
  
  // Determine risk level and counts
  function getRiskSummary(/** @type {any} */ data, /** @type {string} */ type) {
    let summary = {
      showstopper: 0,
      high_risk: 0,
      medium_risk: 0,
      low_risk: 0,
      total: 0
    };
    
    if (!data) return summary;
    
    if (type === 'heritage') {
      // Process conservation areas
      if (data.conservation_areas) {
        data.conservation_areas.forEach((/** @type {any} */ area) => {
          summary.total++;
          if (area.on_site) summary.high_risk++;
          else if (area.within_250m) summary.medium_risk++;
          else summary.low_risk++;
        });
      }
      
      // Process listed buildings
      if (data.listed_buildings) {
        data.listed_buildings.forEach((/** @type {any} */ building) => {
          summary.total++;
          if (building.on_site) {
            if (building.grade === 'I') summary.showstopper++;
            else summary.high_risk++;
          } else if (building.dist_m <= 100) {
            if (building.grade === 'I') summary.high_risk++;
            else summary.medium_risk++;
          } else {
            summary.low_risk++;
          }
        });
      }
    } else if (type === 'landscape') {
      // Process AONB
      if (data.aonb) {
        data.aonb.forEach((/** @type {any} */ area) => {
          summary.total++;
          if (area.on_site) summary.high_risk++;
          else summary.medium_risk++;
        });
      }
      
      // Process Green Belt
      if (data.green_belt) {
        data.green_belt.forEach((/** @type {any} */ area) => {
          summary.total++;
          if (area.on_site) summary.high_risk++;
          else summary.medium_risk++;
        });
      }
    } else if (type === 'agricultural') {
      if (data.ag_land) {
        data.ag_land.forEach((/** @type {any} */ land) => {
          summary.total++;
          // Agricultural land risk assessment based on grade
          if (land.grade === '1' || land.grade === '2') {
            summary.high_risk++;
          } else if (land.grade === '3a') {
            summary.medium_risk++;
          } else {
            summary.low_risk++;
          }
        });
      }
    }
    
    return summary;
  }
  
  function getFeatureDetails(/** @type {any} */ data, /** @type {string} */ type) {
    /** @type {any[]} */ let details = [];
    
    if (!data) return details;
    
    if (type === 'heritage') {
      if (data.conservation_areas && data.conservation_areas.length > 0) {
        details.push({
          type: 'Conservation Areas',
          count: data.conservation_areas.length,
          items: data.conservation_areas.slice(0, 3).map((/** @type {any} */ area) => ({
            name: area.name,
            status: area.on_site ? 'On Site' : area.within_250m ? 'Within 250m' : 'Nearby',
            risk: area.on_site ? 'high' : area.within_250m ? 'medium' : 'low'
          }))
        });
      }
      
      if (data.listed_buildings && data.listed_buildings.length > 0) {
        details.push({
          type: 'Listed Buildings',
          count: data.listed_buildings.length,
          items: data.listed_buildings.slice(0, 3).map((/** @type {any} */ building) => ({
            name: building.name,
            status: `Grade ${building.grade}`,
            risk: building.on_site && building.grade === 'I' ? 'showstopper' : 
                  building.on_site ? 'high' : 
                  building.dist_m <= 100 ? 'medium' : 'low'
          }))
        });
      }
    } else if (type === 'landscape') {
      if (data.aonb && data.aonb.length > 0) {
        details.push({
          type: 'Areas of Outstanding Natural Beauty',
          count: data.aonb.length,
          items: data.aonb.slice(0, 3).map((/** @type {any} */ area) => ({
            name: area.name,
            status: area.on_site ? 'On Site' : `${Math.round(area.dist_m)}m away`,
            risk: area.on_site ? 'high' : 'medium'
          }))
        });
      }
      
      if (data.green_belt && data.green_belt.length > 0) {
        details.push({
          type: 'Green Belt',
          count: data.green_belt.length,
          items: data.green_belt.slice(0, 3).map((/** @type {any} */ area) => ({
            name: area.name || 'Green Belt Area',
            status: area.on_site ? 'On Site' : 'Adjacent',
            risk: area.on_site ? 'high' : 'medium'
          }))
        });
      }
    } else if (type === 'agricultural') {
      if (data.ag_land && data.ag_land.length > 0) {
        details.push({
          type: 'Agricultural Land Classification',
          count: data.ag_land.length,
          items: data.ag_land.slice(0, 3).map((/** @type {any} */ land) => ({
            name: `Grade ${land.grade} Agricultural Land`,
            status: land.on_site ? 'On Site' : 'Adjacent',
            risk: ['1', '2'].includes(land.grade) ? 'high' : 
                  land.grade === '3a' ? 'medium' : 'low'
          }))
        });
      }
    }
    
    return details;
  }
  
  $: riskSummary = getRiskSummary(data, type);
  $: featureDetails = getFeatureDetails(data, type);
  $: hasHighRisk = riskSummary.showstopper > 0 || riskSummary.high_risk > 0;
</script>

<div class="analysis-card" class:high-risk={hasHighRisk}>
  <div class="card-header">
    <div class="card-icon">{icon}</div>
    <div class="card-title-section">
      <h4 class="card-title">{title}</h4>
      <span class="feature-count">{riskSummary.total} features</span>
    </div>
    {#if hasHighRisk}
      <div class="risk-indicator">⚠️</div>
    {/if}
  </div>
  
  <!-- Risk Summary -->
  <div class="risk-summary">
    {#if riskSummary.showstopper > 0}
      <div class="risk-item showstopper">
        <span class="risk-dot">●</span>
        <span class="risk-count">{riskSummary.showstopper}</span>
        <span class="risk-label">Showstopper</span>
      </div>
    {/if}
    {#if riskSummary.high_risk > 0}
      <div class="risk-item high-risk">
        <span class="risk-dot">●</span>
        <span class="risk-count">{riskSummary.high_risk}</span>
        <span class="risk-label">High Risk</span>
      </div>
    {/if}
    {#if riskSummary.medium_risk > 0}
      <div class="risk-item medium-risk">
        <span class="risk-dot">●</span>
        <span class="risk-count">{riskSummary.medium_risk}</span>
        <span class="risk-label">Medium Risk</span>
      </div>
    {/if}
    {#if riskSummary.low_risk > 0}
      <div class="risk-item low-risk">
        <span class="risk-dot">●</span>
        <span class="risk-count">{riskSummary.low_risk}</span>
        <span class="risk-label">Low Risk</span>
      </div>
    {/if}
  </div>
  
  <!-- Feature Details -->
  <div class="feature-details">
    {#each featureDetails as detail}
      <div class="detail-section">
        <div class="detail-header">
          <span class="detail-type">{detail.type}</span>
          <span class="detail-count">({detail.count})</span>
        </div>
        <div class="detail-items">
          {#each detail.items as item}
            <div class="detail-item" class:risk-showstopper={item.risk === 'showstopper'} 
                                      class:risk-high={item.risk === 'high'} 
                                      class:risk-medium={item.risk === 'medium'} 
                                      class:risk-low={item.risk === 'low'}>
              <div class="item-name">{item.name}</div>
              <div class="item-status">{item.status}</div>
            </div>
          {/each}
          {#if detail.count > 3}
            <div class="more-items">
              +{detail.count - 3} more {detail.type.toLowerCase()}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .analysis-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    transition: all 0.2s ease;
  }
  
  .analysis-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }
  
  .analysis-card.high-risk {
    border-left: 4px solid #dc2626;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .card-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
  }
  
  .card-title-section {
    flex: 1;
  }
  
  .card-title {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 0.25rem 0;
  }
  
  .feature-count {
    font-size: 0.75rem;
    color: #6b7280;
    background: #f3f4f6;
    padding: 0.125rem 0.5rem;
    border-radius: 12px;
  }
  
  .risk-indicator {
    font-size: 1.25rem;
    color: #dc2626;
  }
  
  .risk-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .risk-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
  }
  
  .risk-dot {
    font-size: 0.875rem;
    line-height: 1;
  }
  
  .risk-count {
    font-weight: 600;
    min-width: 1.25rem;
    text-align: center;
  }
  
  .risk-label {
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 500;
  }
  
  .showstopper .risk-dot,
  .showstopper .risk-count {
    color: #dc2626;
  }
  
  .high-risk .risk-dot,
  .high-risk .risk-count {
    color: #ea580c;
  }
  
  .medium-risk .risk-dot,
  .medium-risk .risk-count {
    color: #f59e0b;
  }
  
  .low-risk .risk-dot,
  .low-risk .risk-count {
    color: #059669;
  }
  
  .feature-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .detail-section {
    background: #fafbfc;
    border: 1px solid #f1f3f4;
    border-radius: 6px;
    padding: 0.75rem;
  }
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }
  
  .detail-type {
    font-size: 0.8rem;
    font-weight: 600;
    color: #374151;
  }
  
  .detail-count {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .detail-items {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .detail-item {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    padding: 0.5rem;
    border-left-width: 3px;
  }
  
  .detail-item.risk-showstopper {
    border-left-color: #dc2626;
  }
  
  .detail-item.risk-high {
    border-left-color: #ea580c;
  }
  
  .detail-item.risk-medium {
    border-left-color: #f59e0b;
  }
  
  .detail-item.risk-low {
    border-left-color: #059669;
  }
  
  .item-name {
    font-size: 0.8rem;
    font-weight: 500;
    color: #1f2937;
    margin-bottom: 0.25rem;
  }
  
  .item-status {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .more-items {
    font-size: 0.75rem;
    color: #6b7280;
    font-style: italic;
    text-align: center;
    padding: 0.5rem;
    background: #f9fafb;
    border-radius: 4px;
  }
</style>
