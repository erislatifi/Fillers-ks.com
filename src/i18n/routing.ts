import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sq", "en"],
  defaultLocale: "sq",
});

export type AppLocale = (typeof routing.locales)[number];
