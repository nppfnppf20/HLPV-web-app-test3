import { processListedBuildingsRules } from './listedBuildingsRulesRich.js';
import { processConservationAreasRules } from './conservationAreasRulesRich.js';
import { processScheduledMonumentsRules } from './ScheduledMonumentsRulesRich.js';
import { RISK_LEVELS } from '../riskLevels.js';

// Heritage discipline-wide default recommendations
const DEFAULT_HERITAGE_TRIGGERED_RECOMMENDATIONS = [

  'Early engagement with a heritage specialist is recommended',
  'Consider any cumulative heritage effects and setting of nearby heritage assets',
  'Archaeological work, including Geophysical Surveys or trial trenching may be required following further assessment'
];

const DEFAULT_HERITAGE_NO_RULES_RECOMMENDATIONS = [
  'No significant heritage designations identified within assessment area following intial high-level review',
  'Early engagement with a heritage specialist is recommended',
  'Consider potential for undesignated heritage assets and archaeological remains',
  'Archaeological work, including Geophysical Surveys or trial trenching may be required following further assessment',
 
];

/**
 * Aggregate heritage rules across listed buildings, conservation areas, and scheduled monuments
 * @param {any} analysisData
 */
export function processHeritageRules(analysisData) {
  const lb = processListedBuildingsRules(analysisData);
  const ca = processConservationAreasRules(analysisData);
  const sm = processScheduledMonumentsRules(analysisData);

  let rules = [...lb.rules, ...ca.rules, ...sm.rules].map(r => ({ ...r }));

  // SHOWSTOPPER LOGIC: If any rule is a showstopper, only show showstopper rules
  const showstopperRules = rules.filter(r => r.level === RISK_LEVELS.SHOWSTOPPER);
  if (showstopperRules.length > 0) {
    rules = showstopperRules;
  }

  // overallRisk picks highest severity by order in arrays (rules are added from highest to lowest per layer)
  const overallRisk = rules.length > 0 ? rules[0].level : RISK_LEVELS.LOW_RISK;

  // Discipline-wide recommendations based on whether ANY heritage rules triggered
  const hasTriggeredRules = rules.length > 0;
  
  // SHOWSTOPPER OVERRIDE: If showstoppers are present, don't show default triggered recommendations
  const isShowstopperOnly = showstopperRules.length > 0;

  return {
    rules,
    overallRisk,
    buildings: lb.buildings,
    conservationAreas: ca.conservationAreas,
    scheduledMonuments: sm.scheduled_monuments,
    defaultTriggeredRecommendations: (hasTriggeredRules && !isShowstopperOnly) ? DEFAULT_HERITAGE_TRIGGERED_RECOMMENDATIONS : [],
    defaultNoRulesRecommendations: hasTriggeredRules ? [] : DEFAULT_HERITAGE_NO_RULES_RECOMMENDATIONS
  };
}
