import { headers } from "next/headers";
import { getPayloadClient } from "@/lib/payload";
import { hasAdminRole } from "@/access/isAdmin";
import { importPdfList } from "@/lib/catalog/pdfImport";

// Adds the supplier-list products (Administrimi → Importo → "Shto produktet e listës"). Admins only.
export const maxDuration = 300;

export async function POST() {
  const payload = await getPayloadClient();
  const { user } = await payload.auth({ headers: await headers() });
  if (!hasAdminRole(user as { collection?: string; roles?: string[] } | null)) {
    return Response.json({ error: "Vetëm administratori mund ta bëjë importin." }, { status: 403 });
  }
  try {
    return Response.json(await importPdfList(payload));
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
