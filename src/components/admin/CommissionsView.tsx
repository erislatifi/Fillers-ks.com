import React from "react";
import Link from "next/link";
import type { AdminViewServerProps } from "payload";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { hasAdminRole, isAgentOnly } from "../../access/isAdmin";
import { buildCommissionReport, currentMonth, isMonth, listAgents, STATUS_LABELS } from "../../lib/commissionReport";
import { Card, Kpi } from "./Dashboard";

const eur = (n: number) => `€${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (iso: string) =>
  new Intl.DateTimeFormat("sq-AL", { day: "numeric", month: "short", timeZone: "Europe/Belgrade" }).format(new Date(iso));
const monthLabel = (m: string) =>
  new Intl.DateTimeFormat("sq-AL", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-01T00:00:00Z`));

/**
 * Admin → Komisionet (/admin/komisionet): monthly sales and commission per agent.
 * Admins pick any agent; an agent only ever sees their own numbers.
 */
export async function CommissionsView(props: AdminViewServerProps) {
  const { initPageResult, searchParams, payload } = props;
  // Custom views don't always receive `user` directly; the request always has it.
  const user = props.user ?? initPageResult.req.user ?? undefined;
  const u = user as { id: number; collection?: string; roles?: string[] | null } | undefined;
  const admin = hasAdminRole(u);
  const agent = isAgentOnly(u);

  const template = (children: React.ReactNode) => (
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
        {children}
      </div>
    </DefaultTemplate>
  );

  if (!admin && !agent) {
    return template(<p className="fk-empty">Kjo faqe është vetëm për administratorët dhe agjentët e shitjes.</p>);
  }

  const month = isMonth(searchParams?.month) ? (searchParams.month as string) : currentMonth();
  const agentParam = Number(searchParams?.agent);
  const agentId = agent ? u!.id : Number.isFinite(agentParam) && agentParam > 0 ? agentParam : null;
  const [reports, agents] = await Promise.all([
    buildCommissionReport(payload, month, agentId),
    admin ? listAgents(payload) : Promise.resolve([]),
  ]);
  const totals = reports.reduce(
    (t, r) => ({ orders: t.orders + r.totals.orders, sales: t.sales + r.totals.sales, commission: t.commission + r.totals.commission }),
    { orders: 0, sales: 0, commission: 0 },
  );
  const unpaid = reports.reduce((s, r) => s + Math.max(0, r.totals.commission - (r.paid?.amount ?? 0)), 0);
  const qs = `month=${month}${agentId ? `&agent=${agentId}` : ""}`;

  return template(
    <>
      <header className="fk-dash__head">
        <div>
          <p className="fk-eyebrow">Shitjet</p>
          <h1 className="fk-dash__title">Komisionet — {monthLabel(month)}</h1>
          <p className="fk-dash__sub">
            {agent
              ? "Shitjet dhe komisioni yt për muajin e zgjedhur."
              : "Sa ka shitur secili agjent dhe sa komision i takon. Numërohen vetëm porositë me statusin që e ke zgjedhur te Cilësimet → Komisionet."}
          </p>
        </div>
        <div className="fk-dash__cta">
          <a href={`/print/commissions?${qs}`} target="_blank" rel="noreferrer" className="fk-btn fk-btn--ghost">
            Printo / PDF
          </a>
          <a href={`/print/commissions/csv?${qs}`} className="fk-btn">
            Shkarko Excel (CSV)
          </a>
        </div>
      </header>

      <form method="get" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end", margin: "8px 0 24px" }}>
        <label style={{ display: "grid", gap: 4 }}>
          <span className="fk-kpi__label">Muaji</span>
          <input type="month" name="month" defaultValue={month} className="fk-input" style={inputStyle} />
        </label>
        {admin && (
          <label style={{ display: "grid", gap: 4 }}>
            <span className="fk-kpi__label">Agjenti</span>
            <select name="agent" defaultValue={agentId ?? ""} style={inputStyle}>
              <option value="">Të gjithë agjentët</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <button type="submit" className="fk-btn">
          Shfaq
        </button>
      </form>

      <div className="fk-kpis">
        <Kpi label="Porosi" value={totals.orders} icon="receipt" />
        <Kpi label="Shitjet (produktet)" value={eur(totals.sales)} icon="euro" tone="teal" />
        <Kpi label="Komisioni" value={eur(totals.commission)} icon="star" tone="pink" />
        <Kpi label="Pa paguar" value={eur(unpaid)} icon="clock" tone="amber" />
      </div>

      {reports.length === 0 && (
        <p className="fk-empty" style={{ marginTop: 24 }}>
          S’ka porosi me komision për këtë muaj{agentId ? " dhe këtë agjent" : ""}.
          {admin && " Kontrollo që porositë kanë agjent dhe statusin e duhur."}
        </p>
      )}

      {reports.map((r) => (
        <div key={r.agent.id} style={{ marginTop: 28 }}>
          <Card title={`${r.agent.name}${r.agent.code ? ` · kodi ${r.agent.code}` : ""}`}>
            <p className="fk-note" style={{ margin: "0 0 12px" }}>
              {r.totals.orders} porosi · shitjet {eur(r.totals.sales)} · komisioni <strong>{eur(r.totals.commission)}</strong>
              {" · "}
              {r.paid
                ? `paguar ${eur(r.paid.amount)} më ${date(r.paid.paidAt)}${r.paid.amount < r.totals.commission ? ` — mbeten ${eur(r.totals.commission - r.paid.amount)}` : ""}`
                : "pa paguar"}
              {admin && (
                <>
                  {" · "}
                  <Link className="fk-link" href="/admin/collections/commission-payouts/create">
                    Shëno pagesën
                  </Link>
                </>
              )}
            </p>

            <div className="fk-table-wrap">
              <table className="fk-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Porosia</th>
                    <th>Klinika</th>
                    <th>Statusi</th>
                    <th className="is-num">Shitja</th>
                    <th className="is-num">Komisioni</th>
                  </tr>
                </thead>
                <tbody>
                  {r.orders.map((o) => (
                    <tr key={o.id}>
                      <td>{date(o.date)}</td>
                      <td>
                        <Link href={`/admin/collections/orders/${o.id}`} className="fk-link fk-link--strong">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td>{o.clinic}</td>
                      <td>{STATUS_LABELS[o.status] ?? o.status}</td>
                      <td className="is-num">{eur(o.sales)}</td>
                      <td className="is-num">{eur(o.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ margin: "20px 0 8px", fontSize: 14 }}>Sipas produktit</h3>
            <div className="fk-table-wrap">
              <table className="fk-table">
                <thead>
                  <tr>
                    <th>Produkti</th>
                    <th className="is-num">Sasia</th>
                    <th className="is-num">Shitja</th>
                    <th className="is-num">Komisioni</th>
                  </tr>
                </thead>
                <tbody>
                  {r.products.map((p) => (
                    <tr key={p.name}>
                      <td>{p.name}</td>
                      <td className="is-num">{p.quantity}</td>
                      <td className="is-num">{eur(p.sales)}</td>
                      <td className="is-num">{eur(p.commission)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ))}
    </>,
  );
}

const inputStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid var(--theme-elevation-250)",
  background: "var(--theme-input-bg)",
  color: "var(--theme-text)",
  font: "inherit",
};
