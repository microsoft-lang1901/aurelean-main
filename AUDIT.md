# AURELEAN Audit

## 1. Executive summary

### Overall product/design health

AURELEAN has a strong high-end B2B visual direction and a credible quiet-luxury procurement tone. The public site now covers the expected top-level information architecture, and the workspace demonstrates RFQ, supplier, memory, market-signal, risk, notification, and agent workflows. The largest UX issue found was that the workspace looked like an authenticated production account while it was actually a public demo.

### Overall backend/security health

The backend is a compact Next.js App Router API surface backed by a single structured state object. Supabase service-role usage is server-only and the migration enables RLS with no public policies, which is directionally safe. The biggest security gaps are lack of real authentication/authorization, public mutation endpoints, weak runtime input validation before this pass, and no durable abuse controls.

### Top 5 risks or opportunities

1. High: `/workspace` is public and can exercise realistic mutation flows, but there is no auth or ownership model.
2. High: Public API endpoints previously accepted loose or malformed payloads, including invalid agent actions and empty sample requests.
3. High: Award execution needed a stronger explicit approval boundary at the API layer.
4. Medium: Request-access flow needed clearer client/server validation and work-email enforcement.
5. Medium: NVIDIA CAD-to-SimReady status needed to be explicit so clients understand which validation stages passed and which rerun inputs remain blocked.

## 2. Project architecture overview

- Framework: Next.js 16.2.7 with React 19.2.4.
- Package manager: npm, with `package-lock.json`.
- Routing: App Router under `src/app`, with Server Components for pages and Route Handlers for APIs.
- Frontend structure: page-level routes in `src/app`, shared public chrome in `src/components/SiteChrome.tsx`, client workflows in `RequestAccessClient`, `TradeClient`, `SupplierClient`, and `WorkspaceClient`.
- Styling approach: global CSS variables and utility-like classes in `src/app/globals.css`; no Tailwind/shadcn layer.
- State management: React local state on client components; server state through `src/lib/store.ts`.
- Backend/API structure: Next.js route handlers under `src/app/api`.
- Persistence layer: local JSON file at `data/aurelean-db.json` in local dev; Supabase `public.app_state.state` JSONB row when Supabase env vars are present; in-memory fallback on Vercel if Supabase env vars are absent.
- Supabase integration: server-only `@supabase/supabase-js` client initialized lazily with `SUPABASE_SERVICE_ROLE_KEY`; migration enables RLS and denies public access.
- Auth/session model: no implemented auth/session, no cookies, no middleware, no route guards. `/workspace` is effectively a public demo.
- Environment variables: `OPENAI_API_KEY`, optional `OPENAI_MODEL`, optional OpenAI-compatible/NVIDIA NIM variables, optional NVIDIA CAD-to-SimReady renderer/Content Agents variables, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- Testing/build setup: `npm run lint`, `npm run build`, and `npm run test:smoke`; no separate typecheck, unit-test, or format script.

## 3. Commands run

| Command | Result | Notes/blockers |
| --- | --- | --- |
| `git status --short --branch` | Passed | Worktree had only local `.codex-screenshots/` before audit changes. |
| `rg --files` | Passed | Used to map project structure. |
| `npm run lint` | Passed before changes | Baseline lint was clean. |
| `npm run build` | Passed before changes | Baseline build produced 29 routes. |
| Live browser inspection of `/`, `/platform`, `/trade`, `/intelligence`, `/ai-agent`, `/developers`, `/resources/documentation`, `/security`, `/privacy`, `/request-access`, `/workspace` | Passed with findings | Workspace did not mention demo status. |
| Live invalid API probes against production | Passed with findings | Invalid agent action returned `200`; empty sample request was accepted. |
| `npm run lint` | Passed after final changes | No lint regressions. |
| `npm run build` | Passed after final changes | Build produced 34 app routes, including integration and health endpoints. |
| `npm run test:smoke` | Passed after final changes | Includes positive workflow checks, SimReady endpoint check, and negative validation checks. |
| Local rendered-route/API checks for `/integrations`, `/integrations/nvidia-simready`, `/developers`, `/resources/documentation`, `/workspace`, `/request-access`, and `/api/integrations/nvidia-simready` | Passed | Confirmed pages return `200` and SimReady API reports `blocked-needs-rerun`. |
| Browser visual automation with `agent-browser` | Blocked by local browser runtime | CLI installed, but Chrome/Chromium was not available; managed browser install timed out. |

## 4. Design audit findings

### Critical

No critical visual/design blocker found.

### High

#### Issue: Workspace looked like a real signed-in account while public.
- Evidence: Live `/workspace` showed “Atelier Voss / Maison workspace” and user identity copy with no demo disclosure.
- User/business impact: Users may misunderstand whether they are in a secure authenticated account; enterprise buyers may lose trust.
- Recommended fix: Make public demo status explicit; do not call nav entry “Sign in” without auth.
- Files/areas involved: `src/components/SiteChrome.tsx`, `src/components/WorkspaceClient.tsx`.
- Implemented in this task: Yes.

#### Issue: Request-access validation feedback was too late and incomplete.
- Evidence: Client could advance with missing data; server only checked email/company presence before this pass.
- User/business impact: Lower conversion quality, unclear user feedback, malformed lead data.
- Recommended fix: Validate steps client-side and enforce work-email/server validation.
- Files/areas involved: `src/components/RequestAccessClient.tsx`, `src/app/api/request-access/route.ts`.
- Implemented in this task: Yes.

### Medium

#### Issue: Focus visibility was not globally defined.
- Evidence: CSS did not define a clear `:focus-visible` treatment.
- User/business impact: Keyboard users and accessibility reviewers have a harder time using the interface.
- Recommended fix: Add visible focus outline aligned to the gold brand token.
- Files/areas involved: `src/app/globals.css`.
- Implemented in this task: Yes.

#### Issue: `/agent` could reasonably be expected but only `/ai-agent` existed.
- Evidence: Product/audit language references an agent route; repo route was `/ai-agent`.
- User/business impact: External references or user guesses could hit a 404.
- Recommended fix: Add `/agent` redirect to `/ai-agent`.
- Files/areas involved: `src/app/agent/page.tsx`.
- Implemented in this task: Yes.

#### Issue: Security/privacy pages are too MVP-level for enterprise procurement.
- Evidence: Pages describe posture but do not include compliance roadmap, retention periods, subprocessors, incident contact, or legal ownership.
- User/business impact: Technical and procurement buyers may not have enough assurance for vendor review.
- Recommended fix: Expand trust center content once policy/legal inputs are available.
- Files/areas involved: `/security`, `/privacy`, `/resources/documentation`.
- Implemented in this task: Partially. Pages were expanded with MVP trust posture, but legal-approved compliance, subprocessors, and retention details still require policy input.

#### Issue: NVIDIA CAD-to-SimReady integration status was not surfaced in the product.
- Evidence: Local pipeline reports showed conversion/validation progress and blockers, but the public site and API did not expose the run status or rerun requirements.
- User/business impact: Client intake could misread the integration as fully complete or miss required renderer, Content Agents, grasp, and multibody inputs.
- Recommended fix: Add integration pages, a read-only status endpoint, and deployment readiness documentation.
- Files/areas involved: `/integrations`, `/integrations/nvidia-simready`, `/api/integrations/nvidia-simready`, `/developers`, `/resources/documentation`, README, environment docs.
- Implemented in this task: Yes.

### Low

#### Issue: Public pages share generic metadata.
- Evidence: `src/app/layout.tsx` defines one title/description across all routes.
- User/business impact: Lower polish and SEO clarity.
- Recommended fix: Add route-specific metadata.
- Files/areas involved: route `page.tsx` files.
- Implemented in this task: Yes.

## 5. Backend/API/security audit findings

### Critical

No confirmed critical exploit was fixed in this pass, but the lack of auth/ownership would become critical if production customer data were connected.

### High

#### Issue: No authentication or authorization protects workspace/API mutations.
- Evidence: No middleware, cookies, sessions, or ownership checks; public endpoints mutate shared state.
- Risk/impact: IDOR and unauthorized mutation risk if real customer data is stored.
- Recommended fix: Add auth, organization ownership, role checks, and RLS-backed normalized tables before production customer use.
- Files/areas involved: `/workspace`, all mutation APIs, future Supabase schema.
- Implemented in this task: Partially. Workspace is now explicitly labeled demo; full auth requires product/security decisions.

#### Issue: Runtime input validation was weak.
- Evidence: Invalid agent action returned `200`; empty sample request returned `200`; request-access only checked presence.
- Risk/impact: malformed state, confusing API behavior, abuse surface.
- Recommended fix: Add server-side normalization, length caps, enum validation, and validation status codes.
- Files/areas involved: `src/lib/api.ts`, API routes.
- Implemented in this task: Yes.

#### Issue: Award endpoint did not require explicit approval intent in request payload.
- Evidence: `POST /api/rfqs/{id}/award` only required `bidId`.
- Risk/impact: Agents or scripts could execute award action without a distinct approval marker.
- Recommended fix: Require an explicit human approval intent field and keep agent endpoint recommendation-only.
- Files/areas involved: award route, workspace client, smoke tests.
- Implemented in this task: Yes.

### Medium

#### Issue: Public AI/memory endpoints lacked lightweight abuse controls.
- Evidence: No rate limiting or bounded string normalization before this pass.
- Risk/impact: Prompt/API abuse, high cost if OpenAI key is configured.
- Recommended fix: Add basic in-memory rate limiting and request size checks; replace with durable rate limiting for production.
- Files/areas involved: `src/lib/api.ts`, memory/agent/request-access routes.
- Implemented in this task: Partial. Added lightweight in-memory controls; durable edge/distributed rate limiting remains.

#### Issue: Local JSON fallback can mutate shared state and is not concurrency-safe.
- Evidence: `updateState` reads, mutates, and rewrites a JSON file without locking; Vercel fallback uses process memory when Supabase is absent.
- Risk/impact: Lost updates locally; non-durable state in production if Supabase env vars are missing.
- Recommended fix: Require Supabase in production or make demo state read-only/in-memory per session.
- Files/areas involved: `src/lib/store.ts`.
- Implemented in this task: No. Documented as remaining risk.

#### Issue: Supabase service role is safe server-side, but production depends on env hygiene.
- Evidence: `SUPABASE_SERVICE_ROLE_KEY` is not `NEXT_PUBLIC_` and store imports `server-only`; migration denies public policies.
- Risk/impact: Safe if env is configured correctly; dangerous if service role is ever exposed.
- Recommended fix: Keep service-role server-only, expose a user-safe health/readiness endpoint, and normalize schema later.
- Files/areas involved: `src/lib/store.ts`, `.env.example`, Vercel env.
- Implemented in this task: Partially. Added `/api/health` and documented env vars; no schema change.

#### Issue: OpenAI fallback is useful but prompt context still includes broad operational state.
- Evidence: `answerMemoryQuestion` and agent orchestration serialize slices of suppliers/RFQs/memory.
- Risk/impact: Potential data minimization concern with real customer data.
- Recommended fix: Narrow retrieval context by relevance and redact sensitive fields once real data is connected.
- Files/areas involved: `src/lib/assistant.ts`, `src/lib/aurelean-agent.ts`.
- Implemented in this task: Partially. Retrieval context is now narrowed by query relevance; full redaction requires real-data policy.

### Low

#### Issue: API returns user-safe errors, but no structured error codes.
- Evidence: API shape is `{ ok, error }` only.
- Risk/impact: Clients cannot reliably map errors beyond strings/status.
- Recommended fix: Add stable `code` fields while preserving existing contract.
- Files/areas involved: `src/lib/api.ts`, route handlers.
- Implemented in this task: Yes.

## 6. Changes implemented

### Summary of code changes

- Added API helper utilities for bounded JSON bodies, string normalization, array normalization, work-email validation, and lightweight in-memory rate limiting.
- Tightened `/api/request-access` validation and rate limiting.
- Tightened `/api/rfqs` validation and verified-supplier enforcement.
- Tightened `/api/suppliers/{id}/sample` validation and verified-supplier enforcement.
- Tightened `/api/memory/query` validation and rate limiting.
- Tightened `/api/agents/run` action enum validation and rate limiting.
- Added explicit `approvalIntent: "human-approved"` requirement to award endpoint and workspace client.
- Updated smoke tests with negative validation cases.
- Reworded top nav “Sign in” to “Demo workspace.”
- Added workspace demo banner and overview demo notice.
- Added global focus-visible styling.
- Added `/agent` redirect to `/ai-agent`.
- Added `/api/health` for user-safe persistence and integration readiness.
- Added `/api/integrations/nvidia-simready` with the latest CAD-to-SimReady run status, blockers, and readiness requirements.
- Added `/integrations` and `/integrations/nvidia-simready` public pages.
- Added NVIDIA SimReady and NIM integration details to developer docs, resource docs, README, and `.env.example`.
- Added route-specific metadata across high-visibility public pages.
- Reduced AI prompt context to relevant suppliers, RFQs, bids, and memory snippets.
- Created `AUDIT.md`.

### Why these changes were selected

They address the highest-impact safe fixes that do not require secrets, auth provider setup, schema changes, legal policy input, or new dependencies.

### Files changed

- `AUDIT.md`
- `scripts/smoke-test.mjs`
- `src/app/agent/page.tsx`
- `src/app/api/agents/run/route.ts`
- `src/app/api/memory/query/route.ts`
- `src/app/api/request-access/route.ts`
- `src/app/api/rfqs/route.ts`
- `src/app/api/rfqs/[id]/award/route.ts`
- `src/app/api/suppliers/[id]/sample/route.ts`
- `src/app/api/bootstrap/route.ts`
- `src/app/api/health/route.ts`
- `src/app/api/integrations/nvidia-simready/route.ts`
- `src/app/integrations/page.tsx`
- `src/app/integrations/nvidia-simready/page.tsx`
- `src/app/developers/page.tsx`
- `src/app/resources/documentation/page.tsx`
- `src/app/globals.css`
- `src/components/RequestAccessClient.tsx`
- `src/components/SiteChrome.tsx`
- `src/components/WorkspaceClient.tsx`
- `src/lib/api.ts`
- `src/lib/assistant.ts`
- `src/lib/aurelean-agent.ts`
- `src/lib/nvidia-simready.ts`

## 7. Remaining risks and follow-up tasks

- Implement real auth/session handling and organization ownership checks before connecting real customer data.
- Decide whether `/workspace` is a permanent public demo or a protected application surface.
- Add production-grade rate limiting using an edge/durable store.
- Require Supabase configuration in production if persistent mutations are expected; otherwise force read-only demo state.
- Expand security/privacy pages with legal-approved details.
- Add route-specific metadata for public pages.
- Add unit/integration tests for route handlers beyond smoke tests.
- Add observability for API mutation success/failure without logging PII.
- Review OpenAI context minimization and redaction once real customer data exists.
- Resolve NVIDIA SimReady blockers: configure renderer/Content Agents, provide grasp evidence, and supply multibody rigid-body candidates.
- Validate Supabase production project settings, Data API exposure, and RLS through authenticated Supabase access.

## 8. Manual QA checklist

- Homepage: confirm first viewport explains procurement infrastructure and CTAs are visible on desktop/mobile.
- Navigation: click every top-nav and footer link; confirm no unexpected 404 or main-page fallback.
- Request-access form: try empty fields, personal email, valid work email, step navigation, final success state, and server failure state.
- Workspace: confirm demo banner, overview KPIs, active RFQ links, and dashboard subviews.
- RFQ creation: create RFQ from supplier detail and via agent workflow; confirm missing fields fail.
- Supplier save/sample: toggle save, request sample, confirm empty sample quantity fails.
- Award flow: confirm award button sends explicit approval and missing approval payload fails.
- Memory query: ask a known question, malformed empty question, and rapid repeated queries.
- Agent run: run supplier search, compare bids, risk review, recommend award, invalid action, and missing prompt/action.
- Mobile viewport: inspect home, trade, supplier detail, request access, and workspace.
- Keyboard-only navigation: tab through nav, CTAs, request form, marketplace cards, workspace nav, and award buttons.
- Error/loading states: test API failures, network interruption, OpenAI key absent, and Supabase unavailable.
- NVIDIA SimReady: open `/integrations/nvidia-simready`, confirm stage statuses, and verify `/api/integrations/nvidia-simready` reports missing/present renderer and Content Agents configuration correctly.
