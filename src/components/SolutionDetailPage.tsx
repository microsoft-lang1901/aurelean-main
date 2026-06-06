import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

export function SolutionDetailPage({
  eyebrow,
  title,
  description,
  bullets
}: {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap">
          <div className="eyebrow on-dark">{eyebrow}</div>
          <h1 className="h-xl" style={{ marginTop: 16, maxWidth: "13ch" }}>{title}</h1>
          <p className="lead" style={{ marginTop: 22 }}>{description}</p>
          <div className="actions">
            <Link className="btn btn-gold" href="/request-access">
              Request Access <ArrowRight size={16} />
            </Link>
            <Link className="btn btn-ghost-dk" href="/solutions">
              All solutions
            </Link>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-3">
          {bullets.map((bullet) => (
            <div className="feature-card" key={bullet}>
              <CheckCircle2 />
              <h2 className="h-md card-title">{bullet}</h2>
            </div>
          ))}
        </div>
      </section>
    </PublicShell>
  );
}
