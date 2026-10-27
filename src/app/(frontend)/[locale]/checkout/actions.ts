"use server";

import { getPayloadClient } from "@/lib/payload";
import { getCurrentCustomer } from "@/lib/customerSession";

type CheckoutItem = {
  slug: string;
  name: string;
  brandName: string;
  size?: string;
  price: number;
  quantity: number;
};

type PaymentMethod = "pickup" | "bank_transfer";

type CheckoutInput = {
  clinicName: string;
  contactName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
  city: string;
  requestedDeliveryDate: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  items: CheckoutItem[];
};

type CheckoutResult =
  | { success: true; orderNumber: string }
  | { success: false; error: string };

export async function submitOrder(input: CheckoutInput): Promise<CheckoutResult> {
  if (!input.items || input.items.length === 0) {
    return { success: false, error: "empty-cart" };
  }
  if (
    !input.clinicName?.trim() ||
    !input.contactName?.trim() ||
    !input.email?.trim() ||
    !input.phone?.trim() ||
    !input.deliveryAddress?.trim() ||
    !input.city?.trim() ||
    !input.requestedDeliveryDate
  ) {
    return { success: false, error: "missing-fields" };
  }
  if (input.paymentMethod !== "pickup" && input.paymentMethod !== "bank_transfer") {
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
        deliveryAddress: input.deliveryAddress,
        city: input.city,
        requestedDeliveryDate: input.requestedDeliveryDate,
        notes: input.notes,
        paymentMethod: input.paymentMethod,
        items,
        subtotal,
        customer: customer?.id,
      },
    });

    return { success: true, orderNumber: order.orderNumber ?? String(order.id) };
  } catch (err) {
    console.error("submitOrder failed", err);
    return { success: false, error: "server-error" };
  }
}
