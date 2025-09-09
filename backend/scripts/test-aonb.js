import 'dotenv/config';
import pg from 'pg';

async function main() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  try {
    console.log('Testing analysis.analyze_aonb with a sample AOI...');
    const sql = `
      WITH sample AS (
        SELECT ST_Buffer(ST_Centroid(geom), 200)::geometry AS aoi_27700
        FROM public."AONB"
        WHERE geom IS NOT NULL
        LIMIT 1
      )
      SELECT analysis.analyze_aonb(
        ST_AsGeoJSON(ST_Transform(aoi_27700, 4326))::jsonb
      ) AS result
      FROM sample;
    `;
    const r = await pool.query(sql);
    console.log('Result:', JSON.stringify(r.rows[0]?.result, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
    console.error(e);
  } finally {
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


