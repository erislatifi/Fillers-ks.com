"use server";

import { getPayloadClient } from "@/lib/payload";

export type FormState = { ok?: boolean; error?: string } | null;

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();
const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// `website` is a hidden honeypot input: people never fill it, simple spam bots do.
const isBot = (form: FormData) => field(form, "website") !== "";

export async function sendContactMessage(_prev: FormState, form: FormData): Promise<FormState> {
  if (isBot(form)) return { ok: true };
  const data = {
    name: field(form, "name"),
    clinicName: field(form, "clinicName"),
    email: field(form, "email").toLowerCase(),
    phone: field(form, "phone"),
    message: field(form, "message"),
  };
  if (!data.name || !looksLikeEmail(data.email) || data.message.length < 5) return { error: "missing-fields" };
  if (data.message.length > 5000) return { error: "too-long" };

  try {
    const payload = await getPayloadClient();
    await payload.create({ collection: "contact-messages", data });
    return { ok: true };
  } catch (err) {
    console.error("sendContactMessage failed", err);
    return { error: "server-error" };
  }
}

export async function subscribeNewsletter(_prev: FormState, form: FormData): Promise<FormState> {
  if (isBot(form)) return { ok: true };
  const email = field(form, "email").toLowerCase();
  if (!looksLikeEmail(email)) return { error: "missing-fields" };
  const locale = field(form, "locale") === "en" ? "en" : "sq";

  try {
    const payload = await getPayloadClient();
    const existing = await payload.count({ collection: "subscribers", where: { email: { equals: email } } });
    // Already subscribed counts as success — don't reveal who is on the list.
    if (existing.totalDocs === 0) await payload.create({ collection: "subscribers", data: { email, locale } });
    return { ok: true };
  } catch (err) {
    console.error("subscribeNewsletter failed", err);
    return { error: "server-error" };
  }
}
