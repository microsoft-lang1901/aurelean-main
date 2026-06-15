# AURELEAN Codex Agents

## Purpose

This directory defines repository-owned Codex agents for AURELEAN. These agents belong to the codebase, travel through Git, and describe how Codex should handle AURELEAN-specific implementation, procurement, intake, RFQ, validation, documentation, and PR-preparation work.

## How Codex Should Use The Orchestrator

Use `.codex/agents/codex-orchestrator.md` for long-running or product-critical tasks that require repository inspection, planning, bounded delegation, code changes, validation, documentation, and PR preparation.

The orchestrator must inspect repository state, read relevant product and architecture context, create a scoped phase plan, route specialist work to the correct sub-agent, and validate before PR preparation.

## How Codex Should Route To Sub-Agents

Route work by domain:

- Product scope, architecture, roadmap, and acceptance criteria: `product-architecture-agent`
- Dashboard routes, procurement UI, RFQ screens, and responsive fixes: `frontend-dashboard-agent`
- Design tokens, visual language, and component presentation rules: `design-system-agent`
- Intake qualification and Tier 1 recommendations: `intake-qualification-agent`
- Organization legitimacy and verification packets: `organization-verification-agent`
- Sourcing briefs and procurement requirement extraction: `procurement-intelligence-agent`
- RFQ state, invitations, quote status, and lifecycle validation: `rfq-lifecycle-agent`
- Supplier due diligence and risk mitigation: `supplier-risk-agent`
- Quote normalization and award recommendation packets: `quote-analysis-agent`
- Approval requirements, escalation, and decision records: `approval-governance-agent`
- Draft-first client and supplier communications: `client-communications-agent`
- Billing, usage, plan, and entitlement gates: `billing-entitlement-agent`
- Audit events, evidence packages, and trace reconstruction: `audit-evidence-agent`
- Auth, RBAC, tenant isolation, and launch security gates: `security-tenant-agent`
- Vercel, Supabase, Stripe, OpenAI, rollback, and go-live readiness: `live-services-agent`
- Tests, lint, PRD contracts, RFQ rules, and acceptance checks: `qa-validation-agent`
- PRD, architecture, roadmap, release, and implementation docs: `documentation-prd-agent`

## Registry Location

The registry is `.codex/agents.registry.json`.

## Validation Command

Run:

```bash
npm run validate:codex-agents
```

## Safety Boundaries

No agent may self-approve, bypass approval, mutate production services, promote production, expose secrets, send client or supplier outputs directly, grant Tier 1 access, activate accounts, award suppliers, commit spend, modify billing state, weaken tenant isolation, or remove acceptance gates.
