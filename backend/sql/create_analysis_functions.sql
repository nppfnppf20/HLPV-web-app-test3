-- PostgreSQL aggregator functions for spatial analysis
-- This file contains only the main aggregator functions that combine results 
-- from individual analysis functions in heritage_analysis/ and landscape_analysis/

-- Combined heritage analysis function that calls individual heritage functions
CREATE OR REPLACE FUNCTION analyze_site_heritage(polygon_geojson TEXT)
RETURNS JSON AS $$
DECLARE
  listed_buildings_result JSON;
  conservation_areas_result JSON;
  combined_result JSON;
BEGIN
  -- Get listed buildings analysis
  SELECT json_agg(row_to_json(t)) INTO listed_buildings_result
  FROM (
    SELECT * FROM analyze_listed_buildings(polygon_geojson)
  ) t;

  -- Get conservation areas analysis
  SELECT json_agg(row_to_json(t)) INTO conservation_areas_result
  FROM (
    SELECT * FROM analyze_conservation_areas(polygon_geojson)
  ) t;

  -- Combine results
  SELECT json_build_object(
    'listed_buildings', COALESCE(listed_buildings_result, '[]'::json),
    'conservation_areas', COALESCE(conservation_areas_result, '[]'::json)
  ) INTO combined_result;

  RETURN combined_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Combined landscape analysis function that calls individual landscape functions
CREATE OR REPLACE FUNCTION analyze_site_landscape(polygon_geojson TEXT)
RETURNS JSON AS $$
DECLARE
  green_belt_result JSON;
  aonb_result JSON;
  combined_result JSON;
BEGIN
  -- Get Green Belt analysis
  SELECT json_agg(row_to_json(t)) INTO green_belt_result
  FROM (
    SELECT * FROM analyze_green_belt(polygon_geojson)
  ) t;

  -- Get AONB analysis
  SELECT json_agg(row_to_json(t)) INTO aonb_result
  FROM (
    SELECT * FROM analyze_aonb(polygon_geojson)
  ) t;

  -- Combine results
  SELECT json_build_object(
    'green_belt', COALESCE(green_belt_result, '[]'::json),
    'aonb', COALESCE(aonb_result, '[]'::json)
  ) INTO combined_result;

  RETURN combined_result;
END;
$$ LANGUAGE plpgsql STABLE;