-- Reaction Rush leaderboard schema
-- Run this in your Supabase project's SQL editor.

create extension if not exists "pgcrypto";

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null,               -- anonymous id, generated client-side, no auth required
  display_name text,                     -- optional, sanitized before insert
  score_ms integer not null check (score_ms > 80 and score_ms < 3000),
  mode text not null check (mode in ('quick', 'five-round')),
  created_at timestamptz not null default now()
);

create index if not exists scores_score_ms_idx on scores (score_ms asc);
create index if not exists scores_player_id_idx on scores (player_id);

-- Row Level Security: allow anyone to read, but writes should go through a
-- server route (e.g. a Next.js API route or Supabase Edge Function) that
-- performs rate limiting and sanity checks before inserting. Do not grant
-- open insert access directly from the browser.
alter table scores enable row level security;

create policy "Public read access"
  on scores for select
  using (true);

-- No public insert policy is created here on purpose. Inserts should happen
-- via a trusted server-side function using the service role key, after:
--   - validating score_ms is in a plausible human range,
--   - rate-limiting per player_id (e.g. max 1 submission per few seconds),
--   - sanitizing display_name (strip HTML, cap length).
