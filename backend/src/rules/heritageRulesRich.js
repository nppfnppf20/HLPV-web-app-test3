/**
 * HERITAGE IMPACT ASSESSMENT RULES (Rich, UI-aligned)
 *
 * These rules mirror the client-side rules to produce human-readable
 * findings, impact, and requirements along with a string-based risk level.
 */

export const RISK_LEVELS = {
  SHOWSTOPPER: 'showstopper',
  EXTREMELY_HIGH_RISK: 'extremely_high_risk',
  HIGH_RISK: 'high_risk',
  MEDIUM_HIGH_RISK: 'medium_high_risk',
  LOW_RISK: 'low_risk'
};

/** @param {any[]} buildings */
export function checkGradeIOnSite(buildings) {
  const gradeIOnSite = (buildings || []).filter(b => b.on_site && b.grade === 'I');
  if (gradeIOnSite.length === 0) return { triggered: false };
  return {
    id: 'grade_i_on_site',
    triggered: true,
    level: RISK_LEVELS.SHOWSTOPPER,
    rule: 'Grade I On-Site',
    findings: `${gradeIOnSite.length} Grade I listed building(s) found on development site`,
    impact: 'Development directly affects buildings of exceptional national importance',
    requirements: [
      'Immediate specialist heritage consultation required',
      'Historic England pre-application advice essential',
      'Development proposal likely requires fundamental redesign',
      'Consider alternative site locations'
    ],
    buildings: gradeIOnSite
  };
}

/** @param {any[]} conservationAreas */
export function checkConservationAreaOnSite(conservationAreas) {
  const onSiteAreas = (conservationAreas || []).filter(a => a.on_site);
  if (onSiteAreas.length === 0) return { triggered: false };
  return {
    id: 'conservation_area_on_site',
    triggered: true,
    level: RISK_LEVELS.EXTREMELY_HIGH_RISK,
    rule: 'Conservation Area On-Site',
    findings: `Development site intersects with ${onSiteAreas.length} conservation area${onSiteAreas.length > 1 ? 's' : ''}`,
    impact: 'Development within conservation area requires preservation or enhancement of character and appearance',
    requirements: [
      'Conservation Area Consent required for most development',
      'Heritage and Design Statement essential',
      'Conservation officer pre-application consultation mandatory',
      'Design must preserve or enhance conservation area character',
      'Materials and detailing must be sympathetic to historic context',
      'Detailed historical and architectural analysis required'
    ],
    areas: onSiteAreas
  };
}

/** @param {any[]} buildings */
export function checkGradeIWithin100m(buildings) {
  const gradeIClose = (buildings || []).filter(b => !b.on_site && b.grade === 'I' && b.dist_m <= 100);
  if (gradeIClose.length === 0) return { triggered: false };
  return {
    id: 'grade_i_within_100m',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'Grade I Within 100m',
    findings: `${gradeIClose.length} Grade I listed building(s) within 100m of site`,
    impact: 'Development may significantly affect the setting of exceptional heritage assets',
    requirements: [
      'Heritage Impact Assessment focusing on setting required',
      'Visual impact assessment from multiple viewpoints',
      'Historic England consultation recommended',
      'Design must demonstrate no harm to setting'
    ],
    buildings: gradeIClose
  };
}

/** @param {any[]} buildings */
export function checkGradeIWithin500m(buildings) {
  const gradeIWider = (buildings || []).filter(b => !b.on_site && b.grade === 'I' && b.dist_m > 100 && b.dist_m <= 500);
  if (gradeIWider.length === 0) return { triggered: false };
  return {
    id: 'grade_i_within_500m',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'Grade I Within 500m',
    findings: `${gradeIWider.length} Grade I listed building(s) within 500m of site`,
    impact: 'Development may affect wider setting of exceptional heritage assets',
    requirements: [
      'Setting assessment required with focus on inter-visibility',
      'Landscape and visual impact assessment',
      'Consider cumulative effects with other development',
      'Historic England consultation may be required'
    ],
    buildings: gradeIWider
  };
}

/** @param {any[]} buildings */
export function checkGradeIIOnSite(buildings) {
  const gradeIIOnSite = (buildings || []).filter(b => b.on_site && (b.grade === 'II' || b.grade === 'II*'));
  if (gradeIIOnSite.length === 0) return { triggered: false };
  const gradeBreakdown = {
    'II*': gradeIIOnSite.filter(b => b.grade === 'II*').length,
    'II': gradeIIOnSite.filter(b => b.grade === 'II').length
  };
  return {
    id: 'grade_ii_or_ii_star_on_site',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'Grade II/II* On-Site',
    findings: `${gradeIIOnSite.length} Grade II or II* listed building(s) found on development site`,
    gradeBreakdown,
    impact: 'Development directly affects buildings of special architectural or historic interest',
    requirements: [
      'Heritage Impact Assessment required',
      'Specialist heritage consultation recommended',
      'Listed building consent likely required for alterations',
      'Design must demonstrate minimal harm and public benefit',
      'Conservation officer consultation essential'
    ],
    buildings: gradeIIOnSite
  };
}

/** @param {any[]} buildings */
export function checkAnyGradeWithin100m(buildings) {
  const buildingsClose = (buildings || []).filter(b => !b.on_site && b.dist_m <= 100);
  if (buildingsClose.length === 0) return { triggered: false };
  const gradeBreakdown = {
    'I': buildingsClose.filter(b => b.grade === 'I').length,
    'II*': buildingsClose.filter(b => b.grade === 'II*').length,
    'II': buildingsClose.filter(b => b.grade === 'II').length
  };
  return {
    id: 'any_grade_within_100m',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_HIGH_RISK,
    rule: 'Listed Buildings Within 100m',
    findings: `${buildingsClose.length} listed building(s) within 100m of site`,
    gradeBreakdown,
    impact: 'Development likely to affect the immediate setting of listed buildings',
    requirements: [
      'Heritage statement or Heritage Impact Assessment required',
      'Design and Access Statement must address heritage considerations',
      'Detailed site analysis and historical research',
      'Consultation with conservation officer recommended'
    ],
    buildings: buildingsClose
  };
}

/**
 * Runs all heritage rules in priority order and returns triggered rules
 * @param {any} analysisData
 */
export function processHeritageRules(analysisData) {
  const buildings = analysisData?.listed_buildings || [];
  const conservationAreas = analysisData?.conservation_areas || [];

  const triggeredRules = [];

  // Order: most serious first
  const buildingRules = [
    checkGradeIOnSite,
    checkGradeIWithin100m,
    checkGradeIWithin500m,
    checkGradeIIOnSite,
    checkAnyGradeWithin100m
  ];

  const conservationRules = [
    checkConservationAreaOnSite
  ];

  for (const rule of buildingRules) {
    const result = rule(buildings);
    if (result.triggered) triggeredRules.push(result);
  }
  for (const rule of conservationRules) {
    const result = rule(conservationAreas);
    if (result.triggered) triggeredRules.push(result);
  }

  return {
    rules: triggeredRules,
    overallRisk: triggeredRules.length > 0 ? triggeredRules[0].level : RISK_LEVELS.LOW_RISK,
    buildings,
    conservationAreas
  };
}


