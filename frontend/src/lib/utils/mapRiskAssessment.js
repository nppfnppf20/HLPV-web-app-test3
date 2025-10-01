// Risk assessment utilities for map visualization
// These functions extract just the risk level logic from the backend rules
// to avoid the full rule processing overhead for map display

import { RISK_LEVELS } from './riskLevels.js';

/**
 * Determine risk level for a listed building based on its properties
 * Mirrors the logic from backend/src/rules/heritage/listedBuildingsRulesRich.js
 * @param {any} building
 */
export function getBuildingRiskLevel(building) {
  // Grade I on site = SHOWSTOPPER
  if (building.on_site && building.grade === 'I') {
    return RISK_LEVELS.SHOWSTOPPER;
  }

  // Grade II/II* on site = HIGH_RISK
  if (building.on_site && (building.grade === 'II' || building.grade === 'II*')) {
    return RISK_LEVELS.HIGH_RISK;
  }

  // Grade I within 100m = HIGH_RISK
  if (!building.on_site && building.grade === 'I' && building.dist_m <= 100) {
    return RISK_LEVELS.HIGH_RISK;
  }

  // Grade I within 500m = HIGH_RISK
  if (!building.on_site && building.grade === 'I' && building.dist_m > 100 && building.dist_m <= 500) {
    return RISK_LEVELS.HIGH_RISK;
  }

  // Any grade within 100m = MEDIUM_HIGH_RISK
  if (!building.on_site && building.dist_m <= 100) {
    return RISK_LEVELS.MEDIUM_HIGH_RISK;
  }

  // Grade II/II* within 500m = HIGH_RISK
  if (!building.on_site && (building.grade === 'II' || building.grade === 'II*') && building.dist_m <= 500) {
    return RISK_LEVELS.HIGH_RISK;
  }

  return RISK_LEVELS.LOW_RISK;
}

/**
 * Determine risk level for a conservation area based on its properties
 * Mirrors the logic from backend/src/rules/heritage/conservationAreasRulesRich.js
 * @param {any} area
 */
export function getConservationAreaRiskLevel(area) {
  if (area.on_site) return RISK_LEVELS.EXTREMELY_HIGH_RISK;
  if (area.within_250m) return RISK_LEVELS.HIGH_RISK;
  if (area.within_1km) return RISK_LEVELS.MEDIUM_HIGH_RISK;
  return RISK_LEVELS.LOW_RISK;
}

/**
 * Determine risk level for scheduled monuments based on its properties
 * Mirrors the logic from backend/src/rules/heritage/ScheduledMonumentsRulesRich.js
 * @param {any} monument
 */
export function getScheduledMonumentRiskLevel(monument) {
  if (monument.on_site) return RISK_LEVELS.HIGH_RISK;
  if (monument.within_50m) return RISK_LEVELS.HIGH_RISK;
  if (monument.within_100m) return RISK_LEVELS.MEDIUM_HIGH_RISK;
  if (monument.within_250m) return RISK_LEVELS.MEDIUM_RISK;
  if (monument.within_500m) return RISK_LEVELS.MEDIUM_RISK;
  if (monument.within_1km) return RISK_LEVELS.MEDIUM_LOW_RISK;
  if (monument.within_3km) return RISK_LEVELS.MEDIUM_LOW_RISK;
  if (monument.within_5km) return RISK_LEVELS.LOW_RISK;
  return RISK_LEVELS.LOW_RISK;
}

/**
 * Determine risk level for Green Belt based on its properties
 * Mirrors the logic from backend/src/rules/landscape/greenBeltRulesRich.js
 * @param {any} greenBelt
 */
export function getGreenBeltRiskLevel(greenBelt) {
  if (greenBelt.on_site) return RISK_LEVELS.MEDIUM_HIGH_RISK;
  if (greenBelt.within_1km) return RISK_LEVELS.LOW_RISK;
  return RISK_LEVELS.LOW_RISK;
}

/**
 * Determine risk level for AONB based on its properties
 * Mirrors the logic from backend/src/rules/landscape/aonbRulesRich.js
 * @param {any} aonb
 */
export function getAONBRiskLevel(aonb) {
  if (aonb.on_site) return RISK_LEVELS.MEDIUM_HIGH_RISK;
  if (aonb.within_1km) return RISK_LEVELS.LOW_RISK;
  return RISK_LEVELS.LOW_RISK;
}

/**
 * Check if a feature should be visible based on current risk filters
 * @param {string} riskLevel
 * @param {Record<string, boolean>} riskFilters
 */
export function isRiskLevelVisible(riskLevel, riskFilters) {
  return riskFilters[riskLevel] === true;
}