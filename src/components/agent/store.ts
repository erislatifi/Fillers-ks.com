"use client";

// Everything the tablet needs offline lives in localStorage under one key: the downloaded
// catalogue (bootstrap), the queue of work not yet sent, and local edits (visits, clinics, cart).
import type { AgentBootstrap, AgentClinic, AgentVisit, SyncOp, SyncResult } from "@/lib/agentApp/types";

export type CartLine = { productId: number; quantity: number };

export type AgentState = {
  bootstrap: AgentBootstrap | null;
  queue: SyncOp[];
  localVisits: Record<string, AgentVisit>;
  localClinics: AgentClinic[];
  activeVisitId: string | null;
  cart: CartLine[];
  lastSyncAt: string | null;
  lastSyncError: string | null;
  /** Outcome of sent orders, newest first (order number or error), for the "Dërguar" list. */
  sentOrders: { clientId: string; clinicName: string; total: number; at: string; result?: SyncResult }[];
  presentation: boolean;
};

const KEY = "fk-agent-state-v1";

export const emptyState: AgentState = {
  bootstrap: null,
  queue: [],
  localVisits: {},
  localClinics: [],
  activeVisitId: null,
  cart: [],
  lastSyncAt: null,
  lastSyncError: null,
  sentOrders: [],
  presentation: false,
};

export function loadState(agentId: number): AgentState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState;
    const s = JSON.parse(raw) as AgentState & { agentId?: number };
    // Another agent logged in on this tablet: never show the previous agent's data.
    if (s.agentId !== agentId) return emptyState;
    return { ...emptyState, ...s };
  } catch {
    return emptyState;
  }
}

export function saveState(agentId: number, state: AgentState) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, agentId }));
  } catch {
    // Storage full (huge catalogue): keep working in memory.
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** Visits: the server's list with local changes on top (local wins until it has synced). */
export function mergedVisits(s: AgentState): AgentVisit[] {
  const byId = new Map<string, AgentVisit>();
  for (const v of s.bootstrap?.visits ?? []) byId.set(v.clientId, v);
  for (const v of Object.values(s.localVisits)) byId.set(v.clientId, v);
  return [...byId.values()];
}

export function mergedClinics(s: AgentState): AgentClinic[] {
  const server = s.bootstrap?.clinics ?? [];
  const ids = new Set(server.map((c) => c.id));
  const local = s.localClinics.filter((c) => c.id === null || !ids.has(c.id));
  return [...server, ...local].sort((a, b) => a.clinicName.localeCompare(b.clinicName));
}

export const clinicKey = (c: Pick<AgentClinic, "id" | "clientId">) => (c.id ? `id-${c.id}` : `c-${c.clientId}`);

/** 15-minute slots for a day, "08:00" … "19:45". */
export function timeSlots(from = 8, to = 20) {
  const out: string[] = [];
  for (let h = from; h < to; h++) for (const m of [0, 15, 30, 45]) out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  return out;
}

export const sameDay = (iso: string | null | undefined, day: Date) => {
  if (!iso) return false;
  const d = new Date(iso);
  return d.getFullYear() === day.getFullYear() && d.getMonth() === day.getMonth() && d.getDate() === day.getDate();
};

export const fmtTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit", hour12: false }) : "—";

export const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("sq-AL", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

export const eur = (n: number) => `€${n.toFixed(2)}`;
