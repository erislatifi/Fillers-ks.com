import type { SiteSetting } from "@/payload-types";

export type DeliveryMethod = "pickup" | "courier";
// `pickup` = paid at our office (value kept from before delivery methods existed).
export type PaymentMethod = "pickup" | "bank_transfer" | "cash_on_delivery";

// Which payments each delivery method allows. Shared by the form and the server check.
export const paymentsFor: Record<DeliveryMethod, PaymentMethod[]> = {
  pickup: ["pickup", "bank_transfer"],
  courier: ["cash_on_delivery", "bank_transfer"],
};

type Options = SiteSetting["checkoutOptions"];

/**
 * Delivery and payment choices after applying Cilësimet → Dërgesa dhe porositë.
 * An unset switch counts as on; if the admin switched everything off, the defaults
 * stay so checkout can never end up with no way to order.
 */
export function checkoutChoices(options: Options) {
  const on = (v: boolean | null | undefined) => v !== false;
  const paymentOn: Record<PaymentMethod, boolean> = {
    pickup: on(options?.officePaymentEnabled),
    bank_transfer: on(options?.bankTransferEnabled),
    cash_on_delivery: on(options?.cashOnDeliveryEnabled),
  };
  const deliveryOn: Record<DeliveryMethod, boolean> = {
    pickup: on(options?.pickupEnabled),
    courier: on(options?.courierEnabled),
  };

  const payments = (d: DeliveryMethod) => paymentsFor[d].filter((p) => paymentOn[p]);
  let deliveries = (Object.keys(paymentsFor) as DeliveryMethod[]).filter((d) => deliveryOn[d] && payments(d).length > 0);
  if (deliveries.length === 0) deliveries = ["pickup", "courier"];

  return {
    deliveries,
    payments: (d: DeliveryMethod) => (payments(d).length ? payments(d) : paymentsFor[d]),
    minOrder: options?.minOrderAmount && options.minOrderAmount > 0 ? options.minOrderAmount : 0,
  };
}
