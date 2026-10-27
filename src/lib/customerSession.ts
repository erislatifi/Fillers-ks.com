import { cookies } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import type { Customer } from "@/payload-types";

// Customers get their own cookie instead of Payload's `payload-token`, so logging in on the
// shop never replaces (or exposes) an admin's panel session in the same browser.
export const CUSTOMER_COOKIE = "fk-customer";
const MAX_AGE = 60 * 60 * 24 * 30; // matches Customers.auth.tokenExpiration

export async function setCustomerToken(token: string) {
  const store = await cookies();
  store.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearCustomerToken() {
  const store = await cookies();
  store.delete(CUSTOMER_COOKIE);
}

// What client components get to see — never the whole auth document (sessions, lock state…).
export type CustomerProfile = Pick<
  Customer,
  "email" | "clinicName" | "fullName" | "phone" | "city" | "address" | "licenseNumber"
>;

export function toProfile(c: Customer): CustomerProfile {
  const { email, clinicName, fullName, phone, city, address, licenseNumber } = c;
  return { email, clinicName, fullName, phone, city, address, licenseNumber };
}

/** The logged-in clinic, or null. Verifies the JWT through Payload on every call. */
export async function getCurrentCustomer(): Promise<Customer | null> {
  const store = await cookies();
  const token = store.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = await getPayloadClient();
    const { user } = await payload.auth({
      headers: new Headers({ Authorization: `JWT ${token}` }),
    });
    if (!user || user.collection !== "customers") return null;
    return user as Customer;
  } catch {
    return null;
  }
}
