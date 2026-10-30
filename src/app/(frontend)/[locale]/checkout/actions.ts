"use server";

import { after } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { shippingCost } from "@/lib/shipping";
import { emailNewOrder } from "@/lib/email";
import { getCurrentCustomer } from "@/lib/customerSession";
import { checkoutChoices, paymentsFor, type DeliveryMethod, type PaymentMethod } from "@/lib/checkout";

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

    // The cart lives in the browser, so only slug + quantity are trusted from it; price,
    // name and availability always come from the database.
    const items = await Promise.all(
      input.items.map(async (item) => {
        const found = await payload.find({
          collection: "products",
          where: { slug: { equals: item.slug } },
          limit: 1,
          depth: 1,
        });
        const product = found.docs[0];
        const quantity = Math.floor(Number(item.quantity));
        if (
          !product ||
          product.visible === false ||
          product.quoteOnly ||
          product.stockStatus === "out_of_stock" ||
          !(quantity >= 1 && quantity <= 999)
        ) {
          return null;
        }
        return {
          product: product.id,
          name: product.name,
          brandName: typeof product.brand === "object" && product.brand ? product.brand.name : item.brandName,
          size: product.size ?? undefined,
          price: product.price ?? 0,
          quantity,
        };
      }),
    );
    if (items.some((i) => i === null)) return { success: false, error: "unavailable" };
    const validItems = items.filter((i): i is NonNullable<typeof i> => i !== null);

    const subtotal = validItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    // Priced on the server from Cilësimet → Dërgesa dhe porositë, never trusted from the form.
    const settings = await payload.findGlobal({ slug: "site-settings" });
    // Options the admin switched off are refused even if a stale form still sends them.
    const choices = checkoutChoices(settings.checkoutOptions);
    if (!choices.deliveries.includes(input.deliveryMethod) || !choices.payments(input.deliveryMethod).includes(input.paymentMethod)) {
      return { success: false, error: "missing-fields" };
    }
    if (subtotal < choices.minOrder) return { success: false, error: "min-order" };
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
        items: validItems,
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
