import { SolutionDetailPage } from "@/components/SolutionDetailPage";

export default function LuxuryTextilesPage() {
  return (
    <SolutionDetailPage
      eyebrow="Luxury textiles"
      title="Source fine textiles with provenance, memory, and RFQ precision."
      description="For tailoring cloth, silk, cashmere, linen, cotton, and technical fabrics, AURELEAN connects verified suppliers with structured sourcing workflows."
      bullets={[
        "Verified mills and atelier-scale suppliers",
        "Material search by fiber, country, MOQ, and lead time",
        "RFQs, samples, bid comparison, and award memory"
      ]}
    />
  );
}
