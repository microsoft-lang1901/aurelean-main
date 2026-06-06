# AURELEAN Audit and Delivery Update (2026-06-06)

## 1) Executive summary

### Product / design health
The launch surface is functionally complete across public pages, workspace surfaces, API routes, and the new NVIDIA integration pages.  
Current priority is now operational hardening and deployment consistency rather than missing page/build capability.  
Workspace and high-risk actions are now explicitly framed as demo/simulation in UI copy and routes that can remain public are guarded by validation, rate limits, and optional token checks.

### Backend / security health
Core validation, rate limiting, and deterministic fallback behavior are in place for all implemented production-facing routes.
Primary production risks are now mostly environment/configuration-driven:

1. Keep `/workspace` explicitly labeled as simulation unless onboarding activates authenticated access.
2. Enable `AURELEAN_REQUIRE_AUTH=true` + `AURELEAN_API_TOKEN` for production-mutating operations.
3. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; prefer Supabase-backed persistence in production.
4. Configure NVIDIA SimReady trigger credentials before rerun activation.

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

- `npm run lint` : pass (latest)
- `npm run build` : pass (includes new `/integrations/nvidia`, `/integrations/nvidia-simready`, and rerun API route)
- `npm run test:smoke` : pass against `http://127.0.0.1:3000` (including `/api/integrations/nvidia-simready/run` validation)
- `npx vercel --prod` : pass, production deployment created `https://aurelean-main-knpxtrlao-monsieur-app.vercel.app`

Notes / blockers:
- Vercel deployment is currently protected by platform-level auth in this environment, so anonymous automated smoke checks against deployment URLs may return `401`.
- This does not block the build; it only blocks public automated verification from the current session.

## 4) Design audit findings

### Critical
- None.

### High
- Footer, platform, intelligence, company, dashboard/sign-in aliases, and workspace navigation now resolve to implemented pages and do not degrade to incorrect fallbacks.
- NVIDIA integration introduction and SimReady status pages are now present and linked from integrations and developer references.

### Medium
- Trade, solutions, AI agent, resources, and company workflows remain complete and functionally wired to API actions.
- Request Access provides multi-step validation, consumer-email guards, and submission success/error messaging.
- Workspace banner and section-level labeling now explicitly state demo behavior for public access.

### Low
- No dedicated visual regression suite is yet attached to this repo; keyboard path checks are covered in smoke scripts and manual follow-up remains required.
- A lightweight CMS/brand-edit workflow would improve copy iteration for legal/security pages.

## 5) Backend/API/security audit findings

### Critical
- Production risk is limited to configuration posture when mutation endpoints are exposed for real customer data (if `AURELEAN_REQUIRE_AUTH` remains disabled).

### High
- Added `isRateLimited` checks to the new NVIDIA SimReady rerun endpoint to prevent rerun spam and abuse.
- `/api/integrations/nvidia-simready/run` now returns explicit prerequisite and rate-limit failures with distinct codes.
- Request validation and deterministic fallbacks were kept strict to avoid unsafe actions from malformed payloads.

### Medium
- `request-access` volume/corporate-email validation is enforced, and malformed submissions are rejected with status 422.
- SimReady rerun is currently staged via metadata and prerequisite checks; rerun execution remains blocked until render and content-agent credentials are configured.

### Low
- Deterministic fallback actions still allow simulation-mode workspace mutations when auth is disabled by design; this is acceptable for public demo but should be switched for production onboarding.
- There is no centralized abuse telemetry stream (only local logs and JSON error responses).

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
   - Added a full NVIDIA introduction page at `/integrations/nvidia` with context for NIM/Omniverse pathways and links to `/integrations/nvidia-simready` and API references.

4) `AUDIT.md`
    - Refreshed architecture, command outcomes, risk log, and deployment verification status.

5) `src/app/api/integrations/nvidia-simready/run/route.ts`
   - Added rate limiting for SimReady rerun endpoint in line with existing mutation protection model.

6) `src/lib/seed.ts`
   - Cleaned seeded operational content to remove encoding artifacts so the demo and workspace copy read professionally.

7) `scripts/smoke-test.mjs`
   - Added endpoint validation coverage for `/api/integrations/nvidia-simready/run` acceptance/prerequisite responses.
   - Hardened the endpoint response parsing path for optional status checks.

8) `src/app/dashboard/page.tsx`
   - Added `/dashboard` compatibility route to redirect to `/workspace`.

9) `src/app/signin/page.tsx`
   - Added primary sign-in alias route resolving to `/workspace`.

10) `src/app/sign-in/page.tsx`, `src/app/login/page.tsx`
   - Added alias compatibility routes for sign-in and login entry points.

### Validation and deployment cycle
- Re-ran: `npm run lint`, `npm run build`, `npm run test:smoke`.
- Deployed to Vercel with updated production URL `https://aurelean-main-knpxtrlao-monsieur-app.vercel.app` and alias `https://aurelean-main.vercel.app`.

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
- Sign-in/dashboard compatibility paths:
  - `/dashboard`, `/signin`, `/sign-in`, `/login`
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
- `/integrations/nvidia` renders the NVIDIA integration introduction and provides navigation to `/integrations/nvidia-simready` and related developer/API routes.
- `/integrations/nvidia` renders an NVIDIA integration introduction with clear call-to-action into SimReady and developer docs.
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

- Primary production deployment URL: https://aurelean-main-knpxtrlao-monsieur-app.vercel.app
- Aliased domain: https://aurelean-main.vercel.app
- Verification note: the production deployment is currently protected by platform auth for this session; local checks remain green on `http://127.0.0.1:3000`.
- Current redeploy URL: https://aurelean-main-knpxtrlao-monsieur-app.vercel.app
