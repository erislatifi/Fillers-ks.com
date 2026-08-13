import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type OrderItem = {
  slug: string;
  name: string;
  brandName: string;
  price: number;
  size?: string;
  quantity: number;
};

type OrderPayload = {
  customer: {
    fullName: string;
    clinicName?: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    notes?: string;
  };
  items: OrderItem[];
  subtotal: number;
};

function isValidOrder(body: unknown): body is OrderPayload {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  const c = b.customer as Record<string, unknown> | undefined;
  return (
    !!c &&
    typeof c.fullName === "string" &&
    c.fullName.trim().length > 0 &&
    typeof c.phone === "string" &&
    c.phone.trim().length > 0 &&
    typeof c.email === "string" &&
    c.email.trim().length > 0 &&
    typeof c.address === "string" &&
    c.address.trim().length > 0 &&
    typeof c.city === "string" &&
    c.city.trim().length > 0 &&
    Array.isArray(b.items) &&
    b.items.length > 0
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!isValidOrder(body)) {
    return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
  }

  const orderNumber = `FK-${Date.now().toString(36).toUpperCase()}`;
  const { customer, items, subtotal } = body;

  const itemsText = items
    .map((i) => `- ${i.name}${i.size ? ` (${i.size})` : ""} x${i.quantity} — €${(i.price * i.quantity).toFixed(2)}`)
    .join("\n");

  const emailBody = `New order ${orderNumber} (Cash on Delivery)

Customer: ${customer.fullName}
Clinic: ${customer.clinicName || "-"}
Phone: ${customer.phone}
Email: ${customer.email}
Address: ${customer.address}, ${customer.city}
Notes: ${customer.notes || "-"}

Items:
${itemsText}

Subtotal: €${subtotal.toFixed(2)}
Payment method: Cash on Delivery
`;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, ORDER_EMAIL_TO, ORDER_EMAIL_FROM } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && ORDER_EMAIL_TO) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      await transporter.sendMail({
        from: ORDER_EMAIL_FROM || SMTP_USER,
        to: ORDER_EMAIL_TO,
        replyTo: customer.email,
        subject: `New order ${orderNumber} — ${customer.fullName}`,
        text: emailBody,
      });
    } catch (err) {
      console.error("Order email failed to send:", err);
      return NextResponse.json({ error: "Failed to send order notification" }, { status: 502 });
    }
  } else {
    console.warn("SMTP not configured — order not emailed. Order details:\n" + emailBody);
  }

  return NextResponse.json({ orderNumber });
}
