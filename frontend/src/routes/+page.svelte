<script>
  import Map from '$lib/components/Map.svelte';
  import { analyzePolygon } from '$lib/services/api.js';
  /** @type {Record<string, any> | null} */
  let result = null;
  /** @type {string} */
  let errorMsg = '';

  /** @param {any} geometry */
  async function handlePolygonDrawn(geometry) {
    errorMsg = '';
    result = null;
    try {
      result = await analyzePolygon(geometry);
    } catch (/** @type {any} */ err) {
      errorMsg = err?.message || String(err);
    }
  }
</script>

<h1>Draw an area to analyze</h1>
<Map onPolygonDrawn={handlePolygonDrawn} />

{#if errorMsg}
  <p style="color: red;">{errorMsg}</p>
{/if}

{#if result}
  <pre>{JSON.stringify(result, null, 2)}</pre>
{/if}
