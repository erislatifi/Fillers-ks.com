"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "./Logo";

/** Pinned links above the collection groups: Dashboard, pending-orders alert, view live site. */
export function NavTopLinks({ pending }: { pending: number }) {
  const pathname = usePathname();
  const onDashboard = pathname === "/admin" || pathname === "/admin/";

  return (
    <div className="fk-nav-top">
      <Link href="/admin" className="fk-nav-brand" aria-label="Fillers Kosovo — paneli">
        <Mark size={26} id="fk-mark-grad-nav" />
        <span>
          Fillers <small>Kosovo</small>
        </span>
      </Link>

      <Link
        href="/admin"
        id="nav-dashboard"
        className={`nav__link${onDashboard ? " nav__link--selected" : ""}`}
      >
        <span className="nav__link-label">Paneli</span>
      </Link>

      {pending > 0 && (
        <Link
          href="/admin/collections/orders?where[status][equals]=pending"
          className="fk-nav-alert"
        >
          <span className="fk-nav-alert__count">{pending}</span>
          <span>{pending === 1 ? "porosi pret konfirmim" : "porosi presin konfirmim"}</span>
        </Link>
      )}

      <a href="/sq" target="_blank" rel="noreferrer" id="nav-view-site" className="nav__link">
        <span className="nav__link-label">Shiko faqen live</span>
      </a>
    </div>
  );
}
