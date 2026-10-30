"use server";

import { after } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { shippingCost } from "@/lib/shipping";
import { emailNewOrder } from "@/lib/email";
import { getCurrentCustomer } from "@/lib/customerSession";
import { paymentsFor, type DeliveryMethod, type PaymentMethod } from "@/lib/checkout";

type CheckoutItem = {
  slug: string;
  name: string;
  brandName: string;
  size?: string;
  price: number;
  quantity: number;
};

type CheckoutInput = {
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  city?: string;
  requestedDeliveryDate?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  invoice?: {
    companyName: string;
    nui: string;
    fiscalNumber?: string;
    vatNumber?: string;
    address?: string;
  };
  acceptedTerms: boolean;
  items: CheckoutItem[];
};

type CheckoutResult =
  | { success: true; orderNumber: string; shipping: number | null; total: number }
  | { success: false; error: string };

const filled = (v?: string) => Boolean(v?.trim());

export async function submitOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "empty-cart" };
  }
  if (
    !filled(input.clinicName) ||
    !filled(input.contactName) ||
    !filled(input.email) ||
    !filled(input.phone) ||
    !input.acceptedTerms
  ) {
    return { success: false, error: "missing-fields" };
  }
  const allowedPayments = paymentsFor[input.deliveryMethod];
  if (!allowedPayments || !allowedPayments.includes(input.paymentMethod)) {
    return { success: false, error: "missing-fields" };
  }
  const courier = input.deliveryMethod === "courier";
  if (courier && (!filled(input.deliveryAddress) || !filled(input.city))) {
    return { success: false, error: "missing-fields" };
  }
  if (input.invoice && (!filled(input.invoice.companyName) || !filled(input.invoice.nui))) {
    return { success: false, error: "missing-fields" };
  }
  if (input.requestedDeliveryDate && input.requestedDeliveryDate < new Date().toISOString().slice(0, 10)) {
    return { success: false, error: "missing-fields" };
  }

  try {
    const payload = await getPayloadClient();

    const items = await Promise.all(
      input.items.map(async (item) => {
        const found = await payload.find({
          collection: "products",
          where: { slug: { equals: item.slug } },
          limit: 1,
        });
        return {
          product: found.docs[0]?.id,
          name: item.name,
          brandName: item.brandName,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
        };
      }),
    );

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    // Priced on the server from Cilësimet → Dërgesa dhe porositë, never trusted from the form.
    const settings = await payload.findGlobal({ slug: "site-settings" });
    const shipping = shippingCost(input.deliveryMethod, subtotal, settings);
    const total = subtotal + (shipping ?? 0);
    // Taken from the session cookie, never from the form, so an order can't be filed under
    // someone else's account.
    const customer = await getCurrentCustomer();

    const order = await payload.create({
      collection: "orders",
      data: {
        clinicName: input.clinicName,
        contactName: input.contactName,
        email: input.email,
        phone: input.phone,
        deliveryMethod: input.deliveryMethod,
        // Address fields only mean something for courier delivery.
        deliveryAddress: courier ? input.deliveryAddress : undefined,
        city: courier ? input.city : input.city || undefined,
        requestedDeliveryDate: input.requestedDeliveryDate || undefined,
        notes: input.notes,
        paymentMethod: input.paymentMethod,
        needsInvoice: Boolean(input.invoice),
        invoice: input.invoice,
        items,
        subtotal,
        shippingCost: shipping ?? undefined,
        total,
        customer: customer?.id,
      },
    });

    after(() => emailNewOrder(order));
    return { success: true, orderNumber: order.orderNumber ?? String(order.id), shipping, total };
  } catch (err) {
    console.error("submitOrder failed", err);
    return { success: false, error: "server-error" };
  }
}
