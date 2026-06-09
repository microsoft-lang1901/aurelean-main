import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowRight, BadgeCheck, Clock3, Factory, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";
import { getFabric, listFabrics } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const fabric = await getFabric(id);
  if (!fabric) {
    return {
      title: "Fabric Not Found",
      description: "The requested AURELEAN fabric record could not be found."
    };
  }

  return {
    title: `${fabric.material} | AURELEAN Fabrics`,
    description: `${fabric.material} from ${fabric.supplierName}, ${fabric.country}. Verified sourcing profile, lead time, MOQ, and compliance signals.`
  };
}

export default async function FabricDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fabric = await getFabric(id);
  if (!fabric) notFound();

  const related = (await listFabrics())
    .filter((item) => item.id !== fabric.id && item.category === fabric.category)
    .slice(0, 3);

  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow on-dark">Fabric intelligence</div>
            <h1 className="h-xl" style={{ marginTop: 16, maxWidth: "12ch" }}>
              {fabric.material}
            </h1>
            <p className="lead" style={{ marginTop: 22 }}>
              Material profile, supplier evidence, and procurement readiness for
              sourcing teams evaluating {fabric.category} programs.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-gold" href={`/trade/${fabric.supplierId}`}>
                Open supplier <ArrowRight size={16} />
              </Link>
              <Link className="btn btn-ghost-dk" href="/trade">
                Compare materials
              </Link>
            </div>
          </div>
          <div className="panel on-dark-panel" style={{ padding: 0, overflow: "hidden" }}>
            <div
              className="swatch"
              aria-label={`${fabric.material} swatch`}
              style={{
                aspectRatio: "16 / 10",
                background: swatchFor(fabric.category)
              }}
            />
            <div style={{ padding: 24 }}>
              <div className="kicker" style={{ color: "var(--on-dk-dim)" }}>
                {fabric.city}, {fabric.country} · {fabric.countryCode}
              </div>
              <h2 className="h-md" style={{ marginTop: 8 }}>{fabric.supplierName}</h2>
              <p>{fabric.overview}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="grid-4">
            <Metric icon={<BadgeCheck />} value={fabric.verified ? "Verified" : "Review"} label="AURELEAN status" />
            <Metric icon={<ShieldCheck />} value={`${fabric.reliability}/100`} label="Reliability" />
            <Metric icon={<Clock3 />} value={`${fabric.leadTimeWeeks} wk`} label="Lead time" />
            <Metric icon={<Factory />} value={fabric.moq} label="Minimum order" />
          </div>

          <div className="grid-2" style={{ marginTop: 52, alignItems: "start" }}>
            <div>
              <div className="eyebrow">Material record</div>
              <h2 className="h-lg" style={{ marginTop: 10 }}>Sourcing data for specification review.</h2>
              <p className="lead">
                Review supplier provenance, commercial constraints, certification evidence,
                and lead-time risk before moving into sample requests or RFQ approval.
              </p>
            </div>
            <div className="panel" style={{ padding: 24 }}>
              <Spec label="Category" value={fabric.category} />
              <Spec label="Capability tier" value={fabric.capabilityTier} />
              <Spec label="Commercial tier" value={fabric.tier} />
              <Spec label="Supplier" value={fabric.supplierName} />
            </div>
          </div>

          <div style={{ marginTop: 52 }}>
            <div className="eyebrow">Compliance and provenance</div>
            <div className="chip-row" style={{ marginTop: 14 }}>
              {fabric.certifications.map((cert) => (
                <span className="chip" key={cert}>{cert}</span>
              ))}
            </div>
          </div>

          {related.length > 0 && (
            <div style={{ marginTop: 64 }}>
              <div className="eyebrow">Related fabrics</div>
              <div className="grid-3" style={{ marginTop: 18 }}>
                {related.map((item) => (
                  <Link className="feature-card link-card" href={`/fabrics/${item.slug}`} key={item.id}>
                    <div className="kicker">{item.countryCode} · {item.category}</div>
                    <h3 className="card-title">{item.material}</h3>
                    <p>{item.supplierName} · {item.leadTimeWeeks} week lead</p>
                    <span className="text-link">Open fabric <ArrowRight size={16} /></span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}

function Metric({
  icon,
  value,
  label
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="metric-card">
      {icon}
      <div className="stat-number" style={{ color: "var(--on-lt)", marginTop: 12 }}>{value}</div>
      <div className="kicker">{label}</div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="spec-row" style={{ justifyContent: "space-between" }}>
      <span className="kicker">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function swatchFor(category: string) {
  const colors: Record<string, string> = {
    wool: "#70614f",
    silk: "#80605d",
    cashmere: "#8a7f6b",
    linen: "#8f876f",
    cotton: "#b0a58d",
    technical: "#3f5358"
  };
  const color = colors[category] ?? "#6f6555";
  return `
    repeating-linear-gradient(135deg, rgba(247, 242, 232, 0.08) 0 2px, transparent 2px 11px),
    linear-gradient(145deg, ${color}, #17130f)
  `;
}
