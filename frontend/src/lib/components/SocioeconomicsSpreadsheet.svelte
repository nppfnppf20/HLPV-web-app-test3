<script>
  /**
   * @typedef {Object} SocioeconomicsData
   * @property {Object} Countries - Countries data
   * @property {Object} LAD11 - Local Authority Districts 2011 data
   * @property {Object} LAD19 - Local Authority Districts 2019 data
   * @property {Object} LAD25 - Local Authority Districts 2025 data
   * @property {Object} Regions - Regions data
   */

  /** @type {any | undefined} */
  export let socioeconomicsResult = undefined;
  /** @type {string} */
  export let title = 'Socioeconomic Analysis Results';
  /** @type {boolean} */
  export let loading = false;
  /** @type {string} */
  export let error = '';

  /** @type {string[]} */
  let allColumns = [];
  /** @type {string[]} */
  let displayColumns = [];
  /** @type {any[]} */
  let flattenedData = [];

  // Columns to hide from display (but keep in export/copy data)
  const hiddenColumns = [
    'feature_index',
    'geo_code',
    'FID',
    'CTRY24CD',
    'CTRY24NM',
    'CTRY24NMW',
    'BNG_E',
    'BNG_N',
    'LONG',
    'LAT',
    'GlobalID',
    'Master sheet2_Geography Level',
    'Master sheet2_Name',
    'Master sheet2_field_279',
    'Master sheet2_field_280',
    'Master sheet2_field_281',
    'Master sheet2_field_282',
    'Master sheet2_field_283',
    'Master sheet2_field_284',
    'Master sheet2_field_285',
    'OBJECTID',
    'lad11cd',
    'lad11cdo',
    'lad11nm',
    'lad11nmw',
    'lad19cd',
    'lad19nm',
    'lad19nmw',
    'bng_e',
    'bng_n',
    'long',
    'lat',
    'Population projections LAD19_Area',
    'Population projections LAD19_2018 All Ages',
    'Population projections LAD19_2018 Aged 0 to 15',
    'Population projections LAD19_2018 Aged 16 to 64',
    'Population projections LAD19_2018 Aged 65+',
    'Population projections LAD19_field_7',
    'Population projections LAD19_field_8',
    'field_7',
    'field_8',
    'field_9',
    'Master sheet2_field_7',
    'Master sheet2_field_8',
    'Master sheet2_field_9',
    'Population projections LAD19_2043 All Ages',
    'Population projections LAD19_2043 Aged 0 to 15',
    'Population projections LAD19_2043 Aged 16 to 64',
    'Population projections LAD19_2043 Aged 65+',
    'LAD25CD',
    'LAD25NM',
    'LAD25NMW',
    'RGN24CD',
    'RGN24NM',
    'geom' // Hide geometry data if present
  ];

  $: {
    if (socioeconomicsResult) {
      processResultsData();
    }
  }

  function processResultsData() {
    if (!socioeconomicsResult) return;

    // Flatten all data and collect all unique column names
    flattenedData = [];
    const columnsSet = new Set();

    Object.entries(socioeconomicsResult).forEach(([layerName, layerData]) => {
      if (layerName !== 'metadata' && Array.isArray(layerData) && layerData.length > 0) {
        layerData.forEach((feature, index) => {
          // Add layer and feature info
          const row = {
            layer_name: layerName,
            feature_index: index + 1,
            ...feature
          };

          // Map LAD11 census data to standard column names
          // If LAD11 has the long QS103EW column names, copy to the standard shorter names
          if (layerName === 'LAD11') {
            if (row['QS103EW - Age by single year 2011 census_Total 2011 census'] !== undefined) {
              // Map to both with and without Master sheet2_ prefix
              row['Total 2011 census'] = row['QS103EW - Age by single year 2011 census_Total 2011 census'];
              row['Master sheet2_Total 2011 census'] = row['QS103EW - Age by single year 2011 census_Total 2011 census'];
            }
            if (row['QS103EW - Age by single year 2011 census_Age 16-64 2011'] !== undefined) {
              row['Age 16-64 2011'] = row['QS103EW - Age by single year 2011 census_Age 16-64 2011'];
              row['Master sheet2_Age 16-64 2011'] = row['QS103EW - Age by single year 2011 census_Age 16-64 2011'];
            }
            if (row['QS103EW - Age by single year 2011 census_Working age percent 20'] !== undefined) {
              row['Working age percent 2011'] = row['QS103EW - Age by single year 2011 census_Working age percent 20'];
              row['Master sheet2_Working age percent 2011'] = row['QS103EW - Age by single year 2011 census_Working age percent 20'];
            }
          }

          // Collect all column names
          Object.keys(row).forEach(key => columnsSet.add(key));

          flattenedData.push(row);
        });
      }
    });

    // Convert Set to Array for easier iteration
    allColumns = Array.from(columnsSet);

    // Create filtered column list for display (exclude hidden columns)
    displayColumns = allColumns.filter(col => !hiddenColumns.includes(col));
  }

  /**
   * Clean up column name by removing prefixes like "Master sheet2_"
   */
  function cleanColumnName(columnName) {
    if (!columnName) return columnName;

    // Remove "Master sheet2_" prefix (case insensitive)
    let cleaned = columnName.replace(/^Master\s*sheet2?_/i, '');

    // You can add more cleaning rules here if needed
    // For example: cleaned = cleaned.replace(/^some_other_prefix_/i, '');

    return cleaned;
  }

  async function copyToClipboard() {
    if (!flattenedData.length) return;

    // Create TSV content (tab-separated for better clipboard compatibility)
    // Use displayColumns to only export visible columns with cleaned names
    const headers = displayColumns.map(col => cleanColumnName(col)).join('\t');
    const rows = flattenedData.map(row =>
      displayColumns.map(col => {
        const value = row[col];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // Replace tabs and newlines to avoid breaking the format
        return stringValue.replace(/[\t\n\r]/g, ' ');
      }).join('\t')
    );

    const tsvContent = [headers, ...rows].join('\n');

    try {
      await navigator.clipboard.writeText(tsvContent);
      alert('Data copied to clipboard! You can now paste it into a spreadsheet.');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      alert('Failed to copy to clipboard. Please try the CSV export instead.');
    }
  }

  function exportToCSV() {
    if (!flattenedData.length) return;

    // Create CSV content
    // Use displayColumns to only export visible columns with cleaned names
    const headers = displayColumns.map(col => {
      const cleaned = cleanColumnName(col);
      // Escape commas and quotes in headers
      if (cleaned.includes(',') || cleaned.includes('"')) {
        return `"${cleaned.replace(/"/g, '""')}"`;
      }
      return cleaned;
    }).join(',');

    const rows = flattenedData.map(row =>
      displayColumns.map(col => {
        const value = row[col];
        // Handle null/undefined values and escape commas/quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `socioeconomic_analysis_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
</script>

{#if loading}
  <div class="analysis-results">
    <div class="results-loading">
      <p>Analyzing socioeconomic data…</p>
    </div>
  </div>
{:else if error}
  <div class="results-error">
    <strong>Analysis Error:</strong> {error}
  </div>
{:else if !socioeconomicsResult || flattenedData.length === 0}
  <div class="analysis-results">
    <h2>{title}</h2>
    <div class="no-data">
      <p>No geographic features intersect with your polygon.</p>
    </div>
  </div>
{:else}
  <div class="analysis-results">
    <div class="results-header">
      <h2>{title}</h2>
      <div class="action-buttons">
        <button class="copy-button" on:click={copyToClipboard}>
          Copy to Clipboard
        </button>
        <button class="export-button" on:click={exportToCSV}>
          Export to CSV
        </button>
      </div>
    </div>

    <div class="summary">
      <p><strong>Total Features Found:</strong> {flattenedData.length}</p>
      <p><strong>Geographic Layers:</strong> {Object.keys(socioeconomicsResult).filter(key => key !== 'metadata').join(', ')}</p>
    </div>

    <div class="table-container">
      <table class="results-table">
        <thead>
          <tr>
            {#each displayColumns as column}
              <th>{cleanColumnName(column)}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each flattenedData as row}
            <tr>
              {#each displayColumns as column}
                <td>
                  {row[column] ?? ''}
                </td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

<style>
  .analysis-results {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 1.5rem;
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;
  }

  h2 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .results-header h2 {
    margin: 0;
  }

  .action-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .copy-button {
    padding: 0.5rem 1rem;
    border: 1px solid #2196f3;
    background: #2196f3;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background 0.2s;
  }

  .copy-button:hover {
    background: #1976d2;
    border-color: #1976d2;
  }

  .export-button {
    padding: 0.5rem 1rem;
    border: 1px solid #4caf50;
    background: #4caf50;
    color: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: background 0.2s;
  }

  .export-button:hover {
    background: #45a049;
    border-color: #45a049;
  }

  .results-loading {
    text-align: center;
    padding: 2rem;
    color: #7f8c8d;
  }

  .results-error {
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 4px;
    padding: 1rem;
    color: #c33;
    margin-bottom: 1rem;
  }

  .summary {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    border-left: 4px solid #3498db;
  }

  .summary p {
    margin: 0.5rem 0;
    color: #2c3e50;
  }

  .no-data {
    text-align: center;
    padding: 3rem 2rem;
    background: #f8f9fa;
    border-radius: 4px;
    color: #7f8c8d;
  }

  .table-container {
    overflow: auto;
    max-height: 500px;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }

  .results-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .results-table th {
    background: #f8f9fa;
    padding: 0.75rem 0.5rem;
    text-align: left;
    border-bottom: 2px solid #dee2e6;
    border-right: 1px solid #dee2e6;
    font-weight: 600;
    color: #2c3e50;
    position: sticky;
    top: 0;
    z-index: 2;
  }

  .results-table td {
    padding: 0.5rem;
    border-bottom: 1px solid #dee2e6;
    border-right: 1px solid #dee2e6;
    vertical-align: top;
    max-width: 200px;
    word-wrap: break-word;
    color: #495057;
    background: #fafbfc;
  }

  .results-table tr:hover td {
    background: #f1f3f5;
  }

  /* Sticky first column (layer_name) */
  .results-table th:first-child,
  .results-table td:first-child {
    position: sticky;
    left: 0;
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
    isolation: isolate;
    width: 150px;
    min-width: 150px;
    max-width: 150px;
  }

  .results-table th:first-child {
    z-index: 100;
    background: #f8f9fa !important;
  }

  .results-table td:first-child {
    z-index: 50;
    background: #fafbfc !important;
    font-weight: 500;
  }

  .results-table tr:hover td:first-child {
    background: #f1f3f5 !important;
  }

  /* Sticky second column (geo_name) */
  .results-table th:nth-child(2),
  .results-table td:nth-child(2) {
    position: sticky;
    left: 150px; /* Position after first column (150px) */
    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
    isolation: isolate;
    width: 200px;
    min-width: 200px;
    max-width: 200px;
  }

  .results-table th:nth-child(2) {
    z-index: 99;
    background: #f8f9fa !important;
  }

  .results-table td:nth-child(2) {
    z-index: 49;
    background: #fafbfc !important;
    font-weight: 500;
  }

  .results-table tr:hover td:nth-child(2) {
    background: #f1f3f5 !important;
  }
</style>