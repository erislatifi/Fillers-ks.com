/**
 * Prints an SQL statement that sets a new admin password, for when you're locked out
 * of /admin and "forgot password" can't email you. Run it in your own terminal:
 *
 *   node scripts/admin-password-sql.mjs
 *
 * It asks for the email and the new password, then prints SQL to paste into
 * Supabase → SQL Editor. The SQL contains only the salted hash, never the password.
 * Hashing matches Payload's local strategy (pbkdf2, 25000 rounds, 512 bytes, sha256).
 */
import crypto from "node:crypto";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

// Read line by line so it works both typed in a terminal and piped in.
const rl = readline.createInterface({ input });
const lines = rl[Symbol.asyncIterator]();
const ask = async (prompt) => {
  output.write(prompt);
  const { value } = await lines.next();
  return value ?? "";
};
const email = (await ask("Email i adminit: ")).trim().toLowerCase();
const password = await ask("Fjalëkalimi i ri (të paktën 8 shenja): ");
rl.close();

if (!email || password.length < 8) {
  console.error("\nEmail-i mungon ose fjalëkalimi është më i shkurtër se 8 shenja.");
  process.exit(1);
}

const salt = crypto.randomBytes(32).toString("hex");
const hash = crypto.pbkdf2Sync(password, salt, 25000, 512, "sha256").toString("hex");

console.log(`
-- Kopjoje krejt këtë dhe ekzekutoje te Supabase → SQL Editor:
UPDATE "users"
SET "salt" = '${salt}',
    "hash" = '${hash}',
    "login_attempts" = 0,
    "lock_until" = NULL,
    "reset_password_token" = NULL,
    "reset_password_expiration" = NULL
WHERE "email" = '${email.replace(/'/g, "''")}';
-- Duhet të shkruajë "Success" — pastaj hyr te /admin me fjalëkalimin e ri.
`);
