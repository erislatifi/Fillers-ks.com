import React from "react";
import Link from "next/link";
import type { Payload } from "payload";

const TZ = "Europe/Belgrade";
const DAY = 86_400_000;

const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
const shortDate = (d: Date) =>
  new Intl.DateTimeFormat("sq-AL", { day: "numeric", month: "short", timeZone: TZ }).format(d);
const eur = (n: number) => `€${Math.round(n).toLocaleString("en-US")}`;

const STATUS = {
  pending: { label: "Në pritje", tone: "amber" },
  confirmed: { label: "Konfirmuar", tone: "teal" },
  fulfilled: { label: "Dorëzuar", tone: "green" },
  cancelled: { label: "Anuluar", tone: "red" },
} as const;
type StatusKey = keyof typeof STATUS;

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: TZ }).format(new Date()),
  );
  if (hour < 12) return "Mirëmëngjes";
  if (hour < 18) return "Mirëdita";
  return "Mirëmbrëma";
}

const ICONS: Record<string, React.ReactNode> = {
  box: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4.5 7.5L12 12l7.5-4.5M12 12v9" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />,
  tag: <><path d="M3.5 11.5L11.5 3.5H19a1.5 1.5 0 011.5 1.5v7.5l-8 8a1.5 1.5 0 01-2.1 0l-6.9-6.9a1.5 1.5 0 010-2.1z" /><circle cx="15.5" cy="8.5" r="1.5" /></>,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M4 17l5.5-5.5a2 2 0 012.8 0L20 19" /></>,
  home: <><path d="M4 11l8-7 8 7" /><path d="M6 9.5V20a1 1 0 001 1h4v-6h2v6h4a1 1 0 001-1V9.5" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M12 3v2.5M12 18.5V21M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M3 12h2.5M18.5 12H21M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" /></>,
  receipt: <><path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3z" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
  euro: <><path d="M17.5 6.5A6.5 6.5 0 007 9m0 6a6.5 6.5 0 0010.5 2.5" /><path d="M4.5 10.5h9M4.5 13.5h9" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  arrow: <path d="M7 17L17 7M9 7h8v8" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  pin: <><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  users: <><circle cx="9" cy="8.5" r="3.2" /><path d="M3.5 19c.9-3.2 3.1-4.8 5.5-4.8s4.6 1.6 5.5 4.8" /><path d="M16 5.6a3 3 0 010 5.8M18.5 14.6c1.3.7 2.3 2 2.8 4" /></>,
};

function Ico({ name }: { name: keyof typeof ICONS | string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  );
}

function Card({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`fk-card ${className}`}>
      <header className="fk-card__head">
        <h2>{title}</h2>
        {action && (
          <Link href={action.href} className="fk-link">
            {action.label}
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}

function Kpi({
  label,
  value,
  note,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  note?: React.ReactNode;
  icon: string;
  tone?: "neutral" | "amber" | "pink" | "teal";
}) {
  return (
    <div className={`fk-kpi fk-kpi--${tone}`}>
      <span className="fk-kpi__icon">
        <Ico name={icon} />
      </span>
      <p className="fk-kpi__label">{label}</p>
      <p className="fk-kpi__value">{value}</p>
      {note && <p className="fk-kpi__note">{note}</p>}
    </div>
  );
}

function BarList({
  rows,
  format,
  empty,
}: {
  rows: { name: string; value: number }[];
  format: (n: number) => string;
  empty: string;
}) {
  if (rows.length === 0) return <p className="fk-empty">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="fk-bars">
      {rows.map((r) => (
        <li key={r.name}>
          <div className="fk-bars__row">
            <span className="fk-bars__name" title={r.name}>
              {r.name}
            </span>
            <span className="fk-bars__value">{format(r.value)}</span>
          </div>
          <div className="fk-bars__track">
            <div className="fk-bars__fill" style={{ width: `${Math.max(3, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function topN(entries: Map<string, number>, n: number) {
  return Array.from(entries.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, value]) => ({ name, value }));
}

export async function Dashboard({ payload }: { payload: Payload }) {
  const [products, brands, categories, ordersRes, testimonials, articles, promotions] = await Promise.all([
    payload.find({ collection: "products", limit: 1000, depth: 0 }),
    payload.find({ collection: "brands", limit: 200, depth: 0 }),
    payload.find({ collection: "categories", limit: 100, depth: 0 }),
    payload.find({ collection: "orders", limit: 1000, depth: 0, sort: "-createdAt" }),
    payload.count({ collection: "testimonials" }),
    payload.count({ collection: "articles" }),
    payload.count({ collection: "promotions" }),
  ]);

  const orders = ordersRes.docs;
  const now = new Date();
  const t30 = now.getTime() - 30 * DAY;
  const t60 = now.getTime() - 60 * DAY;

  const live = orders.filter((o) => o.status !== "cancelled");
  const cur = live.filter((o) => new Date(o.createdAt).getTime() >= t30);
  const prev = live.filter((o) => {
    const t = new Date(o.createdAt).getTime();
    return t >= t60 && t < t30;
  });
  const sum = (list: typeof orders) => list.reduce((s, o) => s + (o.subtotal ?? 0), 0);
  const revCur = sum(cur);
  const revPrev = sum(prev);
  const delta = revPrev > 0 ? ((revCur - revPrev) / revPrev) * 100 : null;

  const pendingDocs = orders.filter((o) => o.status === "pending");
  const pendingValue = sum(pendingDocs);

  // 30 daily buckets, oldest → newest, bucketed by Kosovo-local day.
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now.getTime() - (29 - i) * DAY);
    return { date: d, key: dayKey(d), revenue: 0, count: 0 };
  });
  const dayIndex = new Map(days.map((d, i) => [d.key, i]));
  for (const o of cur) {
    const idx = dayIndex.get(dayKey(new Date(o.createdAt)));
    if (idx !== undefined) {
      days[idx].revenue += o.subtotal ?? 0;
      days[idx].count += 1;
    }
  }
  const maxDay = Math.max(1, ...days.map((d) => d.revenue));

  const statusCounts = (Object.keys(STATUS) as StatusKey[]).map((key) => ({
    key,
    count: orders.filter((o) => o.status === key).length,
  }));
  const statusTotal = orders.length;
  let acc = 0;
  const donutStops = statusCounts
    .filter((s) => s.count > 0)
    .map((s) => {
      const from = (acc / statusTotal) * 100;
      acc += s.count;
      const to = (acc / statusTotal) * 100;
      return `var(--fk-${STATUS[s.key].tone}) ${from}% ${to}%`;
    })
    .join(", ");

  const productQty = new Map<string, number>();
  const clinicRev = new Map<string, number>();
  const cityRev = new Map<string, number>();
  for (const o of live) {
    for (const item of o.items ?? []) productQty.set(item.name, (productQty.get(item.name) ?? 0) + item.quantity);
    clinicRev.set(o.clinicName, (clinicRev.get(o.clinicName) ?? 0) + (o.subtotal ?? 0));
    if (o.city) cityRev.set(o.city, (cityRev.get(o.city) ?? 0) + (o.subtotal ?? 0));
  }

  // Catalog health
  const prodDocs = products.docs;
  const noPhoto = prodDocs.filter((p) => !p.images || p.images.length === 0).length;
  const noPrice = prodDocs.filter((p) => !p.quoteOnly && !(p.price && p.price > 0)).length;
  const brandsNoLogo = brands.docs.filter((b) => !b.logo).length;
  const categoryCount = new Map<number, number>();
  for (const p of prodDocs) {
    const id = typeof p.category === "object" && p.category ? p.category.id : p.category;
    if (typeof id === "number") categoryCount.set(id, (categoryCount.get(id) ?? 0) + 1);
  }
  const categoryRows = categories.docs
    .map((c) => ({ name: c.name, value: categoryCount.get(c.id) ?? 0 }))
    .sort((a, b) => b.value - a.value);
  const emptyCategories = categoryRows.filter((c) => c.value === 0).length;
  const readyProducts = prodDocs.filter(
    (p) => p.images && p.images.length > 0 && (p.quoteOnly || (p.price ?? 0) > 0),
  ).length;
  const readiness = prodDocs.length ? Math.round((readyProducts / prodDocs.length) * 100) : 0;

  const recent = orders.slice(0, 6);
  const dateLabel = new Intl.DateTimeFormat("sq-AL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  }).format(now);

  const health: { label: string; count: number; href: string; ok: string }[] = [
    { label: "Produkte pa foto", count: noPhoto, href: "/admin/collections/products", ok: "Të gjitha kanë foto" },
    { label: "Produkte pa çmim (dhe jo “me ofertë”)", count: noPrice, href: "/admin/collections/products", ok: "Të gjitha kanë çmim" },
    { label: "Brende pa logo", count: brandsNoLogo, href: "/admin/collections/brands", ok: "Të gjitha kanë logo" },
    { label: "Kategori pa produkte", count: emptyCategories, href: "/admin/collections/categories", ok: "Të gjitha kanë produkte" },
  ];

  const actions = [
    { href: "/admin/collections/products/create", icon: "box", title: "Produkt i ri", text: "Shto në katalog" },
    { href: "/admin/collections/brands/create", icon: "star", title: "Brend i ri", text: "Logo dhe përshkrim" },
    { href: "/admin/collections/media/create", icon: "image", title: "Ngarko foto", text: "Biblioteka e fotove" },
    { href: "/admin/collections/promotions/create", icon: "tag", title: "Promocion i ri", text: "Oferta dhe paketa" },
    { href: "/admin/globals/homepage", icon: "home", title: "Ballina", text: "Tekstet kryesore" },
    { href: "/admin/globals/site-settings", icon: "gear", title: "Cilësimet", text: "Kontakt, banka, rrjete" },
  ];

  return (
    <div className="fk-dash">
      <header className="fk-dash__head">
        <div>
          <p className="fk-eyebrow">{dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}</p>
          <h1 className="fk-dash__title">{greeting()}</h1>
          <p className="fk-dash__sub">Ja çka po ndodh sot me Fillers Kosovo.</p>
        </div>
        <div className="fk-dash__cta">
          <a href="/sq" target="_blank" rel="noreferrer" className="fk-btn fk-btn--ghost">
            Shiko faqen <Ico name="arrow" />
          </a>
          <Link href="/admin/collections/products/create" className="fk-btn fk-btn--primary">
            <Ico name="plus" /> Produkt i ri
          </Link>
        </div>
      </header>

      <div className="fk-kpis">
        <Kpi
          icon="clock"
          tone={pendingDocs.length > 0 ? "amber" : "neutral"}
          label="Porosi në pritje"
          value={pendingDocs.length}
          note={pendingDocs.length > 0 ? `${eur(pendingValue)} presin konfirmim` : "Asgjë nuk pret konfirmim"}
        />
        <Kpi
          icon="euro"
          tone="pink"
          label="Të ardhura · 30 ditë"
          value={eur(revCur)}
          note={
            delta === null ? (
              "Pa të dhëna për krahasim"
            ) : (
              <span className={delta >= 0 ? "fk-up" : "fk-down"}>
                {delta >= 0 ? "+" : ""}
                {delta.toFixed(0)}% nga 30 ditët e mëparshme
              </span>
            )
          }
        />
        <Kpi
          icon="receipt"
          label="Porosi · 30 ditë"
          value={cur.length}
          note={`${orders.length} gjithsej`}
        />
        <Kpi
          icon="box"
          tone="teal"
          label="Produkte në katalog"
          value={prodDocs.length}
          note={`${brands.totalDocs} brende · ${categories.totalDocs} kategori`}
        />
      </div>

      <div className="fk-grid fk-grid--chart">
        <Card title="Të ardhurat ditore" className="fk-card--chart">
          <div className="fk-chart">
            <div className="fk-chart__plot" role="img" aria-label="Të ardhurat ditore, 30 ditët e fundit">
              {days.map((d) => (
                <div
                  key={d.key}
                  className="fk-chart__col"
                  title={`${shortDate(d.date)} · ${eur(d.revenue)} · ${d.count} porosi`}
                >
                  <div
                    className={`fk-chart__bar${d.revenue === 0 ? " is-zero" : ""}`}
                    style={{ height: `${d.revenue === 0 ? 0 : Math.max(4, (d.revenue / maxDay) * 100)}%` }}
                  />
                </div>
              ))}
              {revCur === 0 && (
                <div className="fk-chart__empty">
                  <p>Porosia e parë do të shfaqet këtu.</p>
                  <span>Kolonat mbushen vetë sapo të vijnë kërkesa nga klinikat.</span>
                </div>
              )}
            </div>
            <div className="fk-chart__axis">
              <span>{shortDate(days[0].date)}</span>
              <span>{shortDate(days[15].date)}</span>
              <span>{shortDate(days[29].date)}</span>
            </div>
          </div>
        </Card>

        <Card title="Porositë sipas statusit" action={{ href: "/admin/collections/orders", label: "Të gjitha" }}>
          <div className="fk-status">
            <div
              className="fk-donut"
              style={{ background: statusTotal ? `conic-gradient(${donutStops})` : undefined }}
            >
              <div className="fk-donut__hole">
                <strong>{statusTotal}</strong>
                <span>porosi</span>
              </div>
            </div>
            <ul className="fk-legend">
              {statusCounts.map((s) => (
                <li key={s.key}>
                  <i className={`fk-dot fk-dot--${STATUS[s.key].tone}`} />
                  <span>{STATUS[s.key].label}</span>
                  <b>{s.count}</b>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="fk-grid fk-grid--orders">
        <Card title="Porositë e fundit" action={{ href: "/admin/collections/orders", label: "Shiko të gjitha" }}>
          {recent.length > 0 ? (
            <div className="fk-table-wrap">
              <table className="fk-table">
                <thead>
                  <tr>
                    <th>Porosia</th>
                    <th>Klinika</th>
                    <th>Dorëzimi</th>
                    <th>Statusi</th>
                    <th className="is-num">Totali</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => {
                    const st = STATUS[(o.status as StatusKey) ?? "pending"] ?? STATUS.pending;
                    return (
                      <tr key={o.id}>
                        <td>
                          <Link href={`/admin/collections/orders/${o.id}`} className="fk-link fk-link--strong">
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td>
                          <span className="fk-cell-main">{o.clinicName}</span>
                          <span className="fk-cell-sub">{o.city}</span>
                        </td>
                        <td>{o.requestedDeliveryDate ? shortDate(new Date(o.requestedDeliveryDate)) : "—"}</td>
                        <td>
                          <span className={`fk-pill fk-pill--${st.tone}`}>{st.label}</span>
                        </td>
                        <td className="is-num">{eur(o.subtotal ?? 0)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="fk-blank">
              <span className="fk-blank__icon">
                <Ico name="receipt" />
              </span>
              <p>Ende nuk ka porosi</p>
              <span>Kërkesat e klinikave nga shporta do të shfaqen këtu, me datën e dorëzimit dhe totalin.</span>
            </div>
          )}
        </Card>

        <Card title="Veprime të shpejta">
          <div className="fk-actions">
            {actions.map((a) => (
              <Link key={a.href} href={a.href} className="fk-action">
                <span className="fk-action__icon">
                  <Ico name={a.icon} />
                </span>
                <span className="fk-action__title">{a.title}</span>
                <span className="fk-action__text">{a.text}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="fk-grid fk-grid--three">
        <Card title="Produktet më të porositura">
          <BarList rows={topN(productQty, 5)} format={(n) => `${n} copë`} empty="Pa porosi ende." />
        </Card>
        <Card title="Klinikat kryesore">
          <BarList rows={topN(clinicRev, 5)} format={eur} empty="Pa porosi ende." />
        </Card>
        <Card title="Qytetet kryesore">
          <BarList rows={topN(cityRev, 5)} format={eur} empty="Pa porosi ende." />
        </Card>
      </div>

      <div className="fk-grid fk-grid--catalog">
        <Card title="Gatishmëria e katalogut" action={{ href: "/admin/collections/products", label: "Hap produktet" }}>
          <div className="fk-health">
            <div
              className="fk-ring"
              style={{ ["--p" as string]: `${readiness}` }}
              role="img"
              aria-label={`${readiness}% e produkteve janë gati`}
            >
              <div className="fk-ring__hole">
                <strong>{readiness}%</strong>
                <span>gati</span>
              </div>
            </div>
            <ul className="fk-checks">
              {health.map((h) => (
                <li key={h.label} className={h.count === 0 ? "is-ok" : "is-warn"}>
                  <span className="fk-checks__mark">{h.count === 0 ? <Ico name="check" /> : h.count}</span>
                  <Link href={h.href}>{h.count === 0 ? h.ok : h.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <p className="fk-note">
            “Gati” do të thotë që produkti ka të paktën një foto dhe ose çmim, ose është shënuar “me ofertë”.
          </p>
        </Card>

        <Card title="Produkte sipas kategorisë" action={{ href: "/admin/collections/categories", label: "Kategoritë" }}>
          {categoryRows.length > 0 ? (
            <ul className="fk-bars fk-bars--compact">
              {categoryRows.map((c) => {
                const max = Math.max(1, ...categoryRows.map((r) => r.value));
                return (
                  <li key={c.name} className={c.value === 0 ? "is-empty" : ""}>
                    <div className="fk-bars__row">
                      <span className="fk-bars__name">{c.name}</span>
                      <span className="fk-bars__value">{c.value === 0 ? "bosh" : c.value}</span>
                    </div>
                    <div className="fk-bars__track">
                      <div className="fk-bars__fill" style={{ width: `${c.value === 0 ? 0 : Math.max(4, (c.value / max) * 100)}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="fk-empty">Nuk ka kategori ende.</p>
          )}
        </Card>

        <Card title="Përmbajtja">
          <ul className="fk-content">
            <li>
              <Link href="/admin/collections/testimonials">Vlerësime</Link>
              <b>{testimonials.totalDocs}</b>
            </li>
            <li>
              <Link href="/admin/collections/articles">Artikuj mësimorë</Link>
              <b>{articles.totalDocs}</b>
            </li>
            <li>
              <Link href="/admin/collections/promotions">Promocione</Link>
              <b>{promotions.totalDocs}</b>
            </li>
            <li>
              <Link href="/admin/collections/products?where[bestSeller][equals]=true">Më të shitura (Ballinë)</Link>
              <b>{prodDocs.filter((p) => p.bestSeller).length}</b>
            </li>
            <li>
              <Link href="/admin/collections/products?where[newArrival][equals]=true">Të reja (Ballinë)</Link>
              <b>{prodDocs.filter((p) => p.newArrival).length}</b>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
