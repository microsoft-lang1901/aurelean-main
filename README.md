# AURELEAN Main

AURELEAN is an AI-native procurement workspace for supplier intelligence, RFQ orchestration, marketplace discovery, and operational memory.

## What Is Built

- Public landing pages: Home, Platform, Solutions, Trade, Developers, Request Access.
- Marketplace: search, category filters, sorting, supplier save state, supplier detail pages.
- Supplier workflow: RFQ creation and sample request capture.
- Workspace: overview, RFQ inbox, bid comparison and award action, supplier pipeline, operational memory.
- Backend API routes for all core actions.
- OpenAI-backed memory query endpoint with deterministic fallback.
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

## Deploy

The project is designed for Vercel. Required production env vars:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Push to GitHub, import into Vercel, add env vars, and deploy.
