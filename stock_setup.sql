-- Create unavailable_ingredients table
create table if not exists public.unavailable_ingredients (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.unavailable_ingredients enable row level security;

-- Policies
create policy "Public Read Access"
  on public.unavailable_ingredients for select
  using ( true );

create policy "Admin Write Access"
  on public.unavailable_ingredients for insert
  with check ( true );

create policy "Admin Delete Access"
  on public.unavailable_ingredients for delete
  using ( true );
