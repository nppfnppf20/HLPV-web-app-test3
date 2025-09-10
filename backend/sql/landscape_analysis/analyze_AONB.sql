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

-- Example ad-hoc queries were removed; use the analysis.analyze_aonb(jsonb) function below.

-- Function: analysis.analyze_aonb(jsonb) -> jsonb
-- Returns proximity buffer summaries and nearest AONB within 1km
CREATE OR REPLACE FUNCTION analysis.analyze_aonb(polygon_geojson jsonb)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  aoi_4326 geometry;
  aoi_27700 geometry;
  buffers jsonb := '[]'::jsonb;
  nearest jsonb := NULL;
BEGIN
  -- Parse GeoJSON and transform to 27700
  aoi_4326 := ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON(polygon_geojson::text), 4326));
  aoi_27700 := ST_Transform(aoi_4326, 27700);

  -- Build buffers summary (flatten group_key->name)
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'distance_m', s.distance_m,
        'name', s.group_key->>'name',
        'feature_count', s.feature_count
      )
      ORDER BY s.distance_m, s.group_key->>'name'
    ), '[]'::jsonb)
  INTO buffers
  FROM analysis.proximity_summary(
    aoi         => aoi_27700,
    layer_view  => 'analysis.aonb_features_v'::regclass,
    group_cols  => ARRAY['name'],
    distances_m => ARRAY[0,20,100,250,500,1000,3000,5000]
  ) AS s;

  -- Nearest within 1km
  WITH i AS (
    SELECT aoi_27700 AS aoi_geom, ST_PointOnSurface(aoi_27700) AS aoi_pt
  ), n AS (
    SELECT
      v.name,
      ROUND(ST_Distance(v.geom, i.aoi_pt))::int AS distance_m,
      analysis.to_compass_dir(ST_Azimuth(i.aoi_pt, ST_ClosestPoint(v.geom, i.aoi_pt))) AS direction
    FROM analysis.aonb_features_v v
    CROSS JOIN i
    WHERE ST_DWithin(v.geom, i.aoi_geom, 1000)
    ORDER BY ST_Distance(v.geom, i.aoi_pt)
    LIMIT 1
  )
  SELECT to_jsonb(n.*)
  INTO nearest
  FROM n;

  RETURN jsonb_build_object(
    'buffers', buffers,
    'nearest_within_1km', COALESCE(nearest, 'null'::jsonb)
  );
END;
$$;