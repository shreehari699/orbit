-- ORBIT — PDF Intelligence's document metadata and study-mode sessions.
--
-- The file body itself belongs in Supabase Storage under a
-- user-scoped path (e.g. `documents/{user_id}/{document_id}.pdf`), never
-- in this table — this table is metadata plus whatever ORBIT already
-- extracts client-side (page count, word count, extracted text), so a
-- signed-in user's document list and study sessions sync across devices
-- without re-uploading the file to a third party.

create table if not exists documents (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  file_name       text not null,
  storage_path    text,             -- Supabase Storage object path, once uploaded
  page_count      int,
  word_count      int,
  extracted_text  text,             -- from client-side pdfjs extraction; nullable until processed
  created_at      timestamptz not null default now()
);

create index if not exists documents_user_id_idx on documents (user_id);

alter table documents enable row level security;
create policy "documents are self-scoped"
  on documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Now that `documents` exists, point highlights.document_id at it for real.
alter table highlights
  add constraint highlights_document_id_fkey
  foreign key (document_id) references documents(id) on delete cascade;

alter table notes
  add constraint notes_document_id_fkey
  foreign key (document_id) references documents(id) on delete set null;

-- A "study mode" session on one document: the running Q&A thread the user
-- has with PDF Intelligence's "Ask the PDF" feature, and which pages each
-- answer cited — so the UI can show a source reference, not a guess.
create table if not exists document_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  document_id   uuid not null references documents(id) on delete cascade,
  question      text not null,
  answer        text,
  cited_pages   int[] not null default '{}',
  ai_provider   text,               -- which provider answered, for auditability
  created_at    timestamptz not null default now()
);

create index if not exists document_sessions_document_id_idx on document_sessions (document_id);

alter table document_sessions enable row level security;
create policy "document_sessions are self-scoped"
  on document_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
