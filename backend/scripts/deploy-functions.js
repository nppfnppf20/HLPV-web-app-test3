import 'dotenv/config';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function deployFunctions() {
  const useSsl = process.env.DATABASE_URL && !/localhost|127\.0\.0\.1/i.test(process.env.DATABASE_URL);
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Deploying PostgreSQL functions...');
    
    // Read and deploy heritage SQL
    const heritageSqlPath = join(__dirname, '..', 'sql', 'heritage analysis', 'create_analysis_functions.sql');
    const heritageSql = readFileSync(heritageSqlPath, 'utf8');
    await pool.query(heritageSql);

    // Read and deploy landscape (Green Belt) SQL, if present
    try {
      const greenBeltSqlPath = join(__dirname, '..', 'sql', 'landscape_analysis', 'analyze_green_belt.sql');
      const greenBeltSql = readFileSync(greenBeltSqlPath, 'utf8');
      await pool.query(greenBeltSql);
      console.log('✅ Green Belt analysis function deployed');
    } catch (e) {
      console.warn('ℹ️ Green Belt SQL not found or failed to deploy. Skipping. Reason:', e?.message || e);
    }
    
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

