<script>
  /** @type {boolean} */
  export let hasResults = false;
  
  /** @type {boolean} */
  export let loading = false;
  
  /** @type {() => void} */
  export let onGenerateReport = () => {};
</script>

<nav class="navbar">
  <h1 class="navbar-title">HLPV Planning Assessment</h1>
  
  <div class="navbar-actions">
    <button 
      class="generate-report-btn" 
      on:click={onGenerateReport}
      disabled={!hasResults || loading}
      aria-label="Generate comprehensive planning assessment report"
    >
      Generate Report
    </button>
  </div>
</nav>