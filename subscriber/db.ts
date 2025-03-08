import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/drizzle.schema';
import { must } from './utils';
const client = postgres(must(process.env.ZERO_UPSTREAM_DB));
export const db = drizzle(client, { schema });
