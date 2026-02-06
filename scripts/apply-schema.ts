
import { pool } from "../server/db";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Reading schema_fix.sql...");
  const sqlPath = path.join(process.cwd(), "schema_fix.sql");
  const sql = fs.readFileSync(sqlPath, "utf-8");

  console.log("Executing schema fix...");
  try {
    await pool.query(sql);
    console.log("Schema fix applied successfully!");
  } catch (err) {
    console.error("Error applying schema fix:", err);
  } finally {
    await pool.end();
  }
}

main();
