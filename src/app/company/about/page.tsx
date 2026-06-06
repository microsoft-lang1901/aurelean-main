import { CompanyDetailPage } from "@/components/CompanyDetailPage";

export default function AboutPage() {
  return (
    <CompanyDetailPage
      eyebrow="About"
      title="AURELEAN is infrastructure for modern sourcing teams."
      body="We build procurement systems that connect supplier intelligence, RFQs, operational memory, and agentic workflows."
      points={[
        "Luxury textile sourcing is the first operating vertical.",
        "The architecture expands across materials, furnishings, and manufacturing.",
        "Every workflow is designed around evidence, memory, and governance."
      ]}
    />
  );
}
