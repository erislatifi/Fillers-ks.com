import { redirect } from "next/navigation";
import { buildCommissionReport, STATUS_LABELS } from "@/lib/commissionReport";
import { resolveReportRequest } from "@/lib/reportAccess";
import { PrintButton } from "../order/[id]/PrintButton";

type Props = { searchParams: Promise<{ month?: string; agent?: string }> };

export const metadata = { title: "Raporti i komisioneve" };

const eur = (n: number) => `€${n.toFixed(2)}`;
const date = (iso: string) => new Intl.DateTimeFormat("sq-AL", { dateStyle: "medium", timeZone: "Europe/Belgrade" }).format(new Date(iso));
const monthLabel = (m: string) =>
  new Intl.DateTimeFormat("sq-AL", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${m}-01T00:00:00Z`));

/** Printable / save-as-PDF monthly commission statement (one page per agent). */
export default async function PrintCommissionsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const req = await resolveReportRequest(sp);
  if (!req) redirect(`/admin/login?redirect=/print/commissions`);
  const reports = await buildCommissionReport(req.payload, req.month, req.agentId);

  return (
    <main className="sheet">
      <style>{css}</style>
      <div className="toolbar">
        <PrintButton />
      </div>
      {reports.length === 0 && <p>S’ka porosi me komision për {monthLabel(req.month)}.</p>}
      {reports.map((r) => (
        <section key={r.agent.id} className="agent">
          <header className="head">
            <div>
              <div className="brand">Fillers Kosovo</div>
              <div className="muted">Raporti i komisionit — {monthLabel(req.month)}</div>
            </div>
            <div className="right">
              <strong>{r.agent.name}</strong>
              <div className="muted">{r.agent.email}</div>
              {r.agent.code && <div className="muted">Kodi: {r.agent.code}</div>}
            </div>
          </header>
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Porosia</th>
                <th>Klinika</th>
                <th>Statusi</th>
                <th className="num">Shitja</th>
                <th className="num">Komisioni</th>
              </tr>
            </thead>
            <tbody>
              {r.orders.map((o) => (
                <tr key={o.id}>
                  <td>{date(o.date)}</td>
                  <td>{o.orderNumber}</td>
                  <td>{o.clinic}</td>
                  <td>{STATUS_LABELS[o.status] ?? o.status}</td>
                  <td className="num">{eur(o.sales)}</td>
                  <td className="num">{eur(o.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3>Sipas produktit</h3>
          <table>
            <thead>
              <tr>
                <th>Produkti</th>
                <th className="num">Sasia</th>
                <th className="num">Shitja</th>
                <th className="num">Komisioni</th>
              </tr>
            </thead>
            <tbody>
              {r.products.map((p) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td className="num">{p.quantity}</td>
                  <td className="num">{eur(p.sales)}</td>
                  <td className="num">{eur(p.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="totals">
            <div>
              <span>Porosi</span>
              <span>{r.totals.orders}</span>
            </div>
            <div>
              <span>Shitjet</span>
              <span>{eur(r.totals.sales)}</span>
            </div>
            <div className="grand">
              <span>Komisioni</span>
              <span>{eur(r.totals.commission)}</span>
            </div>
            <div className="muted">
              <span>Paguar</span>
              <span>{r.paid ? `${eur(r.paid.amount)} (${date(r.paid.paidAt)})` : "—"}</span>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}

const css = `
  .sheet { max-width: 860px; margin: 24px auto; background: #fff; padding: 48px; font: 13px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; color: #18181b; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  .toolbar { display: flex; justify-content: flex-end; margin: -24px -24px 16px 0; }
  .agent + .agent { break-before: page; margin-top: 48px; }
  .head { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 16px; border-bottom: 2px solid #18181b; margin-bottom: 16px; }
  .brand { font-size: 20px; font-weight: 700; color: #9c1668; }
  .right { text-align: right; }
  .muted { color: #71717a; }
  h3 { margin: 20px 0 6px; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: #71717a; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #71717a; border-bottom: 1px solid #d4d4d8; padding: 6px; }
  td { border-bottom: 1px solid #f4f4f5; padding: 8px 6px; }
  .num { text-align: right; white-space: nowrap; }
  .totals { margin: 16px 0 0 auto; width: 300px; }
  .totals div { display: flex; justify-content: space-between; padding: 3px 0; }
  .totals .grand { border-top: 2px solid #18181b; margin-top: 6px; padding-top: 8px; font-size: 16px; font-weight: 700; }
  @media print { body { background: #fff !important; } .sheet { box-shadow: none; margin: 0; padding: 0; max-width: none; } .toolbar { display: none; } }
`;
