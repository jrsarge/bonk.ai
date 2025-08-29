#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  console.log('🚀 Starting database setup...');

  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please set your Neon PostgreSQL connection string in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('✅ Connected to Neon database successfully');

    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'schema.sql');
    console.log('📖 Reading schema file...');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema file read successfully');

    // Execute the schema
    console.log('🔨 Creating tables and indexes...');
    
    // Execute the entire schema as one block
    await sql.unsafe(schema);
    
    console.log('✅ Database schema created successfully');

    // Verify tables were created
    console.log('🔍 Verifying tables...');
    
    // Check each table individually
    const tables = ['users', 'sessions', 'training_plans'];
    const existingTables = [];
    
    for (const table of tables) {
      try {
        // Use unsafe to execute dynamic table names
        const result = await sql.unsafe(`SELECT COUNT(*) as count FROM ${table} LIMIT 1`);
        existingTables.push(table);
        console.log(`✅ Table '${table}' exists and is accessible`);
      } catch (error) {
        console.log(`❌ Table '${table}' not found or not accessible: ${error.message}`);
      }
    }
    
    console.log('📋 Verified tables:', existingTables);

    if (existingTables.length === 3) {
      console.log('✅ All required tables created successfully!');
    } else {
      console.warn(`⚠️ Only ${existingTables.length}/3 tables found. Missing: ${tables.filter(t => !existingTables.includes(t)).join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();