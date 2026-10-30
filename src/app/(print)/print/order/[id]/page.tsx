import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getPayloadClient } from "@/lib/payload";
import { PrintButton } from "./PrintButton";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
};

export const metadata = { title: "Printo porosinë" };

const eur = (n: number | null | undefined) => (n == null ? "—" : `€${n.toFixed(2)}`);
const date = (iso?: string | null) =>
  iso ? new Intl.DateTimeFormat("sq-AL", { dateStyle: "medium" }).format(new Date(iso)) : "—";

const DELIVERY: Record<string, string> = { pickup: "Merret në zyrën tonë", courier: "Dërgesë me korrier" };
const PAYMENT: Record<string, string> = {
  pickup: "Pagesë në zyrë",
  bank_transfer: "Transfer bankar",
  cash_on_delivery: "Cash te korrieri",
};

/** Proforma invoice (default) or packing slip (?type=packing) for one order. Staff only. */
export default async function PrintOrderPage({ params, searchParams }: Props) {
  const [{ id }, { type }] = await Promise.all([params, searchParams]);
  const packing = type === "packing";

  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!user || user.collection !== "users") redirect(`/admin/login?redirect=/print/order/${id}`);

  const order = await payload.findByID({ collection: "orders", id, depth: 0 }).catch(() => null);
  if (!order) notFound();
  const settings = await payload.findGlobal({ slug: "site-settings", locale: "sq" });

  const shipping = order.shippingCost;
  const total = order.total ?? order.subtotal + (shipping ?? 0);
  const billTo = order.needsInvoice && order.invoice?.companyName ? order.invoice : null;

  return (
    <main className="sheet">
      <style>{css}</style>
      <div className="toolbar">
        <PrintButton />
      </div>

      <header className="head">
        <div>
          <div className="brand">Fillers Kosovo</div>
          <div className="muted">
            {settings.legalName || "Alp Estetik SHPK"}
            {settings.businessRegistrationNumber ? ` · NUI ${settings.businessRegistrationNumber}` : ""}
          </div>
          {settings.address && <div className="muted">{settings.address}</div>}
          <div className="muted">
            {[settings.contactPhone, settings.contactEmail].filter(Boolean).join(" · ")}
          </div>
        </div>
        <div className="right">
          <div className="doc">{packing ? "FLETË PAKETIMI" : "FATURË PROFORMA"}</div>
          <div>
            Nr. <strong>{order.orderNumber}</strong>
          </div>
          <div className="muted">Data: {date(order.createdAt)}</div>
          {order.requestedDeliveryDate && <div className="muted">Dorëzimi: {date(order.requestedDeliveryDate)}</div>}
        </div>
      </header>

      <section className="parties">
        <div>
          <div className="label">{billTo ? "Faturohet për" : "Klienti"}</div>
          {billTo ? (
            <>
              <strong>{billTo.companyName}</strong>
              <div>NUI: {billTo.nui}</div>
              {billTo.fiscalNumber && <div>Nr. fiskal: {billTo.fiscalNumber}</div>}
              {billTo.vatNumber && <div>Nr. TVSH: {billTo.vatNumber}</div>}
              {billTo.address && <div className="pre">{billTo.address}</div>}
            </>
          ) : (
            <strong>{order.clinicName}</strong>
          )}
          <div>{order.contactName}</div>
          <div className="muted">
            {order.phone} · {order.email}
          </div>
        </div>
        <div>
          <div className="label">Marrja dhe pagesa</div>
          <div>{DELIVERY[order.deliveryMethod] ?? order.deliveryMethod}</div>
          {order.deliveryMethod === "courier" && (
            <div className="pre">
              {order.deliveryAddress}
              {order.city ? `\n${order.city}` : ""}
            </div>
          )}
          <div>{PAYMENT[order.paymentMethod] ?? order.paymentMethod}</div>
          {order.trackingNumber && (
            <div className="muted">
              {order.courierName ? `${order.courierName} · ` : ""}Gjurmimi: {order.trackingNumber}
            </div>
          )}
        </div>
      </section>

      <table>
        <thead>
          <tr>
            <th>Produkti</th>
            <th>Madhësia</th>
            <th className="num">Sasia</th>
            {!packing && <th className="num">Çmimi</th>}
            {!packing && <th className="num">Shuma</th>}
            {packing && <th className="num">✓</th>}
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={item.id ?? i}>
              <td>
                {item.name}
                {item.brandName && <div className="muted">{item.brandName}</div>}
              </td>
              <td>{item.size ?? "—"}</td>
              <td className="num">{item.quantity}</td>
              {!packing && <td className="num">{eur(item.price)}</td>}
              {!packing && <td className="num">{eur(item.price * item.quantity)}</td>}
              {packing && <td className="num box">☐</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {!packing && (
        <section className="totals">
          <div>
            <span>Produktet</span>
            <span>{eur(order.subtotal)}</span>
          </div>
          <div>
            <span>Transporti</span>
            <span>{shipping == null ? "Konfirmohet" : eur(shipping)}</span>
          </div>
          <div className="grand">
            <span>Totali</span>
            <span>{eur(total)}</span>
          </div>
        </section>
      )}

      {!packing && order.paymentMethod === "bank_transfer" && settings.bankDetails?.iban && (
        <section className="bank">
          <div className="label">Pagesa me transfer bankar</div>
          <div>
            {settings.bankDetails.bankName} · {settings.bankDetails.accountHolder}
          </div>
          <div>
            IBAN: <strong>{settings.bankDetails.iban}</strong>
            {settings.bankDetails.swift ? ` · SWIFT: ${settings.bankDetails.swift}` : ""}
          </div>
          <div className="muted">Përshkrimi i pagesës: {order.orderNumber}</div>
        </section>
      )}

      {order.notes && (
        <section className="notes">
          <div className="label">Shënime nga klienti</div>
          <div className="pre">{order.notes}</div>
        </section>
      )}

      <footer className="foot muted">
        {packing
          ? "Kontrolloni produktet dhe numrat e batch-it para paketimit."
          : "Faturë proforma — nuk është faturë fiskale. Faleminderit për besimin!"}
      </footer>
    </main>
  );
}

const css = `
  .sheet { max-width: 800px; margin: 24px auto; background: #fff; padding: 48px; font: 13px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; color: #18181b; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .toolbar { display: flex; justify-content: flex-end; margin: -24px -24px 16px 0; }
  .head { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 20px; border-bottom: 2px solid #18181b; }
  .brand { font-size: 22px; font-weight: 700; color: #9c1668; }
  .doc { font-size: 16px; font-weight: 700; letter-spacing: .08em; }
  .right { text-align: right; }
  .muted { color: #71717a; }
  .pre { white-space: pre-line; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: #71717a; margin-bottom: 4px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #71717a; border-bottom: 1px solid #d4d4d8; padding: 8px 6px; }
  td { border-bottom: 1px solid #f4f4f5; padding: 10px 6px; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .box { font-size: 18px; }
  .totals { margin: 16px 0 0 auto; width: 280px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
  .totals .grand { border-top: 2px solid #18181b; margin-top: 6px; padding-top: 8px; font-size: 16px; font-weight: 700; }
  .bank, .notes { margin-top: 24px; padding: 14px 16px; background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; }
  .foot { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e4e4e7; font-size: 12px; }
  @media print {
    body { background: #fff !important; }
    .sheet { box-shadow: none; margin: 0; padding: 0; max-width: none; }
    .toolbar { display: none; }
  }
`;
