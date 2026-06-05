"use client";

import { useMemo, useState } from "react";
import { BarChart3, Bell, Box, Brain, Grid2X2, Search, Send, Shield, Sparkles, Users } from "lucide-react";
import type { AgentAction, AgentRunData, AureleanState, Bid, MemoryEntry, Rfq, Supplier } from "@/types/aurelean";

type View = "overview" | "rfq" | "suppliers" | "memory";

export function WorkspaceClient({ initialState }: { initialState: AureleanState }) {
  const [state, setState] = useState(initialState);
  const [view, setView] = useState<View>("overview");
  const [selectedRfqId, setSelectedRfqId] = useState(initialState.rfqs[0]?.id ?? "");
  const [command, setCommand] = useState("Compare bids for RFQ-2041 and tell me the approval boundary.");
  const [agentResult, setAgentResult] = useState<AgentRunData | null>(null);
  const [agentBusy, setAgentBusy] = useState(false);
  const selectedRfq = state.rfqs.find((rfq) => rfq.id === selectedRfqId) ?? state.rfqs[0];
  const bids = state.bids.filter((bid) => bid.rfqId === selectedRfq?.id);

  async function refresh() {
    const response = await fetch("/api/bootstrap");
    const json = await response.json();
    if (json.ok) setState(json.data);
  }

  async function awardBid(rfq: Rfq, bid: Bid) {
    const response = await fetch(`/api/rfqs/${rfq.id}/award`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bidId: bid.id })
    });
    const json = await response.json();
    if (json.ok) await refresh();
  }

  async function runAgent(action: AgentAction = "ask") {
    setAgentBusy(true);
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
      } else {
        setAgentResult({
          answer: json.error || "AURELEAN could not complete that command.",
          source: "deterministic-fallback",
          action,
          approvalRequired: false,
          toolEvents: []
        });
      }
    } catch {
      setAgentResult({
        answer: "AURELEAN could not reach the agent backend.",
        source: "deterministic-fallback",
        action,
        approvalRequired: false,
        toolEvents: []
      });
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
          <div style={{ color: "var(--on-dk-dim)", fontSize: 12 }}>Maison workspace</div>
        </div>
        <NavButton view="overview" current={view} setView={setView} icon={<Grid2X2 />} label="Overview" />
        <NavButton view="rfq" current={view} setView={setView} icon={<Box />} label="RFQ Inbox" badge="3" />
        <NavButton view="suppliers" current={view} setView={setView} icon={<Users />} label="Supplier Workspace" />
        <NavButton view="memory" current={view} setView={setView} icon={<Brain />} label="Operational Memory" />
        <div className="kicker" style={{ color: "var(--on-dk-dim)", marginTop: 18 }}>Intelligence</div>
        <NavButton view="overview" current={view} setView={setView} icon={<BarChart3 />} label="Market Signals" />
        <NavButton view="suppliers" current={view} setView={setView} icon={<Shield />} label="Risk Monitor" />
        <div style={{ marginTop: "auto", color: "var(--on-dk-mut)", fontSize: 13 }}>Elise Moreau<br /><span style={{ color: "var(--on-dk-dim)" }}>Head of Sourcing</span></div>
      </aside>
      <main className="appmain">
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
          <button className="btn btn-ghost-lt" onClick={() => runAgent("ask")} disabled={agentBusy}>
            <Send size={16} /> {agentBusy ? "Running" : "Ask"}
          </button>
          <button className="btn btn-ghost-lt" aria-label="Notifications"><Bell size={16} /></button>
          <button className="btn btn-gold" onClick={() => runAgent("create_rfq")}>New RFQ</button>
        </div>
        <AgentConsole result={agentResult} busy={agentBusy} runAgent={runAgent} selectedRfq={selectedRfq} />
        {view === "overview" && <Overview state={state} setView={setView} setSelectedRfqId={setSelectedRfqId} />}
        {view === "rfq" && selectedRfq && <RfqInbox rfqs={state.rfqs} selected={selectedRfq} bids={bids} select={setSelectedRfqId} award={awardBid} runAgent={runAgent} />}
        {view === "suppliers" && <SupplierPipeline suppliers={state.suppliers} />}
        {view === "memory" && <MemoryView memories={state.memories} refresh={refresh} />}
      </main>
    </div>
  );
}

const titles: Record<View, string> = {
  overview: "Overview",
  rfq: "RFQ Inbox",
  suppliers: "Supplier Workspace",
  memory: "Operational Memory"
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
        <button className="btn btn-ghost-lt" onClick={() => runAgent("search_suppliers")} disabled={busy}>Supplier search</button>
        <button className="btn btn-ghost-lt" onClick={() => runAgent("compare_bids")} disabled={busy}>Compare bids</button>
        <button className="btn btn-ghost-lt" onClick={() => runAgent("risk_review")} disabled={busy}>Risk review</button>
        <button className="btn btn-ghost-lt" onClick={() => runAgent("recommend_award")} disabled={busy}>Prepare approval</button>
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
    <button className={`nav-item ${current === view ? "on" : ""}`} onClick={() => setView(view)}>
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
      <p className="lead">{active} active sourcing threads · {responded} RFQs awaiting review · 5 samples in transit.</p>
      <div className="kpis" style={{ marginTop: 22 }}>
        <Kpi label="Active RFQs" value={String(active)} note="+2 this week" />
        <Kpi label="Awaiting response" value={String(responded)} note="2 responded today" />
        <Kpi label="Suppliers" value={String(state.suppliers.length)} note="Across 6 categories" />
        <Kpi label="Spend YTD" value="€2.4M" note="-8% vs budget" />
      </div>
      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="panel" style={{ padding: 20 }}>
          <h3 className="h-md">Active RFQs</h3>
          {state.rfqs.slice(0, 4).map((rfq) => (
            <button key={rfq.id} className="rfq-row" onClick={() => { setSelectedRfqId(rfq.id); setView("rfq"); }}>
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
  runAgent
}: {
  rfqs: Rfq[];
  selected: Rfq;
  bids: Bid[];
  select: (id: string) => void;
  award: (rfq: Rfq, bid: Bid) => void;
  runAgent: (action?: AgentAction) => Promise<void>;
}) {
  return (
    <div className="rfq-layout">
      <div className="rfq-list">
        {rfqs.map((rfq) => (
          <button key={rfq.id} className={`rfq-row ${rfq.id === selected.id ? "on" : ""}`} onClick={() => select(rfq.id)}>
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
            <button className="btn btn-ghost-lt" disabled={!bids[0]} onClick={() => runAgent("recommend_award")}>Prepare approval</button>
            <button className="btn btn-gold" disabled={!bids[0]} onClick={() => bids[0] && award(selected, bids[0])}>Award best bid</button>
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
                <td><button className="btn btn-ghost-lt" onClick={() => award(selected, bid)}>{bid.awarded ? "Awarded" : "Award"}</button></td>
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
          <button className="btn btn-gold" onClick={ask}>{busy ? "Asking..." : "Ask"}</button>
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
