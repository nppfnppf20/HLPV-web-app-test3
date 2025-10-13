import { processListedBuildingsRules } from './listedBuildingsRulesRich.js';
import { processConservationAreasRules } from './conservationAreasRulesRich.js';
import { processScheduledMonumentsRules } from './ScheduledMonumentsRulesRich.js';
import { RISK_LEVELS } from '../riskLevels.js';

// Heritage discipline-wide default recommendations
const DEFAULT_HERITAGE_TRIGGERED_RECOMMENDATIONS = [

  
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

  // Sort rules by risk level (highest to lowest)
  const riskHierarchy = [
    RISK_LEVELS.SHOWSTOPPER,
    RISK_LEVELS.EXTREMELY_HIGH_RISK,
    RISK_LEVELS.HIGH_RISK,
    RISK_LEVELS.MEDIUM_HIGH_RISK,
    RISK_LEVELS.MEDIUM_RISK,
    RISK_LEVELS.MEDIUM_LOW_RISK,
    RISK_LEVELS.LOW_RISK
  ];
  rules.sort((a, b) => riskHierarchy.indexOf(a.level) - riskHierarchy.indexOf(b.level));

  // Check if any showstopper rules exist (but don't filter rules - keep all for ribbon display)
  const showstopperRules = rules.filter(r => r.level === RISK_LEVELS.SHOWSTOPPER);
  const hasShowstoppers = showstopperRules.length > 0;

  // SHOWSTOPPER RECOMMENDATION OVERRIDE: If showstoppers exist, clear recommendations from non-showstopper rules
  if (hasShowstoppers) {
    rules = rules.map(rule => {
      if (rule.level !== RISK_LEVELS.SHOWSTOPPER) {
        // Keep the rule for ribbon display but clear its recommendations
        return { ...rule, recommendations: [] };
      }
      return rule;
    });
  }

  // overallRisk picks highest severity (first rule after sorting by risk level)
  const overallRisk = rules.length > 0 ? rules[0].level : RISK_LEVELS.LOW_RISK;

  // Discipline-wide recommendations based on whether ANY heritage rules triggered
  const hasTriggeredRules = rules.length > 0;

  return {
    rules,
    overallRisk,
    buildings: lb.buildings,
    conservationAreas: ca.conservationAreas,
    scheduledMonuments: sm.scheduled_monuments,
    defaultTriggeredRecommendations: (hasTriggeredRules && !hasShowstoppers) ? DEFAULT_HERITAGE_TRIGGERED_RECOMMENDATIONS : [],
    defaultNoRulesRecommendations: hasTriggeredRules ? [] : DEFAULT_HERITAGE_NO_RULES_RECOMMENDATIONS
  };
}
