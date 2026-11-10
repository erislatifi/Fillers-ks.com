import { headers } from "next/headers";
import type { Payload } from "payload";
import { getPayloadClient, isPublicProduct, VISIBLE } from "@/lib/payload";
import { logoUrl, mediaUrl } from "@/components/media";
import { checkoutChoices, paymentsFor, type DeliveryMethod } from "@/lib/checkout";
import type { Customer, Media, Product, User } from "@/payload-types";
import type { AgentBootstrap, AgentClinic, AgentOrderSummary, AgentVisit } from "./types";

/** The logged-in sales agent (Payload `users` with the agent role), or null. */
export async function getAgent(): Promise<{ payload: Payload; agent: User } | { payload: Payload; agent: null }> {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  const u = user as (User & { collection?: string }) | null;
  if (u?.collection === "users" && u.roles?.includes("agent")) return { payload, agent: u };
  return { payload, agent: null };
}

const imageUrl = (m: number | Media | null | undefined) =>
  m && typeof m === "object" ? (m.sizes?.card?.url ?? mediaUrl(m)) : null;

export const toClinic = (c: Customer): AgentClinic => ({
  id: c.id,
  clinicName: c.clinicName,
  fullName: c.fullName,
  phone: c.phone,
  email: c.email?.endsWith(NO_EMAIL_DOMAIN) ? null : c.email,
  city: c.city ?? null,
  address: c.address ?? null,
});

/** Clinics created on the tablet without an email get a placeholder login on this domain. */
export const NO_EMAIL_DOMAIN = "@pa-email.fillers-ks.com";

/** Everything the tablet keeps offline: catalogue, the agent's clinics, history, visits. */
export async function buildBootstrap(payload: Payload, agent: User): Promise<AgentBootstrap> {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();
  const [settings, brands, categories, products, clinics, orders, visits] = await Promise.all([
    payload.findGlobal({ slug: "site-settings", depth: 0 }),
    payload.find({ collection: "brands", where: { visible: { not_equals: false } }, limit: 300, depth: 1, locale: "sq", sort: "name" }),
    payload.find({ collection: "categories", where: { visible: { not_equals: false } }, limit: 100, depth: 0, locale: "sq" }),
    payload.find({ collection: "products", where: VISIBLE, limit: 1000, depth: 1, locale: "sq", sort: "name" }),
    payload.find({ collection: "customers", where: { agent: { equals: agent.id } }, limit: 1000, depth: 0, sort: "clinicName" }),
    payload.find({ collection: "orders", where: { agent: { equals: agent.id } }, limit: 300, depth: 0, sort: "-createdAt" }),
    payload.find({
      collection: "visits",
      where: { and: [{ agent: { equals: agent.id } }, { or: [{ scheduledAt: { greater_than: since } }, { status: { in: ["planned", "in_progress"] } }] }] },
      limit: 500,
      depth: 0,
      sort: "scheduledAt",
    }),
  ]);
  const choices = checkoutChoices(settings.checkoutOptions);
  const rel = (v: unknown) => (v && typeof v === "object" && "id" in v ? Number((v as { id: unknown }).id) : typeof v === "number" ? v : null);

  return {
    agent: {
      id: agent.id,
      name: agent.fullName || agent.email,
      email: agent.email,
      maxDiscountPercent: agent.maxDiscountPercent ?? 0,
    },
    checkout: {
      deliveries: choices.deliveries,
      payments: Object.fromEntries((Object.keys(paymentsFor) as DeliveryMethod[]).map((d) => [d, choices.payments(d)])) as AgentBootstrap["checkout"]["payments"],
    },
    brands: brands.docs.map((b) => ({
      slug: b.slug,
      name: b.name,
      logo: logoUrl(b.logo),
      tagline: b.tagline ?? "",
      description: b.description ?? "",
      origin: b.origin ?? "",
      type: b.type ?? "injectable",
    })),
    categories: categories.docs.map((c) => ({ slug: c.slug, name: c.name })),
    products: products.docs.filter((p: Product) => isPublicProduct(p)).map((p: Product) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brandSlug: typeof p.brand === "object" && p.brand ? p.brand.slug : "",
      brandName: typeof p.brand === "object" && p.brand ? p.brand.name : "",
      categorySlug: typeof p.category === "object" && p.category ? p.category.slug : "",
      size: p.size ?? null,
      sku: p.sku ?? null,
      price: p.price ?? 0,
      compareAtPrice: p.compareAtPrice && p.compareAtPrice > (p.price ?? 0) ? p.compareAtPrice : null,
      quoteOnly: Boolean(p.quoteOnly),
      stockStatus: p.stockStatus ?? "in_stock",
      description: p.description ?? "",
      images: (p.images ?? []).map(imageUrl).filter((u): u is string => Boolean(u)),
      bestSeller: Boolean(p.bestSeller),
      newArrival: Boolean(p.newArrival),
    })),
    clinics: clinics.docs.map(toClinic),
    orders: orders.docs.map(
      (o): AgentOrderSummary => ({
        id: o.id,
        orderNumber: o.orderNumber ?? String(o.id),
        createdAt: o.createdAt,
        status: o.status ?? "pending",
        total: o.total ?? o.subtotal ?? 0,
        customerId: rel(o.customer),
        clinicName: o.clinicName,
        items: (o.items ?? []).map((i) => ({ productId: rel(i.product), name: i.name, quantity: i.quantity, price: i.price })),
      }),
    ),
    visits: visits.docs.map(
      (v): AgentVisit => ({
        id: v.id,
        clientId: v.clientId ?? `server-${v.id}`,
        customerId: rel(v.customer),
        clinicName: v.clinicName,
        scheduledAt: v.scheduledAt ?? null,
        status: (v.status ?? "planned") as AgentVisit["status"],
        checkInAt: v.checkInAt ?? null,
        checkOutAt: v.checkOutAt ?? null,
        notes: v.notes ?? null,
        interest: (v.interest ?? null) as AgentVisit["interest"],
        nextVisitAt: v.nextVisitAt ?? null,
      }),
    ),
    generatedAt: new Date().toISOString(),
  };
}
