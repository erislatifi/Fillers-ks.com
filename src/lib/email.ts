import nodemailer from "nodemailer";
import { getPayloadClient } from "@/lib/payload";
import type { ContactMessage, Order } from "@/payload-types";

// Emails go out only when SMTP is configured in the host's env vars (SMTP_HOST, SMTP_PORT,
// SMTP_USER, SMTP_PASS, optional ORDER_EMAIL_FROM). Without them every function is a no-op,
// and orders/messages are still saved in the admin. Callers run these inside `after()`.
function transport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function staffInbox() {
  const payload = await getPayloadClient();
  const s = await payload.findGlobal({ slug: "site-settings", locale: "sq" });
  return s.orderNotificationEmail || s.contactEmail || process.env.ORDER_EMAIL_TO || null;
}

async function send(to: string, subject: string, text: string, replyTo?: string) {
  const t = transport();
  if (!t) return;
  try {
    await t.sendMail({ from: process.env.ORDER_EMAIL_FROM || process.env.SMTP_USER, to, subject, text, replyTo });
  } catch (err) {
    console.error(`Email "${subject}" to ${to} failed`, err);
  }
}

const eur = (n: number | null | undefined) => (n == null ? "konfirmohet nga ekipi" : `€${n.toFixed(2)}`);

export async function emailNewOrder(order: Order) {
  if (!transport()) return;
  const lines = order.items.map((i) => `- ${i.quantity} × ${i.name}${i.size ? ` (${i.size})` : ""} — €${(i.price * i.quantity).toFixed(2)}`);
  const summary = [
    `Porosia ${order.orderNumber}`,
    "",
    ...lines,
    "",
    `Produktet: €${order.subtotal.toFixed(2)}`,
    `Transporti: ${eur(order.shippingCost)}`,
    `Totali: ${eur(order.total)}`,
    "",
    `Marrja: ${order.deliveryMethod === "courier" ? `Korrier — ${order.deliveryAddress ?? ""}, ${order.city ?? ""}` : "Në zyrë"}`,
    `Pagesa: ${{ pickup: "Në zyrë", bank_transfer: "Transfer bankar", cash_on_delivery: "Cash te korrieri" }[order.paymentMethod]}`,
  ].join("\n");

  const inbox = await staffInbox();
  if (inbox) {
    await send(
      inbox,
      `Porosi e re ${order.orderNumber} — ${order.clinicName}`,
      `${summary}\n\nKlinika: ${order.clinicName}\nKontakti: ${order.contactName}, ${order.phone}, ${order.email}${
        order.needsInvoice ? `\nFaturë për: ${order.invoice?.companyName} (NUI ${order.invoice?.nui})` : ""
      }${order.notes ? `\nShënime: ${order.notes}` : ""}`,
      order.email,
    );
  }
  await send(
    order.email,
    `Porosia juaj ${order.orderNumber} u pranua — Fillers Kosovo`,
    `Përshëndetje ${order.contactName},\n\nFaleminderit për porosinë! Ekipi ynë do t'ju kontaktojë brenda 1 dite pune për konfirmim.\n\n${summary}\n\nFillers Kosovo`,
  );
}

export async function emailContactMessage(msg: Pick<ContactMessage, "name" | "clinicName" | "email" | "phone" | "message">) {
  if (!transport()) return;
  const inbox = await staffInbox();
  if (!inbox) return;
  await send(
    inbox,
    `Mesazh i ri nga ${msg.name}${msg.clinicName ? ` (${msg.clinicName})` : ""}`,
    `${msg.message}\n\n— ${msg.name}, ${msg.email}${msg.phone ? `, ${msg.phone}` : ""}`,
    msg.email,
  );
}
