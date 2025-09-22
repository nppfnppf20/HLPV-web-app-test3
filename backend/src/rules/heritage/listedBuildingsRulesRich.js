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
    recommendations: [
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
    recommendations: [
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
    recommendations: [
      'Development highly unlikely to be viable given proximity of Grade I asset',
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
    recommendations: [
      'Grade II/II* asset on site. Development highly unlikely to be viable given proximity.',
      'A Heritage Statement or Heritage Impact Assessment will be required.',
      'Specialist heritage consultant input required at an early stage.'
    ],
    buildings: gradeIIOnSite
  };
}

/** @param {any[]} buildings */
export function checkGradeIIWithin500m(buildings) {
  const gradeIIWithin500m = (buildings || []).filter(b => !b.on_site && (b.grade === 'II' || b.grade === 'II*') && b.dist_m <= 500);
  if (gradeIIWithin500m.length === 0) return { triggered: false };
  const gradeBreakdown = {
    'II*': gradeIIWithin500m.filter(b => b.grade === 'II*').length,
    'II': gradeIIWithin500m.filter(b => b.grade === 'II').length
  };
  return {
    id: 'grade_ii_or_ii_star_within_500m',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'Grade II/II* Within 500m',
    findings: `${gradeIIWithin500m.length} Grade II or II* listed building(s) within 500m of development site`,
    gradeBreakdown,
    recommendations: [
      'Grade II/II* asset within 500m. This presents a planning risk. Care will need to be taken to avoid adverse impact on the setting of the listed building/s.',
      'Heritage Impact Assessment essential',
      'Specialist heritage consultant input required at an early stage'
    ],
    buildings: gradeIIWithin500m
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
    recommendations: [
      'A Heritage Statement or Heritage Impact Assessment will be required',
      'Specialist heritage consultant input required at an early stage',
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
    checkGradeIIWithin500m,
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
