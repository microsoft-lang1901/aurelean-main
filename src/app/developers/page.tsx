import Link from "next/link";
import { PublicShell } from "@/components/SiteChrome";

export default function DevelopersPage() {
  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow on-dark">Developers</div>
            <h1 className="h-xl" style={{ marginTop: 16 }}>Build on the AURELEAN protocol.</h1>
            <p className="lead" style={{ marginTop: 22 }}>
              Programmatic access to suppliers, RFQs, bids, memory, and sourcing
              recommendations through first-party backend routes.
            </p>
            <Link className="btn btn-gold" href="/request-access" style={{ marginTop: 28 }}>
              Get an API key
            </Link>
          </div>
          <div className="panel" style={{ background: "#100e0b", color: "var(--on-dk)", padding: 24 }}>
            <pre style={{ overflowX: "auto", margin: 0 }}>
{`curl /api/rfqs \\
  -H "Content-Type: application/json" \\
  -d '{
    "supplierId": "cerruti",
    "material": "Super 150s wool",
    "quantity": "120 m",
    "targetDelivery": "Q3 2026"
  }'`}
            </pre>
          </div>
        </div>
      </section>
      <section className="section" id="reference">
        <div className="wrap">
          <div className="eyebrow">API Reference</div>
          <h2 className="h-lg" style={{ marginTop: 14 }}>A resource for every layer of the platform.</h2>
          <div className="grid-3" style={{ marginTop: 36 }}>
            <Endpoint method="GET" path="/api/bootstrap" text="Fetch all app data" />
            <Endpoint method="POST" path="/api/rfqs" text="Create an RFQ" />
            <Endpoint method="POST" path="/api/memory/query" text="Ask operational memory" />
            <Endpoint method="POST" path="/api/request-access" text="Capture access requests" />
            <Endpoint method="POST" path="/api/suppliers/{id}/save" text="Toggle saved supplier" />
            <Endpoint method="POST" path="/api/rfqs/{id}/award" text="Award a bid" />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function Endpoint({ method, path, text }: { method: string; path: string; text: string }) {
  return (
    <div className="feature-card">
      <div className="kicker">{method}</div>
      <h3 style={{ fontFamily: "var(--mono)", fontSize: 15, marginTop: 12 }}>{path}</h3>
      <p style={{ color: "var(--on-lt-mut)" }}>{text}</p>
    </div>
  );
}
