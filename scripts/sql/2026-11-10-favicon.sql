-- 2026-11-10: Cilësimet → Tekstet e faqes → "Ikona në tab-in e browser-it" (favicon).
-- Safe to run more than once. Independent of 2026-11-09-seo.sql (either order works).
-- Generated: npx tsx scripts/schema-sql.ts diff featured favicon  (snapshot after: snapshots/favicon.json)
BEGIN;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "favicon_id" integer;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_favicon_id_media_id_fk') THEN
    EXECUTE 'ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action';
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
COMMIT;
