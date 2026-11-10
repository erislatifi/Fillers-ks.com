"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/icons";
import type { DeliveryMethod, PaymentMethod } from "@/lib/checkout";
import type { AgentBootstrap, AgentClinic } from "@/lib/agentApp/types";
import { SignaturePad } from "./SignaturePad";
import { clinicKey, eur, type CartLine } from "./store";

export type OrderDetails = {
  clinic: AgentClinic;
  discountPercent: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  requestedDeliveryDate: string | null;
  notes: string | null;
  signature: string | null;
  signedBy: string | null;
};

type Props = {
  data: AgentBootstrap;
  cart: CartLine[];
  clinics: AgentClinic[];
  /** Clinic of the visit in progress; otherwise the agent picks one. */
  visitClinic: AgentClinic | null;
  presentation: boolean;
  onQuantity: (productId: number, quantity: number) => void;
  onClear: () => void;
  onSubmit: (details: OrderDetails) => void;
};

/** The order being built for a clinic: quantities, discount (up to the agent's limit), delivery, signature. */
export function CartView({ data, cart, clinics, visitClinic, presentation, onQuantity, onClear, onSubmit }: Props) {
  const t = useTranslations("agentApp.cart");
  const max = data.agent.maxDiscountPercent;
  const [clinicId, setClinicId] = useState<string>(visitClinic ? clinicKey(visitClinic) : "");
  const [discount, setDiscount] = useState(0);
  const [delivery, setDelivery] = useState<DeliveryMethod>(data.checkout.deliveries[0] ?? "pickup");
  const [payment, setPayment] = useState<PaymentMethod>(data.checkout.payments[data.checkout.deliveries[0] ?? "pickup"][0] ?? "pickup");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [signedBy, setSignedBy] = useState("");
  const [error, setError] = useState<string | null>(null);

  const clinic = visitClinic ?? clinics.find((c) => clinicKey(c) === clinicId) ?? null;
  const lines = cart
    .map((l) => ({ ...l, product: data.products.find((p) => p.id === l.productId) }))
    .filter((l): l is typeof l & { product: NonNullable<typeof l.product> } => Boolean(l.product));
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const discountAmount = Math.round(subtotal * discount) / 100;
  const total = subtotal - discountAmount;

  if (lines.length === 0) return <p className="rounded-2xl border border-dashed border-line bg-paper p-10 text-center text-[17px] text-ink-soft">{t("empty")}</p>;

  const payments = data.checkout.payments[delivery] ?? [];

  function submit() {
    if (!clinic) return setError(t("clinic"));
    if (delivery === "courier" && (!clinic.city || !clinic.address)) return setError(t("needAddress"));
    setError(null);
    onSubmit({
      clinic,
      discountPercent: Math.min(max, Math.max(0, discount)),
      deliveryMethod: delivery,
      paymentMethod: payments.includes(payment) ? payment : payments[0],
      requestedDeliveryDate: date || null,
      notes: notes.trim() || null,
      signature,
      signedBy: signedBy.trim() || null,
    });
  }

  return (
    <div className="grid gap-6 pb-6 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-3">
        {lines.map((l) => (
          <div key={l.productId} className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mist">
              {l.product.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.product.images[0]} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-accent-deep">{l.product.brandName}</p>
              <p className="truncate text-[16px] font-semibold text-ink">{l.product.name}</p>
              <p className="text-[14px] text-ink-soft">{eur(l.product.price)} × {l.quantity} = <strong>{eur(l.product.price * l.quantity)}</strong></p>
            </div>
            <div className="flex h-12 items-center rounded-xl border border-line">
              <button onClick={() => onQuantity(l.productId, l.quantity - 1)} className="flex h-12 w-12 items-center justify-center" aria-label="-"><MinusIcon className="h-5 w-5" /></button>
              <span className="w-8 text-center text-[17px] font-semibold">{l.quantity}</span>
              <button onClick={() => onQuantity(l.productId, l.quantity + 1)} className="flex h-12 w-12 items-center justify-center" aria-label="+"><PlusIcon className="h-5 w-5" /></button>
            </div>
            <button onClick={() => onQuantity(l.productId, 0)} className="flex h-12 w-12 items-center justify-center text-ink-faint" aria-label={t("remove")}>
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        ))}
        <button onClick={onClear} className="text-[14px] font-medium text-ink-faint underline">{t("clear")}</button>
      </div>

      <div className="space-y-5 rounded-2xl border border-line bg-paper p-5">
        <Field label={t("clinic")}>
          {visitClinic ? (
            <p className="text-[18px] font-semibold text-ink">{visitClinic.clinicName}</p>
          ) : (
            <select value={clinicId} onChange={(e) => setClinicId(e.target.value)} className="h-14 w-full rounded-xl border border-line bg-paper px-3 text-[17px]">
              <option value="">—</option>
              {clinics.map((c) => <option key={clinicKey(c)} value={clinicKey(c)}>{c.clinicName}</option>)}
            </select>
          )}
        </Field>

        <Field label={t("delivery")}>
          <div className="grid grid-cols-2 gap-2">
            {data.checkout.deliveries.map((d) => (
              <Toggle key={d} active={delivery === d} onClick={() => { setDelivery(d); setPayment(data.checkout.payments[d][0]); }}>{t(d)}</Toggle>
            ))}
          </div>
        </Field>
        <Field label={t("payment")}>
          <div className="grid grid-cols-2 gap-2">
            {payments.map((p) => <Toggle key={p} active={payment === p} onClick={() => setPayment(p)}>{t(`pay_${p}`)}</Toggle>)}
          </div>
        </Field>

        <Field label={`${t("discount")} ${max > 0 ? `(${t("discountMax", { max })})` : ""}`}>
          {max > 0 ? (
            <div className="flex items-center gap-3">
              <button onClick={() => setDiscount((d) => Math.max(0, d - 1))} className="flex h-12 w-12 items-center justify-center rounded-xl border border-line"><MinusIcon className="h-5 w-5" /></button>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={max}
                value={discount}
                onChange={(e) => setDiscount(Math.min(max, Math.max(0, Math.round(Number(e.target.value) || 0))))}
                className="h-12 w-20 rounded-xl border border-line text-center text-[18px] font-semibold"
              />
              <span className="text-[17px] font-semibold">%</span>
              <button onClick={() => setDiscount((d) => Math.min(max, d + 1))} className="flex h-12 w-12 items-center justify-center rounded-xl border border-line"><PlusIcon className="h-5 w-5" /></button>
            </div>
          ) : (
            <p className="text-[14px] text-ink-faint">{t("noDiscount")}</p>
          )}
        </Field>

        <Field label={t("date")}>
          <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className="h-14 w-full rounded-xl border border-line px-3 text-[17px]" />
        </Field>
        <Field label={t("notes")}>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-xl border border-line p-3 text-[16px]" />
        </Field>
        <Field label={t("signature")}>
          <SignaturePad value={signature} onChange={setSignature} clearLabel={t("clearSignature")} />
          <input value={signedBy} onChange={(e) => setSignedBy(e.target.value)} placeholder={t("signedBy")} className="mt-2 h-12 w-full rounded-xl border border-line px-3 text-[16px]" />
        </Field>

        <div className="space-y-1 border-t border-line pt-4 text-[16px]">
          <Row label={t("subtotal")} value={eur(subtotal)} />
          {discount > 0 && <Row label={`${t("discount")} ${discount}%`} value={`−${eur(discountAmount)}`} />}
          <Row label={t("total")} value={eur(total)} strong />
          <p className="pt-1 text-[13px] text-ink-faint">{t("shippingNote")}</p>
        </div>

        {error && <p className="rounded-xl bg-accent-pale px-4 py-3 text-[15px] text-accent-deep">{error}</p>}
        <button onClick={submit} className="h-16 w-full rounded-2xl bg-accent-deep text-[18px] font-semibold text-white active:bg-ink">
          {t("submit")}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      {children}
    </div>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`min-h-12 rounded-xl border px-3 py-2 text-[15px] font-medium ${active ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink"}`}>
      {children}
    </button>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between ${strong ? "text-[20px] font-semibold text-ink" : "text-ink-soft"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
