-- PostgreSQL function for Green Belt landscape analysis
-- Analyzes Green Belt areas relative to a drawn polygon

-- Function to analyze Green Belt areas relative to a drawn polygon
CREATE OR REPLACE FUNCTION analyze_green_belt(polygon_geojson TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  dist_m INTEGER,
  on_site BOOLEAN,
  within_100m BOOLEAN,
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

-- Green Belt areas as polygons (already in BNG 27700)
gb_areas AS (
  SELECT
    ST_MakeValid(gb.geom) AS geom,
    gb.fid AS id,
    gb."name" AS name
  FROM public."Green_belt" gb
  WHERE gb.geom IS NOT NULL
),

-- Calculate distance, closest point (for azimuth), and flags
with_bearing AS (
  SELECT
    gb.id,
    gb.name,
    ROUND(ST_Distance(sr.geom, gb.geom))::INTEGER               AS dist_m,   -- rounded to nearest meter
    ST_Intersects(sr.geom, gb.geom)                             AS on_site,  -- polygon intersection
    ST_DWithin(sr.geom, gb.geom, 100.0)                         AS within_100m, -- flag for within 100m
    degrees(ST_Azimuth(sr.ref_pt, ST_ClosestPoint(gb.geom, sr.geom))) AS az_deg
  FROM gb_areas gb
  CROSS JOIN site_ref sr
)

SELECT
  wb.id,
  wb.name,
  wb.dist_m,
  wb.on_site,
  wb.within_100m,
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
  OR wb.within_100m     -- only return if on-site or within 100m
ORDER BY wb.on_site DESC, wb.dist_m ASC;

$$ LANGUAGE sql STABLE;
