alter table public.milestones
  add column if not exists confirmed_at timestamptz;
