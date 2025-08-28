/**
 * Database connection test script
 * Run with: npx ts-node lib/db/test-connection.ts
 * Make sure to set DATABASE_URL in your .env file
 */

import { sql } from './connection';

async function testConnection() {
  try {
    console.log('Testing Neon PostgreSQL connection...');
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Database connection successful!');
    console.log('Current time:', result[0].current_time);
    console.log('PostgreSQL version:', result[0].pg_version);
    
    // Test if our tables exist
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'training_plans')
      ORDER BY table_name;
    `;
    
    if (tableCheck.length === 0) {
      console.log('⚠️  No application tables found. You may need to run the schema creation script.');
      console.log('Tables expected: users, training_plans');
    } else {
      console.log('✅ Found application tables:', tableCheck.map(t => t.table_name).join(', '));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Make sure your DATABASE_URL is set correctly in .env file');
    process.exit(1);
  }
}

testConnection();