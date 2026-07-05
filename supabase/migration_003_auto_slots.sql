-- Keeps a rolling window of upcoming appointment slots so the calendar never
-- runs dry if nobody manually re-seeds it. A daily pg_cron job inserts any
-- missing weekday slots between tomorrow and the next 25 calendar days, for
-- every dentist. Safe to run repeatedly: existing slots are left untouched
-- (ON CONFLICT DO NOTHING), so it also self-heals if a scheduled run is ever
-- missed for a few days.
-- Run this in the Supabase SQL Editor after migration_002_blocking.sql.

create or replace function generate_upcoming_slots() returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into time_slots (dentist_id, slot_date, slot_time)
  select d.id, day::date, t.slot_time
  from dentists d
  cross join lateral (
    select generate_series(
      date_trunc('day', now()) + interval '1 day',
      date_trunc('day', now()) + interval '25 day',
      interval '1 day'
    ) as day
  ) days
  cross join lateral (
    select unnest(array['09:00','10:00','11:00','14:00','15:00','16:00']::time[]) as slot_time
  ) t
  where extract(isodow from day) < 6
    and mod((d.id + extract(day from day)::int + extract(hour from t.slot_time)::int), 3) != 0
  on conflict (dentist_id, slot_date, slot_time) do nothing;
end;
$$;

-- Requires the "pg_cron" extension. Enable it once via
-- Database → Extensions → search "pg_cron" → Enable (or run the line below
-- from the SQL Editor if your plan allows enabling extensions directly).
create extension if not exists pg_cron;

-- Runs every day at 03:00 UTC. Re-running this file is safe — it replaces
-- any existing job with this name instead of creating a duplicate.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'generate-upcoming-slots-daily') then
    perform cron.unschedule('generate-upcoming-slots-daily');
  end if;
end;
$$;

select cron.schedule(
  'generate-upcoming-slots-daily',
  '0 3 * * *',
  $$select generate_upcoming_slots()$$
);

-- Backfill immediately so the window is topped up right now too.
select generate_upcoming_slots();
