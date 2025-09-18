import { processOSPriorityPondsRules } from './OSPriorityPondsRulesRich.js';
import { processRamsarRules } from './RamsarRulesRich.js';
import { RISK_LEVELS } from '../riskLevels.js';

/**
 * Aggregate ecology rules across layers
 * @param {{ os_priority_ponds?: any[], ramsar?: any[] }} analysisData
 */
export function processEcologyRules(analysisData) {
  const ponds = processOSPriorityPondsRules(analysisData);
  const ramsar = processRamsarRules(analysisData);

  const rules = [...ponds.rules, ...ramsar.rules].map(r => ({ ...r }));

  // Overall risk picks highest severity by order in arrays
  const overallRisk = rules.length > 0 ? rules[0].level : RISK_LEVELS.LOW_RISK;

  return {
    rules,
    overallRisk,
    os_priority_ponds: ponds.os_priority_ponds,
    ramsar: ramsar.ramsar,
    defaultTriggeredRecommendations: [...ponds.defaultTriggeredRecommendations, ...ramsar.defaultTriggeredRecommendations],
    defaultNoRulesRecommendations: [...ponds.defaultNoRulesRecommendations, ...ramsar.defaultNoRulesRecommendations]
  };
}
