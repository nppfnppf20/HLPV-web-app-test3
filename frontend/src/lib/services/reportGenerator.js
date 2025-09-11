// Main report aggregator: combines heritage and landscape reports
// This is the primary entry point for all report generation

import { buildHeritageReport } from './heritage/heritageReportGenerator.js';
import { buildLandscapeReport } from './landscape/landscapeReportGenerator.js';



/**
 * Resolve a risk summary object from either numeric or string overallRisk
 * @param {number | string} overallRisk
 */
function resolveRiskSummary(overallRisk) {
  const stringMap = {
    showstopper: { label: 'SHOWSTOPPER', description: 'Development likely not viable without major redesign', color: '#dc2626', bgColor: '#fef2f2' },
    extremely_high_risk: { label: 'EXTREMELY HIGH RISK', description: 'Major constraints, extensive specialist input required', color: '#b91c1c', bgColor: '#fee2e2' },
    high_risk: { label: 'HIGH RISK', description: 'Significant constraints, specialist assessment required', color: '#ea580c', bgColor: '#fff7ed' },
    medium_risk: { label: 'MEDIUM RISK', description: 'Notable constraints, proportionate assessment required', color: '#f59e0b', bgColor: '#fff7ed' },
    medium_high_risk: { label: 'MEDIUM-HIGH RISK', description: 'Moderate constraints, careful design required', color: '#d97706', bgColor: '#fffbeb' },
    medium_low_risk: { label: 'MEDIUM-LOW RISK', description: 'Minor constraints, basic mitigation measures', color: '#10b981', bgColor: '#ecfdf5' },
    low_risk: { label: 'LOW RISK', description: 'Minimal constraints, standard mitigation measures', color: '#059669', bgColor: '#ecfdf5' }
  };
  
  if (typeof overallRisk === 'string') {
    return stringMap[/** @type {keyof typeof stringMap} */ (overallRisk)] || stringMap.low_risk;
  }
  
  // For numeric values, fall back to low risk
  return stringMap.low_risk;
}

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

  // Build discipline-specific data for structured report
  // Use the rules that are already separated by domain in individual reports
  const disciplines = [];
  
  if (heritageReport) {
    const heritageTriggeredRules = heritageReport.riskAssessment?.triggeredRules || [];
    disciplines.push({
      name: "Heritage",
      overallRisk: heritageReport.riskAssessment?.overallRisk,
      riskSummary: heritageReport.riskAssessment?.riskSummary,
      triggeredRules: heritageTriggeredRules
    });
  }
  
  if (landscapeReport) {
    const landscapeTriggeredRules = landscapeReport.riskAssessment?.triggeredRules || [];
    disciplines.push({
      name: "Landscape", 
      overallRisk: landscapeReport.riskAssessment?.overallRisk,
      riskSummary: landscapeReport.riskAssessment?.riskSummary,
      triggeredRules: landscapeTriggeredRules
    });
  }

  // Build risk by discipline summary for the summary section
  const riskByDiscipline = disciplines
    .filter(d => d.overallRisk) // Only include disciplines with risk data
    .map(d => ({
      name: d.name,
      risk: d.overallRisk,
      riskSummary: d.riskSummary
    }));
  
  return {
    // EXISTING STRUCTURE - Keep for backward compatibility
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
    },

    // NEW STRUCTURED REPORT - New organized structure
    structuredReport: {
      summary: {
        site: "TBC - Site summary placeholder",
        riskByDiscipline,
        overallRisk,
        overallRiskSummary: resolveRiskSummary(overallRisk)
      },
      disciplines: disciplines.filter(d => d.overallRisk) // Only include disciplines with data
    }
  };
}

/**
 * Legacy function for backward compatibility - builds heritage report only
 * @param {any} backend 
 */
export { buildHeritageReport } from './heritage/heritageReportGenerator.js';