import Link from "next/link";
import { BookOpen, Code2, FileText, LockKeyhole, Network, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

const docs = [
  ["Backend routes", "Bootstrap, RFQ creation, awards, saved suppliers, samples, memory query, and agent runs."],
  ["Workspace workflows", "Overview, RFQ inbox, supplier pipeline, bid comparison, award approval, and memory search."],
  ["Deployment contract", "Vercel-ready environment variables with Supabase persistence and OpenAI fallback behavior."]
];

export default function ResourcesPage() {
  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap grid-2" style={{ alignItems: "end" }}>
          <div>
            <div className="eyebrow on-dark">Resources</div>
            <h1 className="h-xl" style={{ marginTop: 16 }}>
              Documentation for the AURELEAN operating layer.
            </h1>
          </div>
          <p className="lead">
            Product, technical, and governance resources for teams evaluating or
            integrating AURELEAN.
          </p>
        </div>
      </section>

      <section className="section" id="documentation">
        <div className="wrap grid-3">
          {docs.map(([title, text], index) => (
            <div className="feature-card" key={title}>
              {[<BookOpen key="book" />, <Network key="net" />, <FileText key="file" />][index]}
              <h2 className="h-md card-title">{title}</h2>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-1)" }}>
        <div className="wrap grid-3">
          <ResourceLink icon={<Code2 />} title="Developer reference" text="Review the API surface and sample requests." href="/developers" />
          <ResourceLink icon={<ShieldCheck />} title="Security model" text="Understand persistence, guardrails, and approval boundaries." href="/security" />
          <ResourceLink icon={<LockKeyhole />} title="Privacy posture" text="See how product data is scoped for the MVP." href="/privacy" />
        </div>
      </section>
    </PublicShell>
  );
}

function ResourceLink({
  icon,
  title,
  text,
  href
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
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
