-- Run this in your Supabase project under: SQL Editor → New query

-- Create the jobs table
create table jobs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  customer_name text not null,
  address text,
  description text,
  assigned_tech text not null,
  status text default 'Pending' check (status in ('Pending', 'In Progress', 'Done'))
);

-- Allow logged-in users to read and write jobs
alter table jobs enable row level security;

create policy "Authenticated users can view jobs"
  on jobs for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert jobs"
  on jobs for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update jobs"
  on jobs for update using (auth.role() = 'authenticated');

create policy "Authenticated users can delete jobs"
  on jobs for delete using (auth.role() = 'authenticated');
