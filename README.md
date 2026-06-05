# AURELEAN Main

AURELEAN is an AI-native procurement workspace for supplier intelligence, RFQ orchestration, marketplace discovery, and operational memory.

## What Is Built

- Public landing pages: Home, Platform, Solutions, Trade, Developers, Request Access.
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
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: server-only key used to persist app state.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: reserved for auth/client features.

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

Push to GitHub, import into Vercel, add env vars, and deploy.
