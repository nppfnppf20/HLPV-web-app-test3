import { RISK_SCORES } from './riskLevels.js';

/**
 * HERITAGE IMPACT ASSESSMENT RULES
 * 
 * Distance-based risk scoring for heritage assets:
 * - Grade I Listed Buildings: 7 (on-site) down to 3 (5km)
 * - Grade II* Listed Buildings: 6 (on-site) down to 3 (5km) 
 * - Grade II Listed Buildings: 6 (on-site) down to 2 (500m+)
 * - Conservation Areas: 6 (on-site) down to 2 (1km+)
 */

/**
 * Grade I Listed Building Risk Assessment
 * On site: 7, 50m: 6, 100m: 6, 250m: 6, 500m: 6, 1km: 5, 3km: 3, 5km: 3
 */
function assessGradeIRisk(buildings) {
  const gradeIBuildings = buildings.filter(b => b.grade === 'I');
  if (gradeIBuildings.length === 0) return { triggered: false };

  const distanceRisks = [
    { maxDistance: 0, level: 7, rule: 'Grade I On-Site' },
    { maxDistance: 50, level: 6, rule: 'Grade I Within 50m' },
    { maxDistance: 100, level: 6, rule: 'Grade I Within 100m' },
    { maxDistance: 250, level: 6, rule: 'Grade I Within 250m' },
    { maxDistance: 500, level: 6, rule: 'Grade I Within 500m' },
    { maxDistance: 1000, level: 5, rule: 'Grade I Within 1km' },
    { maxDistance: 3000, level: 3, rule: 'Grade I Within 3km' },
    { maxDistance: 5000, level: 3, rule: 'Grade I Within 5km' }
  ];

  // Find highest risk (closest building)
  for (const risk of distanceRisks) {
    const matchingBuildings = risk.maxDistance === 0 
      ? gradeIBuildings.filter(b => b.on_site)
      : gradeIBuildings.filter(b => !b.on_site && b.dist_m <= risk.maxDistance);

    if (matchingBuildings.length > 0) {
      return {
        triggered: true,
        level: risk.level,
        rule: risk.rule,
        count: matchingBuildings.length,
        buildings: matchingBuildings
      };
    }
  }

  return { triggered: false };
}

/**
 * Grade II* Listed Building Risk Assessment  
 * On site: 6, 50m: 6, 100m: 6, 250m: 5, 500m: 5, 1km: 4, 3km: 3, 5km: 3
 */
function assessGradeIIStarRisk(buildings) {
  const gradeIIStarBuildings = buildings.filter(b => b.grade === 'II*');
  if (gradeIIStarBuildings.length === 0) return { triggered: false };

  const distanceRisks = [
    { maxDistance: 0, level: 6, rule: 'Grade II* On-Site' },
    { maxDistance: 50, level: 6, rule: 'Grade II* Within 50m' },
    { maxDistance: 100, level: 6, rule: 'Grade II* Within 100m' },
    { maxDistance: 250, level: 5, rule: 'Grade II* Within 250m' },
    { maxDistance: 500, level: 5, rule: 'Grade II* Within 500m' },
    { maxDistance: 1000, level: 4, rule: 'Grade II* Within 1km' },
    { maxDistance: 3000, level: 3, rule: 'Grade II* Within 3km' },
    { maxDistance: 5000, level: 3, rule: 'Grade II* Within 5km' }
  ];

  // Find highest risk (closest building)
  for (const risk of distanceRisks) {
    const matchingBuildings = risk.maxDistance === 0 
      ? gradeIIStarBuildings.filter(b => b.on_site)
      : gradeIIStarBuildings.filter(b => !b.on_site && b.dist_m <= risk.maxDistance);

    if (matchingBuildings.length > 0) {
      return {
        triggered: true,
        level: risk.level,
        rule: risk.rule,
        count: matchingBuildings.length,
        buildings: matchingBuildings
      };
    }
  }

  return { triggered: false };
}

/**
 * Grade II Listed Building Risk Assessment
 * On site: 6, 50m: 4, 100m: 4, 250m: 3, 500m: 2, 1km: 2, 3km: 2, 5km: 2
 */
function assessGradeIIRisk(buildings) {
  const gradeIIBuildings = buildings.filter(b => b.grade === 'II');
  if (gradeIIBuildings.length === 0) return { triggered: false };

  const distanceRisks = [
    { maxDistance: 0, level: 6, rule: 'Grade II On-Site' },
    { maxDistance: 50, level: 4, rule: 'Grade II Within 50m' },
    { maxDistance: 100, level: 4, rule: 'Grade II Within 100m' },
    { maxDistance: 250, level: 3, rule: 'Grade II Within 250m' },
    { maxDistance: 500, level: 2, rule: 'Grade II Within 500m' },
    { maxDistance: 1000, level: 2, rule: 'Grade II Within 1km' },
    { maxDistance: 3000, level: 2, rule: 'Grade II Within 3km' },
    { maxDistance: 5000, level: 2, rule: 'Grade II Within 5km' }
  ];

  // Find highest risk (closest building)
  for (const risk of distanceRisks) {
    const matchingBuildings = risk.maxDistance === 0 
      ? gradeIIBuildings.filter(b => b.on_site)
      : gradeIIBuildings.filter(b => !b.on_site && b.dist_m <= risk.maxDistance);

    if (matchingBuildings.length > 0) {
      return {
        triggered: true,
        level: risk.level,
        rule: risk.rule,
        count: matchingBuildings.length,
        buildings: matchingBuildings
      };
    }
  }

  return { triggered: false };
}

/**
 * Conservation Area Risk Assessment
 * On site: 6, 50m: 5, 100m: 5, 250m: 4, 500m: 4, 1km: 2, 3km: 2, 5km: 2
 */
function assessConservationAreaRisk(conservationAreas) {
  if (conservationAreas.length === 0) return { triggered: false };

  const distanceRisks = [
    { maxDistance: 0, level: 6, rule: 'Conservation Area On-Site' },
    { maxDistance: 50, level: 5, rule: 'Conservation Area Within 50m' },
    { maxDistance: 100, level: 5, rule: 'Conservation Area Within 100m' },
    { maxDistance: 250, level: 4, rule: 'Conservation Area Within 250m' },
    { maxDistance: 500, level: 4, rule: 'Conservation Area Within 500m' },
    { maxDistance: 1000, level: 2, rule: 'Conservation Area Within 1km' },
    { maxDistance: 3000, level: 2, rule: 'Conservation Area Within 3km' },
    { maxDistance: 5000, level: 2, rule: 'Conservation Area Within 5km' }
  ];

  // Find highest risk (closest conservation area)
  for (const risk of distanceRisks) {
    const matchingAreas = risk.maxDistance === 0 
      ? conservationAreas.filter(a => a.on_site)
      : conservationAreas.filter(a => !a.on_site && a.dist_m <= risk.maxDistance);

    if (matchingAreas.length > 0) {
      return {
        triggered: true,
        level: risk.level,
        rule: risk.rule,
        count: matchingAreas.length,
        areas: matchingAreas
      };
    }
  }

  return { triggered: false };
}

/**
 * HERITAGE RULES PROCESSOR
 * 
 * Runs all heritage rules and returns the highest risk triggered
 */
export function processHeritageRules(analysisData) {
  const buildings = analysisData?.listed_buildings || [];
  const conservationAreas = analysisData?.conservation_areas || [];
  
  const triggeredRules = [];
  
  // Process all building grade rules
  const gradeIResult = assessGradeIRisk(buildings);
  if (gradeIResult.triggered) triggeredRules.push(gradeIResult);

  const gradeIIStarResult = assessGradeIIStarRisk(buildings);
  if (gradeIIStarResult.triggered) triggeredRules.push(gradeIIStarResult);

  const gradeIIResult = assessGradeIIRisk(buildings);
  if (gradeIIResult.triggered) triggeredRules.push(gradeIIResult);

  // Process conservation area rules
  const conservationResult = assessConservationAreaRisk(conservationAreas);
  if (conservationResult.triggered) triggeredRules.push(conservationResult);
  
  // Overall heritage risk is the highest triggered rule
  const overallRisk = triggeredRules.length > 0 
    ? Math.max(...triggeredRules.map(r => r.level))
    : 0;
  
  return {
    rules: triggeredRules,
    overallRisk,
    buildings,
    conservationAreas
  };
}