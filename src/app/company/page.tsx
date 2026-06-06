import Link from "next/link";
import type { Metadata } from "next";
import { Building2, Globe2, Mail, Newspaper, ShieldCheck, Users } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Company",
  description:
    "AURELEAN company overview, careers, newsroom, and contact for procurement operating infrastructure."
};

export default function CompanyPage() {
  return (
    <PublicShell>
      <section className="page-hero company-hero dk">
        <div className="wrap">
          <div className="eyebrow on-dark">Company</div>
          <h1 className="h-xl" style={{ marginTop: 16, maxWidth: "12ch" }}>
            Building the operating layer for global sourcing.
          </h1>
          <p className="lead">
            AURELEAN exists for procurement teams that need sourcing to feel
            precise, intelligent, governed, and ready for agentic workflows.
          </p>
        </div>
      </section>

      <section className="section" id="about">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow">About AURELEAN</div>
            <h2 className="h-lg" style={{ marginTop: 14 }}>
              Quiet infrastructure for demanding procurement organizations.
            </h2>
          </div>
          <p className="lead">
            We combine supplier data, RFQ orchestration, operational memory, and
            AI agents into one governed sourcing environment. The first vertical is
            luxury textiles, with the architecture designed to expand across
            materials, furnishings, and manufacturing.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--paper-1)" }}>
        <div className="wrap grid-4">
          <Principle icon={<ShieldCheck />} title="Governed" text="Human approval stays explicit where procurement risk is material." />
          <Principle icon={<Globe2 />} title="Global" text="Supplier records and workflow memory are built for multi-country operations." />
          <Principle icon={<Building2 />} title="Operational" text="AURELEAN is designed around working teams, not presentation dashboards." />
          <Principle icon={<Users />} title="Relationship-first" text="Supplier history, evidence, and trust signals remain visible in every workflow." />
        </div>
      </section>

      <section className="section" id="careers">
        <div className="wrap grid-2">
          <div>
            <div className="eyebrow">Careers</div>
            <h2 className="h-lg" style={{ marginTop: 14 }}>Build the future of sourcing systems.</h2>
          </div>
          <div className="panel" style={{ padding: 24 }}>
            <h3 className="h-md">Open conversations</h3>
            <p className="lead">
              We are interested in product engineers, procurement operators, data
              systems designers, and supplier intelligence specialists.
            </p>
            <Link className="btn btn-gold" href="/request-access">Start a conversation</Link>
          </div>
        </div>
      </section>

      <section className="section" id="newsroom" style={{ background: "var(--paper-1)" }}>
        <div className="wrap grid-3">
          <Principle icon={<Newspaper />} title="Launch note" text="AURELEAN opens its first cohort around luxury textile sourcing workflows." />
          <Principle icon={<ShieldCheck />} title="Governance" text="Agent recommendations remain separated from human award execution." />
          <Principle icon={<Globe2 />} title="Expansion" text="The platform architecture supports textiles, furnishings, materials, and manufacturing." />
        </div>
      </section>

      <section className="dk section" id="contact">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow on-dark">Contact</div>
            <h2 className="h-lg" style={{ marginTop: 14 }}>Bring AURELEAN into your sourcing operation.</h2>
          </div>
          <Link className="btn btn-gold" href="/request-access">
            <Mail size={16} /> Request Access
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}

function Principle({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="feature-card">
      {icon}
      <h2 className="h-md card-title">{title}</h2>
      <p>{text}</p>
    </div>
  );
}
