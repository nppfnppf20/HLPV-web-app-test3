/**
 * HERITAGE IMPACT ASSESSMENT RULES
 * 
 * These rules determine risk levels and report content based on the presence 
 * and proximity of heritage assets to the development site.
 * 
 * Uses centralized 0-7 risk scoring system:
 * 7 = SHOWSTOPPER: Development likely not viable without major redesign
 * 6 = EXTREMELY_HIGH: Major constraints, extensive specialist input required
 * 5 = HIGH: Significant constraints, specialist assessment required
 * 4 = MEDIUM_HIGH: Moderate constraints, careful design required
 * 1 = LOW: Minimal constraints, standard mitigation measures
 * 0 = NO_RISK: No heritage constraints
 */

import { RISK_SCORES } from './riskLevels.js';

/**
 * RULE 1: Grade I Listed Building On-Site (SHOWSTOPPER)
 * 
 * PURPOSE: Identify if development directly affects Grade I listed structures
 * TRIGGER: Any Grade I listed building with on_site = true
 * RATIONALE: Grade I buildings are of exceptional interest, development on-site 
 *           would require exceptional justification and is rarely permitted
 * OUTCOME: Showstopper level - development likely not viable
 */
/** @param {any[]} buildings */
export function checkGradeIOnSite(buildings) {
  const gradeIOnSite = buildings.filter(b => b.on_site && b.grade === 'I');
  
  if (gradeIOnSite.length > 0) {
    return {
      triggered: true,
      level: RISK_SCORES.SHOWSTOPPER,
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
  
  return { triggered: false };
}

/**
 * RULE 2: Conservation Area On-Site (EXTREMELY HIGH RISK)
 * 
 * PURPOSE: Identify if development site intersects with a conservation area
 * TRIGGER: Any conservation area with on_site = true (intersecting)
 * RATIONALE: Development within conservation areas requires conservation area consent
 *           and must preserve or enhance the character and appearance of the area
 * OUTCOME: Extremely high risk - extensive constraints and specialist requirements
 */
/** @param {any[]} conservationAreas */
export function checkConservationAreaOnSite(conservationAreas) {
  const onSiteAreas = conservationAreas.filter(a => a.on_site);
  
  if (onSiteAreas.length > 0) {
    return {
      triggered: true,
      level: RISK_SCORES.EXTREMELY_HIGH,
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
  
  return { triggered: false };
}

/**
 * RULE 3: Grade I Listed Building Within 100m (HIGH RISK)
 * 
 * PURPOSE: Assess impact on setting of Grade I buildings in immediate vicinity
 * TRIGGER: Any Grade I listed building within 100m of site boundary
 * RATIONALE: Grade I buildings have extensive setting considerations, 
 *           100m represents immediate visual and physical context
 * OUTCOME: High risk - significant design constraints
 */
/** @param {any[]} buildings */
export function checkGradeIWithin100m(buildings) {
  const gradeIClose = buildings.filter(b => 
    !b.on_site && b.grade === 'I' && b.dist_m <= 100
  );
  
  if (gradeIClose.length > 0) {
    return {
      triggered: true,
      level: RISK_SCORES.HIGH,
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
  
  return { triggered: false };
}

/**
 * RULE 3: Grade I Listed Building Within 500m (HIGH RISK)
 * 
 * PURPOSE: Assess wider setting impact on Grade I buildings
 * TRIGGER: Any Grade I listed building within 500m of site boundary
 * RATIONALE: Grade I buildings may have extended setting considerations
 *           up to 500m depending on topography and significance
 * OUTCOME: High risk - detailed setting assessment required
 */
/** @param {any[]} buildings */
export function checkGradeIWithin500m(buildings) {
  const gradeIWider = buildings.filter(b => 
    !b.on_site && b.grade === 'I' && b.dist_m > 100 && b.dist_m <= 500
  );
  
  if (gradeIWider.length > 0) {
    return {
      triggered: true,
      level: RISK_SCORES.HIGH,
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
  
  return { triggered: false };
}

/**
 * RULE 4: Grade II or II* Listed Building On-Site (HIGH RISK)
 * 
 * PURPOSE: Identify if development directly affects Grade II or II* listed structures
 * TRIGGER: Any Grade II or II* listed building with on_site = true
 * RATIONALE: Grade II and II* buildings are of special interest, development on-site 
 *           requires careful assessment and often specialist heritage consultation
 * OUTCOME: High risk - significant design constraints and assessment required
 */
/** @param {any[]} buildings */
export function checkGradeIIOnSite(buildings) {
  const gradeIIOnSite = buildings.filter(b => 
    b.on_site && (b.grade === 'II' || b.grade === 'II*')
  );
  
  if (gradeIIOnSite.length > 0) {
    const gradeBreakdown = {
      'II*': gradeIIOnSite.filter(b => b.grade === 'II*').length,
      'II': gradeIIOnSite.filter(b => b.grade === 'II').length
    };
    
    return {
      triggered: true,
      level: RISK_SCORES.HIGH,
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
  
  return { triggered: false };
}

/**
 * RULE 5: Grade I, II* or II Listed Buildings Within 100m (MEDIUM-HIGH RISK)
 * 
 * PURPOSE: Assess impact on setting of all listed buildings in immediate vicinity
 * TRIGGER: Any listed building (any grade) within 100m of site boundary
 * RATIONALE: 100m represents the zone where development is most likely to 
 *           affect the immediate setting and context of listed buildings
 * OUTCOME: Medium-high risk - careful design and assessment required
 */
/** @param {any[]} buildings */
export function checkAnyGradeWithin100m(buildings) {
  const buildingsClose = buildings.filter(b => 
    !b.on_site && b.dist_m <= 100
  );
  
  if (buildingsClose.length > 0) {
    const gradeBreakdown = {
      'I': buildingsClose.filter(b => b.grade === 'I').length,
      'II*': buildingsClose.filter(b => b.grade === 'II*').length,
      'II': buildingsClose.filter(b => b.grade === 'II').length
    };
    
    return {
      triggered: true,
      level: RISK_SCORES.MEDIUM_HIGH,
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
  
  return { triggered: false };
}

/**
 * HERITAGE RULES PROCESSOR
 * 
 * Runs all heritage rules in priority order and returns triggered rules
 * Rules are processed in severity order to ensure highest risk is captured
 */
/** @param {any} analysisData */
export function processHeritageRules(analysisData) {
  const buildings = analysisData?.listed_buildings || [];
  const conservationAreas = analysisData?.conservation_areas || [];
  
  const triggeredRules = [];
  
  // Process rules in order of severity (most serious first)
  const rules = [
    checkGradeIOnSite,
    checkGradeIWithin100m, 
    checkGradeIWithin500m,
    checkGradeIIOnSite,
    checkAnyGradeWithin100m
  ];

  // Process conservation area rules
  const conservationRules = [
    checkConservationAreaOnSite
  ];
  
  // Process building rules
  for (const rule of rules) {
    const result = rule(buildings);
    if (result.triggered) {
      triggeredRules.push(result);
    }
  }

  // Process conservation area rules
  for (const rule of conservationRules) {
    const result = rule(conservationAreas);
    if (result.triggered) {
      triggeredRules.push(result);
    }
  }
  
  return {
    rules: triggeredRules,
    overallRisk: triggeredRules.length > 0 ? triggeredRules[0].level : RISK_SCORES.NO_RISK,
    buildings,
    conservationAreas
  };
}
