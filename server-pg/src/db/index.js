import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

export const SCHEMA = process.env.PG_SCHEMA || 'WithPostgreSQL';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

export default pool;
