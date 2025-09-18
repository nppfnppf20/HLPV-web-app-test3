-- Analysis function for Scheduled Monuments
CREATE OR REPLACE FUNCTION analyze_scheduled_monuments(polygon_geojson TEXT)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  dist_m NUMERIC,
  direction TEXT,
  on_site BOOLEAN,
  within_50m BOOLEAN,
  within_100m BOOLEAN,
  within_250m BOOLEAN,
  within_500m BOOLEAN,
  within_1km BOOLEAN,
  within_3km BOOLEAN,
  within_5km BOOLEAN
) AS $$
DECLARE
  site_geom GEOMETRY;
BEGIN
  -- Parse the input polygon
  site_geom := ST_GeomFromGeoJSON(polygon_geojson);

  RETURN QUERY
  SELECT
    sm.ogc_fid as id,
    COALESCE(sm.name, 'Unnamed Scheduled Monument') as name,
    ROUND(ST_Distance(site_geom::geography, sm.wkb_geometry::geography)::numeric, 1) as dist_m,
    CASE
      WHEN ST_Intersects(site_geom, sm.wkb_geometry) THEN 'On Site'
      ELSE get_direction(ST_Centroid(site_geom), ST_Centroid(sm.wkb_geometry))
    END as direction,
    ST_Intersects(site_geom, sm.wkb_geometry) as on_site,
    ST_DWithin(site_geom::geography, sm.wkb_geometry::geography, 50) as within_50m,
    ST_DWithin(site_geom::geography, sm.wkb_geometry::geography, 100) as within_100m,
    ST_DWithin(site_geom::geography, sm.wkb_geometry::geography, 250) as within_250m,
    ST_DWithin(site_geom::geography, sm.wkb_geometry::geography, 500) as within_500m,
    ST_DWithin(site_geom::geography, sm.wkb_geometry::geography, 1000) as within_1km,
    ST_DWithin(site_geom::geography, sm.wkb_geometry::geography, 3000) as within_3km,
    ST_DWithin(site_geom::geography, sm.wkb_geometry::geography, 5000) as within_5km
  FROM public."Scheduled monuments" sm
  WHERE ST_DWithin(site_geom::geography, sm.wkb_geometry::geography, 5000)
  ORDER BY ST_Distance(site_geom::geography, sm.wkb_geometry::geography);
END;
$$ LANGUAGE plpgsql STABLE;