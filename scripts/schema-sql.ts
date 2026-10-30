/**
 * Generates the exact Postgres SQL production needs after a schema change, without
 * touching any database. Production doesn't sync its schema by itself (see CLAUDE.md),
 * so every field/collection change ships with an SQL file run in Supabase → SQL Editor.
 *
 *   npx tsx scripts/schema-sql.ts snapshot <name>          # save the current config's schema
 *   npx tsx scripts/schema-sql.ts diff <before> <after>    # print SQL from one snapshot to the other
 *
 * Snapshots live in scripts/sql/snapshots/<name>.json. Take a snapshot of `main` (what
 * production runs) before changing collections, another after, then diff them.
 */
import fs from "fs";
import path from "path";

const [cmd, a, b] = process.argv.slice(2);
const dir = path.resolve("scripts/sql/snapshots");

// Force the Postgres adapter; disableDBConnect below means nothing ever connects to it.
process.env.POSTGRES_URI = "postgres://schema-only:unused@localhost:1/unused";
process.env.PAYLOAD_SECRET ||= "schema-only";

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");
const payload = await getPayload({ config, disableDBConnect: true, disableOnInit: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = payload.db as any;
const kit = db.requireDrizzleKit();

if (cmd === "snapshot" && a) {
  fs.mkdirSync(dir, { recursive: true });
  const json = await kit.generateDrizzleJson(db.schema);
  fs.writeFileSync(path.join(dir, `${a}.json`), JSON.stringify(json, null, 2));
  console.log(`Saved scripts/sql/snapshots/${a}.json`);
} else if (cmd === "diff" && a && b) {
  // "empty" = a blank database, e.g. to build a full schema for testing the SQL.
  const read = (n: string) =>
    n === "empty" ? db.defaultDrizzleSnapshot : JSON.parse(fs.readFileSync(path.join(dir, `${n}.json`), "utf8"));
  const statements: string[] = await kit.generateMigration(read(a), read(b));
  console.log(statements.length ? statements.join("\n") : "-- no schema changes");
} else {
  console.error("Usage: schema-sql.ts snapshot <name> | diff <before> <after>");
  process.exit(1);
}
process.exit(0);
