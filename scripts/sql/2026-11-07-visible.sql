-- 2026-11-07: "I dukshëm në faqe" for brands, categories, testimonials, articles and promotions.
-- Untick it in the admin to take something off the site without deleting it.
-- Safe to run more than once. Every existing row starts as visible (true).
-- Generated: npx tsx scripts/schema-sql.ts diff agents visible  (snapshot after: snapshots/visible.json)
BEGIN;
ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "visible" boolean DEFAULT true;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "visible" boolean DEFAULT true;
ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "visible" boolean DEFAULT true;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "visible" boolean DEFAULT true;
ALTER TABLE "promotions" ADD COLUMN IF NOT EXISTS "visible" boolean DEFAULT true;
COMMIT;
