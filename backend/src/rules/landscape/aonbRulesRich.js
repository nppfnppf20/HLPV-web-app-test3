import { RISK_LEVELS } from '../riskLevels.js';

/** @param {any[]} aonbAreas */
export function checkAONBOnSite(aonbAreas) {
  const onSite = (aonbAreas || []).filter(a => a.on_site);
  if (onSite.length === 0) return { triggered: false };
  return {
    id: 'aonb_on_site',
    triggered: true,
    level: RISK_LEVELS.EXTREMELY_HIGH_RISK,
    rule: 'AONB On-Site',
    findings: `${onSite.length} AONB area${onSite.length > 1 ? 's' : ''} intersecting site`,
    recommendations: [
      'Major planning weight will be given to conserving and enhancing landscape and scenic beauty',
      'Early engagement with landscape specialists required',
      'Landscape and visual impact assessment required'
    ],
    areas: onSite
  };
}

/** @param {any[]} aonbAreas */
export function checkAONBWithin50m(aonbAreas) {
  const areas = (aonbAreas || []).filter(a => !a.on_site && a.within_50m);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'aonb_within_50m',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'AONB Within 50m',
    findings: `${areas.length} AONB area${areas.length > 1 ? 's' : ''} within 50m of site`,
    recommendations: [
      'Detailed LVIA with viewpoints adjacent to AONB',
      'Design to respect AONB character and avoid adverse effects'
    ],
    areas
  };
}

/** @param {any[]} aonbAreas */
export function checkAONBWithin100m(aonbAreas) {
  const areas = (aonbAreas || []).filter(a => !a.on_site && !a.within_50m && a.within_100m);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'aonb_within_100m',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'AONB Within 100m',
    findings: `${areas.length} AONB area${areas.length > 1 ? 's' : ''} within 100m of site`,
    recommendations: [
      'LVIA including intervisibility analysis',
      'Materials/scale to reduce visual prominence'
    ],
    areas
  };
}

/** @param {any[]} aonbAreas */
export function checkAONBWithin250m(aonbAreas) {
  const areas = (aonbAreas || []).filter(a => !a.on_site && !a.within_100m && a.within_250m);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'aonb_within_250m',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_HIGH_RISK,
    rule: 'AONB Within 250m',
    findings: `${areas.length} AONB area${areas.length > 1 ? 's' : ''} within 250m of site`,
    recommendations: [
      'Landscape strategy to avoid harm to setting',
      'Viewpoint verification from AONB edges'
    ],
    areas
  };
}

/** @param {any[]} aonbAreas */
export function checkAONBWithin500m(aonbAreas) {
  const areas = (aonbAreas || []).filter(a => !a.on_site && !a.within_250m && a.within_500m);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'aonb_within_500m',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_RISK,
    rule: 'AONB Within 500m',
    findings: `${areas.length} AONB area${areas.length > 1 ? 's' : ''} within 500m of site`,
    recommendations: [
      'Proportionate landscape assessment',
      'Design measures to reduce visibility'
    ],
    areas
  };
}

/** @param {any[]} aonbAreas */
export function checkAONBWithin1km(aonbAreas) {
  const areas = (aonbAreas || []).filter(a => !a.on_site && !a.within_500m && a.within_1km);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'aonb_within_1km',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_LOW_RISK,
    rule: 'AONB Within 1km',
    findings: `${areas.length} AONB area${areas.length > 1 ? 's' : ''} within 1km of site`,
    recommendations: [
      'Basic landscape context appraisal',
      'Consider mitigation planting where appropriate'
    ],
    areas
  };
}

/** @param {any[]} aonbAreas */
export function checkAONBWithin3km(aonbAreas) {
  const areas = (aonbAreas || []).filter(a => !a.on_site && !a.within_1km && a.within_3km);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'aonb_within_3km',
    triggered: true,
    level: RISK_LEVELS.LOW_RISK,
    rule: 'AONB Within 3km',
    findings: `${areas.length} AONB area${areas.length > 1 ? 's' : ''} within 3km of site`,
    recommendations: [
      'No specific landscape constraints expected'
    ],
    areas
  };
}

/** @param {any[]} aonbAreas */
export function checkAONBWithin5km(aonbAreas) {
  const areas = (aonbAreas || []).filter(a => !a.on_site && !a.within_3km && a.within_5km);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'aonb_within_5km',
    triggered: true,
    level: RISK_LEVELS.LOW_RISK,
    rule: 'AONB Within 5km',
    findings: `${areas.length} AONB area${areas.length > 1 ? 's' : ''} within 5km of site`,
    recommendations: [
      'No specific constraints expected due to distance'
    ],
    areas
  };
}

/** @param {{ aonb?: any[] }} analysisData */
export function processAONBRules(analysisData) {
  const aonb = analysisData?.aonb || [];
  const triggeredRules = [];
  const pipeline = [
    checkAONBOnSite,
    checkAONBWithin50m,
    checkAONBWithin100m,
    checkAONBWithin250m,
    checkAONBWithin500m,
    checkAONBWithin1km,
    checkAONBWithin3km,
    checkAONBWithin5km
  ];
  for (const rule of pipeline) {
    const result = rule(aonb);
    if (result.triggered) triggeredRules.push(result);
  }
  return {
    rules: triggeredRules,
    aonb
  };
}


