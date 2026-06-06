import Link from "next/link";
import { ArrowRight, BookOpen, Database, Route, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

const sections = [
  ["Public site", "Home, platform, intelligence, solutions, company, resources, security, privacy, and request access."],
  ["Marketplace", "Trade listing, supplier detail, save supplier, create RFQ, and sample request workflows."],
  ["Workspace", "Overview, RFQ inbox, supplier pipeline, operational memory, market signals, risk monitor, and notifications."],
  ["Backend", "Bootstrap, RFQs, awards, supplier save/sample, access requests, memory query, and agent run endpoints."]
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
    </PublicShell>
  );
}
