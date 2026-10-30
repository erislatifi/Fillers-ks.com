"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/contexts/CartContext";
import { submitOrder } from "@/app/(frontend)/[locale]/checkout/actions";
import { paymentsFor, type DeliveryMethod, type PaymentMethod } from "@/lib/checkout";
import { shippingCost } from "@/lib/shipping";
import { Button } from "@/components/Button";
import { Link } from "@/i18n/navigation";
import { MediaFrame, hueFromSlug } from "@/components/media";
import type { SiteSetting } from "@/payload-types";
import type { CustomerProfile } from "@/lib/customerSession";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  LockIcon,
  MapPinIcon,
  BuildingIcon,
  CashIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@/components/icons";

const todayIso = () => new Date().toISOString().slice(0, 10);
const str = (form: FormData, name: string) => String(form.get(name) || "").trim();
const eur = (n: number) => `€${n.toFixed(2)}`;

type Props = { siteSettings: SiteSetting; customer: CustomerProfile | null };

function Section({ step, title, children }: { step: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="sm:col-span-2 grid sm:grid-cols-2 gap-5 border-t border-line-soft pt-8 first:border-t-0 first:pt-0">
      <legend className="sm:col-span-2 float-left w-full mb-1 flex items-center gap-3 font-display text-lg text-ink">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-paper text-[12px] font-sans font-semibold">
          {step}
        </span>
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function OptionCard({
  selected,
  onSelect,
  icon,
  label,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`rounded-2xl border p-4 text-left transition-colors ${
        selected ? "border-accent bg-accent-pale text-accent-deep" : "border-line bg-mist hover:border-accent/40"
      }`}
    >
      {icon}
      <p className="mt-2.5 text-[13px] font-medium text-ink">{label}</p>
      <p className="mt-0.5 text-[12px] text-ink-faint">{description}</p>
    </button>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="sm:col-span-2 flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-accent-deep"
      />
      <span>
        <span className="block text-[14px] font-medium text-ink">{label}</span>
        {hint && <span className="block mt-0.5 text-[12.5px] text-ink-faint">{hint}</span>}
      </span>
    </label>
  );
}

function Field({
  label,
  optional,
  wide,
  children,
}: {
  label: string;
  optional?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label className="text-[13px] font-medium text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-faint">({optional})</span>}
      </label>
      {children}
    </div>
  );
}

export function CheckoutForm({ siteSettings, customer }: Props) {
  const t = useTranslations("checkout");
  const { items, subtotal, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [placed, setPlaced] = useState<{ orderNumber: string; payment: PaymentMethod } | null>(null);
  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
  const [payment, setPayment] = useState<PaymentMethod>("pickup");
  const [scheduled, setScheduled] = useState(false);
  const [needsInvoice, setNeedsInvoice] = useState(false);

  const courier = delivery === "courier";
  // Display only — the server recalculates it from the same settings when the order is placed.
  const shipping = shippingCost(delivery, subtotal, siteSettings);
  const total = subtotal + (shipping ?? 0);

  function chooseDelivery(next: DeliveryMethod) {
    setDelivery(next);
    // Keep the payment valid for the new delivery method.
    if (!paymentsFor[next].includes(payment)) setPayment(paymentsFor[next][0]);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const form = new FormData(e.currentTarget);
    const result = await submitOrder({
      clinicName: str(form, "clinicName"),
      contactName: str(form, "contactName"),
      email: str(form, "email"),
      phone: str(form, "phone"),
      deliveryMethod: delivery,
      deliveryAddress: courier ? str(form, "deliveryAddress") : undefined,
      city: courier ? str(form, "city") : undefined,
      requestedDeliveryDate: scheduled ? str(form, "deliveryDate") : undefined,
      notes: str(form, "notes"),
      paymentMethod: payment,
      invoice: needsInvoice
        ? {
            companyName: str(form, "companyName"),
            nui: str(form, "nui"),
            fiscalNumber: str(form, "fiscalNumber"),
            vatNumber: str(form, "vatNumber"),
            address: str(form, "invoiceAddress"),
          }
        : undefined,
      acceptedTerms: form.get("acceptTerms") === "on",
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
      setPlaced({ orderNumber: result.orderNumber, payment });
      clear();
    } else {
      setError(true);
    }
  }

  const bankDetails = (
    <div className="rounded-xl border border-line bg-paper p-4 text-[13px] text-ink-soft space-y-1">
      <p>
        <span className="text-ink font-medium">{t("payment.bankName")}:</span> {siteSettings.bankDetails?.bankName}
      </p>
      <p>
        <span className="text-ink font-medium">{t("payment.accountHolder")}:</span>{" "}
        {siteSettings.bankDetails?.accountHolder}
      </p>
      <p>
        <span className="text-ink font-medium">{t("payment.iban")}:</span> {siteSettings.bankDetails?.iban}
      </p>
      {siteSettings.bankDetails?.swift && (
        <p>
          <span className="text-ink font-medium">{t("payment.swift")}:</span> {siteSettings.bankDetails.swift}
        </p>
      )}
    </div>
  );

  if (placed) {
    return (
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-6 font-display text-2xl sm:text-3xl text-ink text-balance">{t("successTitle")}</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{t("successDescription")}</p>
          <p className="mt-5 text-[13px] text-ink-faint">
            {t("orderNumber")}: <span className="font-medium text-ink">{placed.orderNumber}</span>
          </p>
          {placed.payment === "cash_on_delivery" && (
            <p className="mt-4 text-[14px] text-ink-soft">{t("successCod")}</p>
          )}
          {placed.payment === "bank_transfer" && (
            <div className="mt-6 text-left">
              <p className="mb-3 text-[14px] text-ink-soft">{t("successBank")}</p>
              {bankDetails}
            </div>
          )}
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
          <div className="grid sm:grid-cols-2 gap-8">
            <Section step={1} title={t("steps.contact")}>
              <Field label={t("clinicName")} wide>
                <input name="clinicName" required defaultValue={customer?.clinicName ?? ""} autoComplete="organization" className="input mt-2" />
              </Field>
              <Field label={t("contactName")}>
                <input name="contactName" required defaultValue={customer?.fullName ?? ""} autoComplete="name" className="input mt-2" />
              </Field>
              <Field label={t("phone")}>
                <input name="phone" type="tel" required defaultValue={customer?.phone ?? ""} autoComplete="tel" className="input mt-2" />
              </Field>
              <Field label={t("email")} wide>
                <input name="email" type="email" required defaultValue={customer?.email ?? ""} autoComplete="email" className="input mt-2" />
              </Field>
            </Section>

            <Section step={2} title={t("steps.delivery")}>
              <div className="sm:col-span-2 grid sm:grid-cols-2 gap-3">
                <OptionCard
                  selected={delivery === "pickup"}
                  onSelect={() => chooseDelivery("pickup")}
                  icon={<BuildingIcon className="h-5 w-5" />}
                  label={t("delivery.pickupLabel")}
                  description={t("delivery.pickupDescription")}
                />
                <OptionCard
                  selected={courier}
                  onSelect={() => chooseDelivery("courier")}
                  icon={<TruckIcon className="h-5 w-5" />}
                  label={t("delivery.courierLabel")}
                  description={t("delivery.courierDescription")}
                />
              </div>

              {courier ? (
                <>
                  <Field label={t("city")}>
                    <input name="city" required defaultValue={customer?.city ?? ""} autoComplete="address-level2" className="input mt-2" />
                  </Field>
                  <Field label={t("address")} wide>
                    <textarea
                      name="deliveryAddress"
                      required
                      rows={2}
                      defaultValue={customer?.address ?? ""}
                      autoComplete="street-address"
                      className="input mt-2 resize-none"
                    />
                  </Field>
                </>
              ) : (
                siteSettings.address && (
                  <p className="sm:col-span-2 flex items-start gap-2 text-[13px] text-ink-soft">
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent-deep" />
                    <span>
                      <span className="font-medium text-ink">{t("delivery.pickupAddress")}:</span> {siteSettings.address}
                    </span>
                  </p>
                )
              )}

              <Toggle
                checked={scheduled}
                onChange={setScheduled}
                label={t("delivery.scheduleToggle")}
                hint={scheduled ? undefined : t("delivery.scheduleHint")}
              />
              {scheduled && (
                <Field label={t("deliveryDate")}>
                  <input name="deliveryDate" type="date" required min={todayIso()} className="input mt-2" />
                </Field>
              )}
            </Section>

            <Section step={3} title={t("steps.payment")}>
              <div className="sm:col-span-2 grid sm:grid-cols-3 gap-3">
                {courier ? (
                  <OptionCard
                    selected={payment === "cash_on_delivery"}
                    onSelect={() => setPayment("cash_on_delivery")}
                    icon={<CashIcon className="h-5 w-5" />}
                    label={t("payment.codLabel")}
                    description={t("payment.codDescription")}
                  />
                ) : (
                  <OptionCard
                    selected={payment === "pickup"}
                    onSelect={() => setPayment("pickup")}
                    icon={<CashIcon className="h-5 w-5" />}
                    label={t("payment.officeLabel")}
                    description={t("payment.officeDescription")}
                  />
                )}
                <OptionCard
                  selected={payment === "bank_transfer"}
                  onSelect={() => setPayment("bank_transfer")}
                  icon={<BuildingIcon className="h-5 w-5" />}
                  label={t("payment.bankLabel")}
                  description={t("payment.bankDescription")}
                />
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
              {payment === "bank_transfer" && <div className="sm:col-span-2">{bankDetails}</div>}
              {payment === "cash_on_delivery" && (
                <p className="sm:col-span-2 text-[13px] text-ink-soft">{t("payment.codNote", { total: eur(total) })}</p>
              )}
            </Section>

            <Section step={4} title={t("steps.invoice")}>
              <Toggle checked={needsInvoice} onChange={setNeedsInvoice} label={t("invoice.toggle")} hint={t("invoice.hint")} />
              {needsInvoice && (
                <>
                  <Field label={t("invoice.companyName")}>
                    <input name="companyName" required defaultValue={customer?.clinicName ?? ""} className="input mt-2" />
                  </Field>
                  <Field label={t("invoice.nui")}>
                    <input name="nui" required inputMode="numeric" className="input mt-2" />
                  </Field>
                  <Field label={t("invoice.fiscalNumber")} optional={t("optional")}>
                    <input name="fiscalNumber" inputMode="numeric" className="input mt-2" />
                  </Field>
                  <Field label={t("invoice.vatNumber")} optional={t("optional")}>
                    <input name="vatNumber" className="input mt-2" />
                  </Field>
                  <Field label={t("invoice.address")} optional={t("optional")} wide>
                    <textarea
                      name="invoiceAddress"
                      rows={2}
                      placeholder={t("invoice.addressPlaceholder")}
                      className="input mt-2 resize-none"
                    />
                  </Field>
                </>
              )}
            </Section>

            <Section step={5} title={t("steps.notes")}>
              <Field label={t("notes")} wide>
                <textarea name="notes" rows={3} placeholder={t("notesPlaceholder")} className="input mt-2 resize-none" />
              </Field>
            </Section>

            {error && (
              <div className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 p-4 text-[13px] text-red-700">
                {t("errorTitle")} — {t("errorDescription")}
              </div>
            )}

            <div className="sm:col-span-2 space-y-4 border-t border-line-soft pt-8">
              <label className="flex items-start gap-3 cursor-pointer text-[13px] text-ink-soft">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  required
                  className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-accent-deep"
                />
                <span>
                  {t.rich("acceptTerms", {
                    terms: (chunks) => (
                      <Link href="/terms" className="underline hover:text-accent-deep">
                        {chunks}
                      </Link>
                    ),
                    privacy: (chunks) => (
                      <Link href="/privacy" className="underline hover:text-accent-deep">
                        {chunks}
                      </Link>
                    ),
                  })}
                </span>
              </label>
              <p className="text-[12.5px] text-ink-faint">{t("professionalNotice")}</p>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? t("submitting") : t("submit")}
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-mist p-6 lg:sticky lg:top-28">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-xl text-ink">{t("orderSummary")}</h2>
              <Link href="/cart" className="text-[12.5px] text-ink-soft underline hover:text-accent-deep">
                {t("summary.editCart")}
              </Link>
            </div>
            <div className="mt-5 flex flex-col gap-4 max-h-80 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-3">
                  <MediaFrame hue={hueFromSlug(item.slug)} className="h-14 w-14 rounded-lg border border-line shrink-0">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
                    )}
                  </MediaFrame>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink truncate">{item.name}</p>
                    <p className="text-[12px] text-ink-faint">
                      {item.quantity} × {eur(item.price)}
                    </p>
                  </div>
                  <span className="text-[13px] font-medium text-ink shrink-0">{eur(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-line-soft space-y-2 text-[13.5px]">
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">{t("summary.subtotal")}</span>
                <span className="text-ink">{eur(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-soft">{t("summary.shipping")}</span>
                <span className="text-ink">
                  {shipping === null ? t("summary.shippingTbd") : shipping === 0 ? t("summary.shippingFree") : eur(shipping)}
                </span>
              </div>
              {courier && shipping !== 0 && siteSettings.freeShippingThreshold ? (
                <p className="text-[12px] text-accent-deep">
                  {t("summary.freeOver", { amount: eur(siteSettings.freeShippingThreshold) })}
                </p>
              ) : null}
            </div>
            <div className="mt-4 pt-4 border-t border-line-soft flex items-center justify-between text-[15px]">
              <span className="font-medium text-ink">{t("summary.total")}</span>
              <span className="font-display text-lg text-ink">{eur(total)}</span>
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
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
