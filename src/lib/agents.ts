import { cookies } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { REF_COOKIE } from "@/lib/referral";

/** The agent whose referral link this visitor came through (cookie set by src/proxy.ts). */
export async function agentFromReferral(): Promise<number | null> {
  const code = (await cookies()).get(REF_COOKIE)?.value;
  if (!code) return null;
  const payload = await getPayloadClient();
  const res = await payload.find({
    collection: "users",
    where: { and: [{ agentCode: { equals: code } }, { roles: { in: ["agent"] } }] },
    limit: 1,
    depth: 0,
  });
  return res.docs[0]?.id ?? null;
}

/**
 * Who gets the commission for an order: the clinic's assigned agent wins; otherwise the
 * agent whose link the visitor used; otherwise nobody.
 */
export async function creditedAgent(customer: { agent?: unknown } | null): Promise<number | null> {
  const assigned = customer?.agent;
  if (assigned && typeof assigned === "object" && "id" in assigned) return Number((assigned as { id: unknown }).id);
  if (typeof assigned === "number") return assigned;
  return agentFromReferral();
}
