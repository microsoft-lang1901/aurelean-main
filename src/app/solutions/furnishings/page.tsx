import { SolutionDetailPage } from "@/components/SolutionDetailPage";

export default function FurnishingsPage() {
  return (
    <SolutionDetailPage
      eyebrow="Furnishings"
      title="Coordinate furnishing programs across makers, materials, and timelines."
      description="AURELEAN gives furnishings teams a shared operating memory for supplier evidence, sampling gates, quote comparisons, and delivery risk."
      bullets={[
        "Supplier relationship stages for makers and workshops",
        "Sampling and specification capture for repeated programs",
        "Operational memory across design, procurement, and production"
      ]}
    />
  );
}
