-- Only add the transcriptions table (assuming folders and files already exist)
-- Create transcriptions table
create table "public"."transcriptions" (
  id text not null default gen_random_uuid()::text,
  file_id text not null,
  content text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'error')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Add primary key
alter table "public"."transcriptions" add constraint "transcriptions_pkey" primary key (id);

-- Add foreign key constraint
alter table "public"."transcriptions" add constraint "transcriptions_file_id_fkey" 
  foreign key (file_id) references "public"."files" (id) on delete cascade;

-- Enable Row Level Security
alter table "public"."transcriptions" enable row level security;

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
create index "transcriptions_file_id_idx" on "public"."transcriptions" (file_id);
create index "transcriptions_status_idx" on "public"."transcriptions" (status); 