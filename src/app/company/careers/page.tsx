import { CompanyDetailPage } from "@/components/CompanyDetailPage";

export default function CareersPage() {
  return (
    <CompanyDetailPage
      eyebrow="Careers"
      title="Build the operating layer for global sourcing."
      body="AURELEAN is looking for people who care about product craft, procurement systems, data quality, and agentic software."
      points={[
        "Product engineering for procurement workflows.",
        "Supplier intelligence and sourcing operations.",
        "Design systems for quiet, high-trust enterprise tools."
      ]}
    />
  );
}
