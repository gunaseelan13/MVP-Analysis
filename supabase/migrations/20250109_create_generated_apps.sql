create table public.generated_apps (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  idea text not null,
  content text not null,
  market_analysis jsonb not null
);

-- Set up RLS policies
alter table public.generated_apps enable row level security;

create policy "Enable read access for all users"
  on public.generated_apps for select
  using (true);

create policy "Enable insert for authenticated users only"
  on public.generated_apps for insert
  with check (auth.role() = 'authenticated');
