import Link from "next/link";
import type { Metadata } from "next";
import { Activity, Brain, Database, Radar, ShieldCheck, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Intelligence",
  description:
    "Supplier reliability, market movement, decision memory, and governance signals for procurement operations."
};

const signals = [
  ["Supplier reliability", "Live confidence scoring across response speed, compliance evidence, delivery history, and relationship stage."],
  ["Market movement", "Material lead-time signals, availability shifts, and country-level sourcing pressure surfaced before they become exceptions."],
  ["Decision memory", "Every RFQ, sample, award recommendation, and approval note becomes reusable operating context."],
  ["Governance boundary", "Agents can recommend and prepare approvals, while award execution stays human-controlled."]
];

export default function IntelligencePage() {
  return (
    <PublicShell>
      <section className="page-hero intelligence-hero dk">
        <div className="wrap grid-2" style={{ alignItems: "end" }}>
          <div>
            <div className="eyebrow on-dark">AURELEAN Intelligence</div>
            <h1 className="h-xl" style={{ marginTop: 16 }}>
              Supplier intelligence with memory at operational scale.
            </h1>
          </div>
          <p className="lead">
            Intelligence is not a report layer. It is the evidence system that
            guides supplier discovery, RFQ decisions, bid comparison, risk review,
            and agentic orchestration.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid-4">
          {signals.map(([title, text], index) => (
            <div className="feature-card" key={title}>
              {[<Radar key="r" />, <Activity key="a" />, <Brain key="b" />, <ShieldCheck key="s" />][index]}
              <h2 className="h-md card-title">{title}</h2>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section intelligence-band">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow">Operational graph</div>
            <h2 className="h-lg" style={{ marginTop: 14 }}>
              Every supplier, RFQ, bid, and memory becomes connected context.
            </h2>
            <p className="lead">
              AURELEAN links sourcing facts with relationship history, open
              workflows, and procurement decisions so teams can ask why a supplier
              was selected, where risk is emerging, and what action is ready next.
            </p>
            <div className="actions">
              <Link className="btn btn-gold" href="/workspace">Open workspace</Link>
              <Link className="btn btn-ghost-lt" href="/developers">View API surface</Link>
            </div>
          </div>
          <div className="intelligence-map panel" aria-label="AURELEAN intelligence graph">
            <div className="map-node core"><Sparkles size={18} /> AURELEAN</div>
            <div className="map-node supplier">Suppliers</div>
            <div className="map-node rfq">RFQs</div>
            <div className="map-node bid">Bids</div>
            <div className="map-node memory">Memory</div>
            <Database className="map-icon" />
          </div>
        </div>
      </section>

      <section className="dk section">
        <div className="wrap grid-3">
          <Metric value="94/100" label="Top supplier reliability signal" />
          <Metric value="+3 wk" label="Cashmere lead-time movement detected" />
          <Metric value="100%" label="Award recommendations approval gated" />
        </div>
      </section>
    </PublicShell>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric-card">
      <div className="stat-number">{value}</div>
      <div className="kicker" style={{ color: "var(--on-dk-mut)" }}>{label}</div>
    </div>
  );
}
