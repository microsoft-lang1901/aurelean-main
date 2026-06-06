import { SolutionDetailPage } from "@/components/SolutionDetailPage";

export default function ManufacturingPage() {
  return (
    <SolutionDetailPage
      eyebrow="Manufacturing"
      title="Track sourcing decisions into production-ready operations."
      description="For manufacturing teams, AURELEAN keeps supplier context, RFQs, bid choices, sample status, and risk review in one working environment."
      bullets={[
        "Procurement workspace for active sourcing threads",
        "Risk monitoring by supplier reliability and evidence",
        "Memory layer for approvals, specs, and production decisions"
      ]}
    />
  );
}
