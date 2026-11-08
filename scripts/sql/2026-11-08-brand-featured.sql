-- 2026-11-08: Brendet → "Shfaqe në ballinë" (which brands appear in the homepage logo strip).
-- Safe to run more than once. Every existing brand starts as shown (true).
-- Generated: npx tsx scripts/schema-sql.ts diff visible featured  (snapshot after: snapshots/featured.json)
BEGIN;
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT true;
COMMIT;
