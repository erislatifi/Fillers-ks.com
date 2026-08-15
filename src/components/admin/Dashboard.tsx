import React from "react";
import type { Payload, Where } from "payload";

async function statCard(payload: Payload, collection: "products" | "brands" | "categories" | "testimonials" | "articles" | "promotions" | "orders", where?: Where) {
  const res = await payload.count({ collection, where });
  return res.totalDocs;
}

export async function Dashboard({ payload }: { payload: Payload }) {
  const [
    totalProducts,
    totalBrands,
    totalCategories,
    bestSellers,
    newArrivals,
    devices,
    allProducts,
    totalTestimonials,
    totalArticles,
    totalPromotions,
    allOrders,
    recentOrders,
  ] = await Promise.all([
    statCard(payload, "products"),
    statCard(payload, "brands"),
    statCard(payload, "categories"),
    statCard(payload, "products", { bestSeller: { equals: true } }),
    statCard(payload, "products", { newArrival: { equals: true } }),
    statCard(payload, "products", { quoteOnly: { equals: true } }),
    payload.find({ collection: "products", limit: 500, depth: 0 }),
    statCard(payload, "testimonials"),
    statCard(payload, "articles"),
    statCard(payload, "promotions"),
    payload.find({ collection: "orders", limit: 1000, depth: 0 }),
    payload.find({ collection: "orders", limit: 6, sort: "-createdAt", depth: 0 }),
  ]);

  const totalOrders = allOrders.totalDocs;
  const pendingOrderDocs = allOrders.docs.filter((o) => o.status === "pending");
  const pendingOrders = pendingOrderDocs.length;
  const pendingValue = pendingOrderDocs.reduce((sum, o) => sum + (o.subtotal ?? 0), 0);

  const missingImages = allProducts.docs.filter(
    (p) => !p.images || p.images.length === 0,
  ).length;

  function topN(entries: Map<string, number>, n: number) {
    return Array.from(entries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([name, value]) => ({ name, value }));
  }

  const productQuantities = new Map<string, number>();
  for (const order of allOrders.docs) {
    for (const item of order.items ?? []) {
      productQuantities.set(item.name, (productQuantities.get(item.name) ?? 0) + item.quantity);
    }
  }
  const topProducts = topN(productQuantities, 5);
  const maxProductQty = Math.max(1, ...topProducts.map((p) => p.value));

  const clinicRevenue = new Map<string, number>();
  for (const order of allOrders.docs) {
    clinicRevenue.set(order.clinicName, (clinicRevenue.get(order.clinicName) ?? 0) + (order.subtotal ?? 0));
  }
  const topClinics = topN(clinicRevenue, 5);
  const maxClinicRevenue = Math.max(1, ...topClinics.map((c) => c.value));

  const cityRevenue = new Map<string, number>();
  for (const order of allOrders.docs) {
    if (!order.city) continue;
    cityRevenue.set(order.city, (cityRevenue.get(order.city) ?? 0) + (order.subtotal ?? 0));
  }
  const topCities = topN(cityRevenue, 5);
  const maxCityRevenue = Math.max(1, ...topCities.map((c) => c.value));

  const categories = await payload.find({ collection: "categories", limit: 50 });
  const categoryBreakdown = await Promise.all(
    categories.docs.map(async (cat) => ({
      name: cat.name,
      count: await statCard(payload, "products", { category: { equals: cat.id } }),
    })),
  );
  const maxCount = Math.max(1, ...categoryBreakdown.map((c) => c.count));

  const cards: { label: string; value: number | string; hint?: string }[] = [
    { label: "Total Orders", value: totalOrders },
    { label: "Pending Orders", value: pendingOrders, hint: pendingOrders > 0 ? "needs review" : "all clear" },
    { label: "Pending Order Value", value: `€${pendingValue.toFixed(0)}` },
    { label: "Products", value: totalProducts },
    { label: "Brands", value: totalBrands },
    { label: "Categories", value: totalCategories },
    { label: "Best Sellers", value: bestSellers, hint: "flagged on homepage" },
    { label: "New Arrivals", value: newArrivals, hint: "flagged on homepage" },
    { label: "Devices (quote-only)", value: devices },
    { label: "Missing Images", value: missingImages, hint: missingImages > 0 ? "needs photos" : "all set" },
    { label: "Testimonials", value: totalTestimonials },
    { label: "Articles", value: totalArticles },
    { label: "Promotions", value: totalPromotions },
  ];

  return (
    <div style={{ padding: "40px 32px", maxWidth: 1100 }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 4 }}>Fillers Kosovo</h1>
      <p style={{ opacity: 0.65, marginBottom: 32 }}>Catalog overview</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 40,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              border: "1px solid var(--theme-elevation-150, #333)",
              borderRadius: 8,
              padding: "18px 20px",
              background: "var(--theme-elevation-50, rgba(255,255,255,0.03))",
            }}
          >
            <p style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>{c.value}</p>
            <p style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>{c.label}</p>
            {c.hint && <p style={{ fontSize: 11, opacity: 0.45, marginTop: 2 }}>{c.hint}</p>}
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Products by category</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
        {categoryBreakdown.map((c) => (
          <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 150, fontSize: 13, opacity: 0.8 }}>{c.name}</span>
            <div style={{ flex: 1, background: "var(--theme-elevation-100)", borderRadius: 4, height: 10, overflow: "hidden" }}>
              <div
                style={{
                  width: `${(c.count / maxCount) * 100}%`,
                  background: "linear-gradient(90deg, #f2c879, #e91e8c)",
                  height: "100%",
                }}
              />
            </div>
            <span style={{ width: 24, fontSize: 13, textAlign: "right", opacity: 0.8 }}>{c.count}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, marginBottom: 40 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Top-selling products</h2>
          {topProducts.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topProducts.map((p) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 130, fontSize: 13, opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  <div style={{ flex: 1, background: "var(--theme-elevation-100)", borderRadius: 4, height: 10, overflow: "hidden" }}>
                    <div style={{ width: `${(p.value / maxProductQty) * 100}%`, background: "linear-gradient(90deg, #f2c879, #e91e8c)", height: "100%" }} />
                  </div>
                  <span style={{ width: 30, fontSize: 13, textAlign: "right", opacity: 0.8 }}>{p.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, opacity: 0.6 }}>No orders yet.</p>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Top clinics by revenue</h2>
          {topClinics.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topClinics.map((c) => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 130, fontSize: 13, opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  <div style={{ flex: 1, background: "var(--theme-elevation-100)", borderRadius: 4, height: 10, overflow: "hidden" }}>
                    <div style={{ width: `${(c.value / maxClinicRevenue) * 100}%`, background: "linear-gradient(90deg, #f2c879, #e91e8c)", height: "100%" }} />
                  </div>
                  <span style={{ width: 50, fontSize: 13, textAlign: "right", opacity: 0.8 }}>€{c.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, opacity: 0.6 }}>No orders yet.</p>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Top cities by revenue</h2>
          {topCities.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topCities.map((c) => (
                <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 130, fontSize: 13, opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  <div style={{ flex: 1, background: "var(--theme-elevation-100)", borderRadius: 4, height: 10, overflow: "hidden" }}>
                    <div style={{ width: `${(c.value / maxCityRevenue) * 100}%`, background: "linear-gradient(90deg, #f2c879, #e91e8c)", height: "100%" }} />
                  </div>
                  <span style={{ width: 50, fontSize: 13, textAlign: "right", opacity: 0.8 }}>€{c.value.toFixed(0)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, opacity: 0.6 }}>No orders with a city yet.</p>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600 }}>Recent orders</h2>
        <a href="/admin/collections/orders" style={{ fontSize: 13, color: "#e91e8c" }}>
          View all →
        </a>
      </div>

      {recentOrders.docs.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 720 }}>
          {recentOrders.docs.map((o) => (
            <a
              key={o.id}
              href={`/admin/collections/orders/${o.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                border: "1px solid var(--theme-elevation-150, #333)",
                borderRadius: 8,
                padding: "12px 16px",
                fontSize: 13,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <span style={{ fontWeight: 600 }}>{o.orderNumber}</span>
              <span style={{ opacity: 0.7 }}>{o.clinicName}</span>
              <span style={{ opacity: 0.7 }}>
                delivery: {o.requestedDeliveryDate ? new Date(o.requestedDeliveryDate).toLocaleDateString() : "—"}
              </span>
              <span
                style={{
                  textTransform: "capitalize",
                  padding: "2px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  background:
                    o.status === "pending"
                      ? "rgba(242,200,121,0.25)"
                      : o.status === "cancelled"
                        ? "rgba(255,90,90,0.2)"
                        : "rgba(120,220,150,0.2)",
                }}
              >
                {o.status}
              </span>
              <span style={{ fontWeight: 600 }}>€{(o.subtotal ?? 0).toFixed(0)}</span>
            </a>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, opacity: 0.6 }}>No orders yet — they&apos;ll show up here as clinics check out.</p>
      )}
    </div>
  );
}
