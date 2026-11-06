import { headers } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { hasAdminRole, isAgentOnly } from "@/access/isAdmin";
import { currentMonth, isMonth } from "@/lib/commissionReport";

/**
 * Who may see which commission report: admins any agent (or all), an agent only
 * themselves. Returns null when the visitor isn't allowed at all.
 */
export async function resolveReportRequest(params: { month?: string | null; agent?: string | null }) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  const u = user as { id: number; collection?: string; roles?: string[] | null } | null;
  const admin = hasAdminRole(u);
  if (!admin && !isAgentOnly(u)) return null;

  const requested = Number(params.agent);
  const agentId = admin ? (Number.isFinite(requested) && requested > 0 ? requested : null) : u!.id;
  const month = isMonth(params.month) ? params.month! : currentMonth();
  return { payload, month, agentId };
}
