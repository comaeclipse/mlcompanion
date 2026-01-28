import pg from 'pg';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const migrationSQL = fs.readFileSync(
  join(__dirname, '../prisma/migrations/20260128000000_add_book_episode_relation/migration.sql'),
  'utf-8'
);

console.log('Applying migration: add_book_episode_relation');
console.log('SQL to execute:');
console.log(migrationSQL);
console.log('\n---\n');

try {
  await pool.query(migrationSQL);
  console.log('✅ Migration applied successfully!');
  
  // Verify table exists
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'BookEpisode'
  `);
  
  if (result.rows.length > 0) {
    console.log('✅ Verified: BookEpisode table exists');
  } else {
    console.log('⚠️  Warning: BookEpisode table not found');
  }
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  await pool.end();
}
