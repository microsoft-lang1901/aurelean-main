import Image from "next/image";
import Link from "next/link";
import { Bot, Database, Network, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

export default function PlatformPage() {
  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow on-dark">The AURELEAN Platform</div>
            <h1 className="h-xl" style={{ marginTop: 16 }}>
              One operating layer for sourcing, intelligence, and orchestration.
            </h1>
            <p className="lead" style={{ marginTop: 22 }}>
              AURELEAN turns supplier discovery, RFQs, market signals, and memory
              into a single procurement infrastructure layer.
            </p>
            <Link className="btn btn-gold" href="/workspace" style={{ marginTop: 28 }}>
              Open workspace
            </Link>
          </div>
          <Image
            src="/assets/landing/platform-stack.png"
            alt="AURELEAN stack"
            width={900}
            height={900}
            className="stack-image"
            style={{ width: "min(100%, 520px)", height: "auto" }}
          />
        </div>
      </section>
      <Layer id="trade" title="Sourcing & supplier operations." icon={<Network />} text="Verified supplier profiles, marketplace discovery, structured RFQ issue, bid comparison, sampling, and approvals." />
      <Layer id="intelligence" title="Market & supplier intelligence." icon={<Database />} text="Supplier reliability, lead-time signals, provenance metadata, and relationship status in one operational graph." muted />
      <Layer id="ai" title="Agentic orchestration & memory." icon={<Bot />} text="OpenAI-backed memory queries and sourcing recommendations, with deterministic fallback behavior for reliability." />
      <Layer id="infra" title="Protocols, integrations & security." icon={<ShieldCheck />} text="Supabase-ready persistence, API routes, auditable mutations, and Vercel deployment configuration." muted />
    </PublicShell>
  );
}

function Layer({
  id,
  title,
  text,
  icon,
  muted
}: {
  id: string;
  title: string;
  text: string;
  icon: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section id={id} className="section" style={{ background: muted ? "var(--paper-1)" : "var(--paper)" }}>
      <div className="wrap grid-2" style={{ alignItems: "center" }}>
        <div className="feature-card">{icon}</div>
        <div>
          <div className="eyebrow">Platform layer</div>
          <h2 className="h-lg" style={{ marginTop: 12 }}>{title}</h2>
          <p className="lead" style={{ marginTop: 18 }}>{text}</p>
        </div>
      </div>
    </section>
  );
}
