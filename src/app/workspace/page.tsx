import type { Metadata } from "next";
import { WorkspaceClient } from "@/components/WorkspaceClient";
import { getState } from "@/lib/store";

export const metadata: Metadata = {
  title: "Demo Workspace",
  description:
    "Explore the AURELEAN demo workspace for RFQs, supplier intelligence, operational memory, market signals, and AI-assisted procurement."
};

export default async function WorkspacePage() {
  const state = await getState();
  return <WorkspaceClient initialState={state} />;
}
