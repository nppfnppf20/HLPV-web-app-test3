import { RISK_LEVELS } from '../riskLevels.js';

// Agricultural land discipline-wide default recommendations
const DEFAULT_AGLAND_TRIGGERED_RECOMMENDATIONS = [
  'Agricultural land assessment required in planning submissions',
  'Consider alternative site locations to avoid high-quality agricultural land',
  'Mitigation measures may be required to demonstrate exceptional circumstances',
  'Early engagement with Natural England recommended for Grade 1 and 2 land'
];

const DEFAULT_AGLAND_NO_RULES_RECOMMENDATIONS = [
  'No significant agricultural land constraints identified',
  'Standard planning considerations for agricultural land apply',
  'Consider agricultural context in design and layout planning'
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
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 1 agricultural land (${grade1Areas.length} area${grade1Areas.length > 1 ? 's' : ''})`,
    recommendations: [
      'Development on Grade 1 land strongly discouraged - exceptional circumstances required',
      'Comprehensive agricultural land assessment essential',
      'Alternative site locations should be considered'
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
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 2 agricultural land (${grade2Areas.length} area${grade2Areas.length > 1 ? 's' : ''})`,
    recommendations: [
      'High quality agricultural land - strong policy protection applies',
      'Exceptional circumstances required to justify development',
      'Agricultural land assessment required in planning submissions'
    ],
    areas: grade2Areas
  };
}

/** @param {any[]} agLandAreas */
export function checkGrade3aOnSite(agLandAreas) {
  const grade3aAreas = (agLandAreas || []).filter(a => a.grade === 'Grade 3a' || a.grade === '3a');
  if (grade3aAreas.length === 0) return { triggered: false };

  const totalCoverage = grade3aAreas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);

  return {
    id: 'grade_3a_on_site',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_HIGH_RISK,
    rule: 'Grade 3a Agricultural Land On-Site',
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 3a agricultural land (${grade3aAreas.length} area${grade3aAreas.length > 1 ? 's' : ''})`,
    recommendations: [
      'Good quality agricultural land - policy protection applies',
      'Agricultural land assessment recommended',
      'Consider agricultural context in site design'
    ],
    areas: grade3aAreas
  };
}

/** @param {any[]} agLandAreas */
export function checkGrade3bOnSite(agLandAreas) {
  const grade3bAreas = (agLandAreas || []).filter(a => a.grade === 'Grade 3b' || a.grade === '3b');
  if (grade3bAreas.length === 0) return { triggered: false };

  const totalCoverage = grade3bAreas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);

  return {
    id: 'grade_3b_on_site',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_RISK,
    rule: 'Grade 3b Agricultural Land On-Site',
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 3b agricultural land (${grade3bAreas.length} area${grade3bAreas.length > 1 ? 's' : ''})`,
    recommendations: [
      'Moderate quality agricultural land',
      'Standard agricultural considerations apply',
      'Consider agricultural context in planning applications'
    ],
    areas: grade3bAreas
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
    checkGrade3aOnSite,
    checkGrade3bOnSite,
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
      totalRulesProcessed: 6, // 6 agricultural grade checks
      rulesTriggered: triggeredRules.length,
      rulesVersion: 'agland-rules-v1'
    }
  };
}