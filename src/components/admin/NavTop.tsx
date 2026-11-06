import React from "react";
import type { Payload, TypedUser } from "payload";
import { hasAdminRole, isAgentOnly } from "../../access/isAdmin";
import { NavTopLinks } from "./NavTopLinks";

/** Server wrapper: counts pending orders and unread messages, then hands off to the client links. */
export async function NavTop({ payload, user }: { payload: Payload; user?: TypedUser }) {
  const u = user as { collection?: string; roles?: string[] | null } | undefined;
  const admin = hasAdminRole(u);
  const showCommissions = admin || isAgentOnly(u);
  // Order/message alerts are for admins only — editors and agents don't handle the inbox.
  if (!admin) return <NavTopLinks pending={0} newMessages={0} showCommissions={showCommissions} />;
  let pending = 0;
  let newMessages = 0;
  try {
    const [orders, messages] = await Promise.all([
      payload.count({ collection: "orders", where: { status: { equals: "pending" } } }),
      payload.count({ collection: "contact-messages", where: { status: { equals: "new" } } }),
    ]);
    pending = orders.totalDocs;
    newMessages = messages.totalDocs;
  } catch {
    // Never let a count failure break the whole admin nav.
  }
  return <NavTopLinks pending={pending} newMessages={newMessages} showCommissions={showCommissions} showImport />;
}
