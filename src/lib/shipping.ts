import type { SiteSetting } from "@/payload-types";
import type { DeliveryMethod } from "@/lib/checkout";
import { COUNTRY_CODES, HOME_COUNTRY, type CountryCode } from "@/lib/countries";

type ShippingSettings = Pick<SiteSetting, "courierFee" | "freeShippingThreshold" | "shippingZones">;

export type ShippingQuote = {
  /** Delivery cost; `null` = "confirmed by our team" (no zone or default price applies). */
  cost: number | null;
  zoneName: string | null;
  deliveryTime: string | null;
  /** Order value above which this zone ships free, for the checkout hint. */
  freeOver: number | null;
};

// "Prishtinë", "prishtine " and "PRISHTINA"-style typing should all match the same zone.
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

const cityList = (raw: string | null | undefined) =>
  (raw ?? "")
    .split(/[\n,]/)
    .map(norm)
    .filter(Boolean);

/**
 * Delivery price for an address, from Cilësimet → Dërgesa dhe porositë → Zonat e dërgesës.
 * A zone listing the city wins over a zone covering the whole country; when no zone
 * matches, the default courier price (if set) applies.
 */
export function quoteShipping(
  method: DeliveryMethod,
  subtotal: number,
  settings: ShippingSettings,
  address: { country?: string | null; city?: string | null } = {},
): ShippingQuote {
  const none: ShippingQuote = { cost: 0, zoneName: null, deliveryTime: null, freeOver: null };
  if (method === "pickup") return none;

  const country = address.country || HOME_COUNTRY;
  const city = norm(address.city ?? "");
  const zones = (settings.shippingZones ?? []).filter((z) => (z.country || HOME_COUNTRY) === country);
  const zone =
    (city && zones.find((z) => cityList(z.cities).includes(city))) || zones.find((z) => cityList(z.cities).length === 0);

  const price = zone ? zone.price : settings.courierFee && settings.courierFee > 0 ? settings.courierFee : null;
  const freeOver = (zone ? zone.freeOver : settings.freeShippingThreshold) || null;
  const free = freeOver !== null && freeOver > 0 && subtotal >= freeOver;

  return {
    cost: free ? 0 : price ?? null,
    zoneName: zone?.name ?? null,
    deliveryTime: zone?.deliveryTime ?? null,
    freeOver,
  };
}

/** Countries offered at checkout: every country with a zone, plus Kosovo. */
export function deliveryCountries(settings: Pick<SiteSetting, "shippingZones">): CountryCode[] {
  const used = new Set<string>([HOME_COUNTRY, ...(settings.shippingZones ?? []).map((z) => z.country || HOME_COUNTRY)]);
  return COUNTRY_CODES.filter((c) => used.has(c));
}

/** City suggestions for the checkout field, from the zones of one country. */
export function zoneCities(settings: Pick<SiteSetting, "shippingZones">, country: string): string[] {
  const out = new Set<string>();
  for (const z of settings.shippingZones ?? []) {
    if ((z.country || HOME_COUNTRY) !== country) continue;
    for (const c of (z.cities ?? "").split(/[\n,]/)) if (c.trim()) out.add(c.trim());
  }
  return [...out];
}
