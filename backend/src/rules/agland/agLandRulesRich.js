import { RISK_LEVELS } from '../riskLevels.js';

// Agricultural land discipline-wide default recommendations
const DEFAULT_AGLAND_TRIGGERED_RECOMMENDATIONS = [
'Natural England ALC mapping is only inidicative. An ALC survey will be required the confirm the actual land grade on-site',
  
];

const DEFAULT_AGLAND_NO_RULES_RECOMMENDATIONS = [
 'Natural England ALC mapping is only inidicative. An ALC survey will be required the confirm the actual land grade on-site',
  'No significant agricultural land constraints identified',
  'Standard planning considerations apply',
  
];

/** @param {any[]} agLandAreas */
export function checkGrade1OnSite(agLandAreas) {
  const grade1Areas = (agLandAreas || []).filter(a => a.grade === 'Grade 1' || a.grade === '1');
  if (grade1Areas.length === 0) return { triggered: false };

  const totalCoverage = grade1Areas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);

  // Grade 1 thresholds: 100-60% = showstopper, 60-20% = extremely high
  if (totalCoverage < 20) return { triggered: false };

  let riskLevel, riskDescription;
  if (totalCoverage >= 60) {
    riskLevel = RISK_LEVELS.SHOWSTOPPER;
    riskDescription = 'showstopper risk';
  } else {
    riskLevel = RISK_LEVELS.EXTREMELY_HIGH_RISK;
    riskDescription = 'extremely high risk';
  }

  return {
    id: 'grade_1_on_site',
    triggered: true,
    level: riskLevel,
    rule: 'Grade 1 Agricultural Land On-Site',
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 1 agricultural land`,
    recommendations: [
      `Presence of Grade 1 land constitutes a ${riskDescription}`,
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

  // Grade 2 thresholds: 100-80% = high, 60-40% = medium-high, 40-20% = medium
  if (totalCoverage < 20) return { triggered: false };

  let riskLevel, riskDescription;
  if (totalCoverage >= 80) {
    riskLevel = RISK_LEVELS.HIGH_RISK;
    riskDescription = 'high risk';
  } else if (totalCoverage >= 40) {
    riskLevel = RISK_LEVELS.MEDIUM_HIGH_RISK;
    riskDescription = 'medium-high risk';
  } else {
    riskLevel = RISK_LEVELS.MEDIUM_RISK;
    riskDescription = 'medium risk';
  }

  return {
    id: 'grade_2_on_site',
    triggered: true,
    level: riskLevel,
    rule: 'Grade 2 Agricultural Land On-Site',
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 2 agricultural land`,
    recommendations: [
      `Presence of Grade 2 land constitutes a ${riskDescription}`,
      'Whilst not necessarily a showstopper, strong justification will be needed for development on BMV land',
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

  // Grade 3 thresholds: 100-20% = medium
  if (totalCoverage < 20) return { triggered: false };

  return {
    id: 'grade_3_on_site',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_RISK,
    rule: 'Grade 3 Agricultural Land On-Site',
    findings: `${totalCoverage.toFixed(1)}% of site consists of Grade 3 agricultural land`,
    recommendations: [
      'Presence of Grade 3 land constitutes a medium level risk',
      'Whilst not necessarily a showstopper, strong justification will be needed for development on BMV land',
      'Additional supporting material such as a Site Justification Document, farm diversification/business case, and policy justification will likely be required',
    ],
    areas: grade3Areas
  };
}


/** @param {any[]} agLandAreas */
export function checkGrade4Or5OnlyOnSite(agLandAreas) {
  const allAreas = agLandAreas || [];

  // Check if there are any higher quality grades (1, 2, 3) present with significant coverage (>=20%)
  const higherGrades = allAreas.filter(a => {
    const isHigherGrade = a.grade === 'Grade 1' || a.grade === '1' ||
                         a.grade === 'Grade 2' || a.grade === '2' ||
                         a.grade === 'Grade 3' || a.grade === '3';
    return isHigherGrade && (a.percentage_coverage || 0) >= 20;
  });

  // If higher grades with significant coverage are present, this rule doesn't apply
  if (higherGrades.length > 0) return { triggered: false };

  // Check for Grade 4 or 5 areas
  const grade4Or5Areas = allAreas.filter(a =>
    a.grade === 'Grade 4' || a.grade === '4' ||
    a.grade === 'Grade 5' || a.grade === '5'
  );

  if (grade4Or5Areas.length === 0) return { triggered: false };

  const totalCoverage = grade4Or5Areas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);

  // Grade 4 & 5 thresholds: 100-20% = low risk
  if (totalCoverage < 20) return { triggered: false };

  const grade4Areas = grade4Or5Areas.filter(a => a.grade === 'Grade 4' || a.grade === '4');
  const grade5Areas = grade4Or5Areas.filter(a => a.grade === 'Grade 5' || a.grade === '5');

  const gradeBreakdown = [];
  if (grade4Areas.length > 0) {
    const grade4Coverage = grade4Areas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);
    gradeBreakdown.push(`Grade 4 (${grade4Coverage.toFixed(1)}%)`);
  }
  if (grade5Areas.length > 0) {
    const grade5Coverage = grade5Areas.reduce((sum, area) => sum + (area.percentage_coverage || 0), 0);
    gradeBreakdown.push(`Grade 5 (${grade5Coverage.toFixed(1)}%)`);
  }

  return {
    id: 'grade_4_or_5_only_on_site',
    triggered: true,
    level: RISK_LEVELS.LOW_RISK,
    rule: 'Grade 4 or 5 Agricultural Land Only',
    findings: `Site consists only of lower quality agricultural land: ${gradeBreakdown.join(', ')}`,
    recommendations: [
      'Lower quality agricultural land with limited agricultural value',
      'Although the provisional land classification indicates that the land is unlikely to contain BMV, an ALC survey is still advisable to confirm this'
    ],
    areas: grade4Or5Areas
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
    checkGrade4Or5OnlyOnSite
  ];

  for (const rule of agLandRules) {
    const result = rule(agLand);
    if (result.triggered) triggeredRules.push(result);
  }

  // SHOWSTOPPER LOGIC: If any rule is a showstopper, only show showstopper rules
  const showstopperRules = triggeredRules.filter(r => r.level === RISK_LEVELS.SHOWSTOPPER);
  if (showstopperRules.length > 0) {
    triggeredRules = showstopperRules;
  }

  // Determine overall risk based on highest risk rule triggered
  const overallRisk = triggeredRules.length > 0 ? triggeredRules[0].level : RISK_LEVELS.LOW_RISK;

  // Create site breakdown summary
  const createSiteBreakdown = () => {
    if (agLand.length === 0) return null;
    
    const gradesSummary = agLand
      .sort((a, b) => {
        // Sort by grade quality (1 is best, 5 is worst)
        const gradeOrder = { '1': 1, 'Grade 1': 1, '2': 2, 'Grade 2': 2, '3': 3, 'Grade 3': 3, '4': 4, 'Grade 4': 4, '5': 5, 'Grade 5': 5 };
        const aOrder = gradeOrder[a.grade] || 99;
        const bOrder = gradeOrder[b.grade] || 99;
        return aOrder - bOrder;
      })
      .map(area => `${area.percentage_coverage?.toFixed(1) || 0}% ${area.grade}`)
      .join(', ');
    
    return `Site breakdown: ${gradesSummary}`;
  };

  // Discipline-wide recommendations based on whether ANY agricultural land rules triggered
  const hasTriggeredRules = triggeredRules.length > 0;
  
  // SHOWSTOPPER OVERRIDE: If showstoppers are present, don't show default triggered recommendations
  const isShowstopperOnly = showstopperRules.length > 0;

  // Build recommendations with site breakdown
  const siteBreakdown = createSiteBreakdown();
  const triggeredRecommendations = (hasTriggeredRules && !isShowstopperOnly) 
    ? (siteBreakdown 
        ? [siteBreakdown, ...DEFAULT_AGLAND_TRIGGERED_RECOMMENDATIONS] 
        : DEFAULT_AGLAND_TRIGGERED_RECOMMENDATIONS)
    : [];
  const noRulesRecommendations = hasTriggeredRules 
    ? [] 
    : (siteBreakdown 
        ? [siteBreakdown, ...DEFAULT_AGLAND_NO_RULES_RECOMMENDATIONS] 
        : DEFAULT_AGLAND_NO_RULES_RECOMMENDATIONS);

  return {
    rules: triggeredRules,
    overallRisk,
    agLand,
    defaultTriggeredRecommendations: triggeredRecommendations,
    defaultNoRulesRecommendations: noRulesRecommendations,
    metadata: {
      totalRulesProcessed: 4, // 4 agricultural grade checks
      rulesTriggered: triggeredRules.length,
      rulesVersion: 'agland-rules-v3'
    }
  };
}