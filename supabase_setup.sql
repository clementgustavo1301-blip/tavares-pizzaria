-- Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- Drop existing policies to avoid conflicts/errors when running this multiple times
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Allow Uploads" on storage.objects;
drop policy if exists "Allow Updates" on storage.objects;
drop policy if exists "Allow Deletes" on storage.objects;

-- Re-create permissive policies (Targeting 'public' role ensures it works even if auth is tricky)

-- 1. Allow everyone to READ images (Essential for menu)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'menu-images' );

-- 2. Allow everyone to UPLOAD images (Simplifies debugging, restrict later if needed)
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'menu-images' );

-- 3. Allow updates
create policy "Allow Updates"
  on storage.objects for update
  using ( bucket_id = 'menu-images' );

-- 4. Allow deletes
create policy "Allow Deletes"
  on storage.objects for delete
  using ( bucket_id = 'menu-images' );
