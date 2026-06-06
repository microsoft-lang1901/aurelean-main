import { SolutionDetailPage } from "@/components/SolutionDetailPage";

export default function MaterialsPage() {
  return (
    <SolutionDetailPage
      eyebrow="Materials"
      title="Match raw and processed materials to sourcing requirements."
      description="AURELEAN turns material requirements into searchable supplier evidence, governed RFQs, and memory-backed recommendations."
      bullets={[
        "Category-specific supplier and certification records",
        "Lead-time and availability signals for planning",
        "Reusable decisions across projects and supplier cohorts"
      ]}
    />
  );
}
