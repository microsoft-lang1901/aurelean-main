import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BarChart3, Bot, Clock, Layers, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Procurement infrastructure for agentic operations",
  description:
    "AURELEAN connects supplier intelligence, RFQ orchestration, operational memory, and agentic automation for global procurement teams."
};

export default function HomePage() {
  return (
    <PublicShell>
      <section className="hero">
        <div className="wrap hero-in">
          <div className="eyebrow on-dark">AI-native procurement infrastructure</div>
          <h1 className="h-xl">Procurement infrastructure for agentic operations.</h1>
          <p className="lead">
            AURELEAN connects sourcing workflows, supplier intelligence, RFQ
            orchestration, and operational memory into one intelligent operating layer.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-gold" href="/request-access">
              Request Access <ArrowRight size={16} />
            </Link>
            <Link className="btn btn-ghost-dk" href="/platform">
              Explore the Platform <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="logos">
        <div className="wrap">
          <div className="logos-row">
            {["LORO PIANA", "KERZNER", "ZEGNA", "RIMOWA", "AMAN GROUP", "B&B ITALIA"].map(
              (brand) => (
                <span className="brandmark" key={brand}>
                  {brand}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow">The AURELEAN platform</div>
            <h2 className="h-lg" style={{ marginTop: 16 }}>
              Infrastructure first.
              <br />
              Marketplace second.
            </h2>
            <p className="lead" style={{ marginTop: 20 }}>
              AURELEAN is an AI-native operational infrastructure layer built to
              orchestrate complex procurement ecosystems with intelligence, memory,
              and agentic automation.
            </p>
            <Link className="btn btn-link" href="/platform">
              Explore the platform <ArrowRight size={16} />
            </Link>
          </div>
          <Image
            className="stack-image"
            src="/assets/landing/platform-stack.png"
            alt="AURELEAN platform layers"
            width={900}
            height={900}
            style={{ width: "min(100%, 520px)", height: "auto" }}
            priority
          />
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-1)" }}>
        <div className="wrap" style={{ textAlign: "center" }}>
          <div className="eyebrow">Powering the procurement lifecycle</div>
          <h2 className="h-md" style={{ margin: "16px auto 40px", maxWidth: "22ch" }}>
            Intelligence that orchestrates. Infrastructure that scales.
          </h2>
          <div className="grid-4">
            <Capability icon={<BarChart3 />} title="Supplier Intelligence" text="Discover, evaluate, and monitor suppliers with real-time insights." />
            <Capability icon={<Clock />} title="RFQ Orchestration" text="Structured quote workflows that accelerate clarity and comparison." />
            <Capability icon={<Layers />} title="Operational Memory" text="Long-context memory across projects, suppliers, and decisions." />
            <Capability icon={<Bot />} title="Agentic Automation" text="AI agents that recommend, draft, summarize, and execute." />
            <Capability icon={<ShieldCheck />} title="Governance & Control" text="Human-in-the-loop governance with enterprise-grade controls." />
          </div>
        </div>
      </section>

      <section className="stats-band">
        <div className="stats-image" aria-label="AURELEAN interior" />
        <div className="stats-copy dk">
          <div className="eyebrow on-dark">Global scale. Measurable impact.</div>
          <h2 className="h-lg" style={{ marginTop: 16 }}>
            Built for the world&apos;s most complex procurement operations.
          </h2>
          <div className="stat-grid">
            <Stat number="1M+" label="Supplier relationships" />
            <Stat number="25+" label="Countries operated in" />
            <Stat number="100K+" label="Workflow events daily" />
            <Stat number="24/7" label="Operational intelligence" />
          </div>
          <Link className="btn btn-gold" href="/request-access" style={{ marginTop: 36 }}>
            Request Access <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

function Capability({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="feature-card">
      {icon}
      <h3 style={{ fontFamily: "var(--sans)", fontSize: 16, marginTop: 18 }}>{title}</h3>
      <p style={{ color: "var(--on-lt-mut)", fontSize: 13 }}>{text}</p>
    </div>
  );
}

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="stat-number">{number}</div>
      <div style={{ color: "var(--on-dk-mut)", fontSize: 13 }}>{label}</div>
    </div>
  );
}
