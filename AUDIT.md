# AURELEAN Audit and Delivery Update (2026-06-06)

## 1) Executive summary

### Product / design health
The web product is largely complete for the requested launch surface: marketing pages, solutions, intelligence, integrations, company pages, resources, workspace, trade marketplace, supplier detail pages, and required API documentation pages all exist and render.
The remaining highest-impact item is production access posture: workflow APIs and workspace mutations should be intentionally hardened for enterprise use when required.

### Backend / security health
Core validation, rate limiting, and fallback behavior are in place for core endpoints.
Primary production risks are environment-dependent and tied to deployment flags:

1. Keep `/workspace` clearly identified as a demo unless authenticated onboarding is required.
2. Enable `AURELEAN_REQUIRE_AUTH=true` with `AURELEAN_API_TOKEN` for mutation protection in production.
3. Configure trusted Supabase and AI provider variables for durable persistence and stronger inference paths.

## 2) Project architecture overview

- Framework: Next.js 16 App Router (React 19, TypeScript).
- Routing model:
  - Public marketing and product routes in `src/app/*`.
  - Dynamic route: `src/app/trade/[id]`.
  - API routes: `src/app/api/*`.
- Frontend structure:
  - Shared shell/navigation/footer in `src/components/SiteChrome.tsx`.
  - Client workflows in `src/components/*` (workspace, trade, supplier detail, request access).
- Backend/API structure:
  - Route validation, payload size/rate-limit guards, and JSON parsing in `src/lib/api.ts`.
  - State + mutations in `src/lib/store.ts`.
  - Request schemas in `src/lib/validation.ts`.
  - AI and integration helpers in `src/lib/assistant.ts`, `src/lib/aurelean-agent.ts`, `src/lib/nvidia-simready.ts`.
- Persistence:
  - Supabase server-side state when `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present (`public.app_state`), with local JSON fallback in development.
- Auth/session model:
  - No user sessions in the current MVP.
  - Workspace is intentionally labeled as public demo.
  - Mutations are optionally token-gated via `AURELEAN_REQUIRE_AUTH=true` + `AURELEAN_API_TOKEN`.
- Environment variables:
  - `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_BASE_URL`
  - `NVIDIA_NIM_API_KEY`, `NVIDIA_NIM_BASE_URL`, `NVIDIA_NIM_MODEL`
  - `RENDER_ENDPOINT`, `CONTENT_AGENTS_ENDPOINT`, `CONTENT_AGENTS_API_KEY`, `SIMREADY_PYTHON_RUNTIME`
  - `AURELEAN_REQUIRE_AUTH`, `AURELEAN_API_TOKEN`
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Testing/build setup:
  - `npm run lint`
  - `npm run build`
  - `npm run test:smoke`
  - `npx vercel --prod` for deployment.

## 3) Commands run

- `npm run lint` : pass
- `npm run build` : pass (both local and Vercel build)
- `npm run test:smoke` : pass locally against `http://127.0.0.1:3000`
- `npm run lint` : pass (latest post-update compatibility check)
- `npm run build` : pass (after adding `/integrations/nvidia` route)
- `npm run test:smoke` : pass (with NVIDIA integration redirect coverage)
- `npx vercel --prod` : pass, production deployment created

Notes / blockers:
- Vercel deployment is currently protected by platform-level auth in this environment, so anonymous automated smoke checks against `https://aurelean-main-knb349540-monsieur-app.vercel.app` returned `401`.
- This does not block the build; it only blocks public automated verification from the current session.

## 4) Design audit findings

### Critical
None.

### High
- Footer and secondary landing surfaces were previously incomplete; all footer routes now render and map to implemented pages.
- First-viewport copy and positioning now consistently describe procurement, intelligence, and AI operations on the core pages.

### Medium
- Trade, solutions, intelligence, AI agent, integrations, resources, and company pages all render with operational CTAs.
- Request Access flow provides step-based validation and clear completion feedback.
- NVIDIA SimReady status is represented as explicit operational status with blocked/retry requirements.

### Low
- No dedicated visual regression / interaction suite for full keyboard path coverage.
- Marketing copy and legal/security phrasing still needs enterprise tone review before final public launch.

## 5) Backend/API/security audit findings

### Critical
- Production risk remains if mutation endpoints stay unauthenticated while representing real customer accounts.
- The implementation-level mitigation exists (`AURELEAN_REQUIRE_AUTH` + token checks + rate limiting), but enforcement depends on deployment flags.

### High
- Agent payload validation was strengthened so ask-style requests require a non-empty prompt.
- Rate limiting and malformed payload checks are applied across mutation and AI/data routes.
- Mutation failures return explicit status codes and machine-readable error codes.

### Medium
- Request-access blocks common consumer email providers, but broader abuse controls and privacy policy enforcement rely on deployment configuration and onboarding process.
- NVIDIA simulation metadata is staged from recorded pipeline results, not a live long-running job controller.

### Low
- Deterministic fallback paths can still mutate workspace state when auth is intentionally not enabled.
- No centralized abuse telemetry stream is present in this version.

## 6) Changes implemented

### Implemented changes
1) `src/lib/validation.ts`
   - Added strict prompt requirement for generic agent ask action in `agentRunSchema`.

2) `scripts/smoke-test.mjs`
   - Made company about matcher robust for multiple copy variants.
   - Corrected expected status for missing RFQ award path (`404`).
   - Added and aligned malformed/negative validation checks for request-access, RFQ, agent, sample, and award routes.
   - Added `/integrations/nvidia` coverage and assertion for NVIDIA intro route compatibility.

3) `src/app/integrations/nvidia/page.tsx`
   - Added compatibility redirect from `/integrations/nvidia` to `/integrations/nvidia-simready` for stable NVIDIA integration deep-links.

4) `AUDIT.md`
   - Refreshed architecture, command outcomes, risk log, and deployment verification status.

### Validation and deployment cycle
- Re-ran: `npm run lint`, `npm run build`, `npm run test:smoke`.
- Deployed to Vercel with updated URL alias update.

## 7) Remaining risks and follow-up tasks

### Required before client intake
- Decide and enforce explicit access model for workspace and mutation endpoints:
  - Keep demo mode with clear labeling, or
  - Enable `AURELEAN_REQUIRE_AUTH=true` and token checks for protected production onboarding.
- Configure production keys for persistence and inference:
  - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY` or NVIDIA NIM equivalents
- Define retention, data-processing, and incident response in onboarding package.

### External blockers
- NVIDIA SimReady rerun remains blocked by:
  - RB.MB.001, GSP.001, NP.003, RB.001
  - Missing `RENDER_ENDPOINT` and `CONTENT_AGENTS_*` credentials for the rerun/render path.

## 8) Manual QA checklist

- Homepage: hero clarity, CTA flow, trust signals
- Header and footer path coverage:
  - `/platform`, `/trade`, `/intelligence`, `/ai-agent`, `/integrations`, `/developers`, `/resources`, `/company`, `/security`, `/privacy`
- Request-access:
  - required fields
  - work-email block
  - step validation
  - success/error messaging
- Workspace:
  - bootstrap refresh
  - RFQ detail/inbox flow
  - award requires approval intent
  - memory query and notifications
- `/integrations/nvidia` redirects and renders to `/integrations/nvidia-simready`.
- Marketplace:
  - search/sort/filter
  - save supplier
  - supplier detail RFQ and sample requests
- API:
  - `/api/bootstrap`
  - `/api/health`
  - `/api/request-access`
  - `/api/rfqs`, `/api/rfqs/{id}/award`
  - `/api/suppliers/{id}/save`, `/api/suppliers/{id}/sample`
  - `/api/memory/query`, `/api/agents/run`
- Accessibility:
  - keyboard focus and labels
  - live regions on status and notices
  - mobile and responsive layout checks
- Failure behavior:
  - malformed payloads
  - unauthorized/blocked mutations
  - rate-limited responses

## 9) Live deployment

- Production deployment URL: https://aurelean-main-knb349540-monsieur-app.vercel.app
- Latest production deployment URL: https://aurelean-main-on1qaikk3-monsieur-app.vercel.app
- Aliased domain: https://aurelean-main.vercel.app
- Verification note: both production URLs in this workspace are currently protected by platform auth for this environment; local checks remain green on `http://127.0.0.1:3000`.
