-- ORBIT — per-user workspace: favorites, recent activity, notes, highlights.
-- Every table here is owned by a user and RLS-scoped to auth.uid() — the
-- same shape localStorage.favorites/history already use client-side, so
-- switching a user onto Supabase sync is additive, not a redesign.

create table if not exists favorites (
  user_id     uuid not null references auth.users(id) on delete cascade,
  tool_id     text not null references tools(id) on delete cascade,
  added_at    timestamptz not null default now(),
  primary key (user_id, tool_id)
);

alter table favorites enable row level security;
create policy "favorites are self-scoped"
  on favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists recent (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  tool_id     text not null references tools(id) on delete cascade,
  visited_at  timestamptz not null default now()
);

create index if not exists recent_user_id_visited_at_idx on recent (user_id, visited_at desc);

alter table recent enable row level security;
create policy "recent is self-scoped"
  on recent for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  document_id uuid,                 -- nullable: a note can stand alone or attach to a document (see 0005)
  body        text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists notes_user_id_idx on notes (user_id);
create index if not exists notes_document_id_idx on notes (document_id);

alter table notes enable row level security;
create policy "notes are self-scoped"
  on notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger notes_set_updated_at
  before update on notes
  for each row execute function set_updated_at();

create table if not exists highlights (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  document_id  uuid not null,        -- fk added in 0005 once `documents` exists
  page_number  int not null,
  text_excerpt text not null,
  color        text not null default '#facc15',
  created_at   timestamptz not null default now()
);

create index if not exists highlights_document_id_idx on highlights (document_id);

alter table highlights enable row level security;
create policy "highlights are self-scoped"
  on highlights for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
