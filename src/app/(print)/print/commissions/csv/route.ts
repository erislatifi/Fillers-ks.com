import { buildCommissionReport, STATUS_LABELS } from "@/lib/commissionReport";
import { resolveReportRequest } from "@/lib/reportAccess";

const cell = (v: string | number) => {
  const s = String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const money = (n: number) => n.toFixed(2).replace(".", ",");

/** Commission report as CSV (semicolon-separated + BOM so Excel opens it with ë/ç intact). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const req = await resolveReportRequest({ month: url.searchParams.get("month"), agent: url.searchParams.get("agent") });
  if (!req) return new Response("Nuk keni qasje.", { status: 403 });

  const reports = await buildCommissionReport(req.payload, req.month, req.agentId);
  const rows: (string | number)[][] = [["Agjenti", "Kodi", "Data", "Porosia", "Klinika", "Statusi", "Shitja (€)", "Komisioni (€)"]];
  for (const r of reports) {
    for (const o of r.orders) {
      rows.push([r.agent.name, r.agent.code ?? "", o.date.slice(0, 10), o.orderNumber, o.clinic, STATUS_LABELS[o.status] ?? o.status, money(o.sales), money(o.commission)]);
    }
    rows.push([r.agent.name, r.agent.code ?? "", "", "TOTALI", "", "", money(r.totals.sales), money(r.totals.commission)]);
  }
  const csv = "﻿" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="komisionet-${req.month}.csv"`,
    },
  });
}
