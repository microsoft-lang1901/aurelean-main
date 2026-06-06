# AURELEAN Main

AURELEAN is an AI-native procurement workspace for supplier intelligence, RFQ orchestration, marketplace discovery, and operational memory.

## What Is Built

- Public landing pages: Home, Platform, Solutions, Trade, Developers, Request Access.
- Integration pages: NVIDIA Omniverse CAD-to-SimReady status, NVIDIA NIM-ready inference, and deployment readiness.
- Marketplace: search, category filters, sorting, supplier save state, supplier detail pages.
- Supplier workflow: RFQ creation and sample request capture.
- Workspace: overview, RFQ inbox, bid comparison and award action, supplier pipeline, operational memory.
- Backend API routes for all core actions.
- OpenAI-backed memory query endpoint with deterministic fallback.
- OpenAI Agents SDK orchestration endpoint with specialist agents, local procurement tools, and human approval guardrails.
- Supabase-ready persistence through `public.app_state`.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Environment

Copy `.env.example` to `.env.local` and set values as needed.

- `OPENAI_API_KEY`: powers `/api/memory/query`.
- `OPENAI_MODEL`: optional model override for memory and agent workflows. Defaults to `gpt-5.4-mini`.
- `OPENAI_BASE_URL`: optional OpenAI-compatible inference endpoint.
- `NVIDIA_NIM_API_KEY`: optional NVIDIA NIM API key for NIM-compatible memory inference.
- `NVIDIA_NIM_BASE_URL`: optional NVIDIA NIM endpoint URL.
- `NVIDIA_NIM_MODEL`: optional NVIDIA NIM model override.
- `RENDER_ENDPOINT`: optional render backend endpoint for NVIDIA Omniverse/OVRTX pipeline reruns.
- `CONTENT_AGENTS_ENDPOINT`: optional Content Agents service endpoint for material and physics property assignment.
- `CONTENT_AGENTS_API_KEY`: server-only Content Agents credential.
- `SIMREADY_PYTHON_RUNTIME`: optional runtime label shown in integration readiness responses.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used to persist app state.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: reserved for auth/client features.
- `AURELEAN_REQUIRE_AUTH`: set to `true` to require token-gated API mutations.
- `AURELEAN_API_TOKEN`: API token used only when `AURELEAN_REQUIRE_AUTH=true`.

If Supabase env vars are missing, local development writes to `data/aurelean-db.json`.

## Supabase Setup

Run the migration in `supabase/migrations/0001_aurelean_app_state.sql` on a new Supabase project, then add the Supabase env vars to Vercel.

The table has RLS enabled and no public policies. Only server-side service-role access should read/write `app_state`.

## Verification

With the dev server running:

```bash
npm run test:smoke
```

Browser verification should cover:

- Home route renders with supplied landing imagery.
- Trade search/filter/sort works.
- Save supplier toggles state.
- Supplier RFQ creates a new RFQ.
- Request Access stores a request.
- Workspace RFQ award updates bid state.
- Operational Memory returns an answer.
- Agent command center can search suppliers, compare bids, prepare approval, and create RFQs without bypassing the award button.

## Agent Framework

`POST /api/agents/run` is the AURELEAN orchestration path. It uses the OpenAI Agents SDK when `OPENAI_API_KEY` is present and falls back to deterministic local workflow logic if the model call is unavailable.

`POST /api/memory/query` can use OpenAI-compatible inference endpoints. For NVIDIA-accelerated enterprise deployment paths, set `NVIDIA_NIM_BASE_URL`, `NVIDIA_NIM_API_KEY`, and `NVIDIA_NIM_MODEL` to route supported memory inference through a NIM-compatible endpoint.

## NVIDIA CAD-to-SimReady Integration

`GET /api/integrations/nvidia-simready` exposes the latest known CAD-to-SimReady pipeline status for client intake. The current `minimal_mesh.stl` run passed conversion, minimum USD, Omniverse asset validation, geometry validation, and physics validation. SimReady profile validation and rendering remain blocked pending richer simulation evidence and deployment credentials.

Before rerunning the full pipeline, configure:

- `RENDER_ENDPOINT` or another usable render backend.
- `CONTENT_AGENTS_ENDPOINT` and `CONTENT_AGENTS_API_KEY` for property assignment.
- Grasp candidates or point-cloud evidence for FET005/GSP.001.
- Multi-component rigid-body candidates for RB.MB.001.

Agent structure:

- AURELEAN Orchestrator: routes requests across sourcing, RFQ, bid, risk, and memory workflows.
- Supplier Intelligence Agent: supplier discovery, profile checks, and risk review.
- RFQ Orchestration Agent: RFQ and sample-request workflows for verified suppliers only.
- Bid Comparison Agent: compares bids and prepares award recommendations.
- Operational Memory Agent: answers from memory and current state.

Guardrails:

- The agent can recommend an award, but cannot execute one.
- RFQs and sample requests are limited to verified suppliers.
- Supplier certifications and compliance facts must come from stored records.
- Unsafe requests that bypass approval or payment controls are blocked.

## Deploy

The project is designed for Vercel. Required production env vars:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `AURELEAN_REQUIRE_AUTH` and `AURELEAN_API_TOKEN` (optional production hardening; enable if you need write APIs behind a token)

Optional production integration env vars:

- `NVIDIA_NIM_BASE_URL`
- `NVIDIA_NIM_API_KEY`
- `NVIDIA_NIM_MODEL`
- `RENDER_ENDPOINT`
- `CONTENT_AGENTS_ENDPOINT`
- `CONTENT_AGENTS_API_KEY`

When `AURELEAN_REQUIRE_AUTH=true`, mutate routes (`/api/rfqs`, `/api/suppliers/{id}/save`, `/api/suppliers/{id}/sample`, `/api/rfqs/{id}/award`, `/api/agents/run`) require a token in either:
- `x-aurelean-api-token` header
- `Authorization: Bearer <AURELEAN_API_TOKEN>` header

Push to GitHub, import into Vercel, add env vars, and deploy.
