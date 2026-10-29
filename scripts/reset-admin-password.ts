/**
 * Sets a new password for an admin-panel user (`users`), e.g. when it's forgotten in
 * production and no email is configured for "forgot password".
 *
 * Production (values typed inline in your own terminal — never saved to a file):
 *   $env:POSTGRES_URI="…"; $env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_NEW_PASSWORD="…"; npm run reset:admin
 *
 * Without ADMIN_EMAIL it only lists the admin emails. Without POSTGRES_URI it works on the
 * local SQLite file. It touches nothing but that one user row: the config holds only
 * `users`, and schema push is off, so the production schema is never altered.
 */
import { buildConfig, getPayload } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { Users } from "../src/collections/Users";

const { POSTGRES_URI, ADMIN_EMAIL, ADMIN_NEW_PASSWORD } = process.env;

const config = buildConfig({
  collections: [Users],
  // Password hashes don't depend on the secret, so any value works for this one-off run.
  secret: process.env.PAYLOAD_SECRET || "reset-admin-password-tmp-secret",
  db: POSTGRES_URI
    ? postgresAdapter({ pool: { connectionString: POSTGRES_URI }, push: false })
    : sqliteAdapter({ client: { url: process.env.DATABASE_URI || "file:./payload.db" }, push: false }),
});

const payload = await getPayload({ config, key: "reset-admin-password" });
console.log(`Database: ${POSTGRES_URI ? "PRODUCTION Postgres" : "local SQLite (payload.db)"}`);

const admins = await payload.find({ collection: "users", limit: 50, depth: 0 });
console.log(`Admin users: ${admins.docs.map((u) => u.email).join(", ") || "(none)"}`);

if (!ADMIN_EMAIL) {
  console.log("Set ADMIN_EMAIL (and ADMIN_NEW_PASSWORD) to change a password.");
  process.exit(0);
}
if (!ADMIN_NEW_PASSWORD || ADMIN_NEW_PASSWORD.length < 8) {
  console.error("ADMIN_NEW_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

const user = admins.docs.find((u) => u.email.toLowerCase() === ADMIN_EMAIL.trim().toLowerCase());
if (!user) {
  console.error(`No admin user with email ${ADMIN_EMAIL}.`);
  process.exit(1);
}

await payload.update({
  collection: "users",
  id: user.id,
  // Also clears a lockout from earlier wrong guesses.
  data: { password: ADMIN_NEW_PASSWORD, loginAttempts: 0, lockUntil: null },
});
console.log(`Password changed for ${user.email}. You can sign in at /admin now.`);
process.exit(0);
