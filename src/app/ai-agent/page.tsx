import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Bot, Cpu, FileCheck2, GitBranch, ShieldCheck, Sparkles } from "lucide-react";
import { PublicShell } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "AI Agent",
  description:
    "AURELEAN AI coordinates supplier search, RFQ orchestration, bid comparison, memory query, and approval-gated recommendations."
};

const workflows = [
  ["Supplier search", "Find verified suppliers by material, country, certification, and operating context."],
  ["RFQ orchestration", "Draft and create structured RFQs for verified suppliers with clear specifications."],
  ["Bid comparison", "Compare price, lead time, MOQ, and reliability without executing awards."],
  ["Memory query", "Answer sourcing questions from stored operational memory and current state."]
];

export default function AiAgentPage() {
  return (
    <PublicShell>
      <section className="dk section">
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <Bot className="hero-icon" />
            <div className="eyebrow on-dark">AURELEAN AI Agent</div>
            <h1 className="h-xl" style={{ marginTop: 16 }}>
              Agentic procurement with approval boundaries.
            </h1>
            <p className="lead" style={{ marginTop: 22 }}>
              AURELEAN coordinates supplier intelligence, RFQ creation, bid
              comparison, risk review, and operational memory while keeping
              award execution under human control.
            </p>
            <div className="actions">
              <Link className="btn btn-gold" href="/workspace">
                Open workspace <ArrowRight size={16} />
              </Link>
              <Link className="btn btn-ghost-dk" href="/developers">
                View API
              </Link>
            </div>
          </div>
          <div className="panel agent-public-panel">
            <Sparkles size={24} />
            <h2 className="h-md">Human approval required</h2>
            <p>
              Agents can prepare recommendations, create safe workflow records,
              and summarize evidence. Awards remain separate user actions.
            </p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap grid-4">
          {workflows.map(([title, text], index) => (
            <div className="feature-card" key={title}>
              {[<GitBranch key="g" />, <FileCheck2 key="f" />, <ShieldCheck key="s" />, <Sparkles key="sp" />][index]}
              <h2 className="h-md card-title">{title}</h2>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section" style={{ background: "var(--paper-1)" }}>
        <div className="wrap grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow">Inference integrations</div>
            <h2 className="h-lg" style={{ marginTop: 14 }}>NVIDIA NIM-ready for enterprise deployment paths.</h2>
            <p className="lead">
              AURELEAN can point its memory assistant at OpenAI-compatible
              inference endpoints, including NVIDIA NIM microservices, when a
              client needs self-hosted or NVIDIA-accelerated model infrastructure.
            </p>
          </div>
          <div className="feature-card">
            <Cpu />
            <h3 className="h-md card-title">Configurable model endpoint</h3>
            <p>
              Use `NVIDIA_NIM_BASE_URL`, `NVIDIA_NIM_API_KEY`, and
              `NVIDIA_NIM_MODEL` during deployment to route supported memory
              inference through a NIM-compatible endpoint.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
