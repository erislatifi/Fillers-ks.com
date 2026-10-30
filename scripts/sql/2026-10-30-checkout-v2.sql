-- Checkout v2: delivery method (pickup / courier), cash on delivery, optional delivery
-- date/address/city, and business invoice details on orders.
-- Run once in Supabase → SQL Editor BEFORE merging `checkout-v2` into main.
-- Safe to re-run: every statement is idempotent. Only adds things or relaxes NOT NULL —
-- existing orders keep their data (they get delivery_method = 'pickup').

BEGIN;

DO $$ BEGIN
  CREATE TYPE "public"."enum_orders_delivery_method" AS ENUM ('pickup', 'courier');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TYPE "public"."enum_orders_payment_method" ADD VALUE IF NOT EXISTS 'cash_on_delivery';

-- `city` was added to the code in August but never reached production (found with
-- check-missing-columns.sql on 2026-10-30), so live checkout couldn't save orders.
ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "city" varchar,
  ADD COLUMN IF NOT EXISTS "delivery_method" "public"."enum_orders_delivery_method" DEFAULT 'pickup' NOT NULL,
  ADD COLUMN IF NOT EXISTS "needs_invoice" boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS "invoice_company_name" varchar,
  ADD COLUMN IF NOT EXISTS "invoice_nui" varchar,
  ADD COLUMN IF NOT EXISTS "invoice_fiscal_number" varchar,
  ADD COLUMN IF NOT EXISTS "invoice_vat_number" varchar,
  ADD COLUMN IF NOT EXISTS "invoice_address" varchar;

-- Pickup orders have no address/city, and the delivery date is now optional.
ALTER TABLE "orders"
  ALTER COLUMN "city" DROP NOT NULL,
  ALTER COLUMN "delivery_address" DROP NOT NULL,
  ALTER COLUMN "requested_delivery_date" DROP NOT NULL;

COMMIT;
