import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { getAgent } from "@/lib/agentApp/server";
import { AgentApp } from "@/components/agent/AgentApp";
import { AgentLogin } from "@/components/agent/AgentLogin";

// The agents' tablet app. Texts: messages → agentApp (editable at Përmbajtja → Tekstet).
export const dynamic = "force-dynamic";

export default async function AgentPage() {
  const [{ agent }, messages] = await Promise.all([getAgent(), getMessages({ locale: "sq" })]);
  return (
    <NextIntlClientProvider locale="sq" messages={{ agentApp: messages.agentApp }}>
      {agent ? <AgentApp agentId={agent.id} agentName={agent.fullName || agent.email} /> : <AgentLogin />}
    </NextIntlClientProvider>
  );
}
