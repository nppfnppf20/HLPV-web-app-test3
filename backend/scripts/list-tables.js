import 'dotenv/config';
import { pool } from '../src/db.js';

async function listTables() {
  try {
    console.log('🔍 Connecting to database...');
    
    // Query to get all tables in the public schema
    const result = await pool.query(`
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Tables in your database:');
    console.log('═'.repeat(50));
    
    if (result.rows.length === 0) {
      console.log('No tables found in the public schema.');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name} (${row.table_type})`);
      });
    }
    
    console.log('\n🔍 Getting column information for each table...');
    console.log('═'.repeat(50));
    
    // Get detailed info about each table
    for (const table of result.rows) {
      const tableName = table.table_name;
      
      const columnsResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      console.log(`\n📋 Table: ${tableName}`);
      console.log('-'.repeat(30));
      
      if (columnsResult.rows.length > 0) {
        columnsResult.rows.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`  • ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
        });
      } else {
        console.log('  No columns found.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error querying database:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    console.log('\n✅ Database connection closed.');
  }
}

listTables();

