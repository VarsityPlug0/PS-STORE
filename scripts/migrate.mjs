// Create PostgreSQL tables
// Run: node scripts/migrate.mjs
import pg from "pg";
import { config } from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", ".env.local") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS products (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price       NUMERIC(10,2) NOT NULL DEFAULT 0,
    image       TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT '',
    stock       INTEGER NOT NULL DEFAULT 0,
    specs       JSONB NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS orders (
    id               TEXT PRIMARY KEY,
    customer         JSONB NOT NULL,
    items            JSONB NOT NULL,
    total            NUMERIC(10,2) NOT NULL,
    status           TEXT NOT NULL DEFAULT 'pending',
    payment_method   TEXT NOT NULL DEFAULT 'card',
    payment_status   TEXT NOT NULL DEFAULT 'pending',
    tracking_number  TEXT,
    tracking_carrier TEXT,
    stripe_session_id TEXT,
    admin_notes      TEXT,
    messages         JSONB NOT NULL DEFAULT '[]',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS orders_email_idx
    ON orders ((lower(customer->>'email')));

  CREATE INDEX IF NOT EXISTS orders_created_at_idx
    ON orders (created_at DESC);
`);

console.log("Tables and indexes created.");
await pool.end();
