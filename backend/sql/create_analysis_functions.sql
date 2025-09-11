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

-- Agricultural land analysis function (separate category)
CREATE OR REPLACE FUNCTION analyze_site_ag_land(polygon_geojson TEXT)
RETURNS JSON AS $$
DECLARE
  ag_land_result JSON;
  combined_result JSON;
BEGIN
  -- Get agricultural land analysis
  SELECT json_agg(row_to_json(t)) INTO ag_land_result
  FROM (
    SELECT * FROM analyze_ag_land(polygon_geojson)
  ) t;

  -- Build result object
  SELECT json_build_object(
    'ag_land', COALESCE(ag_land_result, '[]'::json)
  ) INTO combined_result;

  RETURN combined_result;
END;
$$ LANGUAGE plpgsql STABLE;

-- Renewables analysis function (separate category)
CREATE OR REPLACE FUNCTION analyze_site_renewables(polygon_geojson TEXT)
RETURNS JSON AS $$
DECLARE
  renewables_result JSON;
  combined_result JSON;
BEGIN
  -- Get renewables analysis
  SELECT json_agg(row_to_json(t)) INTO renewables_result
  FROM (
    SELECT * FROM analyze_renewables(polygon_geojson)
  ) t;

  -- Build result object
  SELECT json_build_object(
    'renewables', COALESCE(renewables_result, '[]'::json)
  ) INTO combined_result;

  RETURN combined_result;
END;
$$ LANGUAGE plpgsql STABLE;