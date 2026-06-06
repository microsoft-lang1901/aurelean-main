export type SimReadyStageStatus = "ready" | "passed" | "failed" | "blocked";

export type SimReadyStage = {
  name: string;
  status: SimReadyStageStatus;
  artifact: string;
  note: string;
};

export const simReadyPipelineSummary = {
  name: "NVIDIA Omniverse CAD to SimReady",
  status: "blocked-needs-rerun",
  lastRunDate: "2026-06-06",
  sourceAsset: "minimal_mesh.stl",
  finalUsd: "pipeline/07_conform/fet004-multibody/minimal_mesh.usd",
  outputRoot: "pipeline_output",
  repairedRules: ["NP.006", "UN.007"],
  blockers: [
    {
      code: "RB.MB.001",
      title: "Multibody evidence required",
      detail: "The current source appears to be a single-component mesh. At least two rigid-body component candidates are required."
    },
    {
      code: "GSP.001",
      title: "Explicit grasp workflow required",
      detail: "Supply grasp candidates or point-cloud evidence before authoring the FET005 grasp line."
    },
    {
      code: "NP.003",
      title: "Naming/profile rule remains open",
      detail: "The rerun validation still reports a SimReady profile naming requirement."
    },
    {
      code: "RB.001",
      title: "Rigid-body authoring remains open",
      detail: "Rigid-body profile evidence could not be completed from the current mesh topology."
    }
  ],
  stages: [
    {
      name: "Preflight",
      status: "ready",
      artifact: "preflight.json",
      note: "Content Agents skipped because service credentials are not configured."
    },
    {
      name: "Convert to USD",
      status: "passed",
      artifact: "pipeline/01_conversion/convert-to-usd.json",
      note: "Source STL converted to a USD handoff artifact."
    },
    {
      name: "Minimum USD validation",
      status: "passed",
      artifact: "pipeline/02_minimum/validate-usd-minimum.json",
      note: "Minimum USD checks passed."
    },
    {
      name: "Omniverse Asset Validate",
      status: "passed",
      artifact: "pipeline/03_validation/omni-asset-validate.json",
      note: "General asset validation passed."
    },
    {
      name: "Geometry validation",
      status: "passed",
      artifact: "pipeline/04_geometry/omni-asset-validate-geometry.json",
      note: "Geometry validation passed."
    },
    {
      name: "Physics validation",
      status: "passed",
      artifact: "pipeline/05_physics/omni-asset-validate-physics.json",
      note: "Physics validation passed."
    },
    {
      name: "SimReady profile validation",
      status: "failed",
      artifact: "pipeline/06_simready/simready-validate.json",
      note: "Initial SimReady profile validation failed."
    },
    {
      name: "SimReady conformance",
      status: "blocked",
      artifact: "pipeline/07_conform/simready-conform-profile.json",
      note: "NP.006 and UN.007 repaired; multibody and grasp evidence remain blocked."
    },
    {
      name: "SimReady validation rerun",
      status: "failed",
      artifact: "pipeline/08_simready_rerun/simready-validate.json",
      note: "Rerun failed on RB.MB.001, GSP.001, NP.003, and RB.001."
    },
    {
      name: "OVRTX render",
      status: "failed",
      artifact: "pipeline/09_render/ovrtx-render-service.json",
      note: "RENDER_ENDPOINT is not configured and no renderable mesh prims were reported."
    }
  ] satisfies SimReadyStage[]
};

export function simReadyReadiness() {
  return {
    renderConfigured: Boolean(process.env.RENDER_ENDPOINT),
    contentAgentsConfigured: Boolean(process.env.CONTENT_AGENTS_ENDPOINT && process.env.CONTENT_AGENTS_API_KEY),
    pythonRuntime: process.env.SIMREADY_PYTHON_RUNTIME || "Python 3.12 recommended for Omniverse Kit tooling",
    requiredNextInputs: [
      "Configure RENDER_ENDPOINT or another usable render backend.",
      "Configure CONTENT_AGENTS_ENDPOINT and CONTENT_AGENTS_API_KEY for property assignment.",
      "Provide grasp candidates or point-cloud evidence for FET005.",
      "Provide multi-component rigid-body candidates for RB.MB.001."
    ]
  };
}
