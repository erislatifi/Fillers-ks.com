import type { Payload, Where } from "payload";
import type { Order, User } from "@/payload-types";

// Monthly commission report: shared by the admin screen (Komisionet), the print page and
// the CSV export, so the three always show the same numbers.

const TZ_OFFSET_HOURS = 1; // Kosovo (CET); months start at local midnight, close enough for reporting.

export type ReportOrder = {
  id: number;
  orderNumber: string;
  date: string;
  clinic: string;
  status: string;
  sales: number;
  commission: number;
};
export type ReportProduct = { name: string; quantity: number; sales: number; commission: number };
export type AgentReport = {
  agent: { id: number; name: string; email: string; code: string | null };
  orders: ReportOrder[];
  products: ReportProduct[];
  totals: { orders: number; sales: number; commission: number };
  paid: { amount: number; paidAt: string } | null;
};

export const currentMonth = () => new Date().toISOString().slice(0, 7);
export const isMonth = (v: unknown): v is string => typeof v === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(v);

function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1, -TZ_OFFSET_HOURS));
  const end = new Date(Date.UTC(y, m, 1, -TZ_OFFSET_HOURS));
  return { start: start.toISOString(), end: end.toISOString() };
}

const agentName = (u: Pick<User, "fullName" | "email">) => u.fullName || u.email;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Agents who appear in the agent filter (admins see all). */
export async function listAgents(payload: Payload) {
  const res = await payload.find({ collection: "users", where: { roles: { in: ["agent"] } }, limit: 200, depth: 0, sort: "fullName" });
  return res.docs.map((u) => ({ id: u.id, name: agentName(u) }));
}

/**
 * Orders credited to agents in `month` whose status counts (Cilësimet → Komisionet),
 * grouped per agent with per-product totals and the recorded payout.
 */
export async function buildCommissionReport(payload: Payload, month: string, agentId?: number | null): Promise<AgentReport[]> {
  const settings = await payload.findGlobal({ slug: "site-settings", depth: 0 });
  const statuses = settings.commissionStatuses?.length ? settings.commissionStatuses : ["fulfilled"];
  const { start, end } = monthRange(month);

  const where: Where = {
    and: [
      { agent: { exists: true } },
      { status: { in: statuses } },
      { createdAt: { greater_than_equal: start } },
      { createdAt: { less_than: end } },
      ...(agentId ? [{ agent: { equals: agentId } }] : []),
    ],
  };
  const { docs: orders } = await payload.find({ collection: "orders", where, limit: 5000, depth: 1, sort: "createdAt" });
  const { docs: payouts } = await payload.find({
    collection: "commission-payouts",
    where: { and: [{ month: { equals: month } }, ...(agentId ? [{ agent: { equals: agentId } }] : [])] },
    limit: 500,
    depth: 0,
  });

  const byAgent = new Map<number, AgentReport>();
  for (const order of orders as Order[]) {
    const agent = order.agent && typeof order.agent === "object" ? order.agent : null;
    if (!agent) continue;
    let report = byAgent.get(agent.id);
    if (!report) {
      report = {
        agent: { id: agent.id, name: agentName(agent), email: agent.email, code: agent.agentCode ?? null },
        orders: [],
        products: [],
        totals: { orders: 0, sales: 0, commission: 0 },
        paid: null,
      };
      byAgent.set(agent.id, report);
    }
    const commission = order.commissionTotal ?? 0;
    report.orders.push({
      id: order.id,
      orderNumber: order.orderNumber ?? String(order.id),
      date: order.createdAt,
      clinic: order.clinicName,
      status: order.status ?? "pending",
      sales: order.subtotal,
      commission,
    });
    report.totals.orders += 1;
    report.totals.sales += order.subtotal;
    report.totals.commission += commission;
    for (const item of order.items) {
      const key = item.name;
      let p = report.products.find((x) => x.name === key);
      if (!p) report.products.push((p = { name: key, quantity: 0, sales: 0, commission: 0 }));
      p.quantity += item.quantity;
      p.sales += item.price * item.quantity;
      p.commission += item.commission ?? 0;
    }
  }

  for (const report of byAgent.values()) {
    report.totals.sales = round2(report.totals.sales);
    report.totals.commission = round2(report.totals.commission);
    report.products = report.products
      .map((p) => ({ ...p, sales: round2(p.sales), commission: round2(p.commission) }))
      .sort((a, b) => b.commission - a.commission);
    const paid = payouts.filter((p) => (typeof p.agent === "object" ? p.agent.id : p.agent) === report.agent.id);
    if (paid.length) {
      report.paid = {
        amount: round2(paid.reduce((s, p) => s + p.amount, 0)),
        paidAt: paid.map((p) => p.paidAt).sort().at(-1)!,
      };
    }
  }
  return [...byAgent.values()].sort((a, b) => b.totals.commission - a.totals.commission);
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Në pritje",
  confirmed: "Konfirmuar",
  fulfilled: "Dorëzuar",
  cancelled: "Anuluar",
};
