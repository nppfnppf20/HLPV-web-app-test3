import { RISK_LEVELS } from '../riskLevels.js';

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
    recommendations: [
      'A Heritage Statement or Heritage Impact Assessment will be required.',
      'Specialist heritage consultant input required at an early stage.',
      'Consideration should be given to design, layout and mitigation in order to minimise adverse impact on the Conservation Area',
      'Development will be required to demonstrate that character and appearance of the Conservation Area will be preserved or enhanced'
    ],
    areas: onSiteAreas
  };
}

/** @param {any[]} conservationAreas */
export function checkConservationAreaWithin250m(conservationAreas) {
  const within250mAreas = (conservationAreas || []).filter(a => !a.on_site && a.within_250m);
  if (within250mAreas.length === 0) return { triggered: false };
  return {
    id: 'conservation_area_within_250m',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'Conservation Area Within 250m',
    findings: `${within250mAreas.length} conservation area${within250mAreas.length > 1 ? 's' : ''} within 250m of development site`,
    recommendations: [
      'A Heritage Statement or Heritage Impact Assessment will be required.',
      'Specialist heritage consultant input required at an early stage.',
      'Consideration should be given to design, layout and mitigation in order to minimise adverse impact on the Conservation Area',
      'Development will be required to demonstrate that character and appearance of the Conservation Area will be preserved or enhanced'
    ],
    areas: within250mAreas
  };
}

/** @param {any[]} conservationAreas */
export function checkConservationAreaWithin1km(conservationAreas) {
  const within1kmAreas = (conservationAreas || []).filter(a => !a.on_site && !a.within_250m && a.within_1km);
  if (within1kmAreas.length === 0) return { triggered: false };
  return {
    id: 'conservation_area_within_1km',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_HIGH_RISK,
    rule: 'Conservation Area Within 1km',
    findings: `${within1kmAreas.length} conservation area${within1kmAreas.length > 1 ? 's' : ''} within 1km of development site`,
    recommendations: [
    'A Heritage Statement or Heritage Impact Assessment will be required.',
      'Specialist heritage consultant input required at an early stage.',
      'Consideration should be given to design, layout and mitigation in order to minimise adverse impact on the Conservation Area',
      'Development may be required to demonstrate that character and appearance of the Conservation Area will be preserved or enhanced'
    ],
    areas: within1kmAreas
  };
}

/**
 * Process all conservation area rules and return triggered ones
 * @param {{ conservation_areas?: any[] }} analysisData
 */
export function processConservationAreasRules(analysisData) {
  const conservationAreas = analysisData?.conservation_areas || [];
  const triggeredRules = [];

  const conservationRules = [
    checkConservationAreaOnSite,
    checkConservationAreaWithin250m,
    checkConservationAreaWithin1km
  ];

  for (const rule of conservationRules) {
    const result = rule(conservationAreas);
    if (result.triggered) triggeredRules.push(result);
  }

  return {
    rules: triggeredRules,
    conservationAreas
  };
}
