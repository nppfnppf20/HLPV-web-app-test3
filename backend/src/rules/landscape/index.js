import { processGreenBeltRules } from './greenBeltRulesRich.js';
import { processAONBRules } from './aonbRulesRich.js';
import { RISK_LEVELS } from '../riskLevels.js';

/**
 * Aggregate landscape rules across layers
 * @param {{ green_belt?: any[], aonb?: any[] }} analysisData
 */
export function processLandscapeRules(analysisData) {
  const gb = processGreenBeltRules(analysisData);
  const ab = processAONBRules(analysisData);

  const rules = [...gb.rules, ...ab.rules].map(r => ({ ...r }));

  // overallRisk picks highest severity by order in arrays (rules are added from highest to lowest per layer)
  const overallRisk = rules.length > 0 ? rules[0].level : RISK_LEVELS.LOW_RISK;

  return {
    rules,
    overallRisk,
    green_belt: gb.green_belt,
    aonb: ab.aonb
  };
}


