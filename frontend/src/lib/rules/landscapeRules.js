import { RISK_SCORES } from './riskLevels.js';

/**
 * LANDSCAPE RULES
 *
 * Assesses landscape constraints including:
 * - Areas of Outstanding Natural Beauty (AONB)
 * - Green Belt

/**
 * RULE: AONB Proximity Assessment
 * 
 * PURPOSE: Assess impact on Areas of Outstanding Natural Beauty
 * TRIGGER: AONB intersecting site or within proximity
 * RATIONALE: AONBs have statutory protection; development must conserve and enhance natural beauty
 * 
 * Risk Levels:
 * - On-site (intersects): EXTREMELY_HIGH (6)
 * - Within 50m: MEDIUM_HIGH (4)
 * - Within 100m: MEDIUM_HIGH (4)
 * - Within 250m: MEDIUM (3)
 * - Within 500m: MEDIUM (3)
 * - Within 1km: MEDIUM_LOW (2)
 * - Within 3km: LOW (1)
 * - Within 5km: LOW (1)
 */
/** @param {{ buffers?: any[], nearest_within_1km?: { name?: string, distance_m?: number, direction?: string } }} aonbData */
export function checkAONBConstraints(aonbData) {
  const buffers = aonbData?.buffers || [];
  const nearest = aonbData?.nearest_within_1km;
  
  // Define distance thresholds and their risk levels
  const distanceRisks = [
    { distance: 0, level: RISK_SCORES.EXTREMELY_HIGH, rule: 'AONB On-Site' },
    { distance: 20, level: RISK_SCORES.MEDIUM_HIGH, rule: 'AONB Within 50m' },
    { distance: 100, level: RISK_SCORES.MEDIUM_HIGH, rule: 'AONB Within 100m' },
    { distance: 250, level: RISK_SCORES.MEDIUM, rule: 'AONB Within 250m' },
    { distance: 500, level: RISK_SCORES.MEDIUM, rule: 'AONB Within 500m' },
    { distance: 1000, level: RISK_SCORES.MEDIUM_LOW, rule: 'AONB Within 1km' },
    { distance: 3000, level: RISK_SCORES.LOW, rule: 'AONB Within 3km' },
    { distance: 5000, level: RISK_SCORES.LOW, rule: 'AONB Within 5km' }
  ];
  
  // Check buffers in order of highest risk first
  for (const risk of distanceRisks) {
    const buffer = buffers.find(b => b.distance_m === risk.distance && b.feature_count > 0);
    if (buffer) {
      return {
        triggered: true,
        level: risk.level,
        rule: risk.rule,
        findings: risk.distance === 0 
          ? `Development site intersects with AONB: ${buffer.name}`
          : `AONB within ${risk.distance}m: ${buffer.name}`,
        impact: risk.distance === 0
          ? 'Development within AONB must conserve and enhance natural beauty'
          : 'Development may affect the setting and views to/from AONB',
        requirements: risk.distance === 0 ? [
          'Landscape and Visual Impact Assessment (LVIA) required',
          'Demonstrate development conserves and enhances natural beauty',
          'Early consultation with Natural England and Local Planning Authority',
          'Consider alternative locations outside AONB',
          'Exceptional circumstances may be required for major development'
        ] : [
          'Landscape and Visual Impact Assessment recommended',
          'Assess visual impact from AONB viewpoints',
          'Design should minimize impact on AONB setting',
          'Consider landscaping and screening measures'
        ],
        aonbName: buffer.name
      };
    }
  }
  
  return { triggered: false };
}

/**
 * RULE: Green Belt On-Site
 * 
 * PURPOSE: Assess Green Belt constraints
 * TRIGGER: Green Belt intersecting site
 * RATIONALE: Green Belt policy aims to prevent urban sprawl and maintain openness
 * 
 * Risk Level:
 * - On-site (intersects): MEDIUM_HIGH (4)
 * - All other distances: NO_RISK (0)
 */
/** @param {any[]} greenBeltData */
export function checkGreenBeltConstraints(greenBeltData) {
  const onSite = (greenBeltData || []).filter(g => g.on_site);
  
  if (onSite.length > 0) {
    return {
      triggered: true,
      level: RISK_SCORES.MEDIUM_HIGH,
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
 * Run landscape rules and return triggered ones
 * @param {{ aonb?: any, greenBelt?: any[] }} landscapeData
 */
export function processLandscapeRules(landscapeData) {
  const aonb = landscapeData?.aonb;
  const greenBelt = landscapeData?.greenBelt;
  const triggered = [];

  // AONB rules
  if (aonb) {
    const aonbRule = checkAONBConstraints(aonb);
    if (aonbRule.triggered) triggered.push(aonbRule);
  }

  // Green Belt rules
  if (greenBelt) {
    const greenBeltRule = checkGreenBeltConstraints(greenBelt);
    if (greenBeltRule.triggered) triggered.push(greenBeltRule);
  }
  
  // Determine overall landscape risk: highest triggered rule level
  const overallRisk = triggered.length > 0 
    ? Math.max(...triggered.map(r => r.level).filter(level => level !== undefined))
    : RISK_SCORES.NO_RISK;

  return { rules: triggered, overallRisk };
}
