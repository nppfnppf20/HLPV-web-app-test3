// Main report aggregator: combines heritage and landscape reports
// This is the primary entry point for all report generation

import { buildHeritageReport } from './heritage/heritageReportGenerator.js';
import { buildLandscapeReport } from './landscape/landscapeReportGenerator.js';

/**
 * Build renewables-specific report from backend analysis data
 * @param {any} renewablesData - Backend renewables analysis results
 */
function buildRenewablesReport(renewablesData) {
  const rules = renewablesData?.rules || [];
  const overallRisk = renewablesData?.overallRisk || null;
  const renewablesArray = renewablesData?.renewables || [];

  // Build designation summary for renewables
  const designationSummary = [];
  if (renewablesArray.length > 0) {
    const onSite = renewablesArray.filter(/** @param {any} r */ r => r.on_site).length;
    const nearby = renewablesArray.filter(/** @param {any} r */ r => !r.on_site).length;
    
    const summaryItems = [
      `${renewablesArray.length} renewable energy development${renewablesArray.length === 1 ? '' : 's'} identified`,
      onSite > 0 ? `${onSite} on-site` : null,
      nearby > 0 ? `${nearby} nearby` : null
    ].filter(/** @param {any} item */ item => Boolean(item));
    
    designationSummary.push(...summaryItems);
  }

  return {
    riskAssessment: {
      overallRisk,
      riskSummary: `${rules.length} renewable energy rule${rules.length === 1 ? '' : 's'} triggered`,
      triggeredRules: rules
    },
    designationSummary,
    metadata: renewablesData?.metadata || {}
  };
}



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
 * @param {string|number|null} renewablesRisk 
 */
function determineOverallRisk(heritageRisk, landscapeRisk, renewablesRisk) {
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
  
  const risks = [heritageRisk, landscapeRisk, renewablesRisk].filter(Boolean);
  if (risks.length === 0) return 'low_risk';
  
  // Return the highest risk level found
  for (const riskLevel of riskHierarchy) {
    if (risks.includes(riskLevel)) return riskLevel;
  }
  
  return 'low_risk';
}

/**
 * Build combined heritage, landscape, and renewables report
 * @param {any} heritageData - Backend heritage analysis results
 * @param {any} landscapeData - Backend landscape analysis results  
 * @param {any} renewablesData - Backend renewables analysis results
 */
export function buildCombinedReport(heritageData, landscapeData, renewablesData) {
  const heritageReport = heritageData ? buildHeritageReport(heritageData) : null;
  const landscapeReport = landscapeData ? buildLandscapeReport(landscapeData) : null;
  const renewablesReport = renewablesData ? buildRenewablesReport(renewablesData) : null;
  
  // Determine overall risk across all domains
  const overallRisk = determineOverallRisk(
    heritageReport?.riskAssessment?.overallRisk,
    landscapeReport?.riskAssessment?.overallRisk,
    renewablesReport?.riskAssessment?.overallRisk
  );
  
  // Combine triggered rules from all domains
  const allTriggeredRules = [
    ...(heritageReport?.riskAssessment?.triggeredRules || []),
    ...(landscapeReport?.riskAssessment?.triggeredRules || []),
    ...(renewablesReport?.riskAssessment?.triggeredRules || [])
  ];
  
  // Combine designation summaries
  const combinedDesignationSummary = [
    ...(heritageReport?.designationSummary || []),
    ...(landscapeReport?.designationSummary || []),
    ...(renewablesReport?.designationSummary || [])
  ];

  // Build discipline-specific data for structured report
  // Use the rules that are already separated by domain in individual reports
  const disciplines = [];
  
  if (heritageReport) {
    const heritageTriggeredRules = heritageReport.riskAssessment?.triggeredRules || [];
    disciplines.push({
      name: "Heritage",
      overallRisk: heritageReport.riskAssessment?.overallRisk,
      riskSummary: resolveRiskSummary(heritageReport.riskAssessment?.overallRisk),
      triggeredRules: heritageTriggeredRules
    });
  }
  
  if (landscapeReport) {
    const landscapeTriggeredRules = landscapeReport.riskAssessment?.triggeredRules || [];
    disciplines.push({
      name: "Landscape", 
      overallRisk: landscapeReport.riskAssessment?.overallRisk,
      riskSummary: resolveRiskSummary(landscapeReport.riskAssessment?.overallRisk),
      triggeredRules: landscapeTriggeredRules
    });
  }
  
  if (renewablesReport) {
    const renewablesTriggeredRules = renewablesReport.riskAssessment?.triggeredRules || [];
    disciplines.push({
      name: "Renewable Energy", 
      overallRisk: renewablesReport.riskAssessment?.overallRisk,
      riskSummary: resolveRiskSummary(renewablesReport.riskAssessment?.overallRisk),
      triggeredRules: renewablesTriggeredRules
    });
  }

  // Build risk by discipline summary for the summary section
  const riskByDiscipline = disciplines
    .filter(d => d.overallRisk) // Only include disciplines with risk data
    .map(d => ({
      name: d.name,
      risk: d.overallRisk,
      riskSummary: resolveRiskSummary(d.overallRisk)
    }));
  
  return {
    // EXISTING STRUCTURE - Keep for backward compatibility
    heritage: heritageReport,
    landscape: landscapeReport,
    renewables: renewablesReport,
    combined: {
      overallRisk,
      designationSummary: combinedDesignationSummary,
      triggeredRules: allTriggeredRules,
      riskSummary: heritageReport?.riskAssessment?.riskSummary || landscapeReport?.riskAssessment?.riskSummary || renewablesReport?.riskAssessment?.riskSummary
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      sectionsIncluded: [
        heritageData ? 'heritage' : null,
        landscapeData ? 'landscape' : null,
        renewablesData ? 'renewables' : null
      ].filter(Boolean),
      totalRules: allTriggeredRules.length,
      totalRulesProcessed: (heritageReport?.metadata?.totalRulesProcessed || 0) + (landscapeReport?.metadata?.totalRulesProcessed || 0) + (renewablesReport?.metadata?.totalRulesProcessed || 0),
      rulesTriggered: allTriggeredRules.length,
      rulesVersion: `combined-v2 (heritage: ${heritageReport?.metadata?.rulesVersion || 'n/a'}, landscape: ${landscapeReport?.metadata?.rulesVersion || 'n/a'}, renewables: ${renewablesReport?.metadata?.rulesVersion || 'n/a'})`,
      heritageMetadata: heritageReport?.metadata,
      landscapeMetadata: landscapeReport?.metadata,
      renewablesMetadata: renewablesReport?.metadata
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