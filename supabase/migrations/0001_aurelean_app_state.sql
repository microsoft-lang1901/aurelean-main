-- AURELEAN MVP persistence.
-- The app uses a single JSONB state row so the MVP can preserve the complete
-- procurement workspace while the normalized enterprise schema evolves.

create table if not exists public.app_state (
  id text primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "No public app_state access" on public.app_state;

create policy "No public app_state access"
  on public.app_state
  for all
  using (false)
  with check (false);

comment on table public.app_state is
  'AURELEAN structured MVP state. Accessed only by server-side Supabase service role.';
