import { buildBootstrap, getAgent } from "@/lib/agentApp/server";

// Everything the agent's tablet keeps offline (catalogue, clinics, history, visits).
export const dynamic = "force-dynamic";

export async function GET() {
  const { payload, agent } = await getAgent();
  if (!agent) return Response.json({ error: "login" }, { status: 401 });
  return Response.json(await buildBootstrap(payload, agent), { headers: { "Cache-Control": "no-store" } });
}
