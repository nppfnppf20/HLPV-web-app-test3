<script>
  /** @type {any[] | undefined} */
  export let agLand = [];
  /** @type {string} */
  export let title = 'Agricultural Land Analysis';
  /** @type {boolean} */
  export let loading = false;
  /** @type {string} */
  export let error = '';

  $: totalCoverage = (agLand || []).reduce((sum, grade) => sum + (grade.percentage_coverage || 0), 0);
  $: hasBestAndMostVersatile = (agLand || []).some(g => ['1', '2', '3a'].includes(g.grade));
</script>

{#if loading}
  <div class="analysis-results">
    <div class="results-header">
      <h2>{title}</h2>
    </div>
    <p>Analyzing agricultural land…</p>
  </div>
{:else if error}
  <div class="analysis-results">
    <div class="results-header">
      <h2>{title}</h2>
    </div>
    <p class="no-results">{error}</p>
  </div>
{:else}
  <div class="analysis-results">
    <div class="results-header">
      <h2>{title}</h2>
    </div>

    <div class="results-summary">
      <div class="summary-item">
        <span class="summary-label">Total Site Coverage</span>
        <span class="summary-value">{totalCoverage.toFixed(2)}%</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Best & Most Versatile (BMV)</span>
        <span class="summary-value" class:positive={hasBestAndMostVersatile} class:negative={!hasBestAndMostVersatile}>
          {hasBestAndMostVersatile ? 'Yes' : 'No'}
        </span>
      </div>
    </div>

    {#if agLand && agLand.length > 0}
      <div class="results-details">
        <h4>On-Site ALC Grades</h4>
        <table>
          <thead>
            <tr>
              <th>Grade</th>
              <th>Area (ha)</th>
              <th>% of Site</th>
            </tr>
          </thead>
          <tbody>
            {#each agLand as grade}
              <tr>
                <td>Grade {grade.grade}</td>
                <td>{grade.area_hectares.toFixed(4)}</td>
                <td>{grade.percentage_coverage.toFixed(2)}%</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p class="no-results">No agricultural land classification found on site.</p>
    {/if}
  </div>
{/if}

<style>
  /* Basic styling for the results ribbon */
  .analysis-results {
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 1rem 0;
    padding: 1rem;
    background-color: #f9f9f9;
  }
  .results-header {
    margin-bottom: 1rem;
  }
  .results-summary {
    display: flex;
    gap: 2rem;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
  .summary-item {
    display: flex;
    flex-direction: column;
  }
  .summary-label {
    font-weight: bold;
    color: #555;
    font-size: 0.9rem;
  }
  .summary-value {
    font-weight: bold;
  }
  .positive { color: #b91c1c; } /* Red for Yes */
  .negative { color: #059669; } /* Green for No */

  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border-bottom: 1px solid #ddd;
    padding: 0.5rem;
    text-align: left;
  }
  th {
    background-color: #f2f2f2;
  }
  .no-results {
    color: #777;
  }
</style>
