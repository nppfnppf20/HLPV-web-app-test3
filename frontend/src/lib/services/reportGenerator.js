import { processHeritageRules, RISK_LEVELS } from '../rules/heritageRules.js';
import { processEcologyRules } from '../rules/ecologyRules.js';

/** @param {any} analysisData */
export function generateDesignationSummary(analysisData) {
  const buildings = analysisData?.listed_buildings || [];
  const conservationAreas = analysisData?.conservation_areas || [];

  const summary = [];

  if (buildings.length > 0) {
    const onSite = buildings.filter(/** @param {any} b */ b => b.on_site);
    const nearby = buildings.filter(/** @param {any} b */ b => !b.on_site);
    const grades = {
      'I': buildings.filter(/** @param {any} b */ b => b.grade === 'I').length,
      'II*': buildings.filter(/** @param {any} b */ b => b.grade === 'II*').length,
      'II': buildings.filter(/** @param {any} b */ b => b.grade === 'II').length
    };
    let buildingText = `${buildings.length} listed building${buildings.length > 1 ? 's' : ''} identified`;
    if (onSite.length > 0) buildingText += ` (${onSite.length} on site, ${nearby.length} nearby)`;
    const gradeTexts = [];
    if (grades.I > 0) gradeTexts.push(`${grades.I} Grade I`);
    if (grades['II*'] > 0) gradeTexts.push(`${grades['II*']} Grade II*`);
    if (grades.II > 0) gradeTexts.push(`${grades.II} Grade II`);
    if (gradeTexts.length > 0) buildingText += `: ${gradeTexts.join(', ')}`;
    summary.push(buildingText);
  } else {
    summary.push('No listed buildings identified within the search area');
  }

  if (conservationAreas.length > 0) {
    const intersecting = conservationAreas.filter(/** @param {any} a */ a => a.on_site);
    const nearby = conservationAreas.filter(/** @param {any} a */ a => !a.on_site);
    let areaText = `${conservationAreas.length} conservation area${conservationAreas.length > 1 ? 's' : ''} identified`;
    if (intersecting.length > 0) areaText += ` (${intersecting.length} intersecting with site, ${nearby.length} nearby)`;
    summary.push(areaText);
  } else {
    summary.push('No conservation areas identified within the search area');
  }

  return summary;
}

/** @param {string} overallRisk */
export function getRiskSummary(overallRisk) {
  const riskConfig = {
    [RISK_LEVELS.SHOWSTOPPER]: { label: 'SHOWSTOPPER', description: 'Development likely not viable without major redesign', color: '#dc2626', bgColor: '#fef2f2' },
    [RISK_LEVELS.EXTREMELY_HIGH_RISK]: { label: 'EXTREMELY HIGH RISK', description: 'Major constraints, extensive specialist input required', color: '#b91c1c', bgColor: '#fee2e2' },
    [RISK_LEVELS.HIGH_RISK]: { label: 'HIGH RISK', description: 'Significant constraints, specialist assessment required', color: '#ea580c', bgColor: '#fff7ed' },
    [RISK_LEVELS.MEDIUM_HIGH_RISK]: { label: 'MEDIUM-HIGH RISK', description: 'Moderate constraints, careful design required', color: '#d97706', bgColor: '#fffbeb' },
    [RISK_LEVELS.LOW_RISK]: { label: 'LOW RISK', description: 'Minimal constraints, standard mitigation measures', color: '#059669', bgColor: '#ecfdf5' }
  };
  return riskConfig[overallRisk] || riskConfig[RISK_LEVELS.LOW_RISK];
}

/** @param {any} analysisData */
export function generateHeritageReport(analysisData) {
  const designationSummary = generateDesignationSummary(analysisData);
  const ruleResults = processHeritageRules(analysisData);
  const riskSummary = getRiskSummary(ruleResults.overallRisk || RISK_LEVELS.LOW_RISK);
  // Ecology risk (e.g., Green Belt)
  const ecologyRuleResults = processEcologyRules({ green_belt: analysisData?.green_belt || [] });
  const ecologyOverall = ecologyRuleResults.overallRisk;

  // Combine overall risk: take highest severity (SHOWSTOPPER > EXTREMELY_HIGH_RISK > HIGH_RISK > MEDIUM_HIGH_RISK ...)
  const severityOrder = [
    RISK_LEVELS.SHOWSTOPPER,
    RISK_LEVELS.EXTREMELY_HIGH_RISK,
    RISK_LEVELS.HIGH_RISK,
    RISK_LEVELS.MEDIUM_HIGH_RISK,
    RISK_LEVELS.LOW_RISK
  ];
  const combinedOverall = [ruleResults.overallRisk || RISK_LEVELS.LOW_RISK, ecologyOverall || RISK_LEVELS.LOW_RISK]
    .sort((a, b) => severityOrder.indexOf(a) - severityOrder.indexOf(b))[0];
  const combinedRiskSummary = getRiskSummary(combinedOverall);

  return {
    designationSummary,
    riskAssessment: {
      overallRisk: combinedOverall,
      riskSummary: combinedRiskSummary,
      triggeredRules: [
        ...ruleResults.rules,
        ...ecologyRuleResults.rules
      ]
    },
    rawData: {
      buildings: ruleResults.buildings,
      conservationAreas: ruleResults.conservationAreas,
      greenBelt: analysisData?.green_belt || []
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      rulesVersion: '1.1.0',
      totalRulesProcessed: 7,
      rulesTriggered: (ruleResults.rules.length + ecologyRuleResults.rules.length)
    }
  };
}
