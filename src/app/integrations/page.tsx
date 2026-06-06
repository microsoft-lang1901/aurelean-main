import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, Box, Cpu, Layers3 } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";
import { simReadyPipelineSummary, simReadyReadiness } from "@/lib/nvidia-simready";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "AURELEAN integration readiness for NVIDIA Omniverse CAD-to-SimReady, NVIDIA NIM, and enterprise procurement infrastructure."
};

export default function IntegrationsPage() {
  const readiness = simReadyReadiness();

  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow on-dark">Integrations</div>
            <h1 className="h-xl" style={{ marginTop: 16 }}>
              Procurement intelligence connected to enterprise AI and simulation.
            </h1>
            <p className="lead" style={{ marginTop: 22 }}>
              AURELEAN tracks inference, supplier workflows, and NVIDIA Omniverse
              CAD-to-SimReady readiness without hiding operational blockers.
            </p>
          </div>
          <div className="panel on-dark-panel">
            <Box />
            <div className="eyebrow on-dark" style={{ marginTop: 18 }}>Current SimReady run</div>
            <h2 className="h-md" style={{ marginTop: 12 }}>{simReadyPipelineSummary.status}</h2>
            <p>{simReadyPipelineSummary.finalUsd}</p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-3">
          <IntegrationCard
            icon={<ArrowRight />}
            title="NVIDIA integration overview"
            text="Context, operational flow, and references for CAD-to-SimReady plus inference configuration."
            href="/integrations/nvidia"
          />
          <IntegrationCard
            icon={<Layers3 />}
            title="NVIDIA Omniverse CAD to SimReady"
            text="Pipeline status, validation stages, conformance repairs, and remaining rerun requirements."
            href="/integrations/nvidia-simready"
          />
          <IntegrationCard
            icon={<Cpu />}
            title="NVIDIA NIM-compatible inference"
            text="Server-side configuration for NVIDIA-accelerated memory and agent inference paths."
            href="/ai-agent"
          />
          <IntegrationCard
            icon={<ArrowRight />}
            title="Developer readiness"
            text="Health, bootstrap, RFQ, award, memory, supplier, and request-access endpoints."
            href="/developers"
          />
        </div>
      </section>
      <section className="section" style={{ background: "var(--paper-1)" }}>
        <div className="wrap grid-2">
          <div>
            <div className="eyebrow">Deployment readiness</div>
            <h2 className="h-lg" style={{ marginTop: 14 }}>What must be configured before a clean SimReady rerun.</h2>
          </div>
          <div className="feature-card">
            <p><strong>Render backend:</strong> {readiness.renderConfigured ? "Configured" : "Not configured"}</p>
            <p><strong>Content Agents:</strong> {readiness.contentAgentsConfigured ? "Configured" : "Not configured"}</p>
            <p><strong>Runtime:</strong> {readiness.pythonRuntime}</p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function IntegrationCard({
  icon,
  title,
  text,
  href
}: {
  icon: ReactNode;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link className="feature-card link-card" href={href}>
      {icon}
      <h2 className="h-md card-title">{title}</h2>
      <p>{text}</p>
      <span className="text-link">View integration <ArrowRight size={15} /></span>
    </Link>
  );
}
