# AURELEAN Codex Sub-Agents

## Purpose

AURELEAN uses repository-owned Codex agents to make long-running implementation and governance work explicit, reviewable, and versioned with the application.

## Project-Level vs Global-Level Codex Agents

Project-level agents live in `.codex/agents/`, belong to this repository, and define AURELEAN-specific behavior. Global agents live in an operator environment and must not own AURELEAN product policy, approval rules, RFQ state, billing, tenant controls, supplier risk, or client-facing communication.

## Codex Orchestrator Responsibilities

The orchestrator inspects repository state, reads product context, plans phases, routes specialist work, validates changes, records safety gates, and prepares PR summaries. It cannot approve its own work or bypass approval requirements.

## AURELEAN Sub-Agent List

- `product-architecture-agent`: PRD, architecture, roadmap, scope, and acceptance criteria.
- `frontend-dashboard-agent`: dashboard routes, procurement views, intake UI, RFQ screens, and responsive behavior.
- `design-system-agent`: visual language, tokens, hierarchy, and reference fidelity.
- `intake-qualification-agent`: gated access intake scoring and reviewer packets.
- `organization-verification-agent`: company legitimacy, domain consistency, and verification packets.
- `procurement-intelligence-agent`: requirement extraction, category classification, and sourcing briefs.
- `rfq-lifecycle-agent`: RFQ validation, state transitions, supplier invitation plans, and quote status.
- `supplier-risk-agent`: due diligence, compliance signals, supplier risk, and mitigations.
- `quote-analysis-agent`: quote normalization, landed-cost comparison, and award recommendation packets.
- `approval-governance-agent`: approval requirements, escalation routing, and decision records.
- `client-communications-agent`: draft-first client and supplier communications.
- `billing-entitlement-agent`: plan gates, usage limits, billing state, and feature access.
- `audit-evidence-agent`: evidence packages, audit summaries, and decision traces.
- `security-tenant-agent`: auth, RBAC, tenant isolation, and security launch gates.
- `live-services-agent`: production readiness, environment gates, rollback, and go-live evidence.
- `qa-validation-agent`: tests, lint, RFQ rules, intake controls, security contracts, and acceptance checks.
- `documentation-prd-agent`: PRD, architecture, roadmap, release, and alignment docs.

## Routing Model

Codex should start with the orchestrator for broad or critical work, then route bounded tasks to the smallest capable sub-agent. Specialist agents should return scoped outputs and hand off to validation, documentation, governance, or security agents when their work crosses those boundaries.

## Approval Model

High and critical risk agents require approval. No agent may self-approve, bypass approval, mutate production services, promote production, send external outputs directly, grant access, award suppliers, commit spend, or change billing state.

## Intake And Gated Access Boundaries

Intake agents may score applicants, identify missing fields, and prepare review packets. They may not grant Tier 1 access, activate accounts, send rejections, or mark final verification.

## Procurement And RFQ Workflow Boundaries

Procurement agents may create sourcing briefs and RFQ-ready scopes. RFQ lifecycle agents may validate state and prepare invitation plans, but may not send supplier invitations, close high-value RFQs, or award suppliers.

## Supplier Risk And Quote Analysis Boundaries

Supplier and quote agents may score risk, compare quotes, identify mitigations, and recommend review actions. They may not select suppliers, override blocked suppliers, commit spend, award suppliers, or modify contract terms.

## Billing And Entitlement Boundaries

Billing agents may evaluate access decisions and explain upgrade paths. They may not modify Stripe state, grant manual overrides, or bypass payment gates.

## Audit And Evidence Boundaries

Audit agents may collect evidence, prepare digests, and reconstruct traces. They may not delete audit events, override missing approvals, or edit final evidence outside review.

## Memory And Governance Boundaries

Agent memory access is scoped by domain and must not expose secrets. Governance state must preserve approval requirements, tenant separation, audit logging, and launch blockers.

## Failure Handling

Agents must stop or hand off when scope is unclear, documents conflict, evidence is missing, approvals are required, validation fails, or a requested action crosses a forbidden boundary.

## Validation

Run `npm run validate:codex-agents` after editing agent files or the registry. Run repository tests and lint when available.

## Acceptance Criteria

- Every agent file has required front matter and a concise instruction body.
- Registry includes every project agent and points to existing files.
- High and critical risk agents require approval.
- Forbidden authority permissions are never set to `true`.
- README documentation points to the project-level agent system.
