import { CompanyDetailPage } from "@/components/CompanyDetailPage";

export default function NewsroomPage() {
  return (
    <CompanyDetailPage
      eyebrow="Newsroom"
      title="Updates from the AURELEAN operating layer."
      body="Follow product milestones, governance notes, and expansion updates as AURELEAN moves from textile sourcing into broader procurement infrastructure."
      points={[
        "First cohort focused on luxury textile workflows.",
        "Agent recommendations preserve human approval boundaries.",
        "Supplier intelligence and memory remain core product surfaces."
      ]}
    />
  );
}
