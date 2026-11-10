-- 2026-11-10: Cilësimet → Tekstet e faqes: "Ikona në tab-in e browser-it" (favicon),
-- "Madhësia e logos", "Shfaq emrin dhe sloganin pranë gjysmëhënës", "Emri pranë logos".
-- Safe to run more than once. Independent of 2026-11-09-seo.sql (either order works).
-- Generated: npx tsx scripts/schema-sql.ts diff featured favicon  (snapshot after: snapshots/favicon.json)
BEGIN;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_logo_size') THEN
    EXECUTE 'CREATE TYPE "public"."enum_site_settings_logo_size" AS ENUM(''small'', ''medium'', ''large'')';
  END IF;
END $$;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "favicon_id" integer;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logo_size" "enum_site_settings_logo_size" DEFAULT 'medium';
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logo_text" boolean DEFAULT true;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "brand_name" varchar;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'site_settings_favicon_id_media_id_fk') THEN
    EXECUTE 'ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_favicon_id_media_id_fk" FOREIGN KEY ("favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action';
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS "site_settings_favicon_idx" ON "site_settings" USING btree ("favicon_id");
COMMIT;
