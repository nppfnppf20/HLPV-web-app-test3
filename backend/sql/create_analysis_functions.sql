-- PostgreSQL functions for spatial analysis
-- This file contains functions to analyze listed buildings and conservation areas
-- relative to a drawn polygon (replacing site_boundary approach)

-- Function to analyze listed buildings relative to a drawn polygon
CREATE OR REPLACE FUNCTION analyze_listed_buildings(polygon_geojson TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  grade TEXT,
  dist_m INTEGER,
  on_site BOOLEAN,
  direction TEXT
) AS $$
WITH
-- Convert input GeoJSON polygon to geometry
site AS (
  SELECT ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON(polygon_geojson), 4326)) AS geom
),

-- Transform to British National Grid (27700) for accurate distance calculations
site_metric AS (
  SELECT ST_Transform(geom, 27700) AS geom
  FROM site
),

-- Reference point for azimuth calculation
site_ref AS (
  SELECT
    sm.geom,
    ST_PointOnSurface(sm.geom) AS ref_pt
  FROM site_metric sm
),

-- Listed buildings using existing geometry - extract points from multipoint
lb_points AS (
  SELECT
    ST_GeometryN(lb.geom, 1) AS geom,  -- Extract first point from multipoint
    lb."OBJECTID" AS id,
    lb."Name"     AS name,
    lb."Grade"    AS grade
  FROM public.listed_building lb
  WHERE lb.geom IS NOT NULL
),

-- Calculate distance, azimuth, and on-site flag
with_bearing AS (
  SELECT
    p.id,
    p.name,
    p.grade,
    p.geom,
    ROUND(ST_Distance(sr.geom, p.geom))::INTEGER AS dist_m,  -- rounded to nearest meter
    ST_Covers(sr.geom, p.geom)                   AS on_site,
    degrees(ST_Azimuth(sr.ref_pt, p.geom))       AS az_deg
  FROM lb_points p
  CROSS JOIN site_ref sr
)

SELECT
  wb.id,
  wb.name,
  wb.grade,
  wb.dist_m,
  wb.on_site,
  CASE
    WHEN wb.on_site THEN 'N/A'
    WHEN wb.az_deg >= 337.5 OR wb.az_deg < 22.5  THEN 'N'
    WHEN wb.az_deg >= 22.5  AND wb.az_deg < 67.5  THEN 'NE'
    WHEN wb.az_deg >= 67.5  AND wb.az_deg < 112.5 THEN 'E'
    WHEN wb.az_deg >= 112.5 AND wb.az_deg < 157.5 THEN 'SE'
    WHEN wb.az_deg >= 157.5 AND wb.az_deg < 202.5 THEN 'S'
    WHEN wb.az_deg >= 202.5 AND wb.az_deg < 247.5 THEN 'SW'
    WHEN wb.az_deg >= 247.5 AND wb.az_deg < 292.5 THEN 'W'
    WHEN wb.az_deg >= 292.5 AND wb.az_deg < 337.5 THEN 'NW'
    ELSE NULL
  END AS direction
FROM with_bearing wb
WHERE
  wb.on_site
  OR wb.dist_m <= 100
ORDER BY wb.on_site DESC, wb.dist_m ASC;

$$ LANGUAGE sql STABLE;

-- Function to analyze conservation areas relative to a drawn polygon
CREATE OR REPLACE FUNCTION analyze_conservation_areas(polygon_geojson TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  dist_m INTEGER,
  on_site BOOLEAN,
  within_250m BOOLEAN,
  direction TEXT
) AS $$
WITH
-- Convert input GeoJSON polygon to geometry
site AS (
  SELECT ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON(polygon_geojson), 4326)) AS geom
),

-- Transform to British National Grid (27700) for accurate distance calculations
site_metric AS (
  SELECT ST_Transform(geom, 27700) AS geom
  FROM site
),

-- Reference point for azimuth calculation
site_ref AS (
  SELECT
    sm.geom,
    ST_PointOnSurface(sm.geom) AS ref_pt
  FROM site_metric sm
),

-- Conservation areas as polygons
ca_polys AS (
  SELECT
    ST_MakeValid(
      CASE WHEN ST_SRID(c.geom) = 27700 
           THEN c.geom
           ELSE ST_Transform(c.geom, 27700)
      END
    ) AS geom,
    c."OBJECTID" AS id,
    c."NAME"     AS name
  FROM public.conservation_area c
),

-- Calculate distance, closest point (for azimuth), and on-site flag
with_bearing AS (
  SELECT
    p.id,
    p.name,
    ROUND(ST_Distance(sr.geom, p.geom))::INTEGER               AS dist_m,   -- rounded to nearest meter
    ST_Intersects(sr.geom, p.geom)                             AS on_site,  -- polygon intersection
    ST_DWithin(sr.geom, p.geom, 250.0)                         AS within_250m, -- flag for within 250m
    degrees(ST_Azimuth(sr.ref_pt, ST_ClosestPoint(p.geom, sr.geom))) AS az_deg
  FROM ca_polys p
  CROSS JOIN site_ref sr
)

SELECT
  wb.id,
  wb.name,
  wb.dist_m,
  wb.on_site,
  wb.within_250m,
  CASE
    WHEN wb.on_site THEN 'N/A'
    WHEN wb.az_deg >= 337.5 OR wb.az_deg < 22.5  THEN 'N'
    WHEN wb.az_deg >= 22.5  AND wb.az_deg < 67.5  THEN 'NE'
    WHEN wb.az_deg >= 67.5  AND wb.az_deg < 112.5 THEN 'E'
    WHEN wb.az_deg >= 112.5 AND wb.az_deg < 157.5 THEN 'SE'
    WHEN wb.az_deg >= 157.5 AND wb.az_deg < 202.5 THEN 'S'
    WHEN wb.az_deg >= 202.5 AND wb.az_deg < 247.5 THEN 'SW'
    WHEN wb.az_deg >= 247.5 AND wb.az_deg < 292.5 THEN 'W'
    WHEN wb.az_deg >= 292.5 AND wb.az_deg < 337.5 THEN 'NW'
    ELSE NULL
  END AS direction
FROM with_bearing wb
WHERE
  wb.on_site
  OR wb.dist_m <= 1000     -- within 1 km
ORDER BY wb.on_site DESC, wb.dist_m ASC;

$$ LANGUAGE sql STABLE;

-- Combined analysis function that calls both individual functions
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

-- Combined landscape analysis function that calls landscape individual functions
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
