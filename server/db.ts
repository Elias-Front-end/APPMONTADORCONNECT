import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Diagnostic log to help user debug connection issues
try {
  const url = new URL(process.env.DATABASE_URL);
  console.log(`[DB] Configuring connection pool to host: ${url.hostname}, port: ${url.port}, database: ${url.pathname.slice(1)}`);
} catch (e) {
  console.error("[DB] Invalid DATABASE_URL format provided");
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Máximo de conexões no pool
  idleTimeoutMillis: 30000, // Tempo de espera para fechar conexões ociosas
  connectionTimeoutMillis: 2000, // Timeout para novas conexões
});
export const db = drizzle(pool, { schema });
