/**
 * Local SQLite only: Payload's dev schema push sometimes stops with
 * "SQLITE_ERROR: index X already exists" after the schema changed (see CLAUDE.md). This
 * starts Payload in-process, drops each index it complains about and retries until the
 * push completes. Stop `next dev` first. Never touches production (Postgres).
 *
 *   npx tsx scripts/fix-sqlite-indexes.ts
 */
import { readFileSync } from "fs";
import path from "path";
import { createClient } from "@libsql/client";

for (const line of readFileSync(path.resolve(".env.local"), "utf-8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
}
if (process.env.POSTGRES_URI) {
  console.error("POSTGRES_URI is set — this script is for the local SQLite database only.");
  process.exit(1);
}

const db = createClient({ url: process.env.DATABASE_URI || "file:./payload.db" });
const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

for (let attempt = 1; attempt <= 30; attempt++) {
  for (const t of (await db.execute("select name from sqlite_master where type='table' and name like '\\_\\_new%' escape '\\'")).rows) {
    await db.execute(`DROP TABLE IF EXISTS \`${t.name}\``);
  }
  try {
    await getPayload({ config, key: `fix-indexes-${attempt}` });
    console.log(`Schema push OK (attempt ${attempt}).`);
    process.exit(0);
  } catch (err) {
    const text = String((err as { cause?: unknown })?.cause ?? err) + String(err);
    const index = text.match(/index (\S+) already exists/)?.[1];
    if (!index) throw err;
    console.log(`Dropping leftover index ${index}`);
    await db.execute(`DROP INDEX IF EXISTS \`${index}\``);
  }
}
console.error("Gave up after 30 attempts.");
process.exit(1);
