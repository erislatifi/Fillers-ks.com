-- 2026-11-11: agents tablet app (/agjent): Vizitat, Lokacionet e agjenteve, porosia me zbritje/nenshkrim/burim,
-- kufiri i zbritjes per agjentin. Safe to run more than once. Requires 2026-11-10-favicon.sql (already run).
-- Generated: npx tsx scripts/schema-sql.ts diff favicon agent-tablet  (snapshot after: snapshots/agent-tablet.json)
BEGIN;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_source') THEN EXECUTE 'CREATE TYPE "public"."enum_orders_source" AS ENUM(''website'', ''agent_tablet'')'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_visits_status') THEN EXECUTE 'CREATE TYPE "public"."enum_visits_status" AS ENUM(''planned'', ''in_progress'', ''done'', ''cancelled'')'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_visits_interest') THEN EXECUTE 'CREATE TYPE "public"."enum_visits_interest" AS ENUM(''low'', ''medium'', ''high'')'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_agent_locations_kind') THEN EXECUTE 'CREATE TYPE "public"."enum_agent_locations_kind" AS ENUM(''interval'', ''check_in'', ''check_out'')'; END IF; END $$;
CREATE TABLE IF NOT EXISTS "visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"clinic_name" varchar NOT NULL,
	"status" "enum_visits_status" DEFAULT 'planned',
	"agent_id" integer NOT NULL,
	"customer_id" integer,
	"scheduled_at" timestamp(3) with time zone,
	"check_in_at" timestamp(3) with time zone,
	"check_out_at" timestamp(3) with time zone,
	"interest" "enum_visits_interest",
	"next_visit_at" timestamp(3) with time zone,
	"notes" varchar,
	"check_in_lat" numeric,
	"check_in_lng" numeric,
	"client_id" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "agent_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" integer NOT NULL,
	"recorded_at" timestamp(3) with time zone NOT NULL,
	"kind" "enum_agent_locations_kind" DEFAULT 'interval',
	"lat" numeric NOT NULL,
	"lng" numeric NOT NULL,
	"accuracy" numeric,
	"visit_id" integer,
	"client_id" varchar,
	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_percent" numeric;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "discount_amount" numeric;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "source" "enum_orders_source" DEFAULT 'website';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "visit_id" integer;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "signature_id" integer;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "signed_by" varchar;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "client_id" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "max_discount_percent" numeric DEFAULT 0;
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "visits_id" integer;
ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "agent_locations_id" integer;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visits_agent_id_users_id_fk') THEN EXECUTE 'ALTER TABLE "visits" ADD CONSTRAINT "visits_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'visits_customer_id_customers_id_fk') THEN EXECUTE 'ALTER TABLE "visits" ADD CONSTRAINT "visits_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agent_locations_agent_id_users_id_fk') THEN EXECUTE 'ALTER TABLE "agent_locations" ADD CONSTRAINT "agent_locations_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agent_locations_visit_id_visits_id_fk') THEN EXECUTE 'ALTER TABLE "agent_locations" ADD CONSTRAINT "agent_locations_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE set null ON UPDATE no action'; END IF; END $$;
CREATE INDEX IF NOT EXISTS "visits_agent_idx" ON "visits" USING btree ("agent_id");
CREATE INDEX IF NOT EXISTS "visits_customer_idx" ON "visits" USING btree ("customer_id");
CREATE UNIQUE INDEX IF NOT EXISTS "visits_client_id_idx" ON "visits" USING btree ("client_id");
CREATE INDEX IF NOT EXISTS "visits_updated_at_idx" ON "visits" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "visits_created_at_idx" ON "visits" USING btree ("created_at");
CREATE INDEX IF NOT EXISTS "agent_locations_agent_idx" ON "agent_locations" USING btree ("agent_id");
CREATE INDEX IF NOT EXISTS "agent_locations_visit_idx" ON "agent_locations" USING btree ("visit_id");
CREATE UNIQUE INDEX IF NOT EXISTS "agent_locations_client_id_idx" ON "agent_locations" USING btree ("client_id");
CREATE INDEX IF NOT EXISTS "agent_locations_updated_at_idx" ON "agent_locations" USING btree ("updated_at");
CREATE INDEX IF NOT EXISTS "agent_locations_created_at_idx" ON "agent_locations" USING btree ("created_at");
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_visit_id_visits_id_fk') THEN EXECUTE 'ALTER TABLE "orders" ADD CONSTRAINT "orders_visit_id_visits_id_fk" FOREIGN KEY ("visit_id") REFERENCES "public"."visits"("id") ON DELETE set null ON UPDATE no action'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_signature_id_media_id_fk') THEN EXECUTE 'ALTER TABLE "orders" ADD CONSTRAINT "orders_signature_id_media_id_fk" FOREIGN KEY ("signature_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_visits_fk') THEN EXECUTE 'ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_visits_fk" FOREIGN KEY ("visits_id") REFERENCES "public"."visits"("id") ON DELETE cascade ON UPDATE no action'; END IF; END $$;
DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payload_locked_documents_rels_agent_locations_fk') THEN EXECUTE 'ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_agent_locations_fk" FOREIGN KEY ("agent_locations_id") REFERENCES "public"."agent_locations"("id") ON DELETE cascade ON UPDATE no action'; END IF; END $$;
CREATE INDEX IF NOT EXISTS "orders_visit_idx" ON "orders" USING btree ("visit_id");
CREATE INDEX IF NOT EXISTS "orders_signature_idx" ON "orders" USING btree ("signature_id");
CREATE UNIQUE INDEX IF NOT EXISTS "orders_client_id_idx" ON "orders" USING btree ("client_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_visits_id_idx" ON "payload_locked_documents_rels" USING btree ("visits_id");
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_agent_locations_id_idx" ON "payload_locked_documents_rels" USING btree ("agent_locations_id");
COMMIT;
