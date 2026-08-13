"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/contexts/CartContext";
import { submitOrder } from "@/app/(frontend)/[locale]/checkout/actions";
import { Button } from "@/components/Button";
import { MediaFrame, hueFromSlug } from "@/components/media";
import { ArrowRightIcon, CheckCircleIcon } from "@/components/icons";

const todayIso = () => new Date().toISOString().slice(0, 10);

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const { items, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const form = new FormData(e.currentTarget);
    const result = await submitOrder({
      clinicName: String(form.get("clinicName") || ""),
      contactName: String(form.get("contactName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      deliveryAddress: String(form.get("deliveryAddress") || ""),
      requestedDeliveryDate: String(form.get("deliveryDate") || ""),
      notes: String(form.get("notes") || ""),
      items: items.map((i) => ({
        slug: i.slug,
        name: i.name,
        brandName: i.brandName,
        size: i.size,
        price: i.price,
        quantity: i.quantity,
      })),
    });

    setSubmitting(false);

    if (result.success) {
      setOrderNumber(result.orderNumber);
      clear();
    } else {
      setError(true);
    }
  }

  if (orderNumber) {
    return (
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-6 font-display text-2xl sm:text-3xl text-ink text-balance">
            {t("successTitle")}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{t("successDescription")}</p>
          <p className="mt-5 text-[13px] text-ink-faint">
            {t("orderNumber")}: <span className="font-medium text-ink">{orderNumber}</span>
          </p>
          <div className="mt-8">
            <Button href="/">{t("backToHome")}</Button>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <h1 className="font-display text-2xl sm:text-3xl text-ink text-balance">{t("title")}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{t("description")}</p>
          <div className="mt-8">
            <Button href="/catalog">
              {t("submit")}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <h1 className="font-display text-3xl sm:text-4xl text-ink text-balance">{t("title")}</h1>
        <p className="mt-3 max-w-xl text-[14px] text-ink-soft">{t("description")}</p>

        <form onSubmit={handleSubmit} className="mt-10 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-start">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="text-[13px] font-medium text-ink">{t("clinicName")}</label>
              <input name="clinicName" required className="input mt-2" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-ink">{t("contactName")}</label>
              <input name="contactName" required className="input mt-2" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-ink">{t("email")}</label>
              <input name="email" type="email" required className="input mt-2" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-ink">{t("phone")}</label>
              <input name="phone" type="tel" required className="input mt-2" />
            </div>
            <div>
              <label className="text-[13px] font-medium text-ink">{t("deliveryDate")}</label>
              <input
                name="deliveryDate"
                type="date"
                required
                min={todayIso()}
                className="input mt-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[13px] font-medium text-ink">{t("address")}</label>
              <textarea name="deliveryAddress" required rows={3} className="input mt-2 resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[13px] font-medium text-ink">{t("notes")}</label>
              <textarea
                name="notes"
                rows={3}
                placeholder={t("notesPlaceholder")}
                className="input mt-2 resize-none"
              />
            </div>

            {error && (
              <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
                {t("errorTitle")} — {t("errorDescription")}
              </div>
            )}

            <p className="sm:col-span-2 text-[12.5px] text-ink-faint">{t("professionalNotice")}</p>

            <div className="sm:col-span-2">
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? t("submitting") : t("submit")}
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-mist p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-xl text-ink">{t("orderSummary")}</h2>
            <div className="mt-5 flex flex-col gap-4 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-3">
                  <MediaFrame hue={hueFromSlug(item.slug)} className="h-14 w-14 rounded-lg border border-line shrink-0">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </MediaFrame>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{item.name}</p>
                    <p className="text-[12px] text-ink-faint">
                      {item.quantity} × €{item.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-[13px] font-medium text-ink shrink-0">
                    €{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-line-soft flex items-center justify-between text-[14px]">
              <span className="text-ink-soft">{t("orderSummary")}</span>
              <span className="font-display text-ink">€{subtotal.toFixed(2)}</span>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
