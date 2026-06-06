import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { initialState } from "@/lib/seed";
import type {
  AccessRequest,
  AureleanState,
  Bid,
  MemoryEntry,
  Rfq,
  SampleRequest,
  Supplier
} from "@/types/aurelean";

const STATE_ID = "main";
const dbFile = path.join(process.cwd(), "data", "aurelean-db.json");

let supabase: SupabaseClient | null = null;
let memoryState: AureleanState | null = null;

function cloneState(state: AureleanState): AureleanState {
  return JSON.parse(JSON.stringify(state)) as AureleanState;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!supabase) {
    supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return supabase;
}

async function readFileState() {
  try {
    const raw = await fs.readFile(dbFile, "utf8");
    return JSON.parse(raw) as AureleanState;
  } catch {
    const fresh = cloneState(initialState);
    await writeFileState(fresh);
    return fresh;
  }
}

async function writeFileState(state: AureleanState) {
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  await fs.writeFile(dbFile, JSON.stringify(state, null, 2));
}

async function readSupabaseState(client: SupabaseClient) {
  const { data, error } = await client
    .from("app_state")
    .select("state")
    .eq("id", STATE_ID)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (data?.state) return data.state as AureleanState;

  const fresh = cloneState(initialState);
  await writeSupabaseState(client, fresh);
  return fresh;
}

async function writeSupabaseState(client: SupabaseClient, state: AureleanState) {
  const { error } = await client
    .from("app_state")
    .upsert({
      id: STATE_ID,
      state,
      updated_at: new Date().toISOString()
    });
  if (error) throw new Error(error.message);
}

export async function getState() {
  const client = getSupabase();
  if (client) return readSupabaseState(client);

  if (process.env.VERCEL) {
    memoryState ??= cloneState(initialState);
    return memoryState;
  }

  return readFileState();
}

export async function getPublicState() {
  const state = await getState();
  return {
    suppliers: state.suppliers,
    rfqs: state.rfqs,
    bids: state.bids,
    memories: state.memories,
    accessRequests: [],
    sampleRequests: []
  } satisfies AureleanState;
}

export async function updateState<T>(
  mutator: (state: AureleanState) => T | Promise<T>
) {
  const state = await getState();
  const result = await mutator(state);
  const client = getSupabase();

  if (client) await writeSupabaseState(client, state);
  else if (process.env.VERCEL) memoryState = state;
  else await writeFileState(state);

  return result;
}

export async function listSuppliers() {
  return (await getState()).suppliers;
}

export async function getSupplier(id: string) {
  return (await listSuppliers()).find((supplier) => supplier.id === id) ?? null;
}

export async function toggleSupplierSaved(id: string) {
  return updateState<Supplier | null>((state) => {
    const supplier = state.suppliers.find((item) => item.id === id);
    if (!supplier) return null;
    supplier.saved = !supplier.saved;
    return supplier;
  });
}

export async function createSampleRequest(input: Omit<SampleRequest, "id" | "createdAt">) {
  return updateState<SampleRequest>((state) => {
    const request = {
      ...input,
      id: `SMP-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    state.sampleRequests.unshift(request);
    state.memories.unshift({
      id: `MEM-${Date.now()}`,
      kind: "Request",
      title: `Sample requested from ${input.supplierId}`,
      body: `${input.quantity} requested for ${input.material}. Target delivery: ${input.targetDelivery || "not specified"}.`,
      entities: [input.supplierId, input.material],
      time: "Just now",
      group: "Today"
    });
    return request;
  });
}

export async function createAccessRequest(
  input: Omit<AccessRequest, "id" | "createdAt">
) {
  return updateState<AccessRequest>((state) => {
    const request = {
      ...input,
      id: `ACC-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    state.accessRequests.unshift(request);
    return request;
  });
}

export async function listRfqs() {
  return (await getState()).rfqs;
}

export async function createRfq(
  input: Pick<Rfq, "supplierId" | "supplierName" | "material" | "quantity" | "targetDelivery"> & {
    specifications?: string;
  }
) {
  return updateState<Rfq>((state) => {
    const numericIds = state.rfqs
      .map((rfq) => Number(rfq.id.replace("RFQ-", "")))
      .filter((value) => Number.isFinite(value));
    const nextNumber = (numericIds.length > 0 ? Math.max(...numericIds) : 2040) + 1;
    const rfq: Rfq = {
      id: `RFQ-${nextNumber}`,
      supplierId: input.supplierId,
      supplierName: input.supplierName,
      material: input.material,
      quantity: input.quantity,
      status: "sent",
      bidsReceived: 0,
      updatedAtLabel: "Just now",
      project: "New sourcing thread",
      targetDelivery: input.targetDelivery || "TBD",
      thread: [
        {
          author: "AURELEAN",
          initials: "AR",
          body: input.specifications
            ? `Structured RFQ issued with specifications: ${input.specifications}`
            : "Structured RFQ issued through AURELEAN.",
          time: "Just now"
        }
      ]
    };
    state.rfqs.unshift(rfq);
    state.memories.unshift({
      id: `MEM-${Date.now()}`,
      kind: "Request",
      title: `Issued ${rfq.id} to ${rfq.supplierName}`,
      body: `${rfq.quantity} of ${rfq.material} requested for ${rfq.targetDelivery}.`,
      entities: [rfq.id, rfq.supplierName, rfq.material],
      time: "Just now",
      group: "Today"
    });
    return rfq;
  });
}

export async function listBids() {
  return (await getState()).bids;
}

export async function awardBid(rfqId: string, bidId: string) {
  return updateState<Bid | null>((state) => {
    const bid = state.bids.find((item) => item.id === bidId && item.rfqId === rfqId);
    const rfq = state.rfqs.find((item) => item.id === rfqId);
    if (!bid || !rfq) return null;

    state.bids.forEach((item) => {
      if (item.rfqId === rfqId) item.awarded = item.id === bidId;
    });
    rfq.status = "closed";
    rfq.updatedAtLabel = "Just now";
    state.memories.unshift({
      id: `MEM-${Date.now()}`,
      kind: "Decision",
      title: `Awarded ${rfq.id} to ${bid.supplierName}`,
      body: `${bid.supplierName} was awarded ${rfq.material} at €${bid.pricePerUnit}/m with a ${bid.leadTimeWeeks}-week lead time.`,
      entities: [rfq.id, bid.supplierName, rfq.material],
      time: "Just now",
      group: "Today"
    });
    return bid;
  });
}

export async function listMemory() {
  return (await getState()).memories;
}

export async function recordMemory(
  input: Omit<MemoryEntry, "id" | "time" | "group">
) {
  return updateState<MemoryEntry>((state) => {
    const memory: MemoryEntry = {
      ...input,
      id: `MEM-${Date.now()}`,
      time: "Just now",
      group: "Today"
    };
    state.memories.unshift(memory);
    return memory;
  });
}

export function findMemoryMatches(memories: MemoryEntry[], query: string) {
  const q = query.toLowerCase();
  return memories.filter((entry) => {
    const haystack = [
      entry.title,
      entry.body,
      entry.kind,
      ...entry.entities
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  });
}
