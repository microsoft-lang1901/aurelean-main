import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Cpu, FileCheck2, Gauge, ShieldCheck } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";
import { simReadyPipelineSummary } from "@/lib/nvidia-simready";

export const metadata: Metadata = {
  title: "NVIDIA Integration",
  description:
    "NVIDIA Omniverse CAD-to-SimReady and NVIDIA NIM-compatible inference integration for enterprise procurement intelligence."
};

export default function NvidiaIntegrationPage() {
  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow on-dark">NVIDIA Integration</div>
            <h1 className="h-xl" style={{ marginTop: 16, maxWidth: "12ch" }}>
              NVIDIA pathways for simulation and procurement intelligence.
            </h1>
            <p className="lead" style={{ marginTop: 22 }}>
              AURELEAN integrates Omniverse CAD-to-SimReady validation and
              NVIDIA-compatible inference endpoints as part of the sourcing
              technology stack.
            </p>
            <div className="actions">
              <Link className="btn btn-gold" href="/integrations/nvidia-simready">
                Open SimReady status <ArrowRight size={16} />
              </Link>
              <Link className="btn btn-ghost-dk" href="/developers">
                View API references <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="feature-card">
            <Cpu />
            <h2 className="h-md card-title">Current state</h2>
            <p>
              Pipeline health: <strong>{simReadyPipelineSummary.status}</strong>
            </p>
            <p>Final USD handoff: {simReadyPipelineSummary.finalUsd}</p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-3">
          <div className="feature-card">
            <ShieldCheck />
            <h2 className="h-md card-title">Secure inference</h2>
            <p>
              Agent and memory inference can be pointed at NVIDIA NIM-compatible
              endpoints for deployment-grade routing and policy alignment.
            </p>
          </div>
          <div className="feature-card">
            <Gauge />
            <h2 className="h-md card-title">Operational evidence</h2>
            <p>
              CAD-to-SimReady output includes conformance blockers, repaired
              rules, and rerun requirements for procurement simulation workflows.
            </p>
          </div>
          <div className="feature-card">
            <FileCheck2 />
            <h2 className="h-md card-title">Readiness checks</h2>
            <p>
              Configure <strong>RENDER_ENDPOINT</strong> and content-agent
              credentials before running full reruns. Current status is a
              verified operational checkpoint.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

