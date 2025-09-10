import { processListedBuildingsRules } from './listedBuildingsRulesRich.js';
import { processConservationAreasRules } from './conservationAreasRulesRich.js';
import { RISK_LEVELS } from '../riskLevels.js';

/**
 * Aggregate heritage rules across listed buildings and conservation areas
 * @param {any} analysisData
 */
export function processHeritageRules(analysisData) {
  const lb = processListedBuildingsRules(analysisData);
  const ca = processConservationAreasRules(analysisData);

  const rules = [...lb.rules, ...ca.rules].map(r => ({ ...r }));

  // overallRisk picks highest severity by order in arrays (rules are added from highest to lowest per layer)
  const overallRisk = rules.length > 0 ? rules[0].level : RISK_LEVELS.LOW_RISK;

  return {
    rules,
    overallRisk,
    buildings: lb.buildings,
    conservationAreas: ca.conservationAreas
  };
}
