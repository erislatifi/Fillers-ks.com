import React from "react";
import type { Payload } from "payload";
import { NavTopLinks } from "./NavTopLinks";

/** Server wrapper: counts pending orders and unread messages, then hands off to the client links. */
export async function NavTop({ payload }: { payload: Payload }) {
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
  return <NavTopLinks pending={pending} newMessages={newMessages} />;
}
