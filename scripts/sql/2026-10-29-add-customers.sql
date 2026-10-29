-- Adds the clinic-accounts schema (Customers collection + orders.customer) to the
-- production Postgres database. Run once in Supabase → SQL Editor BEFORE merging the
-- `account` branch into main. Safe to re-run: every statement is IF NOT EXISTS.
-- Mirrors what Payload's schema push generates (see the local SQLite schema).

BEGIN;

CREATE TABLE IF NOT EXISTS "customers" (
  "id" serial PRIMARY KEY NOT NULL,
  "clinic_name" varchar NOT NULL,
  "full_name" varchar NOT NULL,
  "phone" varchar NOT NULL,
  "city" varchar,
  "address" varchar,
  "license_number" varchar,
  "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  "email" varchar NOT NULL,
  "reset_password_token" varchar,
  "reset_password_expiration" timestamp(3) with time zone,
  "salt" varchar,
  "hash" varchar,
  "login_attempts" numeric DEFAULT 0,
  "lock_until" timestamp(3) with time zone
);
CREATE INDEX IF NOT EXISTS "customers_updated_at_idx" ON "customers" ("updated_at");
CREATE INDEX IF NOT EXISTS "customers_created_at_idx" ON "customers" ("created_at");
CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_idx" ON "customers" ("email");

CREATE TABLE IF NOT EXISTS "customers_sessions" (
  "_order" integer NOT NULL,
  "_parent_id" integer NOT NULL REFERENCES "customers"("id") ON DELETE cascade,
  "id" varchar PRIMARY KEY NOT NULL,
  "created_at" timestamp(3) with time zone,
  "expires_at" timestamp(3) with time zone NOT NULL
);
CREATE INDEX IF NOT EXISTS "customers_sessions_order_idx" ON "customers_sessions" ("_order");
CREATE INDEX IF NOT EXISTS "customers_sessions_parent_id_idx" ON "customers_sessions" ("_parent_id");

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "customer_id" integer REFERENCES "customers"("id") ON DELETE set null;
CREATE INDEX IF NOT EXISTS "orders_customer_idx" ON "orders" ("customer_id");

ALTER TABLE "payload_locked_documents_rels"
  ADD COLUMN IF NOT EXISTS "customers_id" integer REFERENCES "customers"("id") ON DELETE cascade;
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_customers_id_idx"
  ON "payload_locked_documents_rels" ("customers_id");

ALTER TABLE "payload_preferences_rels"
  ADD COLUMN IF NOT EXISTS "customers_id" integer REFERENCES "customers"("id") ON DELETE cascade;
CREATE INDEX IF NOT EXISTS "payload_preferences_rels_customers_id_idx"
  ON "payload_preferences_rels" ("customers_id");

-- These tables hold password hashes: keep them out of Supabase's public Data API.
-- Payload connects as the table owner (postgres), which RLS doesn't restrict.
ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "customers_sessions" ENABLE ROW LEVEL SECURITY;

COMMIT;
