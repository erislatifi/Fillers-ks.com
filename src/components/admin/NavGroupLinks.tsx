"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Puts extra links (custom admin pages, external apps) inside one of Payload's sidebar
 * groups — e.g. "Raporti i komisioneve" under "Agjentët" — so related things sit together.
 * Payload renders each group as #nav-group-<label> › .nav-group__content. If the group isn't
 * found (renamed, hidden for this user), the links show where this component is rendered.
 */
export function NavGroupLinks({ group, children }: { group: string; children: React.ReactNode }) {
  const [target, setTarget] = useState<Element | null>(null);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    const find = () => document.getElementById(`nav-group-${group}`)?.querySelector(".nav-group__content") ?? null;
    const found = find();
    if (found) return setTarget(found);
    // The nav may render after this component — watch briefly, then fall back.
    const observer = new MutationObserver(() => {
      const el = find();
      if (el) {
        setTarget(el);
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = setTimeout(() => {
      observer.disconnect();
      setGaveUp(true);
    }, 2500);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [group]);

  if (target) return createPortal(children, target);
  return gaveUp ? <>{children}</> : null;
}
