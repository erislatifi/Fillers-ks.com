"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { sendContactMessage } from "@/lib/formActions";
import { Button } from "@/components/Button";
import { CheckCircleIcon } from "@/components/icons";

export function ContactForm() {
  const t = useTranslations("contact");
  const [state, action, pending] = useActionState(sendContactMessage, null);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-line bg-mist p-8 text-center">
        <CheckCircleIcon className="mx-auto h-10 w-10 text-accent" />
        <p className="mt-4 font-display text-xl text-ink">{t("successTitle")}</p>
        <p className="mt-2 text-[14px] text-ink-soft">{t("successText")}</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid sm:grid-cols-2 gap-5">
      {/* Honeypot — hidden from people, filled in by spam bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div>
        <label htmlFor="c-name" className="text-[13px] font-medium text-ink">{t("name")}</label>
        <input id="c-name" name="name" required autoComplete="name" className="input mt-2" />
      </div>
      <div>
        <label htmlFor="c-clinic" className="text-[13px] font-medium text-ink">{t("clinic")}</label>
        <input id="c-clinic" name="clinicName" autoComplete="organization" className="input mt-2" />
      </div>
      <div>
        <label htmlFor="c-email" className="text-[13px] font-medium text-ink">{t("email")}</label>
        <input id="c-email" name="email" type="email" required autoComplete="email" className="input mt-2" />
      </div>
      <div>
        <label htmlFor="c-phone" className="text-[13px] font-medium text-ink">{t("phone")}</label>
        <input id="c-phone" name="phone" type="tel" autoComplete="tel" className="input mt-2" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-message" className="text-[13px] font-medium text-ink">{t("message")}</label>
        <textarea id="c-message" name="message" rows={5} required maxLength={5000} className="input mt-2 resize-none" />
      </div>
      {state?.error && (
        <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
          {t("error")}
        </div>
      )}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? t("sending") : t("send")}
        </Button>
      </div>
    </form>
  );
}
