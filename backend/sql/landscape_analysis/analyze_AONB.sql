-- Schema and thin view
CREATE SCHEMA IF NOT EXISTS analysis;

CREATE OR REPLACE VIEW analysis.aonb_features_v AS
SELECT
  "OBJECTID"::bigint AS id,
  geom                AS geom,
  "NAME"::text        AS name
FROM public."AONB";

-- Helper: azimuth (radians) -> 16-wind compass direction
CREATE OR REPLACE FUNCTION analysis.to_compass_dir(azimuth_rad double precision)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  deg double precision := degrees(azimuth_rad);
  dirs text[] := ARRAY['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  idx int;
BEGIN
  IF deg IS NULL THEN RETURN NULL; END IF;
  deg := mod(deg + 360, 360);
  idx := floor((deg + 11.25) / 22.5)::int % 16 + 1;
  RETURN dirs[idx];
END;
$$;

-- 1) Proximity buffers + summary using the central function
-- aoi should be SRID 27700; if not, ST_Transform(:aoi, 27700)
SELECT *
FROM analysis.proximity_summary(
  aoi         => :aoi,  -- replace :aoi with your input geometry
  layer_view  => 'analysis.aonb_features_v'::regclass,
  group_cols  => ARRAY['name'], -- or ARRAY[]::text[] for totals only
  distances_m => ARRAY[0,20,100,250,500,1000,3000,5000]
);

-- 2) Name, direction, distance to nearest AONB within 1 km
WITH input AS (
  SELECT
    :aoi::geometry AS aoi_geom,
    ST_PointOnSurface(:aoi::geometry) AS aoi_pt
),
nearest AS (
  SELECT
    v.name,
    ST_Distance(v.geom, i.aoi_pt) AS distance_m,
    ST_Azimuth(i.aoi_pt, ST_ClosestPoint(v.geom, i.aoi_pt)) AS azimuth_rad
  FROM analysis.aonb_features_v v
  CROSS JOIN input i
  WHERE ST_DWithin(v.geom, i.aoi_geom, 1000)
  ORDER BY ST_Distance(v.geom, i.aoi_pt)
  LIMIT 1
)
SELECT
  name,
  round(distance_m)::int AS distance_m,
  analysis.to_compass_dir(azimuth_rad) AS direction
FROM nearest;