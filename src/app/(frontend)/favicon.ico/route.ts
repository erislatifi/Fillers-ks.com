import fs from "fs/promises";
import path from "path";
import { getPayloadClient } from "@/lib/payload";

// The browser-tab icon. Cilësimet → Tekstet e faqes → "Ikona në tab-in e browser-it" wins;
// without it, the Fillers crescent bundled in public/brand/favicon.ico.
export const dynamic = "force-dynamic";

const CACHE = "public, max-age=3600, stale-while-revalidate=86400";

async function fallback() {
  const data = await fs.readFile(path.join(process.cwd(), "public", "brand", "favicon.ico"));
  return new Response(new Uint8Array(data), { headers: { "Content-Type": "image/x-icon", "Cache-Control": CACHE } });
}

export async function GET(request: Request) {
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({ slug: "site-settings", depth: 1 });
    const icon = settings.favicon;
    const url = typeof icon === "object" && icon ? (icon.sizes?.thumbnail?.url ?? icon.url) : null;
    if (!url) return fallback();
    const res = await fetch(new URL(url, request.url), { cache: "no-store" });
    if (!res.ok) return fallback();
    return new Response(await res.arrayBuffer(), {
      headers: { "Content-Type": res.headers.get("content-type") ?? "image/png", "Cache-Control": CACHE },
    });
  } catch {
    return fallback();
  }
}
