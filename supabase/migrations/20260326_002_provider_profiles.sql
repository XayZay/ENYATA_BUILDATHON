create table if not exists public.provider_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  handle text not null unique,
  provider_code text not null unique,
  bio text not null default '',
  country text not null default 'Nigeria',
  specialty text not null default '',
  preferred_payout_channel text not null default 'interswitch',
  availability_status text not null default 'available',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_provider_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_provider_profiles_updated_at on public.provider_profiles;
create trigger set_provider_profiles_updated_at
  before update on public.provider_profiles
  for each row execute procedure public.set_provider_profile_updated_at();

create index if not exists provider_profiles_user_id_idx on public.provider_profiles (user_id);
create index if not exists provider_profiles_handle_idx on public.provider_profiles (handle);
create index if not exists provider_profiles_provider_code_idx on public.provider_profiles (provider_code);

alter table public.provider_profiles enable row level security;

create policy if not exists "provider_profiles_public_read" on public.provider_profiles
for select to authenticated using (true);

create policy if not exists "provider_profiles_owner_write" on public.provider_profiles
for all to authenticated using (auth.uid() = user_id)
with check (auth.uid() = user_id);
