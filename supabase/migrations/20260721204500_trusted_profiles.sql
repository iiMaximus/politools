-- Polito Tools is shared by a tiny trusted study group. There is deliberately
-- no account system: choosing a profile on a device gives access to that
-- profile's progress, and the aggregate columns power the leaderboard.

create extension if not exists pgcrypto;

create table if not exists public.study_profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(display_name) between 2 and 24),
  avatar text not null default '🎓' check (char_length(avatar) between 1 and 8),
  progress jsonb not null default '{"version":1,"stores":{},"generatedAt":0}'::jsonb,
  client_updated_at bigint not null default 0,
  total_xp integer not null default 0 check (total_xp >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  best_streak integer not null default 0 check (best_streak >= 0),
  answers integer not null default 0 check (answers >= 0),
  mastered_cards integer not null default 0 check (mastered_cards >= 0),
  lessons_completed integer not null default 0 check (lessons_completed >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists study_profiles_name_unique
  on public.study_profiles (lower(display_name));

create index if not exists study_profiles_rank_idx
  on public.study_profiles (total_xp desc, current_streak desc, updated_at asc);

alter table public.study_profiles enable row level security;

revoke all on table public.study_profiles from anon;
revoke all on table public.study_profiles from authenticated;
grant select, insert, update on table public.study_profiles to anon, authenticated;
grant all on table public.study_profiles to service_role;

drop policy if exists "Trusted group can read profiles" on public.study_profiles;
create policy "Trusted group can read profiles"
  on public.study_profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Trusted group can create profiles" on public.study_profiles;
create policy "Trusted group can create profiles"
  on public.study_profiles for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Trusted group can update profiles" on public.study_profiles;
create policy "Trusted group can update profiles"
  on public.study_profiles for update
  to anon, authenticated
  using (true)
  with check (true);

create or replace function public.set_study_profile_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_study_profiles_updated_at on public.study_profiles;
create trigger set_study_profiles_updated_at
  before update on public.study_profiles
  for each row execute function public.set_study_profile_updated_at();
