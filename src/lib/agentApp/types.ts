// Shapes shared by the agents' tablet app (/agjent) and its API (/agjent/api/*).
import type { DeliveryMethod, PaymentMethod } from "@/lib/checkout";

export type AgentProduct = {
  id: number;
  slug: string;
  name: string;
  brandSlug: string;
  brandName: string;
  categorySlug: string;
  size: string | null;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  quoteOnly: boolean;
  stockStatus: string;
  description: string;
  images: string[];
  bestSeller: boolean;
  newArrival: boolean;
};

export type AgentBrand = {
  slug: string;
  name: string;
  logo: string | null;
  tagline: string;
  description: string;
  origin: string;
  type: string;
};

export type AgentCategory = { slug: string; name: string };

export type AgentClinic = {
  /** Server id; null for a clinic created offline that hasn't synced yet. */
  id: number | null;
  clientId?: string;
  clinicName: string;
  fullName: string;
  phone: string;
  email: string | null;
  city: string | null;
  address: string | null;
};

export type AgentOrderSummary = {
  id: number;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  customerId: number | null;
  clinicName: string;
  items: { productId: number | null; name: string; quantity: number; price: number }[];
};

export type AgentVisit = {
  id: number | null;
  clientId: string;
  customerId: number | null;
  customerClientId?: string;
  clinicName: string;
  scheduledAt: string | null;
  status: "planned" | "in_progress" | "done" | "cancelled";
  checkInAt?: string | null;
  checkOutAt?: string | null;
  notes?: string | null;
  interest?: "low" | "medium" | "high" | null;
  nextVisitAt?: string | null;
};

export type AgentBootstrap = {
  agent: { id: number; name: string; email: string; maxDiscountPercent: number };
  checkout: { deliveries: DeliveryMethod[]; payments: Record<DeliveryMethod, PaymentMethod[]> };
  brands: AgentBrand[];
  categories: AgentCategory[];
  products: AgentProduct[];
  clinics: AgentClinic[];
  orders: AgentOrderSummary[];
  visits: AgentVisit[];
  generatedAt: string;
};

// ── Offline queue: everything the tablet does is an op, sent by /agjent/api/sync. ──

export type ClinicOp = {
  type: "clinic";
  clientId: string;
  data: { clinicName: string; fullName: string; phone: string; email?: string; city?: string; address?: string };
};

export type VisitOp = {
  type: "visit";
  clientId: string;
  data: {
    customerId?: number | null;
    customerClientId?: string;
    clinicName: string;
    scheduledAt?: string | null;
    status: AgentVisit["status"];
    checkInAt?: string | null;
    checkOutAt?: string | null;
    lat?: number | null;
    lng?: number | null;
    notes?: string | null;
    interest?: AgentVisit["interest"];
    nextVisitAt?: string | null;
  };
};

export type OrderOp = {
  type: "order";
  clientId: string;
  data: {
    customerId?: number | null;
    customerClientId?: string;
    visitClientId?: string;
    items: { productId: number; quantity: number }[];
    discountPercent: number;
    deliveryMethod: DeliveryMethod;
    paymentMethod: PaymentMethod;
    requestedDeliveryDate?: string | null;
    notes?: string | null;
    /** PNG data URL from the signature pad (optional). */
    signature?: string | null;
    signedBy?: string | null;
  };
};

export type LocationOp = {
  type: "location";
  clientId: string;
  data: { lat: number; lng: number; accuracy?: number | null; recordedAt: string; kind: "interval" | "check_in" | "check_out"; visitClientId?: string };
};

export type SyncOp = ClinicOp | VisitOp | OrderOp | LocationOp;

export type SyncResult = {
  clientId: string;
  ok: boolean;
  id?: number;
  orderNumber?: string;
  total?: number;
  /** Error code for the tablet to show (texts in messages → agentApp.errors). */
  error?: string;
};
