const fs = require("fs");
const path = require("path");

const root = process.cwd();
const agentsDir = path.join(root, ".codex", "agents");
const registryPath = path.join(root, ".codex", "agents.registry.json");

const requiredKeys = [
  "name",
  "description",
  "tools",
  "model",
  "scope",
  "owner",
  "runtime",
  "risk_level",
  "approval_required",
  "memory_access",
  "authority",
  "inputs",
  "outputs",
  "handoff_targets",
  "failure_modes",
  "evals",
];

const forbiddenTrue = [
  "can_self_approve",
  "can_bypass_approval",
  "can_promote_production",
  "can_mutate_live_services",
  "can_send_client_outputs",
  "can_send_messages",
  "can_send_supplier_invites",
  "can_send_rejection",
  "can_grant_tier_1_access",
  "can_activate_account",
  "can_activate_accounts",
  "can_mark_verified_final",
  "can_select_supplier",
  "can_award_supplier",
  "can_override_blocked_supplier",
  "can_commit_spend",
  "can_modify_contract_terms",
  "can_make_pricing_commitments",
  "can_make_contractual_commitments",
  "can_modify_stripe_state",
  "can_grant_manual_override",
  "can_bypass_payment_gate",
  "can_weaken_tenant_policy",
  "can_disable_audit_logging",
  "can_bypass_rbac",
  "can_ignore_failures",
  "can_weaken_acceptance_criteria",
  "can_change_product_commitments",
  "can_remove_launch_blockers",
  "can_delete_audit_event",
  "can_override_missing_approval",
];

function fail(message) {
  console.error(`Codex agent validation failed: ${message}`);
  process.exitCode = 1;
}

function parseFrontMatter(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    fail(`${path.relative(root, filePath)} is missing YAML front matter`);
    return null;
  }

  const yaml = match[1];
  const values = {};
  for (const line of yaml.split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_]+):(?:\s*(.*))?$/);
    if (pair) values[pair[1]] = pair[2] || "";
  }

  return { yaml, values };
}

if (!fs.existsSync(agentsDir)) fail(".codex/agents directory does not exist");
if (!fs.existsSync(registryPath)) fail(".codex/agents.registry.json does not exist");

const files = fs.existsSync(agentsDir)
  ? fs.readdirSync(agentsDir).filter((file) => file.endsWith(".md")).sort()
  : [];

if (files.length === 0) fail("no .codex/agents/*.md files found");

const agentNames = new Map();

for (const file of files) {
  const filePath = path.join(agentsDir, file);
  const parsed = parseFrontMatter(filePath);
  if (!parsed) continue;

  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  for (const key of requiredKeys) {
    if (!(key in parsed.values)) fail(`${rel} is missing required key: ${key}`);
  }

  if (parsed.values.scope !== "project") fail(`${rel} must set scope: project`);
  if (parsed.values.owner !== "codebase") fail(`${rel} must set owner: codebase`);
  if (parsed.values.runtime !== "codex") fail(`${rel} must set runtime: codex`);
  if (parsed.values.model !== "codex") fail(`${rel} must set model: codex`);

  if (["high", "critical"].includes(parsed.values.risk_level) && parsed.values.approval_required !== "true") {
    fail(`${rel} is ${parsed.values.risk_level} risk and must require approval`);
  }

  for (const permission of forbiddenTrue) {
    const pattern = new RegExp(`^\\s*${permission}:\\s*true\\s*$`, "m");
    if (pattern.test(parsed.yaml)) fail(`${rel} sets forbidden permission ${permission}: true`);
  }

  agentNames.set(parsed.values.name, rel);
}

let registry;
try {
  registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
} catch (error) {
  fail(`registry JSON could not be parsed: ${error.message}`);
}

if (registry) {
  if (registry.runtime !== "codex") fail("registry must set runtime: codex");
  if (registry.scope !== "project") fail("registry must set scope: project");
  if (registry.owner !== "codebase") fail("registry must set owner: codebase");
  if (!Array.isArray(registry.agents)) fail("registry agents must be an array");

  const registryNames = new Set();
  for (const agent of registry.agents || []) {
    registryNames.add(agent.name);
    const target = path.join(root, agent.path || "");
    if (!fs.existsSync(target)) fail(`registry references missing file: ${agent.path}`);
  }

  for (const [name, rel] of agentNames.entries()) {
    if (!registryNames.has(name)) fail(`${rel} is not represented in the registry`);
  }

  for (const name of registryNames) {
    if (!agentNames.has(name)) fail(`registry includes ${name}, but no matching agent file exists`);
  }
}

if (process.exitCode) process.exit(process.exitCode);

console.log(`Codex agent validation passed: ${files.length} agent files and registry are valid.`);
