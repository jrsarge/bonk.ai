/**
 * Database setup script for Neon PostgreSQL
 * Run with: npx ts-node lib/db/setup.ts
 */

import { sql } from './connection';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupDatabase() {
  try {
    console.log('Setting up Neon PostgreSQL database...');
    
    // Read and execute the schema file
    const schemaPath = join(__dirname, 'schema.sql');
    const schemaSQL = readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements and execute them
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      await sql.unsafe(statement);
      console.log('✅ Executed SQL statement');
    }
    
    console.log('🎉 Database setup completed successfully!');
    
    // Verify tables were created
    const tables = await sql`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'training_plans')
      ORDER BY table_name, ordinal_position;
    `;
    
    console.log('\n📊 Created tables and columns:');
    let currentTable = '';
    for (const row of tables) {
      if (row.table_name !== currentTable) {
        currentTable = row.table_name;
        console.log(`\n${currentTable}:`);
      }
      console.log(`  - ${row.column_name} (${row.data_type})`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    console.error('Make sure your DATABASE_URL is set correctly in .env file');
    process.exit(1);
  }
}

setupDatabase();