// Heritage analysis using PostgreSQL functions
// These functions analyze listed buildings and conservation areas relative to a drawn polygon

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

// Legacy function for backward compatibility (if needed)
export function buildAnalysisQuery(geojsonPolygon) {
  // For now, redirect to the new heritage analysis
  return buildHeritageAnalysisQuery(geojsonPolygon);
}

// AONB analysis (JSON result)
export function buildAONBQuery(geojsonPolygon) {
  const text = `SELECT analysis.analyze_aonb($1::jsonb) AS result;`;
  const values = [JSON.stringify(geojsonPolygon)];
  return { text, values };
}

// Generic multi-layer analyze: map layer keys to query builders that return JSON
export function buildMultiLayerQueries(geojsonPolygon, layers) {
  const layerMap = {
    // existing heritage layers could be added here when migrated to JSON-returning functions
    aonb: (p) => buildAONBQuery(p)
    // green_belt, listed_building, conservation_areas can be added when standardized
  };

  return layers
    .filter((key) => Boolean(layerMap[key]))
    .map((key) => ({ key, builder: layerMap[key](geojsonPolygon) }));
}


