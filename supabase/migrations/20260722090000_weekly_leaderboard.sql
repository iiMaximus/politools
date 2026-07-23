-- Weekly, friendly competition for the trusted-profile leaderboard. The
-- browser continues to write only lifetime aggregates; this trigger turns
-- their monotonic deltas into a Europe/Warsaw Monday-to-Sunday score.

alter table public.study_profiles
  add column if not exists week_started_on date not null
    default date_trunc('week', now() at time zone 'Europe/Warsaw')::date,
  add column if not exists weekly_xp integer not null default 0 check (weekly_xp >= 0),
  add column if not exists weekly_activity integer not null default 0 check (weekly_activity >= 0),
  add column if not exists weekly_mastery integer not null default 0 check (weekly_mastery >= 0);

create index if not exists study_profiles_weekly_rank_idx
  on public.study_profiles
    (week_started_on desc, weekly_xp desc, weekly_activity desc, weekly_mastery desc);

create or replace function public.accumulate_study_profile_weekly_stats()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_week date := date_trunc('week', now() at time zone 'Europe/Warsaw')::date;
  base_xp integer := 0;
  base_activity integer := 0;
  base_mastery integer := 0;
begin
  -- Aggregate counters should not move backwards when a stale trusted device
  -- checks in. This also prevents a later recovery from counting twice.
  new.total_xp := greatest(new.total_xp, old.total_xp);
  new.answers := greatest(new.answers, old.answers);
  new.mastered_cards := greatest(new.mastered_cards, old.mastered_cards);
  new.lessons_completed := greatest(new.lessons_completed, old.lessons_completed);

  if old.week_started_on = current_week then
    base_xp := old.weekly_xp;
    base_activity := old.weekly_activity;
    base_mastery := old.weekly_mastery;
  end if;

  new.week_started_on := current_week;
  new.weekly_xp := base_xp + greatest(new.total_xp - old.total_xp, 0);
  new.weekly_activity := base_activity
    + greatest(new.answers - old.answers, 0)
    + greatest(new.lessons_completed - old.lessons_completed, 0);
  new.weekly_mastery := base_mastery
    + greatest(new.mastered_cards - old.mastered_cards, 0);
  return new;
end;
$$;

drop trigger if exists accumulate_study_profiles_weekly_stats on public.study_profiles;
create trigger accumulate_study_profiles_weekly_stats
  before update on public.study_profiles
  for each row execute function public.accumulate_study_profile_weekly_stats();
