// Main report aggregator: combines heritage and landscape reports
// This is the primary entry point for all report generation

import { buildHeritageReport } from './heritage/heritageReportGenerator.js';
import { buildLandscapeReport } from './landscape/landscapeReportGenerator.js';

/**
 * Determine overall risk across multiple domains
 * @param {string|number|null} heritageRisk 
 * @param {string|number|null} landscapeRisk 
 */
function determineOverallRisk(heritageRisk, landscapeRisk) {
  // Risk hierarchy (highest to lowest)
  const riskHierarchy = [
    'showstopper',
    'extremely_high_risk', 
    'high_risk',
    'medium_high_risk',
    'medium_risk',
    'medium_low_risk',
    'low_risk'
  ];
  
  const risks = [heritageRisk, landscapeRisk].filter(Boolean);
  if (risks.length === 0) return 'low_risk';
  
  // Return the highest risk level found
  for (const riskLevel of riskHierarchy) {
    if (risks.includes(riskLevel)) return riskLevel;
  }
  
  return 'low_risk';
}

/**
 * Build combined heritage and landscape report
 * @param {any} heritageData - Backend heritage analysis results
 * @param {any} landscapeData - Backend landscape analysis results  
 */
export function buildCombinedReport(heritageData, landscapeData) {
  const heritageReport = heritageData ? buildHeritageReport(heritageData) : null;
  const landscapeReport = landscapeData ? buildLandscapeReport(landscapeData) : null;
  
  // Determine overall risk across both domains
  const overallRisk = determineOverallRisk(
    heritageReport?.riskAssessment?.overallRisk,
    landscapeReport?.riskAssessment?.overallRisk
  );
  
  // Combine triggered rules from both domains
  const allTriggeredRules = [
    ...(heritageReport?.riskAssessment?.triggeredRules || []),
    ...(landscapeReport?.riskAssessment?.triggeredRules || [])
  ];
  
  // Combine designation summaries
  const combinedDesignationSummary = [
    ...(heritageReport?.designationSummary || []),
    ...(landscapeReport?.designationSummary || [])
  ];
  
  return {
    heritage: heritageReport,
    landscape: landscapeReport,
    combined: {
      overallRisk,
      designationSummary: combinedDesignationSummary,
      triggeredRules: allTriggeredRules,
      riskSummary: heritageReport?.riskAssessment?.riskSummary || landscapeReport?.riskAssessment?.riskSummary
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      sectionsIncluded: [
        heritageData ? 'heritage' : null,
        landscapeData ? 'landscape' : null
      ].filter(Boolean),
      totalRules: allTriggeredRules.length,
      totalRulesProcessed: (heritageReport?.metadata?.totalRulesProcessed || 0) + (landscapeReport?.metadata?.totalRulesProcessed || 0),
      rulesTriggered: allTriggeredRules.length,
      rulesVersion: `combined-v1 (heritage: ${heritageReport?.metadata?.rulesVersion || 'n/a'}, landscape: ${landscapeReport?.metadata?.rulesVersion || 'n/a'})`,
      heritageMetadata: heritageReport?.metadata,
      landscapeMetadata: landscapeReport?.metadata
    }
  };
}

/**
 * Legacy function for backward compatibility - builds heritage report only
 * @param {any} backend 
 */
export { buildHeritageReport } from './heritage/heritageReportGenerator.js';