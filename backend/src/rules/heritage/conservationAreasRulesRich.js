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
    impact: 'Development within conservation area requires preservation or enhancement of character and appearance',
    requirements: [
      'Heritage Statement essential',
      'Specialist heritage consultant input required at an early stage',
      'Careful consideration of site layout required to minimise adverse impact on the Conservation Area'
    ],
    areas: onSiteAreas
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
    checkConservationAreaOnSite
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
