<script>
  import { buildCombinedReport } from '../services/reportGenerator.js';
  
  /** @type {any} */
  export let heritageData = null;
  
  /** @type {any} */
  export let landscapeData = null;
  
  /** @type {() => void} */
  export let onClose;

  // Generate combined report when data changes
  $: report = (heritageData || landscapeData) ? buildCombinedReport(heritageData, landscapeData) : null;
  
  // Use the new structured data
  $: structuredReport = report?.structuredReport;
  $: summaryData = structuredReport?.summary;
  $: disciplines = structuredReport?.disciplines || [];
  
  // Keep legacy data for fallback compatibility
  $: designationSummary = report?.combined?.designationSummary || [];
  $: riskAssessment = report?.combined || report?.heritage?.riskAssessment || report?.landscape?.riskAssessment;
  $: triggeredRules = report?.combined?.triggeredRules || [];

  function handleClose() {
    onClose();
  }

  /** @param {Event} event */
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  /** @param {string[]} requirements */
  function formatRequirements(requirements) {
    return requirements || [];
  }
</script>

<div class="report-modal-backdrop" on:click={handleBackdropClick} on:keydown={handleBackdropClick} role="dialog" aria-labelledby="report-title" tabindex="-1">
  <div class="report-modal">
    <div class="report-header">
      <h2 id="report-title">📄 Planning Constraints Assessment Report</h2>
      <button class="close-btn" on:click={handleClose} aria-label="Close report">
        ✕
      </button>
    </div>
    
    <div class="report-content">
      {#if structuredReport}
        <!-- 1. SUMMARY SECTION -->
        <div class="report-section">
          <h3>📋 Summary</h3>
          
          <!-- 1a. Site Summary -->
          <div class="subsection">
            <h4>Site Summary</h4>
            <p class="placeholder">{summaryData?.site}</p>
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
          
          <!-- 1c. Overall Risk -->
          <div class="subsection">
            <h4>Overall Risk Estimation</h4>
            <p class="placeholder">TBC - Overall risk estimation placeholder</p>
          </div>
        </div>

        <!-- 2. DISCIPLINE SECTIONS (Heritage, Landscape, etc.) -->
        {#each disciplines as discipline}
          <div class="report-section discipline-section">
            <h3>{discipline.name === 'Heritage' ? '🏛️' : discipline.name === 'Landscape' ? '🌳' : '📊'} {discipline.name}</h3>
            
            <!-- 2a. Overall Risk for this discipline -->
            <div class="subsection">
              <h4>Overall {discipline.name} Risk</h4>
              <div class="risk-badge" style="background-color: {discipline.riskSummary?.bgColor}; color: {discipline.riskSummary?.color};">
                <span class="risk-level">{discipline.riskSummary?.label}</span>
                <span class="risk-description">{discipline.riskSummary?.description}</span>
              </div>
            </div>
            
            <!-- 2b. Triggered Rules -->
            {#if discipline.triggeredRules && discipline.triggeredRules.length > 0}
              <div class="subsection">
                <h4>{discipline.name} Assessment Rules Triggered</h4>
                <div class="rules-container">
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
                        <p class="rule-impact"><strong>Impact:</strong> {rule.impact}</p>
                        
                        {#if rule.requirements && rule.requirements.length > 0}
                          <div class="rule-requirements">
                            <strong>Requirements:</strong>
                            <ul>
                              {#each formatRequirements(rule.requirements) as requirement}
                                <li>{requirement}</li>
                              {/each}
                            </ul>
                          </div>
                        {/if}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {:else}
              <div class="subsection">
                <h4>{discipline.name} Assessment Rules</h4>
                <p class="no-rules">No {discipline.name.toLowerCase()} risk rules were triggered. Standard development considerations apply.</p>
              </div>
            {/if}
            
            <!-- 2c. Recommendations -->
            <div class="subsection">
              <h4>{discipline.name} Recommendations</h4>
              <p class="placeholder">TBC - {discipline.name} recommendations placeholder</p>
            </div>
          </div>
        {/each}

        <!-- Report Metadata -->
        {#if report?.metadata}
          <div class="report-section">
            <h3>📋 Report Information</h3>
            <div class="metadata">
              <p><strong>Generated:</strong> {new Date(report.metadata.generatedAt).toLocaleString()}</p>
              <p><strong>Rules Processed:</strong> {report.metadata.totalRulesProcessed}</p>
              <p><strong>Rules Triggered:</strong> {report.metadata.rulesTriggered}</p>
              <p><strong>Rules Version:</strong> {report.metadata.rulesVersion}</p>
            </div>
          </div>
        {/if}
      {:else}
        <div class="report-placeholder">
          <h3>⚠️ No Analysis Data</h3>
          <p>Please run an analysis first to generate a report.</p>
        </div>
      {/if}
    </div>
    
    <div class="report-footer">
      <button class="btn-secondary" on:click={handleClose}>
        Close
      </button>
      <button class="btn-primary" disabled>
        Generate PDF (Coming Soon)
      </button>
    </div>
  </div>
</div>

<style>
  .report-modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 1rem;
  }

  .report-modal {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    color: #6b7280;
    border-radius: 4px;
  }

  .close-btn:hover {
    background: #f3f4f6;
    color: #374151;
  }

  .report-content {
    flex: 1;
    padding: 1.5rem;
    overflow-y: auto;
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

  .risk-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    font-weight: 600;
  }

  .risk-level {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .risk-description {
    font-size: 0.875rem;
    font-weight: 400;
  }

  /* New structured report styles */
  .subsection {
    margin-bottom: 1.5rem;
  }

  .subsection h4 {
    margin-bottom: 0.75rem;
    color: #4b5563;
    font-size: 1rem;
    font-weight: 600;
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


  .placeholder {
    font-style: italic;
    color: #6b7280;
    background: #f3f4f6;
    padding: 1rem;
    border-radius: 6px;
    border-left: 4px solid #d1d5db;
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

  .rule-requirements ul {
    margin: 0.5rem 0 0 0;
    padding-left: 1.5rem;
  }

  .rule-requirements li {
    margin-bottom: 0.5rem;
    color: #4b5563;
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

  .report-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem;
    border-top: 1px solid #e5e7eb;
  }

  .btn-secondary,
  .btn-primary {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border: 1px solid #3b82f6;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-primary:disabled {
    background: #9ca3af;
    border-color: #9ca3af;
    cursor: not-allowed;
  }
</style>
