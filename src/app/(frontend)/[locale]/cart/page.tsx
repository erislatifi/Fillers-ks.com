"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/Button";
import { MediaFrame, hueFromSlug } from "@/components/media";
import { MinusIcon, PlusIcon, TrashIcon, ArrowRightIcon, BagIcon } from "@/components/icons";

export default function CartPage() {
  const t = useTranslations("cart");
  const { items, setQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-lg px-6 text-center">
          <BagIcon className="mx-auto h-10 w-10 text-ink-faint" />
          <h1 className="mt-6 font-display text-2xl sm:text-3xl text-ink text-balance">
            {t("emptyTitle")}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{t("emptyDescription")}</p>
          <div className="mt-8">
            <Button href="/catalog">
              {t("browseCatalog")}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <h1 className="font-display text-3xl sm:text-4xl text-ink text-balance">{t("title")}</h1>

        <div className="mt-10 grid lg:grid-cols-[1.6fr_1fr] gap-10">
          <div className="flex flex-col gap-5">
            {items.map((item) => (
              <div
                key={item.slug}
                className="flex gap-4 rounded-2xl border border-line p-4"
              >
                <Link href={`/products/${item.slug}`} className="shrink-0">
                  <MediaFrame hue={hueFromSlug(item.slug)} className="h-24 w-24 rounded-xl border border-line">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="absolute inset-0 h-full w-full object-cover" />
                    )}
                  </MediaFrame>
                </Link>

                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-accent-deep font-medium">
                      {item.brandName}
                    </p>
                    <Link href={`/products/${item.slug}`} className="block mt-0.5 text-[15px] font-medium text-ink hover:text-accent-deep transition-colors">
                      {item.name}
                    </Link>
                    {item.size && <p className="mt-0.5 text-[12.5px] text-ink-faint">{item.size}</p>}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button
                        type="button"
                        aria-label={t("decrease")}
                        onClick={() => setQuantity(item.slug, item.quantity - 1)}
                        className="h-9 w-9 flex items-center justify-center text-ink-soft hover:text-accent-deep transition-colors"
                      >
                        <MinusIcon className="h-3 w-3" />
                      </button>
                      <span className="w-7 text-center text-[13px] font-medium text-ink">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={t("increase")}
                        onClick={() => setQuantity(item.slug, item.quantity + 1)}
                        className="h-9 w-9 flex items-center justify-center text-ink-soft hover:text-accent-deep transition-colors"
                      >
                        <PlusIcon className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-display text-[15px] text-ink">
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        aria-label={t("remove")}
                        onClick={() => removeItem(item.slug)}
                        className="text-ink-faint hover:text-accent-deep transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-line bg-mist p-6 h-fit lg:sticky lg:top-28">
            <h2 className="font-display text-xl text-ink">{t("orderSummary")}</h2>
            <div className="mt-5 flex items-center justify-between text-[14px] text-ink-soft">
              <span>{t("subtotal")}</span>
              <span className="text-ink font-medium">€{subtotal.toFixed(2)}</span>
            </div>
            <p className="mt-2 text-[12.5px] text-ink-faint">{t("shippingNote")}</p>
            <div className="mt-6">
              <Button href="/checkout" className="w-full">
                {t("proceedToCheckout")}
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
