import React from "react";
import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { hasAdminRole } from "../../access/isAdmin";
import { NEW_BRANDS, PRODUCT_MAP } from "../../lib/wordpress/catalogMap";
import { ImportRunner } from "./ImportRunner";

/** Administrimi → Importo nga WordPress (/admin/importo). Admins only. */
export function ImportView(props: AdminViewServerProps) {
  const { initPageResult, searchParams, payload } = props;
  const user = props.user ?? initPageResult.req.user ?? undefined;
  const admin = hasAdminRole(user as { collection?: string; roles?: string[] } | undefined);
  const byCategory = Object.values(PRODUCT_MAP).reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={props.params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={initPageResult.visibleEntities}
    >
      <div className="fk-dash" style={{ padding: "32px var(--gutter-h, 48px)" }}>
        <header className="fk-dash__head">
          <div>
            <p className="fk-eyebrow">Administrimi</p>
            <h1 className="fk-dash__title">Importo nga WordPress</h1>
            <p className="fk-dash__sub">
              Merr produktet nga dyqani i vjetër (fillers-ks.com) me çmimet, zbritjet, stokun, përshkrimin dhe fotot. Çdo produkt
              është renditur me dorë në brendin dhe kategorinë e duhur.
            </p>
          </div>
        </header>

        {!admin ? (
          <p className="fk-empty">Vetëm administratori mund ta bëjë importin.</p>
        ) : (
          <>
            <p className="fk-note">
              {Object.keys(PRODUCT_MAP).length} produkte · {NEW_BRANDS.length} brende të reja (
              {NEW_BRANDS.map((b) => b.name).join(", ")}) ·{" "}
              {Object.entries(byCategory)
                .map(([c, n]) => `${c} ${n}`)
                .join(" · ")}
              . Mund ta nisësh sa herë të duash: produktet ekzistuese përditësohen, nuk dyfishohen.
            </p>
            <ImportRunner />
          </>
        )}
      </div>
    </DefaultTemplate>
  );
}
