import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

export function CompanyDetailPage({
  eyebrow,
  title,
  body,
  points
}: {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
}) {
  return (
    <PublicShell>
      <section className="page-hero company-hero dk">
        <div className="wrap">
          <Building2 className="hero-icon" />
          <div className="eyebrow on-dark">{eyebrow}</div>
          <h1 className="h-xl" style={{ marginTop: 16, maxWidth: "12ch" }}>{title}</h1>
          <p className="lead">{body}</p>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-3">
          {points.map((point) => (
            <div className="feature-card" key={point}>
              <h2 className="h-md">{point}</h2>
            </div>
          ))}
        </div>
        <div className="wrap" style={{ marginTop: 42 }}>
          <Link className="btn btn-gold" href="/request-access">
            Start a conversation <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
