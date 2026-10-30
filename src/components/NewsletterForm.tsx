"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { subscribeNewsletter } from "@/lib/formActions";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/icons";

// Shared by the homepage section ("section") and the footer ("footer").
export function NewsletterForm({ variant }: { variant: "section" | "footer" }) {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  const footer = variant === "footer";

  if (state?.ok) {
    return (
      <p
        className={`flex items-center gap-2 text-[13.5px] ${footer ? "mt-3 text-accent-light" : "mt-8 justify-center text-accent-deep"}`}
      >
        <CheckCircleIcon className="h-4 w-4 shrink-0" />
        {t("success")}
      </p>
    );
  }

  return (
    <form action={action} className={footer ? "mt-3" : "mt-8 max-w-md mx-auto"}>
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot — hidden from people, filled in by spam bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {footer ? (
        <div className="flex items-center rounded-full border border-paper/15 pl-4 pr-1.5 py-1.5 focus-within:border-accent-light transition-colors">
          <input
            type="email"
            name="email"
            required
            aria-label={t("placeholder")}
            placeholder={t("placeholder")}
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-paper/40"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-accent px-4 py-2 text-[12px] font-medium text-paper shrink-0 hover:bg-accent-light transition-colors disabled:opacity-60"
          >
            {t("subscribe")}
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            name="email"
            required
            aria-label={t("placeholder")}
            placeholder={t("placeholder")}
            className="w-full rounded-full border border-line bg-paper px-5 py-3.5 text-sm outline-none focus:border-accent transition-colors placeholder:text-ink-faint"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink text-paper px-6 py-3.5 text-sm font-medium hover:bg-accent-deep transition-colors shrink-0 disabled:opacity-60"
          >
            {t("subscribe")}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      {state?.error && (
        <p className={`mt-2 text-[12.5px] ${footer ? "text-red-300" : "text-red-700"}`}>{t("error")}</p>
      )}
    </form>
  );
}
