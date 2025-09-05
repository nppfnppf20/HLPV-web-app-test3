// Example analysis: counts intersections and area overlap percentage from a target layer
// Adjust table/column names to your schema as needed

export function buildAnalysisQuery(geojsonPolygon) {
  const text = `
    with input_wgs84 as (
      select ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) as geom
    ),
    -- Transform to 27700 (British National Grid) to match your layers
    input as (
      select ST_Transform(geom, 27700) as geom from input_wgs84
    ),
    conservation as (
      select ST_Area(ST_Intersection(ca.geom, i.geom)) as overlap_area_m2
      from input i
      join public.conservation_area ca
        on ST_Intersects(ca.geom, i.geom)
    ),
    listed as (
      select 1
      from input i
      join public.listed_building lb
        on ST_Intersects(lb.geom, i.geom)
    )
    select 
      (select count(*) from conservation) as conservation_intersections,
      (select coalesce(sum(overlap_area_m2),0) from conservation) as conservation_overlap_area_m2,
      (select count(*) from listed) as listed_building_count;
  `;
  const values = [JSON.stringify(geojsonPolygon)];
  return { text, values };
}


