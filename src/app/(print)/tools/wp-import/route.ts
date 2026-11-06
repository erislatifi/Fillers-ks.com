import { headers } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { hasAdminRole } from "@/access/isAdmin";
import { importWordPressBatch } from "@/lib/wordpress/importer";

// One batch of the WordPress import (Administrimi → Importo nga WordPress calls this
// repeatedly until `next` is null). Admins only.
export const maxDuration = 300;

export async function POST(request: Request) {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!hasAdminRole(user as { collection?: string; roles?: string[] } | null)) {
    return Response.json({ error: "Vetëm administratori mund ta bëjë importin." }, { status: 403 });
  }
  const body = (await request.json().catch(() => ({}))) as { offset?: number; hideOthers?: boolean };
  const offset = Math.max(0, Math.floor(Number(body.offset) || 0));
  try {
    const result = await importWordPressBatch(payload, { offset, size: 6, hideOthers: Boolean(body.hideOthers) });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
