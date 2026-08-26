-- ORBIT — extensions and profiles.
-- Not applied in this session: written and reviewed, but no live Supabase
-- project/credentials existed to run it against. See supabase/README.md.

create extension if not exists pgcrypto;   -- gen_random_uuid()
create extension if not exists pg_trgm;    -- fuzzy / prefix search, used by 0003

-- One row per Supabase Auth user. `id` mirrors auth.users(id) — Supabase
-- owns credentials, this table only owns app-facing profile data.
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles are self-readable"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles are self-writable"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles are self-insertable"
  on profiles for insert
  with check (auth.uid() = id);

-- Keeps updated_at honest without relying on every caller to set it.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();
