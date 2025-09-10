/**
 * LANDSCAPE IMPACT ASSESSMENT RULES (Rich, UI-aligned)
 *
 * These rules assess landscape designations and their impact on development.
 * Risk levels are aligned with planning policy importance.
 */

export const RISK_LEVELS = {
  SHOWSTOPPER: 'showstopper',
  EXTREMELY_HIGH_RISK: 'extremely_high_risk',
  HIGH_RISK: 'high_risk',
  MEDIUM_HIGH_RISK: 'medium_high_risk',
  LOW_RISK: 'low_risk'
};

/**
 * RULE 1: Green Belt On-Site (MEDIUM-HIGH RISK)
 * 
 * PURPOSE: Identify if development site intersects with Green Belt
 * TRIGGER: Any Green Belt area with on_site = true (intersecting)
 * RATIONALE: Green Belt policy creates strong presumption against inappropriate development
 *           but is not an absolute constraint with very special circumstances
 * OUTCOME: Medium-high risk - significant policy constraints
 */
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
    impact: 'Development within Green Belt faces strong policy presumption against inappropriate development',
    requirements: [
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

/**
 * RULE 2: Green Belt Within 1km (LOW RISK)
 * 
 * PURPOSE: Assess impact on Green Belt setting and openness from nearby development
 * TRIGGER: Any Green Belt area within 1km of site boundary
 * RATIONALE: Development close to Green Belt may affect its openness and character
 *           but is not subject to Green Belt policy constraints
 * OUTCOME: Low risk - standard assessment and mitigation measures
 */
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
    impact: 'Development may affect Green Belt setting and visual openness',
    requirements: [
      'Green Belt setting assessment recommended',
      'Visual impact assessment from Green Belt boundary',
      'Design to minimize impact on Green Belt openness',
      'Landscape mitigation measures to screen development'
    ],
    areas: nearbyAreas
  };
}

/**
 * LANDSCAPE RULES PROCESSOR
 * 
 * Runs all landscape rules in priority order and returns triggered rules
 * Rules are processed in severity order to ensure highest risk is captured
 */
/** @param {any} analysisData */
export function processLandscapeRules(analysisData) {
  const greenBelt = analysisData?.green_belt || [];
  
  const triggeredRules = [];
  
  // Order: most serious first
  const greenBeltRules = [
    checkGreenBeltOnSite,
    checkGreenBeltWithin1km
  ];
  
  // Process Green Belt rules
  for (const rule of greenBeltRules) {
    const result = rule(greenBelt);
    if (result.triggered) {
      triggeredRules.push(result);
    }
  }
  
  return {
    rules: triggeredRules,
    overallRisk: triggeredRules.length > 0 ? triggeredRules[0].level : RISK_LEVELS.LOW_RISK,
    green_belt: greenBelt
  };
}
