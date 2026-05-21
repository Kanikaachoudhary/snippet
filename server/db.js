/**
 * db.js
 * -----
 * Postgres connection pool and schema setup.
 *
 * Why Postgres (instead of SQLite from the earlier local version):
 *   - Free hosting services don't keep local files between restarts, so a
 *     SQLite file would lose all snippets on every redeploy.
 *   - A managed Postgres database (Neon) keeps the data permanently and is
 *     free for small projects.
 *
 * The connection details come from the DATABASE_URL environment variable, so
 * the same code works locally and in production — only the env var changes.
 */

import pg from 'pg';

const { Pool } = pg;

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    'DATABASE_URL environment variable is required. ' +
      'Set it to your Postgres connection string (e.g. from Neon).'
  );
}

// Pooled connection so the server doesn't open a new connection per request.
export const pool = new Pool({
  connectionString: url,
  // Neon (and most hosted Postgres) requires SSL.
  ssl: { rejectUnauthorized: false }
});

/**
 * Create the snippets table if it doesn't already exist. Safe to run
 * repeatedly — it only creates the table the first time.
 */
export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS snippets (
      id         SERIAL PRIMARY KEY,
      title      TEXT NOT NULL,
      language   TEXT NOT NULL,
      code       TEXT NOT NULL,
      tags       TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
