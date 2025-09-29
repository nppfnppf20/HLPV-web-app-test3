import { RISK_LEVELS } from '../riskLevels.js';

/** @param {any[]} ramsarSites */
export function checkRamsarOnSite(ramsarSites) {
  const onSite = (ramsarSites || []).filter(r => r.on_site);
  if (onSite.length === 0) return { triggered: false };
  return {
    id: 'ramsar_on_site',
    triggered: true,
    level: RISK_LEVELS.SHOWSTOPPER,
    rule: 'Ramsar Site On-Site',
    findings: `${onSite.length} Ramsar site${onSite.length > 1 ? 's' : ''} intersecting site`,
    recommendations: [
      'Development within Ramsar sites is extremely unlikely to be acceptable',
      'Immediate consultation with Natural England required',
      'Alternative site locations should be considered'
    ],
    areas: onSite
  };
}

/** @param {any[]} ramsarSites */
export function checkRamsarWithin50m(ramsarSites) {
  const sites = (ramsarSites || []).filter(r => !r.on_site && r.within_50m);
  if (sites.length === 0) return { triggered: false };
  return {
    id: 'ramsar_within_50m',
    triggered: true,
    level: RISK_LEVELS.EXTREMELY_HIGH_RISK,
    rule: 'Ramsar Site Within 50m',
    findings: `${sites.length} Ramsar site${sites.length > 1 ? 's' : ''} within 50m of site`,
    recommendations: [
      'Likely effects on the Ramsar site must be assessed',
    ],
    areas: sites
  };
}

/** @param {any[]} ramsarSites */
export function checkRamsarWithin100m(ramsarSites) {
  const sites = (ramsarSites || []).filter(r => !r.on_site && !r.within_50m && r.within_100m);
  if (sites.length === 0) return { triggered: false };
  return {
    id: 'ramsar_within_100m',
    triggered: true,
    level: RISK_LEVELS.EXTREMELY_HIGH_RISK,
    rule: 'Ramsar Site Within 100m',
    findings: `${sites.length} Ramsar site${sites.length > 1 ? 's' : ''} within 100m of site`,
    recommendations: [
      'Likely effects on the Ramsar site must be assessed',
    ],
    areas: sites
  };
}

/** @param {any[]} ramsarSites */
export function checkRamsarWithin250m(ramsarSites) {
  const sites = (ramsarSites || []).filter(r => !r.on_site && !r.within_100m && r.within_250m);
  if (sites.length === 0) return { triggered: false };
  return {
    id: 'ramsar_within_250m',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'Ramsar Site Within 250m',
    findings: `${sites.length} Ramsar site${sites.length > 1 ? 's' : ''} within 250m of site`,
    recommendations: [
      'Likely effects on the Ramsar site must be assessed',
    ],
    areas: sites
  };
}

/** @param {any[]} ramsarSites */
export function checkRamsarWithin500m(ramsarSites) {
  const sites = (ramsarSites || []).filter(r => !r.on_site && !r.within_250m && r.within_500m);
  if (sites.length === 0) return { triggered: false };
  return {
    id: 'ramsar_within_500m',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_HIGH_RISK,
    rule: 'Ramsar Site Within 500m',
    findings: `${sites.length} Ramsar site${sites.length > 1 ? 's' : ''} within 500m of site`,
    recommendations: [
      'Likely effects on the Ramsar site must be assessed',
      'Appropriate buffer zones and mitigation measures may be required'
    ],
    areas: sites
  };
}

/** @param {any[]} ramsarSites */
export function checkRamsarWithin1km(ramsarSites) {
  const sites = (ramsarSites || []).filter(r => !r.on_site && !r.within_500m && r.within_1km);
  if (sites.length === 0) return { triggered: false };
  return {
    id: 'ramsar_within_1km',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_RISK,
    rule: 'Ramsar Site Within 1km',
    findings: `${sites.length} Ramsar site${sites.length > 1 ? 's' : ''} within 1km of site`,
    recommendations: [
      'Likely effects on the Ramsar site must be assessed',
      'Appropriate buffer zones and mitigation measures may be required'
    ],
    areas: sites
  };
}

/** @param {any[]} ramsarSites */
export function checkRamsarWithin3km(ramsarSites) {
  const sites = (ramsarSites || []).filter(r => !r.on_site && !r.within_1km && r.within_3km);
  if (sites.length === 0) return { triggered: false };
  return {
    id: 'ramsar_within_3km',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_LOW_RISK,
    rule: 'Ramsar Site Within 3km',
    findings: `${sites.length} Ramsar site${sites.length > 1 ? 's' : ''} within 3km of site`,
    recommendations: [
      'Ramsar site within 3km - effects of development may need to be assessed',
    ],
    areas: sites
  };
}

/** @param {any[]} ramsarSites */
export function checkRamsarWithin5km(ramsarSites) {
  const sites = (ramsarSites || []).filter(r => !r.on_site && !r.within_3km && r.within_5km);
  if (sites.length === 0) return { triggered: false };
  return {
    id: 'ramsar_within_5km',
    triggered: true,
    level: RISK_LEVELS.LOW_RISK,
    rule: 'Ramsar Site Within 5km',
    findings: `${sites.length} Ramsar site${sites.length > 1 ? 's' : ''} within 5km of site`,
    recommendations: [
    ],
    areas: sites
  };
}

/** @param {{ ramsar?: any[] }} analysisData */
export function processRamsarRules(analysisData) {
  const ramsar = analysisData?.ramsar || [];
  const triggeredRules = [];
  const pipeline = [
    checkRamsarOnSite,
    checkRamsarWithin50m,
    checkRamsarWithin100m,
    checkRamsarWithin250m,
    checkRamsarWithin500m,
    checkRamsarWithin1km,
    checkRamsarWithin3km,
    checkRamsarWithin5km
  ];

  for (const rule of pipeline) {
    const result = rule(ramsar);
    if (result.triggered) triggeredRules.push(result);
  }

  return {
    rules: triggeredRules,
    ramsar
  };
}