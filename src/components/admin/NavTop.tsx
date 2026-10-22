import React from "react";
import type { Payload } from "payload";
import { NavTopLinks } from "./NavTopLinks";

/** Server wrapper: looks up the pending-order count, then hands off to the client links. */
export async function NavTop({ payload }: { payload: Payload }) {
  let pending = 0;
  try {
    const res = await payload.count({ collection: "orders", where: { status: { equals: "pending" } } });
    pending = res.totalDocs;
  } catch {
    // Never let a count failure break the whole admin nav.
  }
  return <NavTopLinks pending={pending} />;
}
