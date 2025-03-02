import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from '../../../drizzle.schema';
if (!env.ZERO_UPSTREAM_DB) throw new Error('ZERO_UPSTREAM_DB is not set');
const client = postgres(env.ZERO_UPSTREAM_DB);
export const db = drizzle(client, { schema });
