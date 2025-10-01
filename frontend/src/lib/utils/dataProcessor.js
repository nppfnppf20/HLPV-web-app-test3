// Data processing utilities for map visualization
// Handles geometry conversion, filtering, and data transformation

import { isRiskLevelVisible } from './mapRiskAssessment.js';

/**
 * Convert scheduled monuments data to include geometry for map display
 * @param {any[]} monuments - Raw scheduled monuments data
 * @returns {any[]} - Monuments with geometry objects
 */
export function processScheduledMonuments(monuments) {
  return monuments.map(monument => ({
    ...monument,
    geometry: {
      type: 'Point',
      coordinates: [parseFloat(monument.lng), parseFloat(monument.lat)]
    }
  }));
}

/**
 * Filter buildings by grade
 * @param {any[]} buildings - Listed buildings array
 * @param {'I' | 'II*' | 'II'} grade - Grade to filter by
 * @returns {any[]} - Filtered buildings
 */
export function filterBuildingsByGrade(buildings, grade) {
  return (buildings || []).filter(b => b.grade === grade);
}

/**
 * Apply data to a Leaflet layer with risk filtering
 * @param {import('leaflet').GeoJSON | null} layer - Target layer
 * @param {any[]} rows - Data rows to add
 * @param {(r: any) => Record<string, any>} propsMapper - Function to map row to properties
 * @param {boolean} applyRiskFilter - Whether to apply risk level filtering
 * @param {Record<string, boolean>} riskFilters - Current risk filter settings
 */
export function setLayerData(layer, rows, propsMapper = (r) => r, applyRiskFilter = false, riskFilters = {}) {
  if (!layer) {
    console.log('❌ setLayerData called with null layer');
    return;
  }
  console.log('📊 setLayerData called with', rows.length, 'rows, applyRiskFilter:', applyRiskFilter);
  layer.clearLayers();

  if (!Array.isArray(rows) || rows.length === 0) {
    console.log('⚠️ No rows to add to layer');
    return;
  }

  let filteredRows = rows.filter((r) => r?.geometry);
  console.log('📍 After geometry filter:', filteredRows.length, 'rows');

  // Apply risk level filtering if requested
  if (applyRiskFilter) {
    const beforeRiskFilter = filteredRows.length;
    filteredRows = filteredRows.filter((r) => {
      const props = propsMapper(r);
      const visible = props.riskLevel ? isRiskLevelVisible(props.riskLevel, riskFilters) : true;
      if (!visible) console.log('🚫 Filtering out', r.name || 'feature', 'with risk level:', props.riskLevel);
      return visible;
    });
    console.log('⚡ After risk filter:', filteredRows.length, 'rows (was', beforeRiskFilter, ')');
  }

  const features = filteredRows.map((r) => ({
    type: 'Feature',
    geometry: r.geometry,
    properties: propsMapper(r)
  }));

  console.log('🗺️ Adding', features.length, 'features to layer');
  if (features.length > 0) {
    layer.addData({ type: 'FeatureCollection', features });
    console.log('✅ Features added to layer successfully');
  }
}