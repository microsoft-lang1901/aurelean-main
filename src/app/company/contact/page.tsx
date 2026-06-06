import { CompanyDetailPage } from "@/components/CompanyDetailPage";

export default function ContactPage() {
  return (
    <CompanyDetailPage
      eyebrow="Contact"
      title="Bring AURELEAN into your sourcing operation."
      body="Tell us about your suppliers, sourcing categories, and workflow needs so we can prepare the right operating layer."
      points={[
        "Request access for onboarding.",
        "Discuss supplier intelligence and RFQ orchestration.",
        "Plan workspace setup around your current sourcing operation."
      ]}
    />
  );
}
