import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Database, Network, ShieldCheck, ShoppingBag } from "lucide-react";
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
            <div className="actions">
              <Link className="btn btn-gold" href="/workspace">
                Open workspace <ArrowRight size={16} />
              </Link>
              <Link className="btn btn-ghost-dk" href="/trade">
                Explore Trade
              </Link>
            </div>
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
      <section className="section">
        <div className="wrap grid-4">
          <LayerCard icon={<ShoppingBag />} title="AURELEAN Trade" text="Verified supplier discovery, saved suppliers, material search, structured sample requests, and RFQ creation." href="/trade" />
          <LayerCard icon={<Database />} title="AURELEAN Intelligence" text="Reliability signals, market movement, supplier evidence, and operational memory in one graph." href="/intelligence" />
          <LayerCard icon={<Bot />} title="AURELEAN AI" text="Agentic orchestration for supplier search, bid comparison, RFQ drafting, risk review, and memory queries." href="/workspace" />
          <LayerCard icon={<ShieldCheck />} title="AURELEAN Infrastructure" text="Supabase-ready state, server routes, guardrails, deterministic fallbacks, and deployable backend contracts." href="/developers" />
        </div>
      </section>
      <Layer id="trade" title="Sourcing & supplier operations." icon={<Network />} text="Verified supplier profiles, marketplace discovery, structured RFQ issue, bid comparison, sampling, and approvals." cta="Open marketplace" href="/trade" />
      <Layer id="intelligence" title="Market & supplier intelligence." icon={<Database />} text="Supplier reliability, lead-time signals, provenance metadata, and relationship status in one operational graph." cta="View intelligence" href="/intelligence" muted />
      <Layer id="ai" title="Agentic orchestration & memory." icon={<Bot />} text="OpenAI-backed memory queries and sourcing recommendations, with deterministic fallback behavior for reliability." cta="Open workspace" href="/workspace" />
      <Layer id="infra" title="Protocols, integrations & security." icon={<ShieldCheck />} text="Supabase-ready persistence, API routes, auditable mutations, and Vercel deployment configuration." cta="Read developers" href="/developers" muted />
    </PublicShell>
  );
}

function LayerCard({
  title,
  text,
  icon,
  href
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link className="feature-card link-card" href={href}>
      {icon}
      <h2 className="h-md card-title">{title}</h2>
      <p>{text}</p>
    </Link>
  );
}

function Layer({
  id,
  title,
  text,
  icon,
  cta,
  href,
  muted
}: {
  id: string;
  title: string;
  text: string;
  icon: React.ReactNode;
  cta: string;
  href: string;
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
          <Link className="btn btn-link" href={href}>
            {cta} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
