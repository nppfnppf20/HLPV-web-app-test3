// Heritage analysis using PostgreSQL functions
// These functions analyze listed buildings and conservation areas relative to a drawn polygon

import { processAllRules } from './rules/index.js';

// Main analysis function that returns detailed heritage analysis
export function buildHeritageAnalysisQuery(geojsonPolygon) {
  const text = `SELECT analyze_site_heritage($1) as analysis_result;`;
  const values = [JSON.stringify(geojsonPolygon)];
  return { text, values };
}

// Individual analysis functions for specific heritage types
export function buildListedBuildingsQuery(geojsonPolygon) {
  const text = `SELECT * FROM analyze_listed_buildings($1);`;
  const values = [JSON.stringify(geojsonPolygon)];
  return { text, values };
}

export function buildConservationAreasQuery(geojsonPolygon) {
  const text = `SELECT * FROM analyze_conservation_areas($1);`;
  const values = [JSON.stringify(geojsonPolygon)];
  return { text, values };
}

// Landscape analysis: Green Belt
export function buildGreenBeltQuery(geojsonPolygon) {
  const text = `SELECT * FROM analyze_green_belt($1);`;
  const values = [JSON.stringify(geojsonPolygon)];
  return { text, values };
}

// AONB analysis (JSON result)
export function buildAONBQuery(geojsonPolygon) {
  const text = `SELECT analysis.analyze_aonb($1::jsonb) AS result;`;
  const values = [JSON.stringify(geojsonPolygon)];
  return { text, values };
}

// Enhanced multi-layer analysis with risk assessment
export function buildEnhancedAnalysisQuery(geojsonPolygon) {
  // This will be expanded to include all spatial analysis + risk assessment
  return buildHeritageAnalysisQuery(geojsonPolygon);
}

// Generic multi-layer analyze: map layer keys to query builders that return JSON
export function buildMultiLayerQueries(geojsonPolygon, layers) {
  const layerMap = {
    aonb: (p) => buildAONBQuery(p)
  };

  return layers
    .filter((key) => Boolean(layerMap[key]))
    .map((key) => ({ key, builder: layerMap[key](geojsonPolygon) }));
}

// Legacy function for backward compatibility (if needed)
export function buildAnalysisQuery(geojsonPolygon) {
  return buildHeritageAnalysisQuery(geojsonPolygon);
}

// Process analysis results through rules engine
export async function enhanceWithRiskAssessment(analysisData) {
  // Apply rules to spatial analysis results
  const ruleResults = processAllRules(analysisData);
  
  return {
    spatial_data: analysisData,
    rule_results: ruleResults,
    report_data: {
      // Placeholder for future report generation
      summary: "Rules processed, no aggregation yet",
      recommendations: []
    }
  };
}