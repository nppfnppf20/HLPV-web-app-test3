-- PostgreSQL function for Renewable Energy developments spatial analysis
-- Analyzes renewables relative to a drawn polygon with multiple buffer flags

-- Drop existing function first to allow return type change
DROP FUNCTION IF EXISTS analyze_renewables(TEXT);

CREATE OR REPLACE FUNCTION analyze_renewables(polygon_geojson TEXT)
RETURNS TABLE (
  id INTEGER,
  site_name TEXT,
  development_status_short TEXT,
  technology_type TEXT,
  installed_capacity_mw TEXT,
  dist_m INTEGER,
  on_site BOOLEAN,
  within_50m BOOLEAN,
  within_100m BOOLEAN,
  within_250m BOOLEAN,
  within_500m BOOLEAN,
  within_1km BOOLEAN,
  within_3km BOOLEAN,
  within_5km BOOLEAN,
  direction TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
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

-- Renewable energy points filtered by technology type
ren_points AS (
  SELECT
    -- Ensure geometry validity and correct SRID
    ST_MakeValid(
      CASE WHEN ST_SRID(r.geom) = 27700 
           THEN r.geom
           ELSE ST_Transform(r.geom, 27700)
      END
    ) AS geom,
    r."id"::INTEGER AS id,
    r."Site Name" AS site_name,
    r."Development Status (short)" AS development_status_short,
    r."Technology Type" AS technology_type,
    r."Installed Capacity (MWelec)" AS installed_capacity_mw
  FROM public."Renewable Energy developments Q1 2025" r
  WHERE r."Technology Type" = 'Solar Photovoltaics'
    AND r.geom IS NOT NULL
    AND r."Development Status (short)" IN ('Appeal Refused', 'Application Refused', 'Application Submitted', 'Awaiting Construction', 'Operational', 'Revised', 'Under Construction')
    AND (
      r."Installed Capacity (MWelec)" ~ '^[0-9]+\.?[0-9]*$' 
      AND CAST(r."Installed Capacity (MWelec)" AS NUMERIC) > 10
    )
),

-- Calculate distance, flags and azimuth
with_metrics AS (
  SELECT
    p.id,
    p.site_name,
    p.development_status_short,
    p.technology_type,
    p.installed_capacity_mw,
    ROUND(ST_Distance(sr.geom, p.geom))::INTEGER AS dist_m,
    ST_Intersects(sr.geom, p.geom) AS on_site,
    ST_DWithin(sr.geom, p.geom, 50.0)   AS within_50m,
    ST_DWithin(sr.geom, p.geom, 100.0)  AS within_100m,
    ST_DWithin(sr.geom, p.geom, 250.0)  AS within_250m,
    ST_DWithin(sr.geom, p.geom, 500.0)  AS within_500m,
    ST_DWithin(sr.geom, p.geom, 1000.0) AS within_1km,
    ST_DWithin(sr.geom, p.geom, 3000.0) AS within_3km,
    ST_DWithin(sr.geom, p.geom, 5000.0) AS within_5km,
    degrees(ST_Azimuth(sr.ref_pt, p.geom)) AS az_deg,
    -- Extract lat/lng coordinates for frontend mapping
    ST_Y(ST_Transform(p.geom, 4326)) AS lat,
    ST_X(ST_Transform(p.geom, 4326)) AS lng
  FROM ren_points p
  CROSS JOIN site_ref sr
)

SELECT
  wm.id,
  wm.site_name,
  wm.development_status_short,
  wm.technology_type,
  wm.installed_capacity_mw,
  wm.dist_m,
  wm.on_site,
  wm.within_50m,
  wm.within_100m,
  wm.within_250m,
  wm.within_500m,
  wm.within_1km,
  wm.within_3km,
  wm.within_5km,
  CASE
    WHEN wm.on_site THEN 'N/A'
    WHEN wm.az_deg >= 337.5 OR wm.az_deg < 22.5  THEN 'N'
    WHEN wm.az_deg >= 22.5  AND wm.az_deg < 67.5  THEN 'NE'
    WHEN wm.az_deg >= 67.5  AND wm.az_deg < 112.5 THEN 'E'
    WHEN wm.az_deg >= 112.5 AND wm.az_deg < 157.5 THEN 'SE'
    WHEN wm.az_deg >= 157.5 AND wm.az_deg < 202.5 THEN 'S'
    WHEN wm.az_deg >= 202.5 AND wm.az_deg < 247.5 THEN 'SW'
    WHEN wm.az_deg >= 247.5 AND wm.az_deg < 292.5 THEN 'W'
    WHEN wm.az_deg >= 292.5 AND wm.az_deg < 337.5 THEN 'NW'
    ELSE NULL
  END AS direction,
  wm.lat,
  wm.lng
FROM with_metrics wm
WHERE
  wm.on_site
  OR wm.within_50m
  OR wm.within_100m
  OR wm.within_250m
  OR wm.within_500m
  OR wm.within_1km
  OR wm.within_3km
  OR wm.within_5km
ORDER BY wm.on_site DESC, wm.dist_m ASC;

$$ LANGUAGE sql STABLE;
