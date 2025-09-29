import { processGreenBeltRules } from './greenBeltRulesRich.js';
import { processAONBRules } from './aonbRulesRich.js';
import { RISK_LEVELS } from '../riskLevels.js';

// Landscape discipline-wide default recommendations
const DEFAULT_LANDSCAPE_TRIGGERED_RECOMMENDATIONS = [
  'Landscape and visual impact assessment will be required to assess effects on landscape character',
  'Consider cumulative landscape effects with any other developments in the area',
  'Early input from landscape specialists will be required.'
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

  let rules = [...gb.rules, ...ab.rules].map(r => ({ ...r }));

  // SHOWSTOPPER LOGIC: If any rule is a showstopper, only show showstopper rules
  const showstopperRules = rules.filter(r => r.level === RISK_LEVELS.SHOWSTOPPER);
  if (showstopperRules.length > 0) {
    rules = showstopperRules;
  }

  // overallRisk picks highest severity by order in arrays (rules are added from highest to lowest per layer)
  const overallRisk = rules.length > 0 ? rules[0].level : RISK_LEVELS.LOW_RISK;

  // Discipline-wide recommendations based on whether ANY landscape rules triggered
  const hasTriggeredRules = rules.length > 0;
  
  // SHOWSTOPPER OVERRIDE: If showstoppers are present, don't show default triggered recommendations
  const isShowstopperOnly = showstopperRules.length > 0;

  return {
    rules,
    overallRisk,
    green_belt: gb.green_belt,
    aonb: ab.aonb,
    defaultTriggeredRecommendations: (hasTriggeredRules && !isShowstopperOnly) ? DEFAULT_LANDSCAPE_TRIGGERED_RECOMMENDATIONS : [],
    defaultNoRulesRecommendations: hasTriggeredRules ? [] : DEFAULT_LANDSCAPE_NO_RULES_RECOMMENDATIONS
  };
}


