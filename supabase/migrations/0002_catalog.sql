-- ORBIT — catalog: categories, tools, and the Zero Degree app registry.
-- Public read-only reference data — no owner, no RLS restriction on
-- SELECT. Writes are service-role only (no policy grants insert/update to
-- anon/authenticated, so only the service-role key — which bypasses RLS —
-- or a Postgres role with direct access can modify these tables).

create table if not exists categories (
  id          text primary key,          -- matches ToolCategory in src/registry/tools.ts
  label       text not null,
  sort_order  int not null default 0
);

alter table categories enable row level security;
create policy "categories are publicly readable"
  on categories for select
  using (true);

create table if not exists tools (
  id                text primary key,     -- matches ToolDef.id
  label             text not null,
  description       text not null,
  href              text not null,
  category_id       text not null references categories(id),
  icon              text not null,
  keywords          text[] not null default '{}',
  requires_provider text,                 -- e.g. 'ai', null if none
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists tools_category_id_idx on tools (category_id);

alter table tools enable row level security;
create policy "tools are publicly readable"
  on tools for select
  using (is_active);

create table if not exists zero_degree_apps (
  id          text primary key,          -- 'orbit' | 'zhub' | 'loop' | 'civi' | ...
  name        text not null,
  tagline     text not null,
  url         text,                       -- null = not connected; never fabricated
  is_self     boolean not null default false,
  sort_order  int not null default 0
);

alter table zero_degree_apps enable row level security;
create policy "zero_degree_apps are publicly readable"
  on zero_degree_apps for select
  using (true);
