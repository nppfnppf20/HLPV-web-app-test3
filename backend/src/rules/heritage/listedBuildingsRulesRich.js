import { RISK_LEVELS } from '../riskLevels.js';

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
      'N/a - this consitutes a showstopping designation', 
      'Development on this site is not viable'
    ],
    buildings: gradeIOnSite
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
      'N/a - this consitutes a showstopping designation', 
      'Development on this site is not viable'
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
      'Development highly unlikely to be viable',
      'Heritage assessment essential',
      'Consider alternative site locations'
      
      
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
 * Process all listed buildings rules and return triggered ones
 * @param {{ listed_buildings?: any[] }} analysisData
 */
export function processListedBuildingsRules(analysisData) {
  const buildings = analysisData?.listed_buildings || [];
  const triggeredRules = [];

  // Order: most serious first
  const buildingRules = [
    checkGradeIOnSite,
    checkGradeIWithin100m,
    checkGradeIWithin500m,
    checkGradeIIOnSite,
    checkAnyGradeWithin100m
  ];

  for (const rule of buildingRules) {
    const result = rule(buildings);
    if (result.triggered) triggeredRules.push(result);
  }

  return {
    rules: triggeredRules,
    buildings
  };
}
