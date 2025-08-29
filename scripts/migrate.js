const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please set your Neon PostgreSQL connection string in .env.local');
    process.exit(1);
  }
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    const schemaPath = path.join(__dirname, '..', 'lib', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🚀 Running database migration...');
    await sql.unsafe(schema);
    console.log('✅ Database schema applied successfully!');
    
    // Test the connection
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection verified!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();