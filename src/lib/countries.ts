// Countries we can deliver to. The codes are stored on orders and shipping zones.
export const COUNTRIES = [
  { code: "XK", sq: "Kosovë", en: "Kosovo" },
  { code: "AL", sq: "Shqipëri", en: "Albania" },
  { code: "MK", sq: "Maqedoni e Veriut", en: "North Macedonia" },
  { code: "ME", sq: "Mal i Zi", en: "Montenegro" },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]["code"];
export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as CountryCode[];
export const HOME_COUNTRY: CountryCode = "XK";

export const countryName = (code: string | null | undefined, locale: string = "sq") => {
  const c = COUNTRIES.find((x) => x.code === code);
  return c ? (locale === "en" ? c.en : c.sq) : (code ?? "");
};

/** Admin select options (labels in Albanian). */
export const countryOptions = COUNTRIES.map((c) => ({ label: c.sq, value: c.code }));
