import { processListedBuildingsRules } from './listedBuildingsRulesRich.js';
import { processConservationAreasRules } from './conservationAreasRulesRich.js';
import { processScheduledMonumentsRules } from './ScheduledMonumentsRulesRich.js';
import { RISK_LEVELS } from '../riskLevels.js';

// Heritage discipline-wide default recommendations
const DEFAULT_HERITAGE_TRIGGERED_RECOMMENDATIONS = [
  'Heritage impact assessment required to assess effects on historic assets',
  'Early engagement with conservation officers and Historic England recommended',
  'Consider cumulative heritage effects and setting of nearby heritage assets',
  'Archaeological assessment may be required depending on site sensitivity'
];

const DEFAULT_HERITAGE_NO_RULES_RECOMMENDATIONS = [
  'No significant heritage designations identified within assessment area',
  'Standard heritage due diligence protocols recommended',
  'Consider potential for undesignated heritage assets and archaeological remains'
];

/**
 * Aggregate heritage rules across listed buildings, conservation areas, and scheduled monuments
 * @param {any} analysisData
 */
export function processHeritageRules(analysisData) {
  const lb = processListedBuildingsRules(analysisData);
  const ca = processConservationAreasRules(analysisData);
  const sm = processScheduledMonumentsRules(analysisData);

  const rules = [...lb.rules, ...ca.rules, ...sm.rules].map(r => ({ ...r }));

  // overallRisk picks highest severity by order in arrays (rules are added from highest to lowest per layer)
  const overallRisk = rules.length > 0 ? rules[0].level : RISK_LEVELS.LOW_RISK;

  // Discipline-wide recommendations based on whether ANY heritage rules triggered
  const hasTriggeredRules = rules.length > 0;

  return {
    rules,
    overallRisk,
    buildings: lb.buildings,
    conservationAreas: ca.conservationAreas,
    scheduledMonuments: sm.scheduled_monuments,
    defaultTriggeredRecommendations: hasTriggeredRules ? DEFAULT_HERITAGE_TRIGGERED_RECOMMENDATIONS : [],
    defaultNoRulesRecommendations: hasTriggeredRules ? [] : DEFAULT_HERITAGE_NO_RULES_RECOMMENDATIONS
  };
}
