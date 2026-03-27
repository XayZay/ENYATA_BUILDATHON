create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('client', 'provider')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  client_id uuid not null references public.users (id) on delete cascade,
  provider_id uuid not null references public.users (id) on delete cascade,
  total_amount_usd numeric(12,2) not null default 0,
  status text not null check (status in ('draft', 'funded', 'in_progress', 'change_requested', 'completed', 'disputed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  description text not null default '',
  amount_usd numeric(12,2) not null,
  status text not null check (status in ('pending', 'funded', 'released')),
  due_date date,
  order_index integer not null,
  delivered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.change_orders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  requested_by uuid not null references public.users (id) on delete cascade,
  original_amount_usd numeric(12,2) not null,
  new_amount_usd numeric(12,2) not null,
  reason text not null,
  milestone_ids uuid[] not null,
  status text not null check (status in ('pending', 'approved_client', 'approved_provider', 'fully_approved', 'rejected')),
  client_approved_at timestamptz,
  provider_approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  milestone_id uuid references public.milestones (id) on delete set null,
  type text not null check (type in ('deposit', 'release', 'change_top_up')),
  amount_usd numeric(12,2) not null,
  status text not null check (status in ('pending', 'completed', 'failed')),
  interswitch_reference text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.users (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  amount_usd numeric(12,2) not null,
  selected_platform text not null check (selected_platform in ('interswitch', 'wise', 'grey', 'payoneer', 'quidax')),
  rate_at_time_ngn numeric(12,4) not null,
  amount_ngn numeric(14,2) not null,
  status text not null check (status in ('pending', 'processing', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  message text not null,
  read boolean not null default false,
  link text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, 'user@example.com'), '@', 1)),
    case
      when coalesce(new.raw_user_meta_data ->> 'role', 'client') = 'provider' then 'provider'
      else 'client'
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_project_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_projects_updated_at on public.projects;
create trigger set_projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_project_updated_at();

create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists projects_provider_id_idx on public.projects (provider_id);
create index if not exists milestones_project_id_idx on public.milestones (project_id);
create index if not exists change_orders_project_id_idx on public.change_orders (project_id);
create index if not exists transactions_project_id_idx on public.transactions (project_id);
create index if not exists notifications_user_id_idx on public.notifications (user_id);

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.milestones enable row level security;
alter table public.change_orders enable row level security;
alter table public.transactions enable row level security;
alter table public.payout_requests enable row level security;
alter table public.notifications enable row level security;

create policy if not exists "users_select_own_profile" on public.users
for select to authenticated using (auth.uid() = id);

create policy if not exists "users_update_own_profile" on public.users
for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy if not exists "projects_select_members" on public.projects
for select to authenticated using (auth.uid() = client_id or auth.uid() = provider_id);

create policy if not exists "projects_insert_client" on public.projects
for insert to authenticated with check (auth.uid() = client_id);

create policy if not exists "projects_update_members" on public.projects
for update to authenticated using (auth.uid() = client_id or auth.uid() = provider_id);

create policy if not exists "milestones_select_members" on public.milestones
for select to authenticated using (
  exists (
    select 1 from public.projects
    where public.projects.id = milestones.project_id
      and (public.projects.client_id = auth.uid() or public.projects.provider_id = auth.uid())
  )
);

create policy if not exists "milestones_modify_members" on public.milestones
for all to authenticated using (
  exists (
    select 1 from public.projects
    where public.projects.id = milestones.project_id
      and (public.projects.client_id = auth.uid() or public.projects.provider_id = auth.uid())
  )
) with check (
  exists (
    select 1 from public.projects
    where public.projects.id = milestones.project_id
      and (public.projects.client_id = auth.uid() or public.projects.provider_id = auth.uid())
  )
);

create policy if not exists "change_orders_members" on public.change_orders
for all to authenticated using (
  exists (
    select 1 from public.projects
    where public.projects.id = change_orders.project_id
      and (public.projects.client_id = auth.uid() or public.projects.provider_id = auth.uid())
  )
) with check (
  exists (
    select 1 from public.projects
    where public.projects.id = change_orders.project_id
      and (public.projects.client_id = auth.uid() or public.projects.provider_id = auth.uid())
  )
);

create policy if not exists "transactions_select_members" on public.transactions
for select to authenticated using (
  exists (
    select 1 from public.projects
    where public.projects.id = transactions.project_id
      and (public.projects.client_id = auth.uid() or public.projects.provider_id = auth.uid())
  )
);

create policy if not exists "payout_requests_members" on public.payout_requests
for all to authenticated using (auth.uid() = provider_id)
with check (auth.uid() = provider_id);

create policy if not exists "notifications_owner" on public.notifications
for all to authenticated using (auth.uid() = user_id)
with check (auth.uid() = user_id);
