import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';

const connectionString = process.env.DATABASE_URL;
const url = new URL(connectionString);
const schema = url.searchParams.get('schema') || 'public';

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool, { schema });

const prisma = new PrismaClient({ adapter });

export default prisma;
