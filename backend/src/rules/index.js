import { processHeritageRules } from './heritageRules.js';
import { processLandscapeRules } from './landscapeRules.js';

/**
 * Process all rules for a given analysis dataset
 * @param {object} analysisData - Spatial analysis results
 * @returns {object} Individual rule assessments (no aggregation)
 */
export function processAllRules(analysisData) {
  // Process heritage rules
  const heritageAssessment = processHeritageRules(analysisData);
  
  // Process landscape rules
  const landscapeData = {
    aonb: analysisData.aonb,
    greenBelt: analysisData.green_belt
  };
  const landscapeAssessment = processLandscapeRules(landscapeData);
  
  return {
    heritage: heritageAssessment,
    landscape: landscapeAssessment
  };
}