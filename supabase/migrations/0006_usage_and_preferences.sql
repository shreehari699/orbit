-- ORBIT — search history, AI usage log, and user preferences.

create table if not exists search_history (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  query       text not null,
  result_type text,               -- 'tool' | 'resource' | 'web' | 'quick-answer'
  searched_at timestamptz not null default now()
);

create index if not exists search_history_user_id_searched_at_idx on search_history (user_id, searched_at desc);

alter table search_history enable row level security;
create policy "search_history is self-scoped"
  on search_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- One row per AI provider call. Not a billing ledger — a usage log for
-- future rate limiting and for a user to see their own AI activity.
create table if not exists ai_usage (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  tool_id      text references tools(id),
  provider     text not null,      -- 'anthropic' | 'openai' | ...
  kind         text not null,      -- 'text' | 'image'
  created_at   timestamptz not null default now()
);

create index if not exists ai_usage_user_id_created_at_idx on ai_usage (user_id, created_at desc);

alter table ai_usage enable row level security;
create policy "ai_usage is self-scoped"
  on ai_usage for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists user_preferences (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  theme               text not null default 'system',   -- 'system' | 'light' | 'dark'
  default_ai_provider text,                              -- overrides the server-side default order
  reduced_motion       boolean not null default false,
  updated_at           timestamptz not null default now()
);

alter table user_preferences enable row level security;
create policy "user_preferences are self-scoped"
  on user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger user_preferences_set_updated_at
  before update on user_preferences
  for each row execute function set_updated_at();
