import { defineConfig } from 'drizzle-kit';
if (!process.env.ZERO_UPSTREAM_DB) throw new Error('ZERO_UPSTREAM_DB is not set');

export default defineConfig({
  schema: './src/drizzle.schema.ts',

  dbCredentials: {
    url: process.env.ZERO_UPSTREAM_DB
  },

  verbose: true,
  strict: true,
  dialect: 'postgresql'
});
