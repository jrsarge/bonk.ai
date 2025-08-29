const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    
    console.log('🔍 Testing database connection...');
    const result = await sql`SELECT current_timestamp as now, 'Hello from bonk.ai!' as message`;
    console.log('✅ Connection successful!');
    console.log('📅 Current time:', result[0].now);
    console.log('💬 Message:', result[0].message);
    
    console.log('\n🔍 Checking tables...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. Run "node scripts/migrate.js" to set up the schema.');
    } else {
      console.log('✅ Tables found:', tables.map(t => t.table_name).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();