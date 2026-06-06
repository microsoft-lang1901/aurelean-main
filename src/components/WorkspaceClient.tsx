"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Bell, Box, Brain, CheckCircle2, Grid2X2, Search, Send, Shield, Sparkles, TrendingUp, Users } from "lucide-react";
import type { AgentAction, AgentRunData, AureleanState, Bid, MemoryEntry, Rfq, Supplier } from "@/types/aurelean";

type View = "overview" | "rfq" | "suppliers" | "memory" | "market" | "risk" | "notifications";

export function WorkspaceClient({ initialState }: { initialState: AureleanState }) {
  const [state, setState] = useState(initialState);
  const [view, setView] = useState<View>("overview");
  const [selectedRfqId, setSelectedRfqId] = useState(
    initialState.rfqs.find((rfq) => rfq.bidsReceived > 0)?.id ?? initialState.rfqs[0]?.id ?? ""
  );
  const [command, setCommand] = useState("Compare bids for RFQ-2041 and tell me the approval boundary.");
  const [agentResult, setAgentResult] = useState<AgentRunData | null>(null);
  const [agentBusy, setAgentBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [operationBusy, setOperationBusy] = useState(false);
  const selectedRfq = state.rfqs.find((rfq) => rfq.id === selectedRfqId) ?? state.rfqs[0];
  const bids = state.bids.filter((bid) => bid.rfqId === selectedRfq?.id);

  async function refresh() {
    try {
      setStatus("Refreshing workspace...");
      const response = await fetch("/api/bootstrap");
      if (!response.ok) {
        setStatus(`Could not refresh workspace (${response.status}).`);
        return;
      }
      const json = await response.json();
      if (json.ok) {
        setState(json.data);
        setStatus("Workspace refreshed.");
      } else {
        setStatus(json.error ?? "Could not refresh workspace.");
      }
    } catch {
      setStatus("Could not reach workspace API.");
    }
  }

  async function awardBid(rfq: Rfq, bid: Bid) {
    if (operationBusy) return;
    setOperationBusy(true);
    setStatus(`Awarding ${bid.supplierName} for ${rfq.id}...`);
    try {
      const response = await fetch(`/api/rfqs/${rfq.id}/award`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId: bid.id, approvalIntent: "human-approved" })
      });
      const json = await response.json();
      if (json.ok) {
        await refresh();
        setStatus("Bid awarded.");
      } else {
        setStatus(json.error ?? "Could not award bid.");
      }
    } catch {
      setStatus("Award request failed.");
    } finally {
      setOperationBusy(false);
    }
  }

  async function runAgent(action: AgentAction = "ask") {
    setAgentBusy(true);
    setStatus("Running AURELEAN agent...");
    try {
      const response = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: command,
          action,
          rfqId: selectedRfq?.id,
          supplierId: selectedRfq?.supplierId,
          material: selectedRfq?.material,
          quantity: selectedRfq?.quantity,
          targetDelivery: selectedRfq?.targetDelivery,
          specifications: command
        })
      });
      const json = await response.json();
      if (json.ok) {
        setAgentResult(json.data);
        await refresh();
        setStatus("Agent action complete.");
      } else {
        setAgentResult({
          answer: json.error || "AURELEAN could not complete that command.",
          source: "deterministic-fallback",
          action,
          approvalRequired: false,
          toolEvents: []
        });
        setStatus(json.error ?? "Agent action failed.");
      }
    } catch {
      setAgentResult({
        answer: "AURELEAN could not reach the agent backend.",
        source: "deterministic-fallback",
        action,
        approvalRequired: false,
        toolEvents: []
      });
      setStatus("Agent run failed.");
    } finally {
      setAgentBusy(false);
    }
  }

  return (
    <div className="workspace">
      <aside className="appbar">
        <div className="logo" style={{ padding: "6px 8px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M12 3 L21 20 H3 Z" />
            <path d="M12 10 L16.5 20 H7.5 Z" strokeOpacity=".55" />
          </svg>
          AURELEAN
        </div>
        <div className="ws-card">
          <strong>Atelier Voss</strong>
          <div style={{ color: "var(--on-dk-dim)", fontSize: 12 }}>Public demo workspace</div>
        </div>
        <NavButton view="overview" current={view} setView={setView} icon={<Grid2X2 />} label="Overview" />
        <NavButton view="rfq" current={view} setView={setView} icon={<Box />} label="RFQ Inbox" badge="3" />
        <NavButton view="suppliers" current={view} setView={setView} icon={<Users />} label="Supplier Workspace" />
        <NavButton view="memory" current={view} setView={setView} icon={<Brain />} label="Operational Memory" />
        <div className="kicker" style={{ color: "var(--on-dk-dim)", marginTop: 18 }}>Intelligence</div>
        <NavButton view="market" current={view} setView={setView} icon={<BarChart3 />} label="Market Signals" />
        <NavButton view="risk" current={view} setView={setView} icon={<Shield />} label="Risk Monitor" />
        <div style={{ marginTop: "auto", color: "var(--on-dk-mut)", fontSize: 13 }}>Elise Moreau<br /><span style={{ color: "var(--on-dk-dim)" }}>Head of Sourcing</span></div>
      </aside>
      <main className="appmain">
        <div className="demo-banner">
          Public demo workspace. Actions are product simulations for evaluation and are not authenticated production procurement.
        </div>
        <div className="topbar">
          <h1 className="h-md" style={{ minWidth: 210 }}>{titles[view]}</h1>
          <label className="input" style={{ maxWidth: 360, display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
            <Search size={16} />
            <input
              style={{ border: 0, background: "transparent", outline: 0, width: "100%" }}
              placeholder="Search or ask AURELEAN..."
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void runAgent("ask");
              }}
            />
          </label>
          <button type="button" className="btn btn-ghost-lt" onClick={() => runAgent("ask")} disabled={agentBusy}>
            <Send size={16} /> {agentBusy ? "Running" : "Ask"}
          </button>
          <button type="button" className="btn btn-ghost-lt" aria-label="Notifications" onClick={() => setView("notifications")}><Bell size={16} /></button>
          <button type="button" className="btn btn-gold" onClick={() => runAgent("create_rfq")} disabled={agentBusy}>
            New RFQ
          </button>
        </div>
        <AgentConsole result={agentResult} busy={agentBusy} runAgent={runAgent} selectedRfq={selectedRfq} />
        {view === "overview" && <Overview state={state} setView={setView} setSelectedRfqId={setSelectedRfqId} />}
        {view === "rfq" && selectedRfq && (
          <RfqInbox
            rfqs={state.rfqs}
            selected={selectedRfq}
            bids={bids}
            select={setSelectedRfqId}
            award={awardBid}
            runAgent={runAgent}
            operationBusy={operationBusy}
          />
        )}
        {view === "suppliers" && <SupplierPipeline suppliers={state.suppliers} />}
        {view === "memory" && <MemoryView memories={state.memories} refresh={refresh} />}
        {view === "market" && <MarketSignals state={state} />}
        {view === "risk" && <RiskMonitor suppliers={state.suppliers} rfqs={state.rfqs} />}
        {view === "notifications" && <Notifications state={state} setView={setView} setSelectedRfqId={setSelectedRfqId} />}
        {status && <div className="notice" style={{ margin: 18 }} role="status" aria-live="polite">{status}</div>}
      </main>
    </div>
  );
}

const titles: Record<View, string> = {
  overview: "Overview",
  rfq: "RFQ Inbox",
  suppliers: "Supplier Workspace",
  memory: "Operational Memory",
  market: "Market Signals",
  risk: "Risk Monitor",
  notifications: "Notifications"
};

function AgentConsole({
  result,
  busy,
  runAgent,
  selectedRfq
}: {
  result: AgentRunData | null;
  busy: boolean;
  runAgent: (action?: AgentAction) => Promise<void>;
  selectedRfq?: Rfq;
}) {
  return (
    <div className="agent-console">
      <div>
        <div className="kicker">AURELEAN Agent Layer</div>
        <strong>{selectedRfq ? `${selectedRfq.id} active context` : "Workspace context"}</strong>
      </div>
      <div className="agent-actions">
        <button type="button" className="btn btn-ghost-lt" onClick={() => runAgent("search_suppliers")} disabled={busy}>Supplier search</button>
        <button type="button" className="btn btn-ghost-lt" onClick={() => runAgent("compare_bids")} disabled={busy}>Compare bids</button>
        <button type="button" className="btn btn-ghost-lt" onClick={() => runAgent("risk_review")} disabled={busy}>Risk review</button>
        <button type="button" className="btn btn-ghost-lt" onClick={() => runAgent("recommend_award")} disabled={busy}>Prepare approval</button>
      </div>
      {result && (
        <div className={`agent-result ${result.approvalRequired ? "needs-approval" : ""}`}>
          <Sparkles size={18} />
          <div>
            <strong>{result.approvalRequired ? "Human approval required" : "Agent result"}</strong>
            <p>{result.answer}</p>
            <div className="chip-row">
              <span className="chip">{result.source}</span>
              {result.toolEvents.map((item) => (
                <span className="chip" key={`${item.tool}-${item.status}`}>{item.tool}: {item.status}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavButton({
  view,
  current,
  setView,
  icon,
  label,
  badge
}: {
  view: View;
  current: View;
  setView: (view: View) => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}) {
  return (
    <button type="button" className={`nav-item ${current === view ? "on" : ""}`} onClick={() => setView(view)}>
      {icon}
      {label}
      {badge && <span className="chip on" style={{ marginLeft: "auto", padding: "2px 7px" }}>{badge}</span>}
    </button>
  );
}

function Overview({
  state,
  setView,
  setSelectedRfqId
}: {
  state: AureleanState;
  setView: (view: View) => void;
  setSelectedRfqId: (id: string) => void;
}) {
  const active = state.rfqs.filter((rfq) => rfq.status !== "closed").length;
  const responded = state.rfqs.filter((rfq) => rfq.status === "responded").length;
  return (
    <div className="view-pad">
      <h2 className="h-lg">Good morning, Elise.</h2>
      <p className="notice" style={{ marginTop: 12 }}>
        Demo mode: this workspace shows realistic procurement flows without representing a live customer account.
      </p>
      <p className="lead">{active} active sourcing threads · {responded} RFQs awaiting review · 5 samples in transit.</p>
      <div className="kpis" style={{ marginTop: 22 }}>
        <Kpi label="Active RFQs" value={String(active)} note="+2 this week" />
        <Kpi label="Awaiting response" value={String(responded)} note="2 responded today" />
        <Kpi label="Suppliers" value={String(state.suppliers.length)} note="Across 6 categories" />
        <Kpi label="Spend YTD" value="€1.4M" note="-8% vs budget" />
      </div>
      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="panel" style={{ padding: 20 }}>
          <h3 className="h-md">Active RFQs</h3>
          {state.rfqs.slice(0, 4).map((rfq) => (
            <button type="button" key={rfq.id} className="rfq-row" onClick={() => { setSelectedRfqId(rfq.id); setView("rfq"); }}>
              <strong>{rfq.supplierName}</strong>
              <div style={{ color: "var(--on-lt-mut)" }}>{rfq.material} · {rfq.quantity}</div>
              <div className="kicker">{rfq.id} · {rfq.bidsReceived} bids · {rfq.updatedAtLabel}</div>
            </button>
          ))}
        </div>
        <div>
          <div className="notice">
            <Sparkles size={18} />
            <strong> AURELEAN suggests </strong>
            Cerruti&apos;s bid is 12% under budget with a 6-week lead. Review bids or award directly.
          </div>
          <div className="panel" style={{ padding: 20, marginTop: 16 }}>
            <h3 className="h-md">Recent activity</h3>
            {state.memories.slice(0, 4).map((memory) => (
              <p key={memory.id}><strong>{memory.title}</strong><br /><span style={{ color: "var(--on-lt-mut)" }}>{memory.time}</span></p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="feature-card">
      <div className="kicker">{label}</div>
      <div className="stat-number" style={{ color: "var(--on-lt)" }}>{value}</div>
      <div style={{ color: "var(--on-lt-mut)", fontSize: 13 }}>{note}</div>
    </div>
  );
}

function RfqInbox({
  rfqs,
  selected,
  bids,
  select,
  award,
  runAgent,
  operationBusy
}: {
  rfqs: Rfq[];
  selected: Rfq;
  bids: Bid[];
  select: (id: string) => void;
  award: (rfq: Rfq, bid: Bid) => void;
  runAgent: (action?: AgentAction) => Promise<void>;
  operationBusy: boolean;
}) {
  const bestBid = bids.find((bid) => bid.bestValue) ?? bids[0];

  return (
    <div className="rfq-layout">
      <div className="rfq-list">
        {rfqs.map((rfq) => (
          <button type="button" key={rfq.id} className={`rfq-row ${rfq.id === selected.id ? "on" : ""}`} onClick={() => select(rfq.id)}>
            <strong>{rfq.supplierName}</strong>
            <div>{rfq.material} · {rfq.quantity}</div>
            <div className="kicker">{rfq.id} · {rfq.bidsReceived} bids · {rfq.status}</div>
          </button>
        ))}
      </div>
      <div className="rfq-detail">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div className="kicker">{selected.id} · {selected.project}</div>
            <h2 className="h-lg">{selected.supplierName}</h2>
            <p className="lead">{selected.material}</p>
          </div>
          <div className="tool-row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost-lt" disabled={!bids[0] || operationBusy} onClick={() => runAgent("recommend_award")}>
              Prepare approval
            </button>
            <button type="button" className="btn btn-gold" disabled={!bestBid || operationBusy} onClick={() => bestBid && award(selected, bestBid)}>
              Award best bid
            </button>
          </div>
        </div>
        <div className="grid-4" style={{ marginTop: 24 }}>
          <Kpi label="Quantity" value={selected.quantity} note="Requested" />
          <Kpi label="Target" value={selected.targetDelivery} note="Delivery" />
          <Kpi label="Status" value={selected.status} note="Workflow state" />
          <Kpi label="Bids" value={String(selected.bidsReceived)} note="Received" />
        </div>
        <div className="notice" style={{ marginTop: 24 }}>
          <Sparkles size={18} /> AURELEAN summary: {bids.length} bids in. Cerruti offers the best value at €42/m with the strongest reliability score.
        </div>
        <h3 className="h-md" style={{ marginTop: 28 }}>Bids & comparison</h3>
        <table className="table">
          <thead>
            <tr><th>Mill</th><th>Price</th><th>Lead</th><th>MOQ</th><th>Reliability</th><th></th></tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid.id}>
                <td>{bid.supplierName} {bid.bestValue && <span className="chip">Best value</span>}</td>
                <td>€{bid.pricePerUnit}/m</td>
                <td>{bid.leadTimeWeeks} wk</td>
                <td>{bid.moq}</td>
                <td>{bid.reliability}</td>
                <td>
                  <button type="button" className="btn btn-ghost-lt" disabled={operationBusy} onClick={() => award(selected, bid)}>
                    {bid.awarded ? "Awarded" : "Award"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="h-md" style={{ marginTop: 28 }}>Thread</h3>
        {selected.thread.map((message) => (
          <div key={`${message.author}-${message.time}`} className="mini-card">
            <strong>{message.author}</strong> <span className="kicker">{message.time}</span>
            <p>{message.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupplierPipeline({ suppliers }: { suppliers: Supplier[] }) {
  const stages = [
    ["shortlisted", "Shortlisted"],
    ["dialogue", "In dialogue"],
    ["sampling", "Sampling"],
    ["approved", "Approved"]
  ] as const;
  return (
    <div className="view-pad">
      <h2 className="h-lg">Supplier Workspace</h2>
      <p className="lead">{suppliers.length} suppliers in your relationship pipeline across 6 categories.</p>
      <div className="pipe" style={{ marginTop: 22 }}>
        {stages.map(([key, label]) => (
          <div className="pipe-col" key={key}>
            <div className="kicker">{label}</div>
            {suppliers.filter((supplier) => supplier.stage === key).map((supplier) => (
              <div className="mini-card" key={supplier.id}>
                <strong>{supplier.name}</strong>
                <div style={{ color: "var(--on-lt-mut)" }}>{supplier.material}</div>
                <div className="kicker">{supplier.countryCode} · score {supplier.reliability}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketSignals({ state }: { state: AureleanState }) {
  const signals = state.memories.filter((memory) => memory.kind === "Signal");
  const categories = state.suppliers.reduce<Record<string, Supplier[]>>((acc, supplier) => {
    acc[supplier.category] ??= [];
    acc[supplier.category].push(supplier);
    return acc;
  }, {});

  return (
    <div className="view-pad">
      <div className="grid-2" style={{ alignItems: "start" }}>
        <div>
          <div className="eyebrow">Market intelligence</div>
          <h2 className="h-lg" style={{ marginTop: 10 }}>Signals by material, lead time, and supplier health.</h2>
          <p className="lead">
            AURELEAN keeps market movement visible beside active procurement work
            so teams can respond before sourcing risk reaches the RFQ thread.
          </p>
        </div>
        <div className="notice">
          <TrendingUp size={18} />
          Cashmere lead times are trending +3 weeks. Sample earlier for FW26 knitwear.
        </div>
      </div>
      <div className="grid-4" style={{ marginTop: 24 }}>
        <Kpi label="Watched categories" value={String(Object.keys(categories).length)} note="Material groups" />
        <Kpi label="Fastest lead" value={`${Math.min(...state.suppliers.map((supplier) => supplier.leadTimeWeeks))} wk`} note="Current supplier index" />
        <Kpi label="Top reliability" value={`${Math.max(...state.suppliers.map((supplier) => supplier.reliability))}/100`} note="Verified supplier score" />
        <Kpi label="Open RFQs" value={String(state.rfqs.filter((rfq) => rfq.status !== "closed").length)} note="Active sourcing threads" />
      </div>
      <div className="grid-2" style={{ marginTop: 22 }}>
        <div className="panel" style={{ padding: 20 }}>
          <h3 className="h-md">Material watchlist</h3>
          {Object.entries(categories).map(([category, suppliers]) => (
            <div className="mini-card" key={category}>
              <strong>{category[0].toUpperCase() + category.slice(1)}</strong>
              <div style={{ color: "var(--on-lt-mut)" }}>
                {suppliers.length} suppliers · avg lead {Math.round(suppliers.reduce((sum, supplier) => sum + supplier.leadTimeWeeks, 0) / suppliers.length)} wk
              </div>
            </div>
          ))}
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <h3 className="h-md">Recent signals</h3>
          {(signals.length ? signals : state.memories.slice(0, 4)).map((memory) => (
            <div className="mini-card" key={memory.id}>
              <div className="kicker">{memory.kind} · {memory.time}</div>
              <strong>{memory.title}</strong>
              <p>{memory.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RiskMonitor({ suppliers, rfqs }: { suppliers: Supplier[]; rfqs: Rfq[] }) {
  const watched = suppliers
    .map((supplier) => ({
      supplier,
      openRfqs: rfqs.filter((rfq) => rfq.supplierId === supplier.id && rfq.status !== "closed").length,
      issues: [
        supplier.reliability < 85 ? "Reliability below preferred threshold" : "",
        supplier.certifications.length < 2 ? "Certification evidence is light" : "",
        supplier.stage === "dialogue" ? "Relationship still in dialogue" : ""
      ].filter(Boolean)
    }))
    .sort((a, b) => b.issues.length - a.issues.length || a.supplier.reliability - b.supplier.reliability);

  return (
    <div className="view-pad">
      <div className="eyebrow">Supplier risk</div>
      <h2 className="h-lg" style={{ marginTop: 10 }}>Reliability, evidence, and relationship watchlist.</h2>
      <p className="lead">
        Risk Monitor separates supplier risk from the general pipeline so teams
        can quickly see which relationships need evidence, escalation, or backup planning.
      </p>
      <div className="grid-3" style={{ marginTop: 24 }}>
        <Kpi label="Low risk" value={String(watched.filter((item) => item.issues.length === 0).length)} note="No active flags" />
        <Kpi label="Watchlist" value={String(watched.filter((item) => item.issues.length === 1).length)} note="Single issue" />
        <Kpi label="Review now" value={String(watched.filter((item) => item.issues.length > 1).length)} note="Multiple issues" />
      </div>
      <div className="panel" style={{ padding: 20, marginTop: 24 }}>
        <table className="table">
          <thead>
            <tr><th>Supplier</th><th>Reliability</th><th>Stage</th><th>Open RFQs</th><th>Risk notes</th></tr>
          </thead>
          <tbody>
            {watched.map(({ supplier, openRfqs, issues }) => (
              <tr key={supplier.id}>
                <td><strong>{supplier.name}</strong><br /><span className="kicker">{supplier.countryCode} · {supplier.material}</span></td>
                <td>{supplier.reliability}/100</td>
                <td>{supplier.stage}</td>
                <td>{openRfqs}</td>
                <td>
                  {issues.length ? (
                    <span><AlertTriangle size={15} /> {issues.join("; ")}</span>
                  ) : (
                    <span><CheckCircle2 size={15} /> Low risk</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Notifications({
  state,
  setView,
  setSelectedRfqId
}: {
  state: AureleanState;
  setView: (view: View) => void;
  setSelectedRfqId: (id: string) => void;
}) {
  const actionableRfqs = state.rfqs.filter((rfq) => rfq.status === "responded" || rfq.status === "sampling");
  return (
    <div className="view-pad">
      <div className="eyebrow">Notifications</div>
      <h2 className="h-lg" style={{ marginTop: 10 }}>Procurement events that need attention.</h2>
      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="panel" style={{ padding: 20 }}>
          <h3 className="h-md">Action queue</h3>
          {actionableRfqs.map((rfq) => (
            <button
              type="button"
              key={rfq.id}
              className="rfq-row"
              onClick={() => {
                setSelectedRfqId(rfq.id);
                setView("rfq");
              }}
            >
              <strong>{rfq.id}: {rfq.supplierName}</strong>
              <div style={{ color: "var(--on-lt-mut)" }}>{rfq.material} · {rfq.status} · {rfq.bidsReceived} bids</div>
            </button>
          ))}
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <h3 className="h-md">Recent memory</h3>
          {state.memories.slice(0, 6).map((memory) => (
            <div className="mini-card" key={memory.id}>
              <div className="kicker">{memory.kind} · {memory.time}</div>
              <strong>{memory.title}</strong>
              <p>{memory.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MemoryView({ memories, refresh }: { memories: MemoryEntry[]; refresh: () => Promise<void> }) {
  const [question, setQuestion] = useState("Why did we choose Cerruti for the FW26 wool?");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  async function ask() {
    setBusy(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch("/api/memory/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: controller.signal
      });
      const json = await response.json();
      if (json.ok) setAnswer(json.data.answer);
      else setAnswer(memories[0]?.body ?? "No operational memory matched that question.");
      await refresh();
    } catch {
      setAnswer(memories[0]?.body ?? "No operational memory matched that question.");
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
    }
  }

  const groups = useMemo(() => {
    return memories.reduce<Record<string, MemoryEntry[]>>((acc, memory) => {
      acc[memory.group] ??= [];
      acc[memory.group].push(memory);
      return acc;
    }, {});
  }, [memories]);

  return (
    <div className="view-pad">
      <div className="memory-feed">
        <div className="eyebrow">Operational memory</div>
        <h2 className="h-lg" style={{ marginTop: 10 }}>Everything your operation remembers.</h2>
        <div className="tool-row" style={{ marginTop: 22 }}>
          <input className="input" value={question} onChange={(e) => setQuestion(e.target.value)} />
          <button type="button" className="btn btn-gold" onClick={ask}>{busy ? "Asking..." : "Ask"}</button>
        </div>
        {answer && <div className="notice" style={{ marginTop: 16 }}><Sparkles size={18} /> {answer}</div>}
        {Object.entries(groups).map(([group, entries]) => (
          <div key={group}>
            <div className="kicker" style={{ marginTop: 26 }}>{group}</div>
            {entries.map((entry) => (
              <div className="memory-entry" key={entry.id}>
                <div className="kicker">{entry.kind} · {entry.time}</div>
                <h3 style={{ fontFamily: "var(--sans)", fontSize: 16 }}>{entry.title}</h3>
                <p>{entry.body}</p>
                <div className="chip-row">{entry.entities.map((entity) => <span className="chip" key={entity}>{entity}</span>)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

