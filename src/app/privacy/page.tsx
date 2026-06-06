import { FileText, LockKeyhole, Users } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

export default function PrivacyPage() {
  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap">
          <LockKeyhole className="hero-icon" />
          <div className="eyebrow on-dark">Privacy</div>
          <h1 className="h-xl" style={{ marginTop: 16, maxWidth: "12ch" }}>
            Product data scoped to sourcing workflows.
          </h1>
          <p className="lead">
            AURELEAN stores the information needed to operate the marketplace,
            workspace, access requests, RFQs, bids, samples, and memory layer.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-3">
          <Card icon={<Users />} title="Access requests" text="Name, email, company, sourcing profile, interested layers, and notes are captured for onboarding review." />
          <Card icon={<FileText />} title="Workflow records" text="Supplier, RFQ, bid, sample, and memory records are retained as operational product state." />
          <Card icon={<LockKeyhole />} title="Environment aware" text="Development uses local state. Production uses configured Supabase persistence with server-side credentials." />
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
