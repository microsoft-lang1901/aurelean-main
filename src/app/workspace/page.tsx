import { WorkspaceClient } from "@/components/WorkspaceClient";
import { getState } from "@/lib/store";

export default async function WorkspacePage() {
  const state = await getState();
  return <WorkspaceClient initialState={state} />;
}
