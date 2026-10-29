import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/Button";
import { LoginForm, ProfileForm } from "@/components/AccountForms";
import { ArrowRightIcon } from "@/components/icons";
import { getPayloadClient } from "@/lib/payload";
import { getCurrentCustomer, toProfile } from "@/lib/customerSession";
import { logoutCustomer } from "./actions";
import type { AppLocale } from "@/i18n/routing";
import type { Customer } from "@/payload-types";

export const metadata = { title: "Account" };

type Props = {
  params: Promise<{ locale: string }>;
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-accent-pale text-accent-deep border-accent/30",
  fulfilled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-mist text-ink-faint border-line",
};

export default async function AccountPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as AppLocale, namespace: "account" });
  const customer = await getCurrentCustomer();

  if (!customer) {
    return (
      <>
        <PageHero eyebrow={t("eyebrow")} title={t("loginTitle")} description={t("loginDescription")} />
        <section className="bg-paper py-14 sm:py-20">
          <div className="mx-auto max-w-md px-6">
            <LoginForm />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("welcome", { name: customer.fullName })} description={customer.clinicName} />
      <section className="bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10 grid lg:grid-cols-[1.2fr_1fr] gap-12 items-start">
          <OrdersList customer={customer} locale={locale as AppLocale} />

          <div className="rounded-2xl border border-line bg-mist p-6">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="font-display text-xl text-ink">{t("profileTitle")}</h2>
              <form action={logoutCustomer}>
                <input type="hidden" name="locale" value={locale} />
                <button type="submit" className="text-[13px] font-medium text-ink-soft underline hover:text-accent-deep">
                  {t("logout")}
                </button>
              </form>
            </div>
            <p className="mb-5 text-[13px] text-ink-faint">{customer.email}</p>
            <ProfileForm customer={toProfile(customer)} />
          </div>
        </div>
      </section>
    </>
  );
}

async function OrdersList({ customer, locale }: { customer: Customer; locale: AppLocale }) {
  const t = await getTranslations({ locale, namespace: "account" });
  const payload = await getPayloadClient();
  const { docs: orders } = await payload.find({
    collection: "orders",
    where: { customer: { equals: customer.id } },
    sort: "-createdAt",
    limit: 50,
    depth: 0,
  });

  const date = new Intl.DateTimeFormat(locale === "sq" ? "sq-AL" : "en-GB", { dateStyle: "medium" });

  return (
    <div>
      <h2 className="font-display text-2xl text-ink">{t("ordersTitle")}</h2>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-line p-8 text-center">
          <p className="text-[14px] text-ink-soft">{t("ordersEmpty")}</p>
          <div className="mt-6">
            <Button href="/catalog">
              {t("browseCatalog")}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {orders.map((order) => {
            const status = order.status ?? "pending";
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <li key={order.id} className="rounded-2xl border border-line p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="font-medium text-ink">{order.orderNumber}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${statusStyles[status]}`}>
                    {t(`status.${status}`)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-ink-soft">
                  <span>
                    {t("orderDate")}: {date.format(new Date(order.createdAt))}
                  </span>
                  <span>{t("orderItems", { count: itemCount })}</span>
                  {order.requestedDeliveryDate && (
                    <span>{t("deliveryOn", { date: date.format(new Date(order.requestedDeliveryDate)) })}</span>
                  )}
                </div>
                <ul className="mt-3 space-y-1 text-[13px] text-ink-faint">
                  {order.items.map((item, idx) => (
                    <li key={item.id ?? idx} className="flex justify-between gap-4">
                      <span className="truncate">
                        {item.quantity} × {item.name}
                        {item.size ? ` (${item.size})` : ""}
                      </span>
                      <span className="shrink-0">€{(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-line-soft flex justify-between text-[14px]">
                  <span className="text-ink-soft">{t("orderTotal")}</span>
                  <span className="font-display text-ink">€{order.subtotal.toFixed(2)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
