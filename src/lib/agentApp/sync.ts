import crypto from "crypto";
import type { Payload } from "payload";
import { isPublicProduct } from "@/lib/payload";
import { quoteShipping } from "@/lib/shipping";
import { HOME_COUNTRY } from "@/lib/countries";
import { checkoutChoices } from "@/lib/checkout";
import type { Order, User } from "@/payload-types";
import { NO_EMAIL_DOMAIN } from "./server";
import type { ClinicOp, LocationOp, OrderOp, SyncOp, SyncResult, VisitOp } from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;
const idOf = (v: unknown) => (v && typeof v === "object" && "id" in v ? Number((v as { id: unknown }).id) : typeof v === "number" ? v : null);

/** Ids of things created earlier in the same batch (or earlier syncs), by the tablet's clientId. */
type Ctx = { payload: Payload; agent: User; clinics: Map<string, number>; visits: Map<string, number> };

async function byClientId(payload: Payload, collection: "customers" | "visits" | "orders" | "agent-locations", clientId: string) {
  if (collection === "customers") return null; // customers are matched by email instead
  const res = await payload.find({ collection, where: { clientId: { equals: clientId } }, limit: 1, depth: 0 });
  return res.docs[0] ?? null;
}

async function resolveCustomer(ctx: Ctx, customerId?: number | null, customerClientId?: string) {
  if (customerId) return customerId;
  if (customerClientId && ctx.clinics.has(customerClientId)) return ctx.clinics.get(customerClientId)!;
  return null;
}

async function clinicOp(ctx: Ctx, op: ClinicOp): Promise<SyncResult> {
  const { payload, agent } = ctx;
  const d = op.data;
  if (!d.clinicName?.trim() || !d.fullName?.trim() || !d.phone?.trim()) return { clientId: op.clientId, ok: false, error: "missing-fields" };
  const email = d.email?.trim().toLowerCase() || `klinika-${op.clientId.slice(0, 12).toLowerCase()}${NO_EMAIL_DOMAIN}`;

  // Same clinic synced twice, or a clinic that already registered on the website.
  const existing = await payload.find({ collection: "customers", where: { email: { equals: email } }, limit: 1, depth: 0 });
  const found = existing.docs[0];
  if (found) {
    const owner = idOf(found.agent);
    if (owner && owner !== agent.id) return { clientId: op.clientId, ok: false, error: "clinic-other-agent" };
    if (!owner) await payload.update({ collection: "customers", id: found.id, data: { agent: agent.id } });
    ctx.clinics.set(op.clientId, found.id);
    return { clientId: op.clientId, ok: true, id: found.id };
  }

  const created = await payload.create({
    collection: "customers",
    data: {
      clinicName: d.clinicName.trim(),
      fullName: d.fullName.trim(),
      phone: d.phone.trim(),
      city: d.city?.trim() || undefined,
      address: d.address?.trim() || undefined,
      email,
      // The clinic never logs in with this; it can set its own password via "kam harruar fjalëkalimin"
      // or the team can change it in the admin.
      password: crypto.randomBytes(18).toString("base64url"),
      agent: agent.id,
    },
  });
  ctx.clinics.set(op.clientId, created.id);
  return { clientId: op.clientId, ok: true, id: created.id };
}

async function visitOp(ctx: Ctx, op: VisitOp): Promise<SyncResult> {
  const { payload, agent } = ctx;
  const d = op.data;
  const customer = await resolveCustomer(ctx, d.customerId, d.customerClientId);
  const data = {
    agent: agent.id,
    customer: customer ?? undefined,
    clinicName: d.clinicName,
    scheduledAt: d.scheduledAt ?? undefined,
    status: d.status,
    checkInAt: d.checkInAt ?? undefined,
    checkOutAt: d.checkOutAt ?? undefined,
    checkInLat: d.lat ?? undefined,
    checkInLng: d.lng ?? undefined,
    notes: d.notes ?? undefined,
    interest: d.interest ?? undefined,
    nextVisitAt: d.nextVisitAt ?? undefined,
    clientId: op.clientId,
  };
  // The visit may have been planned on the server (bootstrap gives it a `server-<id>` clientId).
  const serverId = op.clientId.startsWith("server-") ? Number(op.clientId.slice(7)) : null;
  const existing = serverId
    ? await payload.findByID({ collection: "visits", id: serverId, depth: 0 }).catch(() => null)
    : await byClientId(payload, "visits", op.clientId);
  if (existing) {
    if (idOf(existing.agent) !== agent.id) return { clientId: op.clientId, ok: false, error: "not-yours" };
    const { clientId: _skip, ...rest } = data;
    const updated = await payload.update({ collection: "visits", id: existing.id, data: serverId ? rest : data });
    ctx.visits.set(op.clientId, updated.id);
    return { clientId: op.clientId, ok: true, id: updated.id };
  }
  const created = await payload.create({ collection: "visits", data });
  ctx.visits.set(op.clientId, created.id);
  return { clientId: op.clientId, ok: true, id: created.id };
}

async function visitId(ctx: Ctx, clientId?: string) {
  if (!clientId) return null;
  if (ctx.visits.has(clientId)) return ctx.visits.get(clientId)!;
  if (clientId.startsWith("server-")) return Number(clientId.slice(7));
  const v = await byClientId(ctx.payload, "visits", clientId);
  return v?.id ?? null;
}

async function orderOp(ctx: Ctx, op: OrderOp): Promise<SyncResult> {
  const { payload, agent } = ctx;
  const d = op.data;
  const already = (await byClientId(payload, "orders", op.clientId)) as Order | null;
  if (already) return { clientId: op.clientId, ok: true, id: already.id, orderNumber: already.orderNumber ?? undefined, total: already.total ?? undefined };

  const customerId = await resolveCustomer(ctx, d.customerId, d.customerClientId);
  if (!customerId) return { clientId: op.clientId, ok: false, error: "clinic-missing" };
  const clinic = await payload.findByID({ collection: "customers", id: customerId, depth: 0 }).catch(() => null);
  if (!clinic) return { clientId: op.clientId, ok: false, error: "clinic-missing" };
  if (idOf(clinic.agent) !== agent.id) return { clientId: op.clientId, ok: false, error: "clinic-other-agent" };
  if (!d.items?.length) return { clientId: op.clientId, ok: false, error: "empty-cart" };

  // Prices always from the database — the tablet only says which products and how many.
  const items = [];
  for (const line of d.items) {
    const quantity = Math.floor(Number(line.quantity));
    const product = await payload.findByID({ collection: "products", id: line.productId, depth: 1 }).catch(() => null);
    if (!product || !isPublicProduct(product) || product.quoteOnly || !(quantity >= 1 && quantity <= 999)) {
      return { clientId: op.clientId, ok: false, error: "unavailable" };
    }
    items.push({
      product: product.id,
      name: product.name,
      brandName: typeof product.brand === "object" && product.brand ? product.brand.name : undefined,
      size: product.size ?? undefined,
      price: product.price ?? 0,
      quantity,
    });
  }

  const settings = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  const choices = checkoutChoices(settings.checkoutOptions);
  if (!choices.deliveries.includes(d.deliveryMethod) || !choices.payments(d.deliveryMethod).includes(d.paymentMethod)) {
    return { clientId: op.clientId, ok: false, error: "delivery" };
  }
  const courier = d.deliveryMethod === "courier";
  if (courier && (!clinic.address || !clinic.city)) return { clientId: op.clientId, ok: false, error: "address" };

  const subtotal = round2(items.reduce((s, i) => s + i.price * i.quantity, 0));
  // Never more than the limit the admin set for this agent (Përdoruesit → Zbritja maksimale).
  const maxDiscount = Math.max(0, Math.min(100, agent.maxDiscountPercent ?? 0));
  const discountPercent = Math.max(0, Math.min(maxDiscount, Number(d.discountPercent) || 0));
  const discountAmount = round2((subtotal * discountPercent) / 100);
  const quote = quoteShipping(d.deliveryMethod, subtotal - discountAmount, settings, { country: HOME_COUNTRY, city: clinic.city ?? undefined });
  const shipping = quote.cost;
  const total = round2(subtotal - discountAmount + (shipping ?? 0));

  let signature: number | undefined;
  const match = d.signature?.match(/^data:image\/png;base64,([A-Za-z0-9+/=]+)$/);
  if (match) {
    const data = Buffer.from(match[1], "base64");
    if (data.length > 0 && data.length < 2_000_000) {
      const media = await payload.create({
        collection: "media",
        data: { alt: `Nënshkrimi — ${clinic.clinicName}` },
        file: { data, mimetype: "image/png", name: `nenshkrim-${op.clientId.slice(0, 16)}.png`, size: data.length },
      });
      signature = media.id;
    }
  }

  const order = await payload.create({
    collection: "orders",
    data: {
      clinicName: clinic.clinicName,
      contactName: clinic.fullName,
      email: clinic.email,
      phone: clinic.phone,
      deliveryMethod: d.deliveryMethod,
      paymentMethod: d.paymentMethod,
      deliveryAddress: courier ? clinic.address ?? undefined : undefined,
      city: clinic.city ?? undefined,
      country: courier ? (HOME_COUNTRY as "XK") : undefined,
      shippingZone: courier ? quote.zoneName ?? undefined : undefined,
      requestedDeliveryDate: d.requestedDeliveryDate || undefined,
      notes: d.notes || undefined,
      items,
      subtotal,
      discountPercent: discountPercent || undefined,
      discountAmount: discountAmount || undefined,
      shippingCost: shipping ?? undefined,
      total,
      customer: clinic.id,
      agent: agent.id,
      source: "agent_tablet",
      visit: (await visitId(ctx, d.visitClientId)) ?? undefined,
      signature,
      signedBy: signature ? d.signedBy || undefined : undefined,
      clientId: op.clientId,
    },
  });
  return { clientId: op.clientId, ok: true, id: order.id, orderNumber: order.orderNumber ?? undefined, total };
}

async function locationOp(ctx: Ctx, op: LocationOp): Promise<SyncResult> {
  const d = op.data;
  if (!Number.isFinite(d.lat) || !Number.isFinite(d.lng)) return { clientId: op.clientId, ok: false, error: "gps" };
  const existing = await byClientId(ctx.payload, "agent-locations", op.clientId);
  if (existing) return { clientId: op.clientId, ok: true, id: existing.id };
  const created = await ctx.payload.create({
    collection: "agent-locations",
    data: {
      agent: ctx.agent.id,
      lat: d.lat,
      lng: d.lng,
      accuracy: d.accuracy ?? undefined,
      recordedAt: d.recordedAt,
      kind: d.kind,
      visit: (await visitId(ctx, d.visitClientId)) ?? undefined,
      clientId: op.clientId,
    },
  });
  return { clientId: op.clientId, ok: true, id: created.id };
}

/**
 * Applies the tablet's queued work in order (clinics → visits → orders → locations as queued).
 * Every op is idempotent by its clientId, so a batch resent after a lost connection is safe.
 */
export async function applyOps(payload: Payload, agent: User, ops: SyncOp[]): Promise<{ results: SyncResult[]; newOrders: Order[] }> {
  const ctx: Ctx = { payload, agent, clinics: new Map(), visits: new Map() };
  const results: SyncResult[] = [];
  const newOrders: Order[] = [];
  for (const op of ops.slice(0, 200)) {
    try {
      if (!op?.clientId || typeof op.clientId !== "string") continue;
      let r: SyncResult;
      if (op.type === "clinic") r = await clinicOp(ctx, op);
      else if (op.type === "visit") r = await visitOp(ctx, op);
      else if (op.type === "order") {
        const before = await byClientId(payload, "orders", op.clientId);
        r = await orderOp(ctx, op);
        if (r.ok && !before && r.id) newOrders.push(await payload.findByID({ collection: "orders", id: r.id, depth: 0 }));
      } else if (op.type === "location") r = await locationOp(ctx, op);
      else continue;
      results.push(r);
    } catch (err) {
      console.error("agent sync op failed", op?.type, err);
      results.push({ clientId: op.clientId, ok: false, error: "server-error" });
    }
  }
  return { results, newOrders };
}
