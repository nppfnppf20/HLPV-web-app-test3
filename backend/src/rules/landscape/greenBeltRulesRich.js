import { RISK_LEVELS } from '../riskLevels.js';

/** @param {any[]} greenBeltAreas */
export function checkGreenBeltOnSite(greenBeltAreas) {
  const onSiteAreas = (greenBeltAreas || []).filter(a => a.on_site);
  if (onSiteAreas.length === 0) return { triggered: false };
  return {
    id: 'green_belt_on_site',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_HIGH_RISK,
    rule: 'Green Belt On-Site',
    findings: `Development site intersects with ${onSiteAreas.length} Green Belt area${onSiteAreas.length > 1 ? 's' : ''}`,
    recommendations: [
      'Very special circumstances must be demonstrated',
      'Green Belt assessment required to prove compliance with policy',
      'Alternative sites outside Green Belt must be explored and discounted',
      'Detailed justification for Green Belt development required',
      'Landscape and visual impact assessment mandatory',
      'Assessment of harm to Green Belt openness and purposes'
    ],
    areas: onSiteAreas
  };
}

/** @param {any[]} greenBeltAreas */
export function checkGreenBeltWithin1km(greenBeltAreas) {
  const nearbyAreas = (greenBeltAreas || []).filter(a => !a.on_site && a.within_1km);
  if (nearbyAreas.length === 0) return { triggered: false };
  return {
    id: 'green_belt_within_1km',
    triggered: true,
    level: RISK_LEVELS.LOW_RISK,
    rule: 'Green Belt Within 1km',
    findings: `${nearbyAreas.length} Green Belt area${nearbyAreas.length > 1 ? 's' : ''} within 1km of development site`,
    recommendations: [
      'Green Belt setting assessment recommended',
      'Visual impact assessment from Green Belt boundary',
      'Design to minimize impact on Green Belt openness',
      'Landscape mitigation measures to screen development'
    ],
    areas: nearbyAreas
  };
}

/** @param {{ green_belt?: any[] }} analysisData */
export function processGreenBeltRules(analysisData) {
  const greenBelt = analysisData?.green_belt || [];
  const triggeredRules = [];
  for (const rule of [checkGreenBeltOnSite, checkGreenBeltWithin1km]) {
    const result = rule(greenBelt);
    if (result.triggered) triggeredRules.push(result);
  }
  return {
    rules: triggeredRules,
    green_belt: greenBelt
  };
}


