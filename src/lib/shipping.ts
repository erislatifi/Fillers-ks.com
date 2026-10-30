import type { SiteSetting } from "@/payload-types";
import type { DeliveryMethod } from "@/lib/checkout";

type ShippingSettings = Pick<SiteSetting, "courierFee" | "freeShippingThreshold">;

/**
 * Delivery cost for an order. `null` means "confirmed by our team" — courier delivery
 * with no fee configured in Cilësimet → Dërgesa dhe porositë.
 */
export function shippingCost(method: DeliveryMethod, subtotal: number, settings: ShippingSettings): number | null {
  if (method === "pickup") return 0;
  const threshold = settings.freeShippingThreshold;
  if (threshold && threshold > 0 && subtotal >= threshold) return 0;
  return settings.courierFee && settings.courierFee > 0 ? settings.courierFee : null;
}
