"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/BrandMark";
import { BagIcon, BuildingIcon, CheckCircleIcon, CloseIcon, MapPinIcon, PlusIcon, SearchIcon, SparkleIcon, TruckIcon } from "@/components/icons";
import type { AgentClinic, AgentOrderSummary, AgentVisit, SyncOp, SyncResult } from "@/lib/agentApp/types";
import { CatalogView } from "./CatalogView";
import { CartView, type OrderDetails } from "./CartView";
import {
  clinicKey,
  emptyState,
  eur,
  fmtDate,
  fmtTime,
  loadState,
  mergedClinics,
  mergedVisits,
  newId,
  sameDay,
  saveState,
  timeSlots,
  type AgentState,
} from "./store";

const FIFTEEN_MIN = 15 * 60 * 1000;
type Tab = "day" | "clinics" | "catalog" | "cart" | "sent";

/** One GPS reading, or null (no permission / no signal within 15 s). */
function readPosition(): Promise<{ lat: number; lng: number; accuracy: number } | null> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: Math.round(p.coords.accuracy) }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });
}

function notify(title: string, body: string) {
  try {
    navigator.vibrate?.([200, 100, 200]);
    if ("Notification" in window && Notification.permission === "granted") new Notification(title, { body, icon: "/brand/icon-180.png" });
  } catch {}
}

export function AgentApp({ agentId, agentName }: { agentId: number; agentName: string }) {
  const t = useTranslations("agentApp");
  const [state, setState] = useState<AgentState>(emptyState);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("day");
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<
    | { kind: "plan"; clinic?: AgentClinic }
    | { kind: "newClinic"; thenVisit?: boolean }
    | { kind: "clinic"; key: string }
    | { kind: "pickClinic" }
    | { kind: "endVisit" }
    | null
  >(null);
  const [now, setNow] = useState(() => Date.now());
  const stateRef = useRef(state);
  stateRef.current = state;
  const reminded = useRef(new Set<string>());

  // ── Persisted state ────────────────────────────────────────────────────────
  useEffect(() => {
    setState(loadState(agentId));
    setLoaded(true);
    setOnline(navigator.onLine);
  }, [agentId]);
  useEffect(() => {
    if (loaded) saveState(agentId, state);
  }, [agentId, loaded, state]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  const enqueue = useCallback((op: SyncOp, patch?: (s: AgentState) => AgentState) => {
    setState((s) => {
      // A newer version of the same visit replaces the one still waiting.
      const queue = op.type === "visit" ? s.queue.filter((q) => !(q.type === "visit" && q.clientId === op.clientId)) : s.queue;
      const next = { ...s, queue: [...queue, op] };
      return patch ? patch(next) : next;
    });
  }, []);

  // ── Sync: every 15 min, when the internet returns, and right after an order ──
  const sync = useCallback(async () => {
    if (!navigator.onLine || syncing) return;
    setSyncing(true);
    const ops = stateRef.current.queue;
    try {
      let results: SyncResult[] = [];
      if (ops.length) {
        const res = await fetch("/agjent/api/sync", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ops }),
        });
        if (res.status === 401) {
          setNeedLogin(true);
          throw new Error("login");
        }
        if (!res.ok) throw new Error(String(res.status));
        results = ((await res.json()) as { results: SyncResult[] }).results;
      }
      const boot = await fetch("/agjent/api/bootstrap", { credentials: "include", cache: "no-store" });
      if (boot.status === 401) {
        setNeedLogin(true);
        throw new Error("login");
      }
      const bootstrap = boot.ok ? await boot.json() : null;
      setNeedLogin(false);

      setState((s) => {
        const done = new Map(results.map((r) => [r.clientId, r]));
        // Sent ops leave the queue; ops that failed for good (not a server hiccup) too —
        // their error is shown in "Dërguar". New ops queued during the request stay.
        const sentIds = new Set(ops.map((o) => o.clientId));
        const clinicIds = new Map(results.filter((r) => r.ok && r.id).map((r) => [r.clientId, r.id!]));
        let queue = s.queue.filter((o) => !(sentIds.has(o.clientId) && done.has(o.clientId) && done.get(o.clientId)!.error !== "server-error"));
        // Later ops that pointed at a clinic created offline now use its real id.
        queue = queue.map((o) =>
          (o.type === "visit" || o.type === "order") && o.data.customerClientId && clinicIds.has(o.data.customerClientId)
            ? ({ ...o, data: { ...o.data, customerId: clinicIds.get(o.data.customerClientId) } } as SyncOp)
            : o,
        );
        const pending = new Set(queue.map((o) => o.clientId));
        const serverVisits = new Set((bootstrap?.visits ?? []).map((v: AgentVisit) => v.clientId));
        const localVisits = Object.fromEntries(
          Object.entries(s.localVisits).filter(([id]) => pending.has(id) || !serverVisits.has(id) || id === s.activeVisitId),
        );
        const localClinics = s.localClinics
          .map((c) => (c.clientId && clinicIds.has(c.clientId) ? { ...c, id: clinicIds.get(c.clientId)! } : c))
          .filter((c) => c.id === null || !(bootstrap?.clinics ?? []).some((b: AgentClinic) => b.id === c.id));
        return {
          ...s,
          bootstrap: bootstrap ?? s.bootstrap,
          queue,
          localVisits,
          localClinics,
          lastSyncAt: new Date().toISOString(),
          lastSyncError: null,
          sentOrders: s.sentOrders.map((o) => (done.has(o.clientId) ? { ...o, result: done.get(o.clientId) } : o)),
        };
      });
    } catch (e) {
      setState((s) => ({ ...s, lastSyncError: e instanceof Error ? e.message : "error" }));
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  useEffect(() => {
    if (!loaded) return;
    sync();
    const goOnline = () => { setOnline(true); sync(); };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    const timer = setInterval(sync, FIFTEEN_MIN);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Service worker: keeps the app, catalogue and photos available without internet.
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/agjent-sw.js", { scope: "/agjent" }).catch(() => {});
  }, []);

  // ── GPS every 15 minutes while the app is open ──────────────────────────────
  const recordLocation = useCallback(
    async (kind: "interval" | "check_in" | "check_out", visitClientId?: string) => {
      const pos = await readPosition();
      if (!pos) return null;
      enqueue({ type: "location", clientId: newId(), data: { ...pos, recordedAt: new Date().toISOString(), kind, visitClientId } });
      return pos;
    },
    [enqueue],
  );
  useEffect(() => {
    if (!loaded) return;
    recordLocation("interval");
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") recordLocation("interval", stateRef.current.activeVisitId ?? undefined);
    }, FIFTEEN_MIN);
    return () => clearInterval(timer);
  }, [loaded, recordLocation]);

  // ── Clock + reminders (every 15 min in a visit; 15 min before a planned one) ──
  const visits = useMemo(() => mergedVisits(state), [state]);
  const clinics = useMemo(() => mergedClinics(state), [state]);
  const activeVisit = state.activeVisitId ? visits.find((v) => v.clientId === state.activeVisitId) ?? null : null;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (activeVisit?.checkInAt) {
      const minutes = Math.floor((now - new Date(activeVisit.checkInAt).getTime()) / 60000);
      const slot = `${activeVisit.clientId}-${Math.floor(minutes / 15)}`;
      if (minutes >= 15 && !reminded.current.has(slot)) {
        reminded.current.add(slot);
        const body = t("visit.reminderBody", { clinic: activeVisit.clinicName });
        notify(t("visit.reminderTitle"), body);
        showToast(body);
      }
    }
    for (const v of visits) {
      if (v.status !== "planned" || !v.scheduledAt) continue;
      const until = new Date(v.scheduledAt).getTime() - now;
      const key = `plan-${v.clientId}`;
      if (until > 0 && until <= FIFTEEN_MIN && !reminded.current.has(key)) {
        reminded.current.add(key);
        notify(t("visit.reminderTitle"), `${fmtTime(v.scheduledAt)} — ${v.clinicName}`);
        showToast(`${fmtTime(v.scheduledAt)} — ${v.clinicName}`);
      }
    }
  }, [now, activeVisit, visits, t, showToast]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const saveVisit = useCallback(
    (visit: AgentVisit, extra?: { lat?: number | null; lng?: number | null }, patch?: (s: AgentState) => AgentState) => {
      enqueue(
        {
          type: "visit",
          clientId: visit.clientId,
          data: {
            customerId: visit.customerId,
            customerClientId: visit.customerClientId,
            clinicName: visit.clinicName,
            scheduledAt: visit.scheduledAt,
            status: visit.status,
            checkInAt: visit.checkInAt ?? null,
            checkOutAt: visit.checkOutAt ?? null,
            notes: visit.notes ?? null,
            interest: visit.interest ?? null,
            nextVisitAt: visit.nextVisitAt ?? null,
            lat: extra?.lat ?? null,
            lng: extra?.lng ?? null,
          },
        },
        (s) => {
          const next = { ...s, localVisits: { ...s.localVisits, [visit.clientId]: visit } };
          return patch ? patch(next) : next;
        },
      );
    },
    [enqueue],
  );

  const startVisit = useCallback(
    async (clinic: AgentClinic, planned?: AgentVisit) => {
      if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {});
      const visit: AgentVisit = {
        ...(planned ?? { clientId: newId(), scheduledAt: new Date().toISOString() }),
        customerId: clinic.id,
        customerClientId: clinic.id ? undefined : clinic.clientId,
        clinicName: clinic.clinicName,
        status: "in_progress",
        checkInAt: new Date().toISOString(),
      } as AgentVisit;
      saveVisit(visit, undefined, (s) => ({ ...s, activeVisitId: visit.clientId }));
      setModal(null);
      setTab("catalog");
      const pos = await recordLocation("check_in", visit.clientId);
      if (pos) saveVisit(visit, pos);
    },
    [saveVisit, recordLocation],
  );

  const endVisit = useCallback(
    (notes: string, interest: AgentVisit["interest"], nextAt: string | null) => {
      const v = activeVisit;
      if (!v) return;
      saveVisit({ ...v, status: "done", checkOutAt: new Date().toISOString(), notes: notes || null, interest, nextVisitAt: nextAt }, undefined, (s) => ({ ...s, activeVisitId: null }));
      if (nextAt) {
        saveVisit({
          clientId: newId(),
          customerId: v.customerId,
          customerClientId: v.customerClientId,
          clinicName: v.clinicName,
          scheduledAt: nextAt,
          status: "planned",
        });
      }
      recordLocation("check_out", v.clientId);
      setModal(null);
      setTab("day");
      setTimeout(sync, 300);
    },
    [activeVisit, saveVisit, recordLocation, sync],
  );

  const addClinic = useCallback(
    (data: { clinicName: string; fullName: string; phone: string; email?: string; city?: string; address?: string }) => {
      const clientId = newId();
      const clinic: AgentClinic = { id: null, clientId, clinicName: data.clinicName, fullName: data.fullName, phone: data.phone, email: data.email || null, city: data.city || null, address: data.address || null };
      enqueue({ type: "clinic", clientId, data }, (s) => ({ ...s, localClinics: [...s.localClinics, clinic] }));
      setTimeout(sync, 300);
      return clinic;
    },
    [enqueue, sync],
  );

  const setQuantity = (productId: number, quantity: number) =>
    setState((s) => ({
      ...s,
      cart: quantity <= 0 ? s.cart.filter((l) => l.productId !== productId) : s.cart.some((l) => l.productId === productId) ? s.cart.map((l) => (l.productId === productId ? { ...l, quantity } : l)) : [...s.cart, { productId, quantity }],
    }));
  const addToCart = (productId: number, quantity: number) => {
    const current = state.cart.find((l) => l.productId === productId)?.quantity ?? 0;
    setQuantity(productId, current + quantity);
  };

  const submitOrder = (d: OrderDetails) => {
    const clientId = newId();
    const total = state.cart.reduce((sum, l) => sum + (state.bootstrap?.products.find((p) => p.id === l.productId)?.price ?? 0) * l.quantity, 0) * (1 - d.discountPercent / 100);
    enqueue(
      {
        type: "order",
        clientId,
        data: {
          customerId: d.clinic.id,
          customerClientId: d.clinic.id ? undefined : d.clinic.clientId,
          visitClientId: activeVisit?.clientId,
          items: state.cart,
          discountPercent: d.discountPercent,
          deliveryMethod: d.deliveryMethod,
          paymentMethod: d.paymentMethod,
          requestedDeliveryDate: d.requestedDeliveryDate,
          notes: d.notes,
          signature: d.signature,
          signedBy: d.signedBy,
        },
      },
      (s) => ({ ...s, cart: [], sentOrders: [{ clientId, clinicName: d.clinic.clinicName, total, at: new Date().toISOString() }, ...s.sentOrders].slice(0, 100) }),
    );
    showToast(t("cart.submitted"));
    setTab("sent");
    setTimeout(sync, 300);
  };

  const reorder = (o: AgentOrderSummary) => {
    const available = new Set(state.bootstrap?.products.filter((p) => !p.quoteOnly).map((p) => p.id));
    setState((s) => ({ ...s, cart: o.items.filter((i) => i.productId && available.has(i.productId)).map((i) => ({ productId: i.productId!, quantity: i.quantity })) }));
    setModal(null);
    setTab("cart");
  };

  async function logout() {
    await fetch("/api/users/logout", { method: "POST", credentials: "include" }).catch(() => {});
    window.location.reload();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (!loaded) return null;
  const data = state.bootstrap;
  if (!data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <BrandMark className="h-14 w-auto" />
        <p className="text-[17px] text-ink-soft">{online ? t("status.syncing") : t("login.offline")}</p>
        {online && <button onClick={sync} className="h-14 rounded-2xl bg-ink px-8 text-[17px] font-semibold text-paper">{t("status.refresh")}</button>}
      </div>
    );
  }

  const visitClinic = activeVisit
    ? clinics.find((c) => (activeVisit.customerId ? c.id === activeVisit.customerId : c.clientId === activeVisit.customerClientId)) ?? null
    : null;
  const pendingCount = state.queue.filter((o) => o.type !== "location").length;
  const cartCount = state.cart.reduce((n, l) => n + l.quantity, 0);

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <header className="flex shrink-0 items-center gap-3 border-b border-line bg-paper px-4 py-3 sm:px-6">
        <BrandMark className="h-9 w-auto" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[17px] font-semibold text-ink">{agentName}</p>
          <p className="flex items-center gap-2 text-[13px]">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="text-ink-soft">{online ? t("status.online") : t("status.offline")}</span>
            {pendingCount > 0 && <span className="rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-900">{t("status.pending", { count: pendingCount })}</span>}
            {state.lastSyncAt && pendingCount === 0 && <span className="text-ink-faint">{t("status.synced", { time: fmtTime(state.lastSyncAt) })}</span>}
          </p>
        </div>
        <button
          onClick={() => setState((s) => ({ ...s, presentation: !s.presentation }))}
          className={`h-12 rounded-xl border px-4 text-[14px] font-semibold ${state.presentation ? "border-accent bg-accent-pale text-accent-deep" : "border-line text-ink"}`}
        >
          {state.presentation ? t("presentation.off") : t("presentation.on")}
        </button>
        <button onClick={sync} disabled={!online || syncing} className="hidden h-12 rounded-xl border border-line px-4 text-[14px] font-semibold text-ink disabled:opacity-50 sm:block">
          {syncing ? t("status.syncing") : t("status.syncNow")}
        </button>
      </header>

      {needLogin && (
        <button onClick={logout} className="shrink-0 bg-amber-100 px-6 py-3 text-left text-[15px] font-medium text-amber-900">{t("status.loginAgain")}</button>
      )}

      {/* Visit in progress */}
      {activeVisit && (
        <div className="flex shrink-0 items-center gap-3 bg-ink px-4 py-3 text-paper sm:px-6">
          <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-accent" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] uppercase tracking-[0.16em] text-paper/60">{t("visit.active")}</p>
            <p className="truncate text-[17px] font-semibold">
              {activeVisit.clinicName} · {t("visit.elapsed", { minutes: Math.max(0, Math.floor((now - new Date(activeVisit.checkInAt ?? now).getTime()) / 60000)) })}
            </p>
          </div>
          <button onClick={() => setModal({ kind: "endVisit" })} className="h-12 rounded-xl bg-paper px-5 text-[15px] font-semibold text-ink">{t("visit.end")}</button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {state.presentation && tab === "catalog" && <p className="mb-3 text-[13px] font-medium text-accent-deep">{t("presentation.hint")}</p>}
        {tab === "day" && (
          <DayView
            visits={visits}
            now={now}
            activeVisitId={state.activeVisitId}
            clinics={clinics}
            onStart={(v) => {
              const c = clinics.find((x) => (v.customerId ? x.id === v.customerId : x.clientId === v.customerClientId));
              if (c) startVisit(c, v);
            }}
            onContinue={() => setTab("catalog")}
            onCancel={(v) => saveVisit({ ...v, status: "cancelled" })}
            onNew={() => setModal({ kind: "pickClinic" })}
            onPlan={() => setModal({ kind: "plan" })}
          />
        )}
        {tab === "clinics" && <ClinicsView clinics={clinics} onOpen={(c) => setModal({ kind: "clinic", key: clinicKey(c) })} onNew={() => setModal({ kind: "newClinic" })} />}
        {tab === "catalog" && <CatalogView data={data} cart={state.cart} presentation={state.presentation} onAdd={addToCart} />}
        {tab === "cart" && (
          <CartView
            data={data}
            cart={state.cart}
            clinics={clinics}
            visitClinic={visitClinic}
            presentation={state.presentation}
            onQuantity={setQuantity}
            onClear={() => setState((s) => ({ ...s, cart: [] }))}
            onSubmit={submitOrder}
          />
        )}
        {tab === "sent" && <SentView orders={state.sentOrders} queue={state.queue} />}
        {tab === "day" && <OfflinePhotos urls={[...data.products.flatMap((p) => p.images), ...data.brands.map((b) => b.logo).filter((u): u is string => Boolean(u))]} />}
        {tab === "day" && (
          <button onClick={logout} className="mt-8 text-[14px] text-ink-faint underline">{t("status.logout")}</button>
        )}
      </main>

      {/* Bottom tabs — big targets for fingers */}
      <nav className="grid shrink-0 grid-cols-5 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)]">
        {(
          [
            ["day", t("nav.day"), <MapPinIcon key="i" className="h-6 w-6" />],
            ["clinics", t("nav.clinics"), <BuildingIcon key="i" className="h-6 w-6" />],
            ["catalog", t("nav.catalog"), <SparkleIcon key="i" className="h-6 w-6" />],
            ["cart", `${t("nav.cart")}${cartCount ? ` (${cartCount})` : ""}`, <BagIcon key="i" className="h-6 w-6" />],
            ["sent", t("nav.sent"), <TruckIcon key="i" className="h-6 w-6" />],
          ] as const
        ).map(([key, label, icon]) => (
          <button key={key} onClick={() => setTab(key)} className={`flex h-20 flex-col items-center justify-center gap-1 text-[13px] font-semibold ${tab === key ? "text-accent-deep" : "text-ink-soft"}`}>
            {icon}
            {label}
          </button>
        ))}
      </nav>

      {toast && <div className="fixed left-1/2 top-24 z-50 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl bg-ink px-5 py-4 text-center text-[16px] font-medium text-paper shadow-lg">{toast}</div>}

      {modal?.kind === "plan" && (
        <PlanModal
          clinics={clinics}
          initial={modal.clinic}
          onClose={() => setModal(null)}
          onSave={(clinic, at) => {
            saveVisit({ clientId: newId(), customerId: clinic.id, customerClientId: clinic.id ? undefined : clinic.clientId, clinicName: clinic.clinicName, scheduledAt: at, status: "planned" });
            setModal(null);
            setTimeout(sync, 300);
          }}
        />
      )}
      {modal?.kind === "pickClinic" && (
        <Sheet title={t("visit.pickClinic")} onClose={() => setModal(null)}>
          <ClinicsView clinics={clinics} onOpen={(c) => startVisit(c)} onNew={() => setModal({ kind: "newClinic", thenVisit: true })} compact />
        </Sheet>
      )}
      {modal?.kind === "newClinic" && (
        <NewClinicModal
          onClose={() => setModal(null)}
          onSave={(d) => {
            const c = addClinic(d);
            if (modal.thenVisit) startVisit(c);
            else setModal(null);
          }}
        />
      )}
      {modal?.kind === "clinic" && (() => {
        const c = clinics.find((x) => clinicKey(x) === modal.key);
        if (!c) return null;
        return (
          <ClinicSheet
            clinic={c}
            orders={(data.orders ?? []).filter((o) => c.id && o.customerId === c.id)}
            visits={visits.filter((v) => (c.id ? v.customerId === c.id : v.customerClientId === c.clientId))}
            onClose={() => setModal(null)}
            onStart={() => startVisit(c)}
            onPlan={() => setModal({ kind: "plan", clinic: c })}
            onReorder={reorder}
          />
        );
      })()}
      {modal?.kind === "endVisit" && activeVisit && <EndVisitModal visit={activeVisit} onClose={() => setModal(null)} onFinish={endVisit} />}
    </div>
  );
}

// ── Views ──────────────────────────────────────────────────────────────────

function DayView({
  visits,
  now,
  activeVisitId,
  clinics,
  onStart,
  onContinue,
  onCancel,
  onNew,
  onPlan,
}: {
  visits: AgentVisit[];
  now: number;
  activeVisitId: string | null;
  clinics: AgentClinic[];
  onStart: (v: AgentVisit) => void;
  onContinue: () => void;
  onCancel: (v: AgentVisit) => void;
  onNew: () => void;
  onPlan: () => void;
}) {
  const t = useTranslations("agentApp.day");
  const today = new Date(now);
  const byTime = (a: AgentVisit, b: AgentVisit) => (a.scheduledAt ?? "").localeCompare(b.scheduledAt ?? "");
  const todays = visits.filter((v) => sameDay(v.scheduledAt ?? v.checkInAt, today)).sort(byTime);
  const upcoming = visits
    .filter((v) => v.status === "planned" && v.scheduledAt && new Date(v.scheduledAt).getTime() > new Date(today.toDateString()).getTime() + 86400000)
    .sort(byTime)
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <button onClick={onNew} className="flex h-20 items-center justify-center gap-3 rounded-2xl bg-ink text-[18px] font-semibold text-paper">
          <PlusIcon className="h-6 w-6" /> {t("newVisit")}
        </button>
        <button onClick={onPlan} className="flex h-20 items-center justify-center gap-3 rounded-2xl border border-line bg-paper text-[18px] font-semibold text-ink">
          {t("plan")}
        </button>
      </div>

      <section>
        <h2 className="font-display text-2xl font-semibold text-ink">
          {t("title")} · {today.toLocaleDateString("sq-AL", { weekday: "long", day: "numeric", month: "long" })}
        </h2>
        {todays.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-line bg-paper p-6 text-[16px] text-ink-soft">{t("empty")}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {todays.map((v) => (
              <VisitRow key={v.clientId} visit={v} active={v.clientId === activeVisitId} canStart={!activeVisitId && clinics.length > 0} onStart={() => onStart(v)} onContinue={onContinue} onCancel={() => onCancel(v)} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-display text-xl font-semibold text-ink">{t("upcoming")}</h3>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-[15px] text-ink-faint">{t("noUpcoming")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {upcoming.map((v) => (
              <li key={v.clientId} className="flex items-center justify-between rounded-2xl border border-line bg-paper px-5 py-4 text-[16px]">
                <span className="font-semibold text-ink">{v.clinicName}</span>
                <span className="text-ink-soft">{fmtDate(v.scheduledAt)} · {fmtTime(v.scheduledAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function VisitRow({ visit, active, canStart, onStart, onContinue, onCancel }: { visit: AgentVisit; active: boolean; canStart: boolean; onStart: () => void; onContinue: () => void; onCancel: () => void }) {
  const t = useTranslations("agentApp.day");
  return (
    <li className={`flex flex-wrap items-center gap-4 rounded-2xl border bg-paper px-5 py-4 ${active ? "border-accent" : "border-line"}`}>
      <span className="w-16 font-display text-[22px] font-semibold text-ink">{fmtTime(visit.scheduledAt ?? visit.checkInAt)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[17px] font-semibold text-ink">{visit.clinicName}</p>
        {visit.notes && <p className="truncate text-[14px] text-ink-soft">{visit.notes}</p>}
      </div>
      {visit.status === "planned" && (
        <>
          <button onClick={onCancel} className="h-12 rounded-xl px-4 text-[14px] font-medium text-ink-faint">{t("cancel")}</button>
          <button onClick={onStart} disabled={!canStart} className="h-12 rounded-xl bg-ink px-6 text-[15px] font-semibold text-paper disabled:opacity-40">{t("start")}</button>
        </>
      )}
      {visit.status === "in_progress" && active && <button onClick={onContinue} className="h-12 rounded-xl bg-accent-deep px-6 text-[15px] font-semibold text-white">{t("continue")}</button>}
      {visit.status === "done" && <span className="flex items-center gap-1.5 text-[14px] font-semibold text-emerald-700"><CheckCircleIcon className="h-5 w-5" /> {t("done")}</span>}
      {visit.status === "cancelled" && <span className="text-[14px] text-ink-faint">{t("cancelled")}</span>}
    </li>
  );
}

function ClinicsView({ clinics, onOpen, onNew, compact }: { clinics: AgentClinic[]; onOpen: (c: AgentClinic) => void; onNew: () => void; compact?: boolean }) {
  const t = useTranslations("agentApp.clinics");
  const [q, setQ] = useState("");
  const list = clinics.filter((c) => `${c.clinicName} ${c.fullName} ${c.city ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="h-14 w-full rounded-2xl border border-line bg-paper pl-12 pr-4 text-[17px] outline-none focus:border-accent" />
        </div>
        <button onClick={onNew} className="flex h-14 items-center gap-2 rounded-2xl bg-ink px-5 text-[16px] font-semibold text-paper">
          <PlusIcon className="h-5 w-5" /> {t("new")}
        </button>
      </div>
      {!compact && <h2 className="mt-6 font-display text-2xl font-semibold text-ink">{t("title")}</h2>}
      {list.length === 0 ? (
        <p className="mt-4 text-[16px] text-ink-soft">{t("empty")}</p>
      ) : (
        <ul className={`mt-4 grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
          {list.map((c) => (
            <li key={clinicKey(c)}>
              <button onClick={() => onOpen(c)} className="flex w-full items-center gap-4 rounded-2xl border border-line bg-paper px-5 py-4 text-left active:bg-mist">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-pale font-display text-[16px] font-semibold text-accent-deep">{c.clinicName.slice(0, 2).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[17px] font-semibold text-ink">{c.clinicName}</span>
                  <span className="block truncate text-[14px] text-ink-soft">{c.fullName}{c.city ? ` · ${c.city}` : ""}{c.id === null ? ` · ${t("pendingSync")}` : ""}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SentView({ orders, queue }: { orders: AgentState["sentOrders"]; queue: SyncOp[] }) {
  const t = useTranslations("agentApp");
  const waiting = new Set(queue.map((o) => o.clientId));
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink">{t("sent.title")}</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-[16px] text-ink-soft">{t("sent.empty")}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => {
            const r = o.result;
            const status = waiting.has(o.clientId) || !r ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-[13px] font-semibold text-amber-900">{t("sent.waiting")}</span>
            ) : r.ok ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[13px] font-semibold text-emerald-800">{t("sent.ok", { number: r.orderNumber ?? "" })}</span>
            ) : (
              <span className="rounded-full bg-accent-pale px-3 py-1 text-[13px] font-semibold text-accent-deep">{t("sent.failed")}: {t(`errors.${r.error ?? "server-error"}`)}</span>
            );
            return (
              <li key={o.clientId} className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-paper px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] font-semibold text-ink">{o.clinicName}</p>
                  <p className="text-[14px] text-ink-soft">{fmtDate(o.at)} · {fmtTime(o.at)} · {eur(r?.total ?? o.total)}</p>
                </div>
                {status}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Pre-loads every product photo and brand logo into the offline cache. */
function OfflinePhotos({ urls }: { urls: string[] }) {
  const t = useTranslations("agentApp.offline");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  async function run() {
    const unique = [...new Set(urls)];
    setProgress({ done: 0, total: unique.length });
    let done = 0;
    for (let i = 0; i < unique.length; i += 6) {
      await Promise.all(unique.slice(i, i + 6).map((u) => fetch(u, { mode: u.startsWith("/") ? "same-origin" : "no-cors" }).catch(() => null)));
      done = Math.min(unique.length, i + 6);
      setProgress({ done, total: unique.length });
    }
  }
  const finished = progress && progress.done >= progress.total;
  return (
    <button onClick={run} disabled={Boolean(progress && !finished)} className="mt-8 h-14 w-full rounded-2xl border border-line bg-paper text-[16px] font-semibold text-ink disabled:opacity-60">
      {!progress ? t("download") : finished ? `✓ ${t("downloaded")}` : t("downloading", progress)}
    </button>
  );
}

// ── Modals ─────────────────────────────────────────────────────────────────

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-paper p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
          <button onClick={onClose} className="flex h-12 w-12 items-center justify-center rounded-full bg-mist" aria-label="Mbyll"><CloseIcon className="h-6 w-6" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const input = "h-14 w-full rounded-xl border border-line bg-paper px-4 text-[17px] outline-none focus:border-accent";

function PlanModal({ clinics, initial, onClose, onSave }: { clinics: AgentClinic[]; initial?: AgentClinic; onClose: () => void; onSave: (c: AgentClinic, at: string) => void }) {
  const t = useTranslations("agentApp.plan");
  const [key, setKey] = useState(initial ? clinicKey(initial) : "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  const clinic = clinics.find((c) => clinicKey(c) === key);
  return (
    <Sheet title={t("title")} onClose={onClose}>
      <label className="block text-[14px] font-medium text-ink-soft">
        {t("clinic")}
        <select value={key} onChange={(e) => setKey(e.target.value)} className={`${input} mt-1.5`}>
          <option value="">{t("chooseClinic")}</option>
          {clinics.map((c) => <option key={clinicKey(c)} value={clinicKey(c)}>{c.clinicName}</option>)}
        </select>
      </label>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <label className="block text-[14px] font-medium text-ink-soft">
          {t("date")}
          <input type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setDate(e.target.value)} className={`${input} mt-1.5`} />
        </label>
        <label className="block text-[14px] font-medium text-ink-soft">
          {t("time")}
          <select value={time} onChange={(e) => setTime(e.target.value)} className={`${input} mt-1.5`}>
            {timeSlots().map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <button
        disabled={!clinic || !date}
        onClick={() => clinic && onSave(clinic, new Date(`${date}T${time}:00`).toISOString())}
        className="mt-6 h-14 w-full rounded-2xl bg-ink text-[17px] font-semibold text-paper disabled:opacity-40"
      >
        {t("save")}
      </button>
    </Sheet>
  );
}

function NewClinicModal({ onClose, onSave }: { onClose: () => void; onSave: (d: { clinicName: string; fullName: string; phone: string; email?: string; city?: string; address?: string }) => void }) {
  const t = useTranslations("agentApp.clinicForm");
  const [f, setF] = useState({ clinicName: "", fullName: "", phone: "", email: "", city: "", address: "" });
  const [error, setError] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <Sheet title={t("title")} onClose={onClose}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input value={f.clinicName} onChange={set("clinicName")} placeholder={t("clinicName")} className={input} />
        <input value={f.fullName} onChange={set("fullName")} placeholder={t("fullName")} className={input} />
        <input value={f.phone} onChange={set("phone")} placeholder={t("phone")} inputMode="tel" className={input} />
        <input value={f.email} onChange={set("email")} placeholder={t("email")} inputMode="email" className={input} />
        <input value={f.city} onChange={set("city")} placeholder={t("city")} className={input} />
        <input value={f.address} onChange={set("address")} placeholder={t("address")} className={input} />
      </div>
      {error && <p className="mt-3 rounded-xl bg-accent-pale px-4 py-3 text-[15px] text-accent-deep">{t("required")}</p>}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button onClick={onClose} className="h-14 rounded-2xl border border-line text-[17px] font-semibold text-ink">{t("cancel")}</button>
        <button
          onClick={() => {
            if (!f.clinicName.trim() || !f.fullName.trim() || !f.phone.trim()) return setError(true);
            onSave({ clinicName: f.clinicName.trim(), fullName: f.fullName.trim(), phone: f.phone.trim(), email: f.email.trim() || undefined, city: f.city.trim() || undefined, address: f.address.trim() || undefined });
          }}
          className="h-14 rounded-2xl bg-ink text-[17px] font-semibold text-paper"
        >
          {t("save")}
        </button>
      </div>
    </Sheet>
  );
}

function ClinicSheet({
  clinic,
  orders,
  visits,
  onClose,
  onStart,
  onPlan,
  onReorder,
}: {
  clinic: AgentClinic;
  orders: AgentOrderSummary[];
  visits: AgentVisit[];
  onClose: () => void;
  onStart: () => void;
  onPlan: () => void;
  onReorder: (o: AgentOrderSummary) => void;
}) {
  const t = useTranslations("agentApp");
  const past = [...visits].filter((v) => v.status === "done").sort((a, b) => (b.checkInAt ?? "").localeCompare(a.checkInAt ?? "")).slice(0, 10);
  return (
    <Sheet title={clinic.clinicName} onClose={onClose}>
      <p className="text-[16px] text-ink-soft">
        {clinic.fullName} · {clinic.phone}
        {clinic.city ? ` · ${clinic.city}` : ""}
        {clinic.address ? ` · ${clinic.address}` : ""}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button onClick={onStart} className="h-16 rounded-2xl bg-ink text-[17px] font-semibold text-paper">{t("clinics.startVisit")}</button>
        <button onClick={onPlan} className="h-16 rounded-2xl border border-line text-[17px] font-semibold text-ink">{t("day.plan")}</button>
      </div>

      <h3 className="mt-8 font-display text-xl font-semibold text-ink">{t("clinics.history")}</h3>
      {orders.length === 0 ? (
        <p className="mt-2 text-[15px] text-ink-faint">{t("clinics.noHistory")}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {orders.slice(0, 10).map((o) => (
            <li key={o.id} className="rounded-2xl border border-line p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[16px] font-semibold text-ink">{o.orderNumber} · {fmtDate(o.createdAt)}</p>
                <p className="font-display text-[17px] font-semibold">{eur(o.total)}</p>
              </div>
              <p className="mt-1 text-[14px] text-ink-soft">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</p>
              <button onClick={() => onReorder(o)} className="mt-3 h-12 rounded-xl border border-ink px-5 text-[15px] font-semibold text-ink">{t("clinics.reorder")}</button>
            </li>
          ))}
        </ul>
      )}

      <h3 className="mt-8 font-display text-xl font-semibold text-ink">{t("clinics.visits")}</h3>
      {past.length === 0 ? (
        <p className="mt-2 text-[15px] text-ink-faint">{t("clinics.noVisits")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {past.map((v) => (
            <li key={v.clientId} className="rounded-2xl bg-mist p-4 text-[15px]">
              <p className="font-semibold text-ink">{fmtDate(v.checkInAt)} {v.interest ? `· ${t(`visit.${v.interest}`)}` : ""}</p>
              {v.notes && <p className="mt-1 whitespace-pre-line text-ink-soft">{v.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}

function EndVisitModal({ visit, onClose, onFinish }: { visit: AgentVisit; onClose: () => void; onFinish: (notes: string, interest: AgentVisit["interest"], nextAt: string | null) => void }) {
  const t = useTranslations("agentApp.visit");
  const [notes, setNotes] = useState(visit.notes ?? "");
  const [interest, setInterest] = useState<AgentVisit["interest"]>(visit.interest ?? null);
  const [nextDate, setNextDate] = useState("");
  const [nextTime, setNextTime] = useState("10:00");
  return (
    <Sheet title={t("notesTitle")} onClose={onClose}>
      <p className="text-[16px] font-semibold text-ink">{visit.clinicName}</p>
      <label className="mt-4 block text-[14px] font-medium text-ink-soft">
        {t("notes")}
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder={t("notesPlaceholder")} className="mt-1.5 w-full rounded-xl border border-line p-4 text-[17px] outline-none focus:border-accent" />
      </label>
      <p className="mt-4 text-[14px] font-medium text-ink-soft">{t("interest")}</p>
      <div className="mt-1.5 grid grid-cols-3 gap-2">
        {(["low", "medium", "high"] as const).map((i) => (
          <button key={i} onClick={() => setInterest(i)} className={`h-14 rounded-xl border text-[16px] font-semibold ${interest === i ? "border-ink bg-ink text-paper" : "border-line text-ink"}`}>{t(i)}</button>
        ))}
      </div>
      <p className="mt-4 text-[14px] font-medium text-ink-soft">{t("next")}</p>
      <div className="mt-1.5 grid grid-cols-2 gap-3">
        <input type="date" value={nextDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setNextDate(e.target.value)} className={input} />
        <select value={nextTime} onChange={(e) => setNextTime(e.target.value)} disabled={!nextDate} className={input}>
          {timeSlots().map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {!nextDate && <p className="mt-1 text-[13px] text-ink-faint">{t("noNext")}</p>}
      <button
        onClick={() => onFinish(notes.trim(), interest, nextDate ? new Date(`${nextDate}T${nextTime}:00`).toISOString() : null)}
        className="mt-6 h-16 w-full rounded-2xl bg-accent-deep text-[18px] font-semibold text-white"
      >
        {t("finish")}
      </button>
    </Sheet>
  );
}
