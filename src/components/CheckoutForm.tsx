"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/contexts/CartContext";
import { submitOrder } from "@/app/(frontend)/[locale]/checkout/actions";
import { Button } from "@/components/Button";
import { Link } from "@/i18n/navigation";
import { MediaFrame, hueFromSlug } from "@/components/media";
import type { SiteSetting } from "@/payload-types";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  LockIcon,
  MapPinIcon,
  BuildingIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from "@/components/icons";

const todayIso = () => new Date().toISOString().slice(0, 10);

type PaymentMethod = "pickup" | "bank_transfer";

export function CheckoutForm({ siteSettings }: { siteSettings: SiteSetting }) {
  const t = useTranslations("checkout");
  const { items, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pickup");

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
      paymentMethod,
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
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-mist px-3.5 py-1.5 text-[12.5px] text-ink-soft">
          <LockIcon className="h-3.5 w-3.5 text-accent-deep" />
          {t("payment.secureCheckout")}
        </div>

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

            <div className="sm:col-span-2">
              <label className="text-[13px] font-medium text-ink">{t("payment.heading")}</label>
              <div className="mt-2 grid sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  aria-pressed={paymentMethod === "pickup"}
                  onClick={() => setPaymentMethod("pickup")}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    paymentMethod === "pickup"
                      ? "border-accent bg-accent-pale text-accent-deep"
                      : "border-line bg-mist hover:border-accent/40"
                  }`}
                >
                  <MapPinIcon className="h-5 w-5" />
                  <p className="mt-2.5 text-[13px] font-medium text-ink">{t("payment.pickupLabel")}</p>
                  <p className="mt-0.5 text-[12px] text-ink-faint">{t("payment.pickupDescription")}</p>
                </button>

                <button
                  type="button"
                  aria-pressed={paymentMethod === "bank_transfer"}
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    paymentMethod === "bank_transfer"
                      ? "border-accent bg-accent-pale text-accent-deep"
                      : "border-line bg-mist hover:border-accent/40"
                  }`}
                >
                  <BuildingIcon className="h-5 w-5" />
                  <p className="mt-2.5 text-[13px] font-medium text-ink">{t("payment.bankLabel")}</p>
                  <p className="mt-0.5 text-[12px] text-ink-faint">{t("payment.bankDescription")}</p>
                </button>

                <div
                  aria-disabled="true"
                  className="rounded-2xl border border-line bg-mist p-4 text-left opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <CreditCardIcon className="h-5 w-5" />
                    <span className="rounded-full bg-ink-faint/15 px-2 py-0.5 text-[10.5px] font-medium text-ink-faint">
                      {t("payment.comingSoon")}
                    </span>
                  </div>
                  <p className="mt-2.5 text-[13px] font-medium text-ink">{t("payment.cardLabel")}</p>
                  <p className="mt-0.5 text-[12px] text-ink-faint">{t("payment.cardDescription")}</p>
                </div>
              </div>

              {paymentMethod === "bank_transfer" && (
                <div className="mt-3 rounded-xl border border-line bg-paper p-4 text-[13px] text-ink-soft space-y-1">
                  <p>
                    <span className="text-ink font-medium">{t("payment.bankName")}:</span>{" "}
                    {siteSettings.bankDetails?.bankName}
                  </p>
                  <p>
                    <span className="text-ink font-medium">{t("payment.accountHolder")}:</span>{" "}
                    {siteSettings.bankDetails?.accountHolder}
                  </p>
                  <p>
                    <span className="text-ink font-medium">{t("payment.iban")}:</span>{" "}
                    {siteSettings.bankDetails?.iban}
                  </p>
                  {siteSettings.bankDetails?.swift && (
                    <p>
                      <span className="text-ink font-medium">{t("payment.swift")}:</span>{" "}
                      {siteSettings.bankDetails.swift}
                    </p>
                  )}
                </div>
              )}
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

            <div className="mt-5 pt-5 border-t border-line-soft space-y-2">
              <p className="flex items-center gap-1.5 text-[12px] text-ink-faint">
                <ShieldCheckIcon className="h-3.5 w-3.5 text-accent-deep shrink-0" />
                {siteSettings.businessRegistrationNumber
                  ? t("payment.trustNote", { regNumber: siteSettings.businessRegistrationNumber })
                  : t("payment.trustedByClinics")}
              </p>
              {siteSettings.address && (
                <p className="text-[12px] text-ink-faint">
                  {siteSettings.address}
                  {siteSettings.contactPhone ? ` · ${siteSettings.contactPhone}` : ""}
                </p>
              )}
              <p className="text-[12px] text-ink-faint">
                <Link href="/privacy" className="underline hover:text-accent-deep">
                  {t("payment.privacyLink")}
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
