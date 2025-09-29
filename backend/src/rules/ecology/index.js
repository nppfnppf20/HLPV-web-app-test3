import { processOSPriorityPondsRules } from './OSPriorityPondsRulesRich.js';
import { processRamsarRules } from './RamsarRulesRich.js';
import { processGCNRules } from './GCNRulesRich.js';
import { RISK_LEVELS } from '../riskLevels.js';

// Ecology discipline-wide default recommendations
const DEFAULT_ECOLOGY_TRIGGERED_RECOMMENDATIONS = [
  'Preliminary Ecological Appraisal will be required. This will guide requirement for further surveys and assessments.',
  'Consider cumulative effects of development on ecological connectivity.',
  'Mitigation hierarchy should be followed: avoid, minimise, restore, and offset as last resort',
  'Consider seasonal constraints and optimal survey timings for ecological assessments',
  'Early engagement with ecologists and statutory consultees recommended'
];

const DEFAULT_ECOLOGY_NO_RULES_RECOMMENDATIONS = [
  'No significant ecological designations identified within assessment area',
  'A Preliminary Ecological Appraisal will be required. This will guide requirement for further surveys and assessments',
  'Consider seasonal constraints and optimal survey timings for ecological assessments'
];

/**
 * Aggregate ecology rules across layers
 * @param {{ os_priority_ponds?: any[], ramsar?: any[], gcn?: any[] }} analysisData
 */
export function processEcologyRules(analysisData) {
  const ponds = processOSPriorityPondsRules(analysisData);
  const ramsar = processRamsarRules(analysisData);
  const gcn = processGCNRules(analysisData);

  let rules = [...ponds.rules, ...ramsar.rules, ...gcn.rules].map(r => ({ ...r }));

  // SHOWSTOPPER LOGIC: If any rule is a showstopper, only show showstopper rules
  const showstopperRules = rules.filter(r => r.level === RISK_LEVELS.SHOWSTOPPER);
  if (showstopperRules.length > 0) {
    rules = showstopperRules;
  }

  // Overall risk picks highest severity by order in arrays
  const overallRisk = rules.length > 0 ? rules[0].level : RISK_LEVELS.LOW_RISK;

  // Discipline-wide recommendations based on whether ANY ecology rules triggered
  const hasTriggeredRules = rules.length > 0;
  
  // SHOWSTOPPER OVERRIDE: If showstoppers are present, don't show default triggered recommendations
  const isShowstopperOnly = showstopperRules.length > 0;

  return {
    rules,
    overallRisk,
    os_priority_ponds: ponds.os_priority_ponds,
    ramsar: ramsar.ramsar,
    gcn: gcn.gcn,
    defaultTriggeredRecommendations: (hasTriggeredRules && !isShowstopperOnly) ? DEFAULT_ECOLOGY_TRIGGERED_RECOMMENDATIONS : [],
    defaultNoRulesRecommendations: hasTriggeredRules ? [] : DEFAULT_ECOLOGY_NO_RULES_RECOMMENDATIONS
  };
}
