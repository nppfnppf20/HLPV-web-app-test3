<script>
  import CensusPopWorkingAge from './socioeconomics-charts/CensusPopWorkingAge.svelte';
  import CarsVansHousehold from './socioeconomics-charts/CarsVansHousehold.svelte';
  import BREStable from './socioeconomics-charts/BREStable.svelte';
  import MethodOfTravel from './socioeconomics-charts/MethodOfTravel.svelte';
  import UnemploymentRate from './socioeconomics-charts/UnemploymentRate.svelte';

  /** @type {any | undefined} */
  export let socioeconomicsResult = undefined;
  /** @type {any[]} */
  export let flattenedData = [];
  /** @type {() => void} */
  export let onClose = () => {};

  // Chart navigation
  let currentChartIndex = 0;
  const totalCharts = 5; // Updated for 5 charts/tables

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function previousChart() {
    if (currentChartIndex > 0) {
      currentChartIndex--;
    }
  }

  function nextChart() {
    if (currentChartIndex < totalCharts - 1) {
      currentChartIndex++;
    }
  }
</script>

<div class="modal-backdrop" on:click={handleBackdropClick} role="presentation">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Socioeconomics Charts</h2>
      <button class="close-button" on:click={onClose}>&times;</button>
    </div>
    <div class="modal-body">
      <div class="chart-viewer">
        <button
          class="nav-button nav-left"
          on:click={previousChart}
          disabled={currentChartIndex === 0}
        >
          &#8249;
        </button>

        <div class="chart-display">
          {#if currentChartIndex === 0}
            <CensusPopWorkingAge
              {socioeconomicsResult}
              {flattenedData}
            />
          {:else if currentChartIndex === 1}
            <CarsVansHousehold
              {socioeconomicsResult}
              {flattenedData}
            />
          {:else if currentChartIndex === 2}
            <BREStable
              {socioeconomicsResult}
              {flattenedData}
            />
          {:else if currentChartIndex === 3}
            <MethodOfTravel
              {socioeconomicsResult}
              {flattenedData}
            />
          {:else if currentChartIndex === 4}
            <UnemploymentRate
              {socioeconomicsResult}
              {flattenedData}
            />
          {:else}
            <div class="chart-placeholder">
              <p>Chart {currentChartIndex + 1} of {totalCharts}</p>
            </div>
          {/if}
        </div>

        <button
          class="nav-button nav-right"
          on:click={nextChart}
          disabled={currentChartIndex === totalCharts - 1}
        >
          &#8250;
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 90%;
    max-height: 90%;
    width: 1200px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #dee2e6;
  }

  h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    color: #6c757d;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    line-height: 1;
    transition: color 0.2s;
  }

  .close-button:hover {
    color: #2c3e50;
  }

  .modal-body {
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .chart-viewer {
    display: flex;
    align-items: center;
    gap: 1rem;
    height: 100%;
    min-height: 500px;
  }

  .chart-display {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    overflow: auto;
  }

  .chart-placeholder {
    width: 100%;
    height: 600px;
    background: #f8f9fa;
    border: 2px dashed #dee2e6;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    font-size: 1.2rem;
  }

  .nav-button {
    background: #007bff;
    color: white;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .nav-button:hover:not(:disabled) {
    background: #0056b3;
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .nav-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  .nav-button:disabled {
    background: #e9ecef;
    color: #adb5bd;
    cursor: not-allowed;
    box-shadow: none;
  }

  .nav-left {
    margin-right: 0.5rem;
  }

  .nav-right {
    margin-left: 0.5rem;
  }
</style>
