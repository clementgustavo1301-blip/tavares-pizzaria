-- Create the store_settings table
create table if not exists public.store_settings (
  id int primary key default 1,
  is_open boolean default true,
  updated_at timestamp with time zone default now()
);

-- Insert the initial row (only if it doesn't exist)
insert into public.store_settings (id, is_open)
values (1, true)
on conflict (id) do nothing;

-- Enable RLS
alter table public.store_settings enable row level security;

-- Allow public read access (so customers can check if store is open)
create policy "Public Read Access"
  on public.store_settings for select
  using ( true );

-- Allow authenticated users (admin) to update status
create policy "Admin Update Access"
  on public.store_settings for update
  using ( true )
  with check ( true );
