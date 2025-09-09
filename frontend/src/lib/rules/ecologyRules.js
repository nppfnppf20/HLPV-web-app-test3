import { RISK_LEVELS } from './heritageRules.js';

/**
 * ECOLOGY RULES
 *
 * For now, includes Green Belt rule:
 * - If any Green Belt area is on-site (intersects), set MEDIUM_HIGH_RISK
 */

/** @param {any[]} greenBelt */
export function checkGreenBeltOnSite(greenBelt) {
  const onSite = (greenBelt || []).filter(g => g.on_site);
  if (onSite.length > 0) {
    return {
      triggered: true,
      level: RISK_LEVELS.MEDIUM_HIGH_RISK,
      rule: 'Green Belt On-Site',
      findings: `${onSite.length} Green Belt area(s) intersect the development site`,
      impact: 'Development within Green Belt is constrained; policy tests will apply',
      requirements: [
        'Demonstrate very special circumstances or comply with NPPF Green Belt policy',
        'Assess harm to openness and purposes of the Green Belt',
        'Early engagement with local planning authority recommended'
      ],
      areas: onSite
    };
  }
  return { triggered: false };
}

/**
 * Run ecology rules and return triggered ones
 * @param {{ green_belt?: any[] }} ecologyData
 */
export function processEcologyRules(ecologyData) {
  const greenBelt = ecologyData?.green_belt || [];
  const triggered = [];

  const rules = [checkGreenBeltOnSite];
  for (const rule of rules) {
    const res = rule(greenBelt);
    if (res.triggered) triggered.push(res);
  }

  // Determine overall ecology risk: highest triggered rule level or null
  const overallRisk = triggered.length > 0 ? triggered[0].level : null;

  return { rules: triggered, overallRisk };
}



