-- Drop existing tables if they exist (CASCADE will also drop dependent tables)
DROP TABLE IF EXISTS "public"."transcriptions" CASCADE;
DROP TABLE IF EXISTS "public"."files" CASCADE;
DROP TABLE IF EXISTS "public"."folders" CASCADE;

-- Create folders table
create table "public"."folders" (
  id text not null default gen_random_uuid()::text,
  name text not null,
  user_id text not null default auth.jwt()->>'sub',
  created_at timestamp with time zone not null default now()
);

-- Create files table
create table "public"."files" (
  id text not null default gen_random_uuid()::text,
  folder_id text not null,
  user_id text not null default auth.jwt()->>'sub',
  name text not null,
  size integer not null,
  mime_type text not null,
  url text not null,
  created_at timestamp with time zone not null default now()
);

-- Create transcriptions table
create table "public"."transcriptions" (
  id text not null default gen_random_uuid()::text,
  file_id text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'error')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Add primary keys
alter table "public"."folders" add constraint "folders_pkey" primary key (id);
alter table "public"."files" add constraint "files_pkey" primary key (id);
alter table "public"."transcriptions" add constraint "transcriptions_pkey" primary key (id);

-- Add foreign key constraints
alter table "public"."files" add constraint "files_folder_id_fkey" 
  foreign key (folder_id) references "public"."folders" (id) on delete cascade;

alter table "public"."transcriptions" add constraint "transcriptions_file_id_fkey" 
  foreign key (file_id) references "public"."files" (id) on delete cascade;

-- Enable Row Level Security on all tables
alter table "public"."folders" enable row level security;
alter table "public"."files" enable row level security;
alter table "public"."transcriptions" enable row level security;

-- Create RLS policies for folders table
create policy "Users can view their own folders"
  on "public"."folders"
  for select
  to authenticated
  using (auth.jwt()->>'sub' = user_id);

create policy "Users can insert their own folders"
  on "public"."folders"
  for insert
  to authenticated
  with check (auth.jwt()->>'sub' = user_id);

create policy "Users can update their own folders"
  on "public"."folders"
  for update
  to authenticated
  using (auth.jwt()->>'sub' = user_id)
  with check (auth.jwt()->>'sub' = user_id);

create policy "Users can delete their own folders"
  on "public"."folders"
  for delete
  to authenticated
  using (auth.jwt()->>'sub' = user_id);

-- Create RLS policies for files table
create policy "Users can view their own files"
  on "public"."files"
  for select
  to authenticated
  using (auth.jwt()->>'sub' = user_id);

create policy "Users can insert their own files"
  on "public"."files"
  for insert
  to authenticated
  with check (auth.jwt()->>'sub' = user_id);

create policy "Users can update their own files"
  on "public"."files"
  for update
  to authenticated
  using (auth.jwt()->>'sub' = user_id)
  with check (auth.jwt()->>'sub' = user_id);

create policy "Users can delete their own files"
  on "public"."files"
  for delete
  to authenticated
  using (auth.jwt()->>'sub' = user_id);

-- Create RLS policies for transcriptions table
create policy "Users can view transcriptions for their files"
  on "public"."transcriptions"
  for select
  to authenticated
  using (
    exists (
      select 1 from "public"."files" 
      where files.id = transcriptions.file_id 
      and files.user_id = auth.jwt()->>'sub'
    )
  );

create policy "Users can insert transcriptions for their files"
  on "public"."transcriptions"
  for insert
  to authenticated
  with check (
    exists (
      select 1 from "public"."files" 
      where files.id = transcriptions.file_id 
      and files.user_id = auth.jwt()->>'sub'
    )
  );

create policy "Users can update transcriptions for their files"
  on "public"."transcriptions"
  for update
  to authenticated
  using (
    exists (
      select 1 from "public"."files" 
      where files.id = transcriptions.file_id 
      and files.user_id = auth.jwt()->>'sub'
    )
  )
  with check (
    exists (
      select 1 from "public"."files" 
      where files.id = transcriptions.file_id 
      and files.user_id = auth.jwt()->>'sub'
    )
  );

create policy "Users can delete transcriptions for their files"
  on "public"."transcriptions"
  for delete
  to authenticated
  using (
    exists (
      select 1 from "public"."files" 
      where files.id = transcriptions.file_id 
      and files.user_id = auth.jwt()->>'sub'
    )
  );

-- Create indexes for better performance
create index "folders_user_id_idx" on "public"."folders" (user_id);
create index "files_user_id_idx" on "public"."files" (user_id);
create index "files_folder_id_idx" on "public"."files" (folder_id);
create index "transcriptions_file_id_idx" on "public"."transcriptions" (file_id);
create index "transcriptions_status_idx" on "public"."transcriptions" (status); 