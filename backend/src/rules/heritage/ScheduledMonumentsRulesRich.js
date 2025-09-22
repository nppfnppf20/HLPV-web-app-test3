import { RISK_LEVELS } from '../riskLevels.js';

/** @param {any[]} scheduledMonuments */
export function checkScheduledMonumentsOnSite(scheduledMonuments) {
  const onSite = (scheduledMonuments || []).filter(sm => sm.on_site);
  if (onSite.length === 0) return { triggered: false };
  return {
    id: 'scheduled_monuments_on_site',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'Scheduled Monuments On-Site',
    findings: `${onSite.length} Scheduled Monument${onSite.length > 1 ? 's' : ''} intersecting site`,
    recommendations: [
      'A Heritage Statement or Heritage Impact Assessment will be required.',
      'Specialist heritage consultant input required at an early stage.',
      'Scheduled monument on site.'
    ],
    areas: onSite
  };
}

/** @param {any[]} scheduledMonuments */
export function checkScheduledMonumentsWithin50m(scheduledMonuments) {
  const areas = (scheduledMonuments || []).filter(sm => !sm.on_site && sm.within_50m);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'scheduled_monuments_within_50m',
    triggered: true,
    level: RISK_LEVELS.HIGH_RISK,
    rule: 'Scheduled Monuments Within 50m',
    findings: `${areas.length} Scheduled Monument${areas.length > 1 ? 's' : ''} within 50m of site`,
    recommendations: [
      'A Heritage Statement or Heritage Impact Assessment will be required.',
      'Specialist heritage consultant input required at an early stage.',
      'Scheduled monument within 50m of site.'
    ],
    areas
  };
}

/** @param {any[]} scheduledMonuments */
export function checkScheduledMonumentsWithin100m(scheduledMonuments) {
  const areas = (scheduledMonuments || []).filter(sm => !sm.on_site && !sm.within_50m && sm.within_100m);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'scheduled_monuments_within_100m',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_HIGH_RISK,
    rule: 'Scheduled Monuments Within 100m',
    findings: `${areas.length} Scheduled Monument${areas.length > 1 ? 's' : ''} within 100m of site`,
    recommendations: [
     'A Heritage Statement or Heritage Impact Assessment will be required.',
      'Specialist heritage consultant input required at an early stage.',
      'Scheduled monument within 100m of site.'
    ],
    areas
  };
}

/** @param {any[]} scheduledMonuments */
export function checkScheduledMonumentsWithin250m(scheduledMonuments) {
  const areas = (scheduledMonuments || []).filter(sm => !sm.on_site && !sm.within_50m && !sm.within_100m && sm.within_250m);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'scheduled_monuments_within_250m',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_RISK,
    rule: 'Scheduled Monuments Within 250m',
    findings: `${areas.length} Scheduled Monument${areas.length > 1 ? 's' : ''} within 250m of site`,
    recommendations: [
      'A Heritage Statement or Heritage Impact Assessment will be required.',
      'Specialist heritage consultant input required at an early stage.',
      'Scheduled monument within 250m of site.'
    ],
    areas
  };
}

/** @param {any[]} scheduledMonuments */
export function checkScheduledMonumentsWithin500m(scheduledMonuments) {
  const areas = (scheduledMonuments || []).filter(sm => !sm.on_site && !sm.within_50m && !sm.within_100m && !sm.within_250m && sm.within_500m);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'scheduled_monuments_within_500m',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_RISK,
    rule: 'Scheduled Monuments Within 500m',
    findings: `${areas.length} Scheduled Monument${areas.length > 1 ? 's' : ''} within 500m of site`,
    recommendations: [
      'A Heritage Statement or Heritage Impact Assessment will be required.',
      'Specialist heritage consultant input required at an early stage.',
      'Scheduled monument within 500m of site.'
    ],
    areas
  };
}

/** @param {any[]} scheduledMonuments */
export function checkScheduledMonumentsWithin1km(scheduledMonuments) {
  const areas = (scheduledMonuments || []).filter(sm => !sm.on_site && !sm.within_50m && !sm.within_100m && !sm.within_250m && !sm.within_500m && sm.within_1km);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'scheduled_monuments_within_1km',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_LOW_RISK,
    rule: 'Scheduled Monuments Within 1km',
    findings: `${areas.length} Scheduled Monument${areas.length > 1 ? 's' : ''} within 1km of site`,
    recommendations: [
      'A Heritage Statement or Heritage Impact Assessment will be required.',
      'Specialist heritage consultant input required at an early stage.',
      'Scheduled monument within 1km of site.'
    ],
    areas
  };
}

/** @param {any[]} scheduledMonuments */
export function checkScheduledMonumentsWithin3km(scheduledMonuments) {
  const areas = (scheduledMonuments || []).filter(sm => !sm.on_site && !sm.within_50m && !sm.within_100m && !sm.within_250m && !sm.within_500m && !sm.within_1km && sm.within_3km);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'scheduled_monuments_within_3km',
    triggered: true,
    level: RISK_LEVELS.MEDIUM_LOW_RISK,
    rule: 'Scheduled Monuments Within 3km',
    findings: `${areas.length} Scheduled Monument${areas.length > 1 ? 's' : ''} within 3km of site`,
    recommendations: [
     
    ],
    areas
  };
}

/** @param {any[]} scheduledMonuments */
export function checkScheduledMonumentsWithin5km(scheduledMonuments) {
  const areas = (scheduledMonuments || []).filter(sm => !sm.on_site && !sm.within_50m && !sm.within_100m && !sm.within_250m && !sm.within_500m && !sm.within_1km && !sm.within_3km && sm.within_5km);
  if (areas.length === 0) return { triggered: false };
  return {
    id: 'scheduled_monuments_within_5km',
    triggered: true,
    level: RISK_LEVELS.LOW_RISK,
    rule: 'Scheduled Monuments Within 5km',
    findings: `${areas.length} Scheduled Monument${areas.length > 1 ? 's' : ''} within 5km of site`,
    recommendations: [
     
    ],
    areas
  };
}

/** @param {{ scheduled_monuments?: any[] }} analysisData */
export function processScheduledMonumentsRules(analysisData) {
  const scheduledMonuments = analysisData?.scheduled_monuments || [];
  const triggeredRules = [];
  const pipeline = [
    checkScheduledMonumentsOnSite,
    checkScheduledMonumentsWithin50m,
    checkScheduledMonumentsWithin100m,
    checkScheduledMonumentsWithin250m,
    checkScheduledMonumentsWithin500m,
    checkScheduledMonumentsWithin1km,
    checkScheduledMonumentsWithin3km,
    checkScheduledMonumentsWithin5km
  ];

  for (const rule of pipeline) {
    const result = rule(scheduledMonuments);
    if (result.triggered) triggeredRules.push(result);
  }

  return {
    rules: triggeredRules,
    scheduled_monuments: scheduledMonuments
  };
}