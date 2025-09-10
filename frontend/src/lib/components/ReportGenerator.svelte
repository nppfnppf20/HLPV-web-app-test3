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
      <h2 id="report-title">📄 Heritage Impact Assessment Report</h2>
      <button class="close-btn" on:click={handleClose} aria-label="Close report">
        ✕
      </button>
    </div>
    
    <div class="report-content">
      {#if report}
        <!-- Risk Assessment Section -->
        <div class="report-section">
          <h3>🎯 Risk Assessment</h3>
          <div class="risk-badge" style="background-color: {riskAssessment?.riskSummary?.bgColor}; color: {riskAssessment?.riskSummary?.color};">
            <span class="risk-level">{riskAssessment?.riskSummary?.label}</span>
            <span class="risk-description">{riskAssessment?.riskSummary?.description}</span>
          </div>
        </div>

        <!-- Designation Summary Section -->
        <div class="report-section">
          <h3>🏛️ Heritage Designations Identified</h3>
          <div class="designation-summary">
            {#each designationSummary as summary}
              <p class="summary-item">• {summary}</p>
            {/each}
          </div>
        </div>

        <!-- Triggered Rules Section -->
        {#if triggeredRules.length > 0}
          <div class="report-section">
            <h3>⚠️ Assessment Rules Triggered</h3>
            <div class="rules-container">
              {#each triggeredRules as rule}
                <div class="rule-card" style="border-left-color: {riskAssessment?.riskSummary?.color};">
                  <div class="rule-header">
                    <h4 class="rule-title">{rule.rule}</h4>
                    <span class="rule-level" style="background-color: {riskAssessment?.riskSummary?.bgColor}; color: {riskAssessment?.riskSummary?.color};">
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
          <div class="report-section">
            <h3>✅ Assessment Rules</h3>
            <p class="no-rules">No heritage risk rules were triggered. Standard development considerations apply.</p>
          </div>
        {/if}

        <!-- Report Metadata -->
        <div class="report-section">
          <h3>📋 Report Information</h3>
          <div class="metadata">
            <p><strong>Generated:</strong> {new Date(report.metadata.generatedAt).toLocaleString()}</p>
            <p><strong>Rules Processed:</strong> {report.metadata.totalRulesProcessed}</p>
            <p><strong>Rules Triggered:</strong> {report.metadata.rulesTriggered}</p>
            <p><strong>Rules Version:</strong> {report.metadata.rulesVersion}</p>
          </div>
        </div>
      {:else}
        <div class="report-placeholder">
          <h3>⚠️ No Analysis Data</h3>
          <p>Please run an analysis first to generate a heritage report.</p>
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

  .designation-summary {
    background: #f9fafb;
    border-radius: 8px;
    padding: 1.5rem;
  }

  .summary-item {
    margin-bottom: 0.75rem;
    color: #4b5563;
    line-height: 1.5;
  }

  .summary-item:last-child {
    margin-bottom: 0;
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
