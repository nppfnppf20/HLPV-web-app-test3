import { processOSPriorityPondsRules } from './OSPriorityPondsRulesRich.js';
import { processRamsarRules } from './RamsarRulesRich.js';
import { RISK_LEVELS } from '../riskLevels.js';

// Ecology discipline-wide default recommendations
const DEFAULT_ECOLOGY_TRIGGERED_RECOMMENDATIONS = [
  'Comprehensive ecological survey required to assess all identified ecological features',
  'Consider cumulative effects of development on ecological connectivity',
  'Mitigation hierarchy must be followed: avoid, minimize, restore, and offset as last resort',
  'Early engagement with ecologists and statutory consultees recommended'
];

const DEFAULT_ECOLOGY_NO_RULES_RECOMMENDATIONS = [
  'No significant ecological designations identified within assessment area',
  'Standard ecological survey protocols recommended to identify any undesignated features',
  'Consider seasonal constraints and optimal survey timings for ecological assessments'
];

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

  // Discipline-wide recommendations based on whether ANY ecology rules triggered
  const hasTriggeredRules = rules.length > 0;

  return {
    rules,
    overallRisk,
    os_priority_ponds: ponds.os_priority_ponds,
    ramsar: ramsar.ramsar,
    defaultTriggeredRecommendations: hasTriggeredRules ? DEFAULT_ECOLOGY_TRIGGERED_RECOMMENDATIONS : [],
    defaultNoRulesRecommendations: hasTriggeredRules ? [] : DEFAULT_ECOLOGY_NO_RULES_RECOMMENDATIONS
  };
}
