/**
 * HERITAGE REPORT GENERATOR
 * 
 * Generates standardized heritage impact assessment reports based on
 * analysis data and rule-based risk assessment.
 */

import { processHeritageRules, RISK_LEVELS } from '../rules/heritageRules.js';

/**
 * Generate descriptive text about heritage designations found
 * 
 * PURPOSE: Create plain English summary of what heritage assets were identified
 * OUTPUT: Array of summary strings describing buildings and conservation areas
 * @param {any} analysisData
 */
export function generateDesignationSummary(analysisData) {
  const buildings = analysisData?.listed_buildings || [];
  const conservationAreas = analysisData?.conservation_areas || [];
  
  const summary = [];
  
  // Listed Buildings Summary
  if (buildings.length > 0) {
    const onSite = buildings.filter(/** @param {any} b */ b => b.on_site);
    const nearby = buildings.filter(/** @param {any} b */ b => !b.on_site);
    
    // Grade breakdown
    const grades = {
      'I': buildings.filter(/** @param {any} b */ b => b.grade === 'I').length,
      'II*': buildings.filter(/** @param {any} b */ b => b.grade === 'II*').length,
      'II': buildings.filter(/** @param {any} b */ b => b.grade === 'II').length
    };
    
    let buildingText = `${buildings.length} listed building${buildings.length > 1 ? 's' : ''} identified`;
    
    if (onSite.length > 0) {
      buildingText += ` (${onSite.length} on site, ${nearby.length} nearby)`;
    }
    
    // Add grade breakdown
    const gradeTexts = [];
    if (grades.I > 0) gradeTexts.push(`${grades.I} Grade I`);
    if (grades['II*'] > 0) gradeTexts.push(`${grades['II*']} Grade II*`);
    if (grades.II > 0) gradeTexts.push(`${grades.II} Grade II`);
    
    if (gradeTexts.length > 0) {
      buildingText += `: ${gradeTexts.join(', ')}`;
    }
    
    summary.push(buildingText);
  } else {
    summary.push('No listed buildings identified within the search area');
  }
  
  // Conservation Areas Summary
  if (conservationAreas.length > 0) {
    const intersecting = conservationAreas.filter(/** @param {any} a */ a => a.on_site);
    const nearby = conservationAreas.filter(/** @param {any} a */ a => !a.on_site);
    
    let areaText = `${conservationAreas.length} conservation area${conservationAreas.length > 1 ? 's' : ''} identified`;
    
    if (intersecting.length > 0) {
      areaText += ` (${intersecting.length} intersecting with site, ${nearby.length} nearby)`;
    }
    
    summary.push(areaText);
  } else {
    summary.push('No conservation areas identified within the search area');
  }
  
  return summary;
}

/**
 * Generate risk assessment summary with color coding
 * 
 * PURPOSE: Provide visual and textual representation of overall development risk
 * OUTPUT: Object with styling and descriptive information for each risk level
 * @param {string} overallRisk
 */
export function getRiskSummary(overallRisk) {
  const riskConfig = {
    [RISK_LEVELS.SHOWSTOPPER]: {
      label: 'SHOWSTOPPER',
      description: 'Development likely not viable without major redesign',
      color: '#dc2626', // red-600
      bgColor: '#fef2f2' // red-50
    },
    [RISK_LEVELS.EXTREMELY_HIGH_RISK]: {
      label: 'EXTREMELY HIGH RISK',
      description: 'Major constraints, extensive specialist input required',
      color: '#b91c1c', // red-700
      bgColor: '#fee2e2' // red-100
    },
    [RISK_LEVELS.HIGH_RISK]: {
      label: 'HIGH RISK',
      description: 'Significant constraints, specialist assessment required',
      color: '#ea580c', // orange-600
      bgColor: '#fff7ed' // orange-50
    },
    [RISK_LEVELS.MEDIUM_HIGH_RISK]: {
      label: 'MEDIUM-HIGH RISK',
      description: 'Moderate constraints, careful design required',
      color: '#d97706', // amber-600
      bgColor: '#fffbeb' // amber-50
    },
    [RISK_LEVELS.LOW_RISK]: {
      label: 'LOW RISK',
      description: 'Minimal constraints, standard mitigation measures',
      color: '#059669', // emerald-600
      bgColor: '#ecfdf5' // emerald-50
    }
  };
  
  return riskConfig[overallRisk] || riskConfig[RISK_LEVELS.LOW_RISK];
}

/**
 * Generate complete heritage report
 * 
 * PURPOSE: Main orchestrator function that combines all report elements
 * PROCESS: 
 *   1. Generate plain English designation summary
 *   2. Run heritage rules to assess risk
 *   3. Format results for display
 * OUTPUT: Complete report object ready for UI rendering
 * @param {any} analysisData
 */
export function generateHeritageReport(analysisData) {
  const designationSummary = generateDesignationSummary(analysisData);
  const ruleResults = processHeritageRules(analysisData);
  const riskSummary = getRiskSummary(ruleResults.overallRisk || RISK_LEVELS.LOW_RISK);
  
  return {
    designationSummary,
    riskAssessment: {
      overallRisk: ruleResults.overallRisk,
      riskSummary,
      triggeredRules: ruleResults.rules
    },
    rawData: {
      buildings: ruleResults.buildings,
      conservationAreas: ruleResults.conservationAreas
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      rulesVersion: '1.0.0',
      totalRulesProcessed: 6,
      rulesTriggered: ruleResults.rules.length
    }
  };
}
