import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, CircleDashed, Cpu, XCircle } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";
import { NvidiaSimReadyRerunClient } from "@/components/NvidiaSimReadyRerunClient";
import { simReadyPipelineSummary, simReadyReadiness, type SimReadyStageStatus } from "@/lib/nvidia-simready";

export const metadata: Metadata = {
  title: "NVIDIA SimReady Integration",
  description:
    "AURELEAN NVIDIA Omniverse CAD-to-SimReady pipeline status, blockers, and deployment readiness."
};

const statusIcon: Record<SimReadyStageStatus, ReactNode> = {
  ready: <CircleDashed />,
  passed: <CheckCircle2 />,
  failed: <XCircle />,
  blocked: <AlertTriangle />
};

export default function NvidiaSimReadyPage() {
  const readiness = simReadyReadiness();

  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <Cpu className="hero-icon" />
            <div className="eyebrow on-dark">NVIDIA integration</div>
            <h1 className="h-xl" style={{ marginTop: 16 }}>
              CAD-to-SimReady pipeline status for operational asset intake.
            </h1>
            <p className="lead" style={{ marginTop: 22 }}>
              The latest local pipeline run converted and validated the source
              asset through geometry and physics checks, then stopped at
              SimReady conformance and rendering requirements.
            </p>
          </div>
          <div className="panel on-dark-panel">
            <div className="kicker">Run status</div>
            <h2 className="h-md" style={{ marginTop: 12 }}>{simReadyPipelineSummary.status}</h2>
            <p><strong>Last run:</strong> {simReadyPipelineSummary.lastRunDate}</p>
            <p><strong>Source:</strong> {simReadyPipelineSummary.sourceAsset}</p>
            <p><strong>Final USD:</strong> {simReadyPipelineSummary.finalUsd}</p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">Validation stages</div>
          <h2 className="h-lg" style={{ marginTop: 14 }}>What passed, what was repaired, and what still blocks rerun.</h2>
          <div className="timeline-list" style={{ marginTop: 34 }}>
            {simReadyPipelineSummary.stages.map((stage) => (
              <div className="timeline-row" key={stage.name}>
                <span className={`stage-icon stage-${stage.status}`}>{statusIcon[stage.status]}</span>
                <div>
                  <div className="kicker">{stage.status}</div>
                  <h3 className="h-md" style={{ marginTop: 6 }}>{stage.name}</h3>
                  <p>{stage.note}</p>
                  <p className="mono-line">{stage.artifact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section" style={{ background: "var(--paper-1)" }}>
        <div className="wrap grid-2">
          <div>
            <div className="eyebrow">Remaining blockers</div>
            <h2 className="h-lg" style={{ marginTop: 14 }}>Client intake requires explicit simulation evidence.</h2>
            <p className="lead">
              AURELEAN should treat the current USD as a handoff artifact, not a
              completed SimReady package, until the following items are resolved.
            </p>
          </div>
          <div className="stack">
            {simReadyPipelineSummary.blockers.map((blocker) => (
              <div className="feature-card" key={blocker.code}>
                <div className="kicker">{blocker.code}</div>
                <h3 className="h-md card-title">{blocker.title}</h3>
                <p>{blocker.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-2">
          <div>
            <div className="eyebrow">Deployment requirements</div>
            <h2 className="h-lg" style={{ marginTop: 14 }}>Ready the renderer and Content Agents path before rerun.</h2>
          </div>
          <div className="feature-card">
            <p><strong>RENDER_ENDPOINT:</strong> {readiness.renderConfigured ? "Configured" : "Missing"}</p>
            <p><strong>CONTENT_AGENTS_*:</strong> {readiness.contentAgentsConfigured ? "Configured" : "Missing"}</p>
            <p><strong>Runtime:</strong> {readiness.pythonRuntime}</p>
            <NvidiaSimReadyRerunClient />
            <Link className="text-link" href="/developers">
              Review integration API <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
