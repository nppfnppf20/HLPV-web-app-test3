import { processGreenBeltRules } from './greenBeltRulesRich.js';
import { processAONBRules } from './aonbRulesRich.js';
import { RISK_LEVELS } from '../riskLevels.js';

// Landscape discipline-wide default recommendations
const DEFAULT_LANDSCAPE_TRIGGERED_RECOMMENDATIONS = [
  'Landscape and visual impact assessment required to assess effects on landscape character',
  'Major weight will be given to conserving and enhancing landscape and scenic beauty',
  'Early engagement with landscape specialists and statutory consultees recommended',
  'Consider cumulative landscape effects with other developments in the area'
];

const DEFAULT_LANDSCAPE_NO_RULES_RECOMMENDATIONS = [
  'No significant landscape designations identified within assessment area',
  'Standard landscape and visual impact assessment protocols recommended',
  'Consider local landscape character and visual receptors in design development'
];

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

  // Discipline-wide recommendations based on whether ANY landscape rules triggered
  const hasTriggeredRules = rules.length > 0;

  return {
    rules,
    overallRisk,
    green_belt: gb.green_belt,
    aonb: ab.aonb,
    defaultTriggeredRecommendations: hasTriggeredRules ? DEFAULT_LANDSCAPE_TRIGGERED_RECOMMENDATIONS : [],
    defaultNoRulesRecommendations: hasTriggeredRules ? [] : DEFAULT_LANDSCAPE_NO_RULES_RECOMMENDATIONS
  };
}


