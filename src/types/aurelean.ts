export type RfqStatus = "draft" | "sent" | "responded" | "sampling" | "closed";

export type SupplierStage = "shortlisted" | "dialogue" | "sampling" | "approved";

export type Supplier = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  city: string;
  category: string;
  material: string;
  moq: string;
  leadTimeWeeks: number;
  tier: string;
  verified: boolean;
  reliability: number;
  capabilityTier: string;
  stage: SupplierStage;
  saved: boolean;
  certifications: string[];
  overview: string;
  featuredScore: number;
};

export type Rfq = {
  id: string;
  supplierId: string;
  supplierName: string;
  material: string;
  quantity: string;
  status: RfqStatus;
  bidsReceived: number;
  updatedAtLabel: string;
  project: string;
  targetDelivery: string;
  thread: ThreadMessage[];
};

export type Bid = {
  id: string;
  rfqId: string;
  supplierId: string;
  supplierName: string;
  countryCode: string;
  pricePerUnit: number;
  currency: "EUR" | "USD";
  leadTimeWeeks: number;
  moq: string;
  reliability: number;
  bestValue: boolean;
  awarded: boolean;
};

export type ThreadMessage = {
  author: string;
  initials: string;
  body: string;
  time: string;
};

export type MemoryEntry = {
  id: string;
  kind: "Decision" | "Sample" | "Signal" | "Message" | "Spec" | "Request";
  title: string;
  body: string;
  entities: string[];
  time: string;
  group: "Today" | "This week" | "Earlier";
};

export type AccessRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  sourcing: string[];
  volume: string;
  layers: string[];
  notes: string;
  createdAt: string;
};

export type SampleRequest = {
  id: string;
  supplierId: string;
  material: string;
  quantity: string;
  targetDelivery: string;
  specifications: string;
  createdAt: string;
};

export type AureleanState = {
  suppliers: Supplier[];
  rfqs: Rfq[];
  bids: Bid[];
  memories: MemoryEntry[];
  accessRequests: AccessRequest[];
  sampleRequests: SampleRequest[];
};

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
