import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import 'dotenv/config';

// Use the pooler URL with SSL for Neon
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_PdtA5sDMLUS4@ep-purple-river-aquupzx6-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&options=endpoint%3Dep-purple-river-aquupzx6-pooler';

const client = postgres(connectionString, { ssl: { rejectUnauthorized: false } });
export const db = drizzle(client, { schema });
