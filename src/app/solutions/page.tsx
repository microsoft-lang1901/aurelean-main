import Link from "next/link";
import { ArrowRight, Factory, Gem, Landmark, Shirt } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

const solutions = [
  ["textiles", "Luxury textiles", "Source the world's finest cloth with provenance built in."],
  ["furnishings", "Furnishings", "Coordinate sourcing across materials, makers, and ateliers."],
  ["materials", "Material sourcing", "Match raw and processed materials to specification and standard."],
  ["manufacturing", "Manufacturing", "Track production milestones across the supply chain."]
];

export default function SolutionsPage() {
  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap">
          <div className="eyebrow on-dark">Solutions</div>
          <h1 className="h-xl" style={{ marginTop: 18, maxWidth: "13ch" }}>
            Built first for the most demanding corners of global sourcing.
          </h1>
          <p className="lead" style={{ marginTop: 24 }}>
            AURELEAN begins in luxury textiles and expands into the operating
            infrastructure needed by complex procurement teams.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-4">
          {solutions.map(([id, title, text], index) => (
            <div className="feature-card" id={id} key={title}>
              {[<Shirt key="shirt" />, <Landmark key="landmark" />, <Gem key="gem" />, <Factory key="factory" />][index]}
              <div className="eyebrow">{title}</div>
              <h2 className="h-md" style={{ marginTop: 14 }}>{text}</h2>
              <p>
                Use verified supplier records, RFQs, samples, and operational memory
                to keep complex sourcing work moving with less drift.
              </p>
            </div>
          ))}
        </div>
        <div className="wrap" style={{ textAlign: "center", marginTop: 54 }}>
          <Link className="btn btn-gold" href="/request-access">
            Find your entry point <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
