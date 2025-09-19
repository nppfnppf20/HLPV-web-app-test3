import { RISK_LEVELS } from '../riskLevels.js';

// Agricultural land discipline-wide default recommendations
const DEFAULT_AGLAND_TRIGGERED_RECOMMENDATIONS = [

  
];

const DEFAULT_AGLAND_NO_RULES_RECOMMENDATIONS = [
  'No significant agricultural land constraints identified',
  'Standard planning considerations apply',
  
];

/** @param {any[]} agLandAreas */
export function checkGrade1OnSite(agLandAreas) {
  const grade1Areas = (agLandAreas || []).filter(a => a.grade === 'Grade 1' || a.grade === '1');
  if (grade1Areas.length === 0) return { triggered: false };

  const totalCoverage = grade1Areas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);

  return {
    id: 'grade_1_on_site',
    triggered: true,
    level: RISK_LEVELS.EXTREMELY_HIGH_RISK,
    rule: 'Grade 1 Agricultural Land On-Site',
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 1 agricultural land`,
    recommendations: [
      'Presence of Grade 1 land constitutes a very high risk',
      'Comprehensive agricultural land assessment essential',
      'Additional supporting material such as a Site Justification Document, farm diversification/business case, and policy justification will likely be required',
      'Early engagement with Natural England recommended for Grade 1 and 2 land'
    ],
    areas: grade1Areas
  };
}

/** @param {any[]} agLandAreas */
export function checkGrade2OnSite(agLandAreas) {
  const grade2Areas = (agLandAreas || []).filter(a => a.grade === 'Grade 2' || a.grade === '2');
  if (grade2Areas.length === 0) return { triggered: false };

  const totalCoverage = grade2Areas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);

  return {
    id: 'grade_2_on_site',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'Grade 2 Agricultural Land On-Site',
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 2 agricultural land`,
    recommendations: [
      'Presence of Grade 2 land constitutes high risk. Whilst not necessarily a showstopper, strong justification will be needed for development on BMV land',
      'Early engagement with Natural England recommended for Grade 1 and 2 land',
      'Additional supporting material such as a Site Justification Document, farm diversification/business case, and policy justification will likely be required',

    ],
    areas: grade2Areas
  };
}

/** @param {any[]} agLandAreas */
export function checkGrade3OnSite(agLandAreas) {
  const grade3Areas = (agLandAreas || []).filter(a => a.grade === 'Grade 3' || a.grade === '3');
  if (grade3Areas.length === 0) return { triggered: false };

  const totalCoverage = grade3Areas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);

  return {
    id: 'grade_3_on_site',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_RISK,
    rule: 'Grade 3 Agricultural Land On-Site',
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 3 agricultural land`,
    recommendations: [
      'Planning risk is high and, whilst not necessarily a showstopper, strong justification will be needed for development on BMV land',
      'Additional supporting material such as a Site Justification Document, farm diversification/business case, and policy justification will likely be required',

    ],
    areas: grade3Areas
  };
}


/** @param {any[]} agLandAreas */
export function checkGrade4OnSite(agLandAreas) {
  const grade4Areas = (agLandAreas || []).filter(a => a.grade === 'Grade 4' || a.grade === '4');
  if (grade4Areas.length === 0) return { triggered: false };

  const totalCoverage = grade4Areas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);

  return {
    id: 'grade_4_on_site',
    triggered: true,
    level: RISK_LEVELS.LOW_RISK,
    rule: 'Grade 4 Agricultural Land On-Site',
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 4 agricultural land (${grade4Areas.length} area${grade4Areas.length > 1 ? 's' : ''})`,
    recommendations: [
      'Poor quality agricultural land - limited agricultural value',
      'Minimal agricultural land constraints for development'
    ],
    areas: grade4Areas
  };
}

/** @param {any[]} agLandAreas */
export function checkGrade5OnSite(agLandAreas) {
  const grade5Areas = (agLandAreas || []).filter(a => a.grade === 'Grade 5' || a.grade === '5');
  if (grade5Areas.length === 0) return { triggered: false };

  const totalCoverage = grade5Areas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);

  return {
    id: 'grade_5_on_site',
    triggered: true,
    level: RISK_LEVELS.LOW_RISK,
    rule: 'Grade 5 Agricultural Land On-Site',
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 5 agricultural land (${grade5Areas.length} area${grade5Areas.length > 1 ? 's' : ''})`,
    recommendations: [
      'Very poor quality agricultural land - very limited agricultural value',
      'No significant agricultural land constraints for development'
    ],
    areas: grade5Areas
  };
}

/**
 * Process all agricultural land rules and return triggered ones
 * @param {{ ag_land?: any[] }} analysisData
 */
export function processAgLandRules(analysisData) {
  const agLand = analysisData?.ag_land || [];
  const triggeredRules = [];

  // Order: most restrictive grades first
  const agLandRules = [
    checkGrade1OnSite,
    checkGrade2OnSite,
    checkGrade3OnSite,
    checkGrade4OnSite,
    checkGrade5OnSite
  ];

  for (const rule of agLandRules) {
    const result = rule(agLand);
    if (result.triggered) triggeredRules.push(result);
  }

  // Determine overall risk based on highest risk rule triggered
  const overallRisk = triggeredRules.length > 0 ? triggeredRules[0].level : RISK_LEVELS.LOW_RISK;

  // Discipline-wide recommendations based on whether ANY agricultural land rules triggered
  const hasTriggeredRules = triggeredRules.length > 0;

  return {
    rules: triggeredRules,
    overallRisk,
    agLand,
    defaultTriggeredRecommendations: hasTriggeredRules ? DEFAULT_AGLAND_TRIGGERED_RECOMMENDATIONS : [],
    defaultNoRulesRecommendations: hasTriggeredRules ? [] : DEFAULT_AGLAND_NO_RULES_RECOMMENDATIONS,
    metadata: {
      totalRulesProcessed: 5, // 5 agricultural grade checks
      rulesTriggered: triggeredRules.length,
      rulesVersion: 'agland-rules-v2'
    }
  };
}