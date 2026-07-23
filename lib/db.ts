import { Pool } from "pg";

const g = global as typeof globalThis & { _pgPool?: Pool };

export function getPool(): Pool {
  if (g._pgPool) return g._pgPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL environment variable is not set");

  g._pgPool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  return g._pgPool;
}
