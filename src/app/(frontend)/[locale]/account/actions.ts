"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getPayloadClient } from "@/lib/payload";
import { clearCustomerToken, getCurrentCustomer, setCustomerToken } from "@/lib/customerSession";

export type AccountFormState = { error?: string; saved?: boolean } | null;

const MIN_PASSWORD = 8;

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

function localeFrom(form: FormData): AppLocale {
  const value = field(form, "locale");
  return (routing.locales as readonly string[]).includes(value) ? (value as AppLocale) : routing.defaultLocale;
}

async function loginAndStoreToken(email: string, password: string) {
  const payload = await getPayloadClient();
  const result = await payload.login({ collection: "customers", data: { email, password } });
  if (!result.token) throw new Error("login returned no token");
  await setCustomerToken(result.token);
}

export async function registerCustomer(_prev: AccountFormState, form: FormData): Promise<AccountFormState> {
  const data = {
    clinicName: field(form, "clinicName"),
    fullName: field(form, "fullName"),
    email: field(form, "email").toLowerCase(),
    phone: field(form, "phone"),
    city: field(form, "city"),
    address: field(form, "address"),
    licenseNumber: field(form, "licenseNumber"),
  };
  const password = String(form.get("password") ?? "");

  if (!data.clinicName || !data.fullName || !data.email || !data.phone || !password) {
    return { error: "missing-fields" };
  }
  if (password.length < MIN_PASSWORD) return { error: "password-short" };
  if (password !== String(form.get("passwordConfirm") ?? "")) return { error: "password-mismatch" };

  try {
    const payload = await getPayloadClient();
    const existing = await payload.count({ collection: "customers", where: { email: { equals: data.email } } });
    if (existing.totalDocs > 0) return { error: "email-taken" };

    await payload.create({ collection: "customers", data: { ...data, password } });
    await loginAndStoreToken(data.email, password);
  } catch (err) {
    console.error("registerCustomer failed", err);
    return { error: "server-error" };
  }

  redirect({ href: "/account", locale: localeFrom(form) });
  return null;
}

export async function loginCustomer(_prev: AccountFormState, form: FormData): Promise<AccountFormState> {
  const email = field(form, "email").toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "missing-fields" };

  try {
    await loginAndStoreToken(email, password);
  } catch (err) {
    // Payload throws LockedAuth after too many attempts; anything else is wrong credentials.
    const name = err instanceof Error ? err.name : "";
    return { error: name === "LockedAuth" ? "locked" : "invalid-login" };
  }

  redirect({ href: "/account", locale: localeFrom(form) });
  return null;
}

export async function logoutCustomer(form: FormData) {
  await clearCustomerToken();
  redirect({ href: "/account", locale: localeFrom(form) });
}

export async function updateCustomerProfile(_prev: AccountFormState, form: FormData): Promise<AccountFormState> {
  const customer = await getCurrentCustomer();
  if (!customer) return { error: "session-expired" };

  const data: Record<string, string> = {
    clinicName: field(form, "clinicName"),
    fullName: field(form, "fullName"),
    phone: field(form, "phone"),
    city: field(form, "city"),
    address: field(form, "address"),
    licenseNumber: field(form, "licenseNumber"),
  };
  if (!data.clinicName || !data.fullName || !data.phone) return { error: "missing-fields" };

  const newPassword = String(form.get("newPassword") ?? "");
  if (newPassword) {
    if (newPassword.length < MIN_PASSWORD) return { error: "password-short" };
    try {
      // Re-check the current password before letting it change.
      const payload = await getPayloadClient();
      await payload.login({
        collection: "customers",
        data: { email: customer.email, password: String(form.get("currentPassword") ?? "") },
      });
    } catch {
      return { error: "wrong-password" };
    }
    data.password = newPassword;
  }

  try {
    const payload = await getPayloadClient();
    await payload.update({ collection: "customers", id: customer.id, data });
    // Re-issue the session cookie with a token from the new password.
    if (newPassword) await loginAndStoreToken(customer.email, newPassword);
  } catch (err) {
    console.error("updateCustomerProfile failed", err);
    return { error: "server-error" };
  }

  // Re-render the account page so the form's default values show what was just saved.
  revalidatePath("/[locale]/account", "page");
  return { saved: true };
}
