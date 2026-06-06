import type { Metadata } from "next";
import { CheckCircle2, Database, FileCheck2, LockKeyhole, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Security",
  description:
    "AURELEAN security posture, approval guardrails, persistence model, and enterprise procurement controls."
};

const items = [
  "Human approval is required before bid awards are executed.",
  "RFQs and sample requests are limited to verified suppliers.",
  "Supplier, bid, and certification facts come from stored app state.",
  "Supabase persistence is server-side and updated through server API routes only.",
  "OpenAI calls fall back to deterministic answers if credentials or network access are unavailable.",
  "NVIDIA NIM-compatible inference can be configured through server-side deployment variables.",
  "Public demo workspace actions are labelled as simulations until authenticated production access is configured."
];

export default function SecurityPage() {
  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap">
          <ShieldCheck className="hero-icon" />
          <div className="eyebrow on-dark">Security</div>
          <h1 className="h-xl" style={{ marginTop: 16, maxWidth: "12ch" }}>
            Governed procurement automation.
          </h1>
          <p className="lead">
            The MVP is designed around controlled workflow mutation, explicit
            approval boundaries, and resilient local or Supabase-backed state.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-2">
          <div>
            <div className="eyebrow">Controls</div>
            <h2 className="h-lg" style={{ marginTop: 14 }}>Guardrails built into the operating layer.</h2>
          </div>
          <div className="panel" style={{ padding: 24 }}>
            {items.map((item) => (
              <p className="check-line" key={item}><CheckCircle2 size={17} /> {item}</p>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ background: "var(--paper-1)" }}>
        <div className="wrap grid-3">
          <Card icon={<Database />} title="Persistence" text="State is stored in local JSON during development and public.app_state.state in Supabase when production credentials are present." />
          <Card icon={<ShieldCheck />} title="Approval" text="Agents prepare recommendations. The visible award button remains the approval action." />
          <Card icon={<CheckCircle2 />} title="Fallbacks" text="Memory and agent endpoints remain usable even without an OpenAI key." />
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-3">
          <Card icon={<LockKeyhole />} title="Access model" text="The current workspace is a public demo. In production mode, mutation endpoints can be switched to token-gated access using `AURELEAN_REQUIRE_AUTH` and `AURELEAN_API_TOKEN`." />
          <Card icon={<FileCheck2 />} title="Vendor review" text="Client intake should confirm data retention, subprocessors, incident contact, and compliance requirements before production onboarding." />
          <Card icon={<ShieldCheck />} title="Data boundary" text="Service-role Supabase credentials are server-only. No service-role key is exposed through public environment variables." />
        </div>
      </section>
    </PublicShell>
  );
}

function Card({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="feature-card">
      {icon}
      <h2 className="h-md card-title">{title}</h2>
      <p>{text}</p>
    </div>
  );
}
