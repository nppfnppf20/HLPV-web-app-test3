<script lang="ts">
  import { buildCombinedReport } from '../services/reportGenerator.js';
  import { saveTRPEdits } from '../services/api.js';

  /** @type {any} */
  export let heritageData = null;

  /** @type {any} */
  export let landscapeData = null;

  /** @type {any} */
  export let renewablesData = null;

  /** @type {any} */
  export let ecologyData = null;

  /** @type {any} */
  export let agLandData = null;

  // Risk level options for dropdowns
  const riskLevels = [
    { value: 'showstopper', label: 'SHOWSTOPPER', bgColor: '#991b1b', color: 'white', description: 'Development is prohibited' },
    { value: 'extremely_high_risk', label: 'EXTREMELY HIGH RISK', bgColor: '#dc2626', color: 'white', description: 'Development is extremely unlikely' },
    { value: 'high_risk', label: 'HIGH RISK', bgColor: '#ea580c', color: 'white', description: 'Development is very challenging' },
    { value: 'medium_high_risk', label: 'MEDIUM-HIGH RISK', bgColor: '#d97706', color: 'white', description: 'Development has major challenges' },
    { value: 'medium_risk', label: 'MEDIUM RISK', bgColor: '#ca8a04', color: 'white', description: 'Development has moderate challenges' },
    { value: 'medium_low_risk', label: 'MEDIUM-LOW RISK', bgColor: '#65a30d', color: 'white', description: 'Development has minor challenges' },
    { value: 'low_risk', label: 'LOW RISK', bgColor: '#16a34a', color: 'white', description: 'Development has minimal challenges' },
    { value: 'no_risk', label: 'NO RISK', bgColor: '#059669', color: 'white', description: 'No development restrictions' }
  ];

  // Editable state for the report
  /** @type {any} */
  let editableReport = null;

  /** @type {boolean} */
  let hasUnsavedChanges = false;

  /** @type {boolean} */
  let saving = false;

  /** @type {string} */
  let saveStatus = '';

  // Generate initial report from data
  $: report = (() => {
    try {
      if (heritageData || landscapeData || renewablesData || ecologyData || agLandData) {
        console.log('🔄 Building initial TRP report with:', { heritageData: !!heritageData, landscapeData: !!landscapeData, renewablesData: !!renewablesData, ecologyData: !!ecologyData, agLandData: !!agLandData });
        const result = buildCombinedReport(heritageData, landscapeData, renewablesData, ecologyData, agLandData);
        console.log('✅ TRP report built successfully:', result);
        return result;
      }
      return null;
    } catch (error) {
      console.error('❌ Error building TRP report:', error);
      return null;
    }
  })();

  // Initialize editable report when original report changes
  $: if (report && !editableReport) {
    editableReport = JSON.parse(JSON.stringify(report)); // Deep copy
    console.log('🔄 Initialized editable TRP report:', editableReport);
  }

  // Use the editable structured data
  $: structuredReport = editableReport?.structuredReport;
  $: summaryData = structuredReport?.summary;
  $: disciplines = structuredReport?.disciplines || [];

  function getRiskLevelData(riskValue) {
    return riskLevels.find(level => level.value === riskValue) || riskLevels[riskLevels.length - 1];
  }

  function handleRiskLevelChange(disciplineIndex, newRiskValue) {
    const newRiskData = getRiskLevelData(newRiskValue);

    // Update the discipline risk
    editableReport.structuredReport.disciplines[disciplineIndex].riskSummary = {
      level: newRiskValue,
      label: newRiskData.label,
      description: newRiskData.description,
      bgColor: newRiskData.bgColor,
      color: newRiskData.color
    };

    // Update summary risk by discipline
    const summaryDiscipline = editableReport.structuredReport.summary.riskByDiscipline.find(
      d => d.name === editableReport.structuredReport.disciplines[disciplineIndex].name
    );
    if (summaryDiscipline) {
      summaryDiscipline.riskSummary = {
        level: newRiskValue,
        label: newRiskData.label,
        description: newRiskData.description,
        bgColor: newRiskData.bgColor,
        color: newRiskData.color
      };
    }

    hasUnsavedChanges = true;
    console.log('🔄 Risk level changed for', editableReport.structuredReport.disciplines[disciplineIndex].name, 'to', newRiskValue);
  }

  function handleRecommendationChange(disciplineIndex, recommendationIndex, newValue) {
    if (!editableReport.structuredReport.disciplines[disciplineIndex].recommendations) {
      editableReport.structuredReport.disciplines[disciplineIndex].recommendations = [];
    }

    editableReport.structuredReport.disciplines[disciplineIndex].recommendations[recommendationIndex] = newValue;
    hasUnsavedChanges = true;
    console.log('🔄 Recommendation changed for', editableReport.structuredReport.disciplines[disciplineIndex].name, 'index', recommendationIndex);
  }

  function addRecommendation(disciplineIndex) {
    if (!editableReport.structuredReport.disciplines[disciplineIndex].recommendations) {
      editableReport.structuredReport.disciplines[disciplineIndex].recommendations = [];
    }

    editableReport.structuredReport.disciplines[disciplineIndex].recommendations.push('');
    hasUnsavedChanges = true;
    console.log('➕ Added recommendation for', editableReport.structuredReport.disciplines[disciplineIndex].name);
  }

  function removeRecommendation(disciplineIndex, recommendationIndex) {
    if (editableReport.structuredReport.disciplines[disciplineIndex].recommendations) {
      editableReport.structuredReport.disciplines[disciplineIndex].recommendations.splice(recommendationIndex, 1);
      hasUnsavedChanges = true;
      console.log('➖ Removed recommendation for', editableReport.structuredReport.disciplines[disciplineIndex].name, 'index', recommendationIndex);
    }
  }

  function autoResizeTextarea(textarea) {
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set height to scrollHeight to fit all content
    textarea.style.height = Math.max(44, textarea.scrollHeight) + 'px';
  }

  function handleTextareaInput(event, disciplineIndex, recIndex) {
    // Auto-resize the textarea
    autoResizeTextarea(event.target);
    // Handle the recommendation change
    handleRecommendationChange(disciplineIndex, recIndex, event.target.value);
  }

  // Svelte action to auto-resize textarea on mount
  function autoResizeOnMount(node) {
    // Initial resize
    setTimeout(() => autoResizeTextarea(node), 0);

    return {
      update() {
        // Re-resize when content changes
        setTimeout(() => autoResizeTextarea(node), 0);
      }
    };
  }

  function handleSiteSummaryChange(newSummary) {
    editableReport.structuredReport.summary.site = newSummary;
    hasUnsavedChanges = true;
  }

  function handleOverallRiskChange(newOverallRisk) {
    editableReport.structuredReport.summary.overallRisk = newOverallRisk;
    hasUnsavedChanges = true;
  }

  async function saveChanges() {
    if (!hasUnsavedChanges) return;

    saving = true;
    saveStatus = 'Saving...';

    try {
      // Prepare TRP data for saving
      const trpData = {
        report: editableReport,
        // Add any additional metadata
        lastModified: new Date().toISOString()
      };

      console.log('💾 Saving TRP changes:', trpData);
      const result = await saveTRPEdits(trpData);
      console.log('✅ TRP edits saved successfully:', result);

      hasUnsavedChanges = false;
      saveStatus = 'Saved successfully!';
      setTimeout(() => saveStatus = '', 3000);

    } catch (error) {
      console.error('❌ Error saving TRP changes:', error);
      saveStatus = `Error: ${error.message}`;
      setTimeout(() => saveStatus = '', 5000);
    } finally {
      saving = false;
    }
  }

  function discardChanges() {
    if (report) {
      editableReport = JSON.parse(JSON.stringify(report)); // Reset to original
      hasUnsavedChanges = false;
      saveStatus = '';
      console.log('🔄 Discarded TRP changes');
    }
  }

  function getAggregatedRecommendations(discipline) {
    // Use the editable recommendations if available
    if (discipline.recommendations && Array.isArray(discipline.recommendations)) {
      return discipline.recommendations;
    }

    // Fallback to original logic (same as TRPReportGenerator)
    const allRecommendations = [];

    if (!discipline?.triggeredRules || discipline.triggeredRules.length === 0) {
      if (discipline?.defaultNoRulesRecommendations && Array.isArray(discipline.defaultNoRulesRecommendations)) {
        allRecommendations.push(...discipline.defaultNoRulesRecommendations);
      }
    } else {
      if (discipline?.defaultTriggeredRecommendations && Array.isArray(discipline.defaultTriggeredRecommendations)) {
        allRecommendations.push(...discipline.defaultTriggeredRecommendations);
      }

      discipline.triggeredRules.forEach((rule: any) => {
        if (rule.recommendations && Array.isArray(rule.recommendations)) {
          allRecommendations.push(...rule.recommendations);
        }
      });
    }

    // Deduplicate recommendations
    const uniqueRecommendations: string[] = [];
    const seen = new Set();

    allRecommendations.forEach(rec => {
      const normalizedRec = rec.toLowerCase().trim();
      if (!seen.has(normalizedRec)) {
        seen.add(normalizedRec);
        uniqueRecommendations.push(rec);
      }
    });

    return uniqueRecommendations;
  }

  // Same grouping functions as TRPReportGenerator
  function groupRulesByType(rules: any[]) {
    const groups: Record<string, any[]> = {};

    rules.forEach((rule: any) => {
      let baseType = rule.rule
        .replace(/ On-Site$/, '')
        .replace(/ Within \d+m$/, '')
        .replace(/ Within \d+km$/, '')
        .replace(/ Within \d+-\d+km$/, '')
        .replace(/ \(.*\)$/, '');

      if (!groups[baseType]) {
        groups[baseType] = [];
      }
      groups[baseType].push(rule);
    });

    return groups;
  }

  function createGroupedRuleDisplay(baseType: string, rules: any[]) {
    const riskOrder: Record<string, number> = { 'showstopper': 7, 'extremely_high_risk': 6, 'high_risk': 5, 'medium_high_risk': 4, 'medium_risk': 3, 'medium_low_risk': 2, 'low_risk': 1 };
    const sortedRules = rules.sort((a: any, b: any) => (riskOrder[b.level] || 0) - (riskOrder[a.level] || 0));

    const findings = sortedRules.map((rule: any) => {
      const riskLabel = rule.level?.replace('_', '-').toUpperCase() || 'UNKNOWN';
      let simplifiedFindings = rule.findings;

      const withinMatch = rule.findings.match(/(\d+).*?within (\d+)([km]+)/i);
      if (withinMatch) {
        simplifiedFindings = `${withinMatch[1]} within ${withinMatch[2]}${withinMatch[3]} - ${riskLabel}`;
      } else if (rule.rule.includes('On-Site') || rule.findings.toLowerCase().includes('on site')) {
        const onSiteMatch = rule.findings.match(/(\d+)/);
        if (onSiteMatch) {
          simplifiedFindings = `${onSiteMatch[1]} on-site - ${riskLabel}`;
        }
      } else if (rule.findings.includes('between')) {
        const betweenMatch = rule.findings.match(/(\d+).*?between (\d+-\d+)([km]+)/i);
        if (betweenMatch) {
          simplifiedFindings = `${betweenMatch[1]} between ${betweenMatch[2]}${betweenMatch[3]} - ${riskLabel}`;
        }
      }

      return simplifiedFindings;
    }).join('\n');

    return {
      title: baseType,
      findings: findings,
      highestRisk: sortedRules[0].level,
      allRecommendations: [...new Set(sortedRules.flatMap((r: any) => r.recommendations || []))]
    };
  }
</script>

<div class="report-container">
  <div class="report-header">
    <h2 id="report-title">TRP Planning Constraints Assessment Report</h2>
    <div class="report-actions">
      {#if hasUnsavedChanges}
        <span class="unsaved-indicator">Unsaved changes</span>
      {/if}
      {#if saveStatus}
        <span class="save-status {saveStatus.includes('Error') ? 'error' : 'success'}">{saveStatus}</span>
      {/if}
      <button
        class="btn-secondary"
        on:click={discardChanges}
        disabled={!hasUnsavedChanges || saving}
      >
        Discard Changes
      </button>
      <button
        class="btn-primary"
        on:click={saveChanges}
        disabled={!hasUnsavedChanges || saving}
      >
        {#if saving}
          Saving...
        {:else}
          Save Changes
        {/if}
      </button>
    </div>
  </div>

  <div class="report-content">
    {#if structuredReport}
      <!-- 1. SUMMARY SECTION -->
      <div class="report-section">
        <h3>Summary</h3>

        <!-- 1a. Site Summary (Editable) -->
        <div class="subsection">
          <h4>Site Summary</h4>
          <textarea
            class="editable-textarea site-summary"
            bind:value={summaryData.site}
            on:input={(e) => { autoResizeTextarea(e.target); handleSiteSummaryChange(summaryData.site); }}
            placeholder="Enter site summary..."
            use:autoResizeOnMount
          ></textarea>
        </div>

        <!-- 1b. Risk by Discipline -->
        {#if summaryData?.riskByDiscipline && summaryData.riskByDiscipline.length > 0}
          <div class="subsection">
            <h4>Risk by Discipline</h4>
            <div class="discipline-risk-list">
              {#each summaryData.riskByDiscipline as discipline}
                <div class="discipline-risk-item">
                  <span class="discipline-name">{discipline.name}:</span>
                  <span class="risk-badge-small" style="background-color: {discipline.riskSummary?.bgColor}; color: {discipline.riskSummary?.color};">
                    {discipline.riskSummary?.label}
                  </span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- 1c. Overall Risk (Editable) -->
        <div class="subsection">
          <h4>Overall Risk Estimation</h4>
          <textarea
            class="editable-textarea overall-risk"
            bind:value={summaryData.overallRisk}
            on:input={(e) => { autoResizeTextarea(e.target); handleOverallRiskChange(summaryData.overallRisk); }}
            placeholder="Enter overall risk estimation..."
            use:autoResizeOnMount
          ></textarea>
        </div>
      </div>

      <!-- 2. DISCIPLINE SECTIONS (Heritage, Landscape, etc.) -->
      {#each disciplines as discipline, disciplineIndex}
        <div class="report-section discipline-section">
          <h3>{discipline.name}</h3>

          <!-- 2a. Overall Risk for this discipline (Editable Dropdown) -->
          <div class="subsection">
            <h4>Overall {discipline.name} Risk</h4>
            <div class="risk-badge-dropdown" style="background-color: {discipline.riskSummary?.bgColor}; color: {discipline.riskSummary?.color};">
              <select
                class="hidden-dropdown"
                bind:value={discipline.riskSummary.level}
                on:change={(e) => handleRiskLevelChange(disciplineIndex, e.target.value)}
              >
                {#each riskLevels as riskLevel}
                  <option value={riskLevel.value}>{riskLevel.label}</option>
                {/each}
              </select>
              <div class="badge-content">
                <span class="risk-level">{discipline.riskSummary?.label}</span>
                <span class="risk-description">{discipline.riskSummary?.description}</span>
              </div>
              <div class="dropdown-arrow">▼</div>
            </div>
          </div>

          <!-- 2b. Triggered Rules (Read-only) -->
          {#if discipline.triggeredRules && discipline.triggeredRules.length > 0}
            <div class="subsection">
              <h4>{discipline.name} Assessment Rules Triggered</h4>
              <div class="rules-container">
                {#if discipline.name === 'Agricultural Land'}
                  {#each discipline.triggeredRules as rule}
                    <div class="rule-card" style="border-left-color: {discipline.riskSummary?.color};">
                      <div class="rule-header">
                        <h4 class="rule-title">{rule.rule}</h4>
                        <span class="rule-level" style="background-color: {discipline.riskSummary?.bgColor}; color: {discipline.riskSummary?.color};">
                          {rule.level?.replace('_', '-').toUpperCase()}
                        </span>
                      </div>
                      <div class="rule-content">
                        <p class="rule-findings"><strong>Findings:</strong> {rule.findings}</p>
                      </div>
                    </div>
                  {/each}
                {:else}
                  {#each Object.entries(groupRulesByType(discipline.triggeredRules)) as [baseType, rules]}
                    {@const groupedRule = createGroupedRuleDisplay(baseType, rules)}
                    <div class="rule-card" style="border-left-color: {discipline.riskSummary?.color};">
                      <div class="rule-header">
                        <h4 class="rule-title">{groupedRule.title}</h4>
                        <span class="rule-level" style="background-color: {discipline.riskSummary?.bgColor}; color: {discipline.riskSummary?.color};">
                          {groupedRule.highestRisk?.replace('_', '-').toUpperCase()}
                        </span>
                      </div>
                      <div class="rule-content">
                        <div class="rule-findings">
                          <strong>Findings:</strong>
                          <div style="white-space: pre-line; margin-top: 0.5rem;">
                            {groupedRule.findings}
                          </div>
                        </div>
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>
            </div>
          {:else}
            <div class="subsection">
              <h4>{discipline.name} Assessment Rules</h4>
              <p class="no-rules">No {discipline.name.toLowerCase()} risk rules were triggered. Standard development considerations apply.</p>
            </div>
          {/if}

          <!-- 2c. Recommendations (Editable) -->
          <div class="subsection">
            <h4>{discipline.name} Recommendations</h4>
            <div class="recommendations-editor">
              {#each getAggregatedRecommendations(discipline) as recommendation, recIndex}
                <div class="recommendation-item">
                  <textarea
                    class="recommendation-input"
                    value={recommendation}
                    on:input={(e) => handleTextareaInput(e, disciplineIndex, recIndex)}
                    placeholder="Enter recommendation..."
                    rows="1"
                    use:autoResizeOnMount
                  ></textarea>
                  <button
                    class="remove-recommendation-btn"
                    on:click={() => removeRecommendation(disciplineIndex, recIndex)}
                    title="Remove recommendation"
                  >
                    ×
                  </button>
                </div>
              {/each}

              <button
                class="add-recommendation-btn"
                on:click={() => addRecommendation(disciplineIndex)}
              >
                + Add Recommendation
              </button>
            </div>
          </div>
        </div>
      {/each}

      <!-- Report Metadata -->
      {#if editableReport?.metadata}
        <div class="report-section">
          <h3>Report Information</h3>
          <div class="metadata">
            <p><strong>Generated:</strong> {new Date(editableReport.metadata.generatedAt).toLocaleString()}</p>
            <p><strong>Rules Processed:</strong> {editableReport.metadata.totalRulesProcessed}</p>
            <p><strong>Rules Triggered:</strong> {editableReport.metadata.rulesTriggered}</p>
            <p><strong>Rules Version:</strong> {editableReport.metadata.rulesVersion}</p>
          </div>
        </div>
      {/if}
    {:else}
      <div class="report-placeholder">
        <h3>⚠️ No Analysis Data</h3>
        <p>Please run an analysis first to generate a TRP report.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .report-container {
    background: white;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .report-header h2 {
    margin: 0;
    color: #1f2937;
    font-size: 1.5rem;
  }

  .report-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .unsaved-indicator {
    color: #d97706;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .save-status {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .save-status.success {
    color: #059669;
  }

  .save-status.error {
    color: #dc2626;
  }

  .report-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
    height: 0;
  }

  .report-placeholder {
    text-align: center;
    padding: 2rem;
  }

  .report-placeholder h3 {
    color: #374151;
    margin-bottom: 1rem;
  }

  .report-placeholder p {
    color: #6b7280;
    margin-bottom: 2rem;
  }

  .report-section {
    margin-bottom: 2rem;
  }

  .report-section h3 {
    color: #374151;
    font-size: 1.25rem;
    margin-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }

  .subsection {
    margin-bottom: 1.5rem;
  }

  .subsection h4 {
    margin-bottom: 0.75rem;
    color: #4b5563;
    font-size: 1rem;
    font-weight: 600;
  }

  /* Editable field styles */
  .editable-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    line-height: 1.5;
    resize: vertical;
    transition: all 0.2s ease;
    box-sizing: border-box;
    font-family: inherit;
  }

  .editable-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .editable-textarea.site-summary {
    min-height: 80px;
  }

  .editable-textarea.overall-risk {
    min-height: 60px;
  }

  .editable-textarea.recommendations {
    min-height: 120px;
  }

  /* Recommendations editor styles */
  .recommendations-editor {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .recommendation-item {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  .recommendation-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    transition: all 0.2s ease;
    box-sizing: border-box;
    font-family: inherit;
    resize: vertical;
    min-height: 44px;
    line-height: 1.5;
  }

  .recommendation-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .remove-recommendation-btn {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .remove-recommendation-btn:hover {
    background: #dc2626;
    transform: scale(1.05);
  }

  .add-recommendation-btn {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    align-self: flex-start;
  }

  .add-recommendation-btn:hover {
    background: #059669;
    transform: translateY(-1px);
  }

  .risk-badge-dropdown {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }

  .risk-badge-dropdown:hover {
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .hidden-dropdown {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 10;
  }

  .badge-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
  }

  .risk-level {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .risk-description {
    font-size: 0.875rem;
    font-weight: 400;
  }

  .dropdown-arrow {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    font-size: 0.875rem;
    pointer-events: none;
    opacity: 0.8;
    transition: transform 0.2s ease;
  }

  .risk-badge-dropdown:hover .dropdown-arrow {
    transform: scale(1.1);
    opacity: 1;
  }

  .discipline-risk-list {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1rem;
  }

  .discipline-risk-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .discipline-risk-item:last-child {
    margin-bottom: 0;
  }

  .discipline-name {
    font-weight: 500;
    color: #374151;
  }

  .risk-badge-small {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .discipline-section {
    border-top: 2px solid #e5e7eb;
    padding-top: 1.5rem;
  }

  .rules-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .rule-card {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-left: 4px solid;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .rule-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .rule-title {
    margin: 0;
    color: #374151;
    font-size: 1.125rem;
  }

  .rule-level {
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .rule-content p {
    margin-bottom: 0.75rem;
    color: #4b5563;
    line-height: 1.5;
  }

  .rule-content p:last-child {
    margin-bottom: 0;
  }

  .no-rules {
    color: #059669;
    font-style: italic;
    text-align: center;
    padding: 1rem;
    background: #ecfdf5;
    border-radius: 8px;
  }

  .metadata {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1rem;
  }

  .metadata p {
    margin-bottom: 0.5rem;
    color: #4b5563;
    font-size: 0.875rem;
  }

  .metadata p:last-child {
    margin-bottom: 0;
  }

  .btn-secondary,
  .btn-primary {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid;
    font-size: 0.875rem;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border-color: #d1d5db;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #f9fafb;
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
    border-color: #2563eb;
  }

  .btn-primary:disabled {
    background: #9ca3af;
    border-color: #9ca3af;
    cursor: not-allowed;
  }
</style>