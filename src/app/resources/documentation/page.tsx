import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, Box, Database, Route, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "AURELEAN product map, marketplace workflows, workspace surfaces, and backend API overview."
};

const sections = [
  ["Public site", "Home, platform, intelligence, solutions, company, resources, security, privacy, and request access."],
  ["Marketplace", "Trade listing, supplier detail, save supplier, create RFQ, and sample request workflows."],
  ["Workspace", "Overview, RFQ inbox, supplier pipeline, operational memory, market signals, risk monitor, and notifications."],
  ["Backend", "Bootstrap, RFQs, awards, supplier save/sample, access requests, memory query, agent run, and health endpoints."]
];

export default function DocumentationPage() {
  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap">
          <BookOpen className="hero-icon" />
          <div className="eyebrow on-dark">Documentation</div>
          <h1 className="h-xl" style={{ marginTop: 16, maxWidth: "12ch" }}>
            AURELEAN product and API map.
          </h1>
          <p className="lead">
            A concise guide to the current MVP routes, product workflows, and
            backend capabilities.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-4">
          {sections.map(([title, text], index) => (
            <div className="feature-card" key={title}>
              {[<Route key="r" />, <Database key="d" />, <Sparkles key="s" />, <BookOpen key="b" />][index]}
              <h2 className="h-md card-title">{title}</h2>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="wrap" style={{ marginTop: 42 }}>
          <Link className="btn btn-gold" href="/developers">
            Developer API reference <ArrowRight size={16} />
          </Link>
        </div>
      </section>
      <section className="section" style={{ background: "var(--paper-1)" }}>
        <div className="wrap grid-2">
          <div>
            <div className="eyebrow">Deployment integrations</div>
            <h2 className="h-lg" style={{ marginTop: 14 }}>NVIDIA NIM-ready memory inference.</h2>
            <p className="lead">
              Configure NIM-compatible endpoint variables at deploy time when a
              client standardizes on NVIDIA-accelerated AI infrastructure.
            </p>
          </div>
          <div className="feature-card">
            <Box />
            <h3 className="h-md card-title">CAD-to-SimReady pipeline</h3>
            <p>
              AURELEAN now publishes the latest NVIDIA Omniverse CAD-to-SimReady
              run status, including the passed validation stages, repaired
              conformance rules, and rerun blockers.
            </p>
            <Link className="text-link" href="/integrations/nvidia-simready">
              View SimReady status <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
