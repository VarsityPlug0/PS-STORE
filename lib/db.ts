import { Pool as PgPool } from "pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

type AnyPool = PgPool | NeonPool;
const g = global as typeof globalThis & { _pgPool?: AnyPool };

export function getPool(): AnyPool {
  if (g._pgPool) return g._pgPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL environment variable is not set");

  if (connectionString.includes("localhost")) {
    g._pgPool = new PgPool({ connectionString });
  } else {
    neonConfig.webSocketConstructor = ws;
    g._pgPool = new NeonPool({ connectionString });
  }

  return g._pgPool;
}
