import { after } from "next/server";
import { getAgent } from "@/lib/agentApp/server";
import { applyOps } from "@/lib/agentApp/sync";
import { emailNewOrder } from "@/lib/email";
import type { SyncOp } from "@/lib/agentApp/types";

// The tablet sends its queued work here every 15 minutes, when the internet returns, and
// right after an order. Idempotent: resending the same ops never creates duplicates.
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(request: Request) {
  const { payload, agent } = await getAgent();
  if (!agent) return Response.json({ error: "login" }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { ops?: SyncOp[] } | null;
  if (!body || !Array.isArray(body.ops)) return Response.json({ error: "bad-request" }, { status: 400 });
  const { results, newOrders } = await applyOps(payload, agent, body.ops);
  for (const order of newOrders) after(() => emailNewOrder(order));
  return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
