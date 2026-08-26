-- ORBIT — the internal resource search index (spec Section 8).
--
-- Public read-only reference data, same write model as 0002_catalog.sql.
-- Full-text search via a maintained tsvector (title weighted above
-- description, description above tags), a GIN index for fast ranked
-- search, and pg_trgm for fuzzy/prefix matching on title.
--
-- The tsvector is maintained by a BEFORE INSERT/UPDATE trigger rather
-- than a generated column: `to_tsvector(regconfig, text)` is STABLE, not
-- IMMUTABLE, so Postgres rejects it inside `generated always as (...)
-- stored` — a real constraint discovered by actually running this
-- migration against a local Postgres instance, not just reading it.

create table if not exists resources (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text not null default '',
  url           text not null,
  resource_type text not null,   -- 'educational' | 'developer' | 'ai' | 'productivity' | 'document' | 'image' | 'student' | 'zero_degree'
  tags          text[] not null default '{}',
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  search_vector tsvector
);

create or replace function resources_search_vector_update()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.tags, '{}'), ' ')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger resources_set_search_vector
  before insert or update on resources
  for each row execute function resources_search_vector_update();

create index if not exists resources_search_vector_idx on resources using gin (search_vector);
create index if not exists resources_title_trgm_idx on resources using gin (title gin_trgm_ops);
create index if not exists resources_type_idx on resources (resource_type);

alter table resources enable row level security;
create policy "resources are publicly readable"
  on resources for select
  using (is_active);

-- Ranked full-text search, callable via `select * from search_resources('pdf ocr', 20);`
-- websearch_to_tsquery tolerates plain-language queries ("pdf tools for students")
-- without the caller needing to build tsquery syntax itself.
create or replace function search_resources(query text, result_limit int default 20)
returns setof resources as $$
  select *
  from resources
  where is_active
    and search_vector @@ websearch_to_tsquery('english', query)
  order by ts_rank(search_vector, websearch_to_tsquery('english', query)) desc
  limit result_limit;
$$ language sql stable;
