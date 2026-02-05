import { defineConfig } from "drizzle-kit";

// Construct DATABASE_URL from individual variables if not set
if (!process.env.DATABASE_URL && process.env.DB_POSTGRESDB_HOST) {
  const host = process.env.DB_POSTGRESDB_HOST;
  const port = process.env.DB_POSTGRESDB_PORT || "5432";
  const user = process.env.DB_POSTGRESDB_USER || "postgres";
  const password = process.env.DB_POSTGRESDB_PASSWORD;
  const dbName = process.env.DB_POSTGRESDB_DATABASE;

  if (password && dbName) {
    process.env.DATABASE_URL = `postgres://${user}:${password}@${host}:${port}/${dbName}?sslmode=disable`;
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
