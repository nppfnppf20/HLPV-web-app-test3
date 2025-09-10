import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deployFunctions() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Deploying PostgreSQL functions...');
    
    // Execute landscape analysis SQLs first (so referenced functions exist)
    const aonbPath = join(__dirname, '..', 'sql', 'landscape_analysis', 'analyze_AONB.sql');
    try {
      const aonbSql = readFileSync(aonbPath, 'utf8');
      await pool.query(aonbSql);
      console.log('✅ analyze_aonb created/updated');
    } catch (e) {
      console.warn('⚠️ Could not execute analyze_AONB.sql:', e?.message || e);
    }

    // Read and execute the combined analysis functions (heritage + landscape aggregator)
    const combinedPath = join(__dirname, '..', 'sql', 'create_analysis_functions.sql');
    const combinedSql = readFileSync(combinedPath, 'utf8');
    await pool.query(combinedSql);
    
    console.log('✅ PostgreSQL functions deployed successfully!');
    
    // Test the functions
    console.log('\nTesting functions...');
    
    // Simple test polygon (small square in London)
    const testPolygon = {
      "type": "Polygon",
      "coordinates": [[
        [-0.1, 51.5],
        [-0.09, 51.5],
        [-0.09, 51.51],
        [-0.1, 51.51],
        [-0.1, 51.5]
      ]]
    };
    
    // Test heritage analysis function
    const result = await pool.query(
      'SELECT analyze_site_heritage($1) as result',
      [JSON.stringify(testPolygon)]
    );
    
    console.log('✅ Heritage analysis function working');
    console.log('Sample result structure:', Object.keys(result.rows[0].result));
    
  } catch (error) {
    console.error('❌ Error deploying functions:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

deployFunctions().catch((e) => {
  console.error(e);
  process.exit(1);
});
