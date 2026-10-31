import { cache } from "react";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { getPayloadClient } from "@/lib/payload";
import { applyOverrides } from "@/lib/texts";

// Texts reworded in the admin (Përmbajtja → Tekstet), once per request.
const getOverrides = cache(async (locale: string) => {
  try {
    const payload = await getPayloadClient();
    const texts = await payload.findGlobal({ slug: "site-texts", locale: locale as "sq" | "en", depth: 0 });
    return texts.overrides;
  } catch {
    // Missing table or DB hiccup: fall back to the built-in texts.
    return null;
  }
});

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const base = (await import(`../../messages/${locale}.json`)).default;
  return {
    locale,
    messages: applyOverrides(base, await getOverrides(locale)),
  };
});
