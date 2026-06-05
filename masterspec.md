# AURELEAN Master Spec

## Product Intent

AURELEAN is the operating layer for global sourcing: a quiet-luxury public site, a verified supplier marketplace, and an internal procurement workspace with AI-native memory.

## Core User Roles

- Buyer: searches suppliers, issues RFQs, compares bids, awards suppliers, queries operational memory.
- Supplier: future role for responding to RFQs and updating materials.
- Admin: future role for supplier verification, access request review, and workspace provisioning.

## MVP Functional Scope

1. Public Site
   - Home communicates the infrastructure-first story.
   - Platform explains Trade, Intelligence, AI, and Infrastructure layers.
   - Solutions maps the platform to textiles, furnishings, materials, and manufacturing.
   - Developers documents the app API surface.
   - Request Access captures onboarding information.

2. Trade Marketplace
   - List verified suppliers.
   - Search by supplier, material, and country.
   - Filter by material category.
   - Sort by featured score, lead time, or MOQ.
   - Save/unsave suppliers.
   - Open supplier details.

3. Supplier Detail
   - Show certification, reliability, capability tier, overview, and material data.
   - Create a structured RFQ.
   - Capture a sample request.
   - Toggle saved state.

4. Workspace
   - Overview KPIs and recent activity.
   - RFQ Inbox with selectable RFQs.
   - Bid comparison and award action.
   - Supplier pipeline by stage.
   - Operational Memory feed and question answering.

5. Backend
   - `GET /api/bootstrap`
   - `POST /api/request-access`
   - `GET /api/rfqs`
   - `POST /api/rfqs`
   - `POST /api/rfqs/{id}/award`
   - `POST /api/suppliers/{id}/save`
   - `POST /api/suppliers/{id}/sample`
   - `POST /api/memory/query`
   - `POST /api/agents/run`

## Data Model

The MVP stores a structured state object:

- `suppliers`
- `rfqs`
- `bids`
- `memories`
- `accessRequests`
- `sampleRequests`

Local mode persists this object to `data/aurelean-db.json`. Supabase mode persists it in `public.app_state.state`.

## AI Behavior

`/api/memory/query` calls the OpenAI Responses API when `OPENAI_API_KEY` is available. It answers only from provided operational data. If the key is unavailable or the API fails, the endpoint returns a deterministic memory-based fallback so the product remains usable.

`/api/agents/run` is the agentic operating layer. It uses the OpenAI Agents SDK with an AURELEAN Orchestrator and four specialist agents:

- Supplier Intelligence Agent
- RFQ Orchestration Agent
- Bid Comparison Agent
- Operational Memory Agent

The agent tools map onto concrete product functions: supplier search, supplier profile lookup, RFQ creation, sample request creation, bid comparison, operational memory query, supplier risk review, and award recommendation preparation.

Required guardrails:

- Agents must never execute an award. They can only prepare an approval recommendation.
- The visible RFQ award button is the human approval action.
- RFQs and samples can only be created for verified suppliers.
- Certifications, supplier facts, and bid facts must be sourced from stored app state.
- Requests that attempt to bypass approval, ignore guardrails, or initiate payment are blocked.

Default model: `gpt-5.4-mini`.

## Assets

Landing assets are stored in `public/assets/landing`:

- `coastal-villa-wide.png`
- `interior-hero.png`
- `platform-stack.png`
- `home-full-reference.png`

## Deployment Contract

The production target is Vercel with Supabase persistence. Vercel must receive:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Future Normalized Schema

After MVP validation, split `app_state` into normalized tables:

- `organizations`
- `profiles`
- `suppliers`
- `materials`
- `rfqs`
- `bids`
- `messages`
- `memory_entries`
- `access_requests`
- `sample_requests`
- `audit_events`
