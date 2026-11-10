"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CloseIcon, MinusIcon, PlusIcon, SearchIcon } from "@/components/icons";
import type { AgentBootstrap, AgentProduct } from "@/lib/agentApp/types";
import { eur, type CartLine } from "./store";

type Props = {
  data: AgentBootstrap;
  cart: CartLine[];
  presentation: boolean;
  onAdd: (productId: number, quantity: number) => void;
};

/** Brands → products, big touch targets; prices hidden in presentation mode. */
export function CatalogView({ data, cart, presentation, onAdd }: Props) {
  const t = useTranslations("agentApp.catalog");
  const [brand, setBrand] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<AgentProduct | null>(null);

  const inCart = (id: number) => cart.find((l) => l.productId === id)?.quantity ?? 0;
  const brandInfo = brand ? data.brands.find((b) => b.slug === brand) : null;

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.products.filter(
      (p) =>
        (!brand || p.brandSlug === brand) &&
        (!category || p.categorySlug === category) &&
        (!q || `${p.name} ${p.brandName} ${p.sku ?? ""}`.toLowerCase().includes(q)),
    );
  }, [data.products, brand, category, query]);

  // Only categories that have products in the current brand.
  const categories = data.categories.filter((c) => data.products.some((p) => p.categorySlug === c.slug && (!brand || p.brandSlug === brand)));
  const brands = data.brands.filter((b) => data.products.some((p) => p.brandSlug === b.slug));

  return (
    <div className="pb-6">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search")}
          className="h-14 w-full rounded-2xl border border-line bg-paper pl-12 pr-4 text-[17px] outline-none focus:border-accent"
        />
      </div>

      {/* Brand strip: logos to tap, like a printed brochure's index. */}
      <div className="-mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        <button
          onClick={() => { setBrand(null); setCategory(null); }}
          className={`flex h-20 shrink-0 items-center rounded-2xl border px-6 text-[15px] font-semibold ${!brand ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-soft"}`}
        >
          {t("allBrands")}
        </button>
        {brands.map((b) => (
          <button
            key={b.slug}
            onClick={() => { setBrand(b.slug === brand ? null : b.slug); setCategory(null); }}
            className={`flex h-20 w-40 shrink-0 items-center justify-center rounded-2xl border bg-paper px-4 ${brand === b.slug ? "border-accent ring-2 ring-accent/30" : "border-line"}`}
          >
            {b.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={b.logo} alt={b.name} className="max-h-10 w-auto max-w-full object-contain" />
            ) : (
              <span className="font-display text-[16px] font-semibold text-ink">{b.name}</span>
            )}
          </button>
        ))}
      </div>

      {brandInfo && (
        <div className="mt-3 rounded-2xl border border-line bg-paper p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-faint">{brandInfo.origin}</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{brandInfo.name}</h2>
          <p className="mt-1 text-[15px] font-medium text-accent-deep">{brandInfo.tagline}</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{brandInfo.description}</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={!category} onClick={() => setCategory(null)}>{t("allCategories")}</Chip>
        {categories.map((c) => (
          <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>{c.name}</Chip>
        ))}
      </div>

      <p className="mt-4 text-[14px] text-ink-faint">{t("products", { count: products.length })}</p>

      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <button key={p.id} onClick={() => setOpen(p)} className="group overflow-hidden rounded-2xl border border-line bg-paper text-left active:scale-[0.99]">
            <div className="relative aspect-square bg-mist">
              {p.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center font-display text-3xl text-ink/20">{p.brandName.slice(0, 2)}</div>
              )}
              {inCart(p.id) > 0 && (
                <span className="absolute right-2 top-2 rounded-full bg-accent px-2.5 py-1 text-[12px] font-bold text-white">
                  {t("inCart", { count: inCart(p.id) })}
                </span>
              )}
              <StockBadge product={p} />
            </div>
            <div className="p-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-accent-deep">{p.brandName}</p>
              <h3 className="mt-1 text-[16px] font-semibold leading-snug text-ink line-clamp-2">{p.name}</h3>
              {p.size && <p className="mt-0.5 text-[13px] text-ink-faint">{p.size}</p>}
              {!presentation && <Price product={p} quoteLabel={t("quote")} />}
            </div>
          </button>
        ))}
      </div>

      {open && <ProductSheet product={open} presentation={presentation} inCart={inCart(open.id)} onClose={() => setOpen(null)} onAdd={onAdd} />}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`h-11 rounded-full border px-5 text-[15px] font-medium ${active ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink-soft"}`}
    >
      {children}
    </button>
  );
}

function Price({ product, quoteLabel }: { product: AgentProduct; quoteLabel: string }) {
  if (product.quoteOnly) return <p className="mt-2 text-[15px] font-medium text-ink-soft">{quoteLabel}</p>;
  return (
    <p className="mt-2 font-display text-[19px] font-semibold text-ink">
      {eur(product.price)}
      {product.compareAtPrice && <span className="ml-2 text-[14px] font-normal text-ink-faint line-through">{eur(product.compareAtPrice)}</span>}
    </p>
  );
}

function StockBadge({ product }: { product: AgentProduct }) {
  const t = useTranslations("agentApp.catalog");
  if (product.stockStatus === "out_of_stock")
    return <span className="absolute left-2 top-2 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-paper">{t("outOfStock")}</span>;
  if (product.stockStatus === "low_stock")
    return <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900">{t("lowStock")}</span>;
  return null;
}

function ProductSheet({
  product,
  presentation,
  inCart,
  onClose,
  onAdd,
}: {
  product: AgentProduct;
  presentation: boolean;
  inCart: number;
  onClose: () => void;
  onAdd: (productId: number, quantity: number) => void;
}) {
  const t = useTranslations("agentApp.catalog");
  const [image, setImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const canOrder = !product.quoteOnly;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-paper sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex justify-end bg-paper/90 p-3 backdrop-blur">
          <button onClick={onClose} className="flex h-12 w-12 items-center justify-center rounded-full bg-mist" aria-label={t("back")}>
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="grid gap-6 px-6 pb-8 md:grid-cols-2">
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl bg-mist">
              {product.images[image] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images[image]} alt={product.name} className="h-full w-full object-contain" />
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {product.images.map((src, i) => (
                  <button key={src} onClick={() => setImage(i)} className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${i === image ? "border-accent" : "border-transparent"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-wider text-accent-deep">{product.brandName}</p>
            <h2 className="mt-1 font-display text-[28px] font-semibold leading-tight text-ink">{product.name}</h2>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-[14px]">
              {product.size && (<><dt className="text-ink-faint">{t("size")}</dt><dd className="text-ink">{product.size}</dd></>)}
              {product.sku && (<><dt className="text-ink-faint">{t("sku")}</dt><dd className="text-ink">{product.sku}</dd></>)}
            </dl>
            {!presentation && <Price product={product} quoteLabel={t("quote")} />}
            <p className="mt-4 whitespace-pre-line text-[16px] leading-relaxed text-ink-soft">{product.description}</p>

            {canOrder && (
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-14 items-center rounded-2xl border border-line">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-14 w-14 items-center justify-center" aria-label="-">
                    <MinusIcon className="h-5 w-5" />
                  </button>
                  <span className="w-10 text-center text-[19px] font-semibold">{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(999, q + 1))} className="flex h-14 w-14 items-center justify-center" aria-label="+">
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={() => { onAdd(product.id, qty); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
                  className="h-14 flex-1 rounded-2xl bg-ink text-[17px] font-semibold text-paper active:bg-accent-deep"
                >
                  {added ? `✓ ${t("added")}` : t("add")}
                </button>
              </div>
            )}
            {inCart > 0 && <p className="mt-3 text-[14px] font-medium text-accent-deep">{t("inCart", { count: inCart })}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
