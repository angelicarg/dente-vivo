-- Dente Vivo — schema, security policies and seed data.
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query).

-- ─── TABLES ───────────────────────────────────────────────────────────────

create table dentists (
  id bigint generated always as identity primary key,
  name text not null,
  specialty text not null,
  bio text not null,
  color text not null,
  initials text not null
);

create table time_slots (
  id bigint generated always as identity primary key,
  dentist_id bigint not null references dentists (id) on delete cascade,
  slot_date date not null,
  slot_time time not null,
  is_available boolean not null default true,
  unique (dentist_id, slot_date, slot_time)
);

create table appointments (
  id bigint generated always as identity primary key,
  time_slot_id bigint not null unique references time_slots (id) on delete cascade,
  patient_name text not null,
  patient_phone text not null,
  patient_email text,
  note text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'rejected')),
  created_at timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────
-- Public visitors (anon) can only read dentists/availability and book a slot
-- through the controlled function below. Only the logged-in admin (the
-- clinic's front desk) can read/manage appointments or edit slots directly.

alter table dentists enable row level security;
alter table time_slots enable row level security;
alter table appointments enable row level security;

create policy "public read dentists" on dentists
  for select using (true);

create policy "public read time_slots" on time_slots
  for select using (true);

create policy "admin manage time_slots" on time_slots
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "admin manage appointments" on appointments
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ─── BOOKING FUNCTION ─────────────────────────────────────────────────────
-- Anon calls this instead of writing to the tables directly: it atomically
-- checks the slot is still free, marks it booked, and creates the
-- appointment — so two patients can never grab the same slot.

create or replace function book_appointment(
  p_slot_id bigint,
  p_name text,
  p_phone text,
  p_email text,
  p_note text
) returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available boolean;
  v_appointment_id bigint;
begin
  select is_available into v_available from time_slots where id = p_slot_id for update;

  if v_available is null then
    raise exception 'Horário não encontrado';
  end if;

  if not v_available then
    raise exception 'Este horário já foi reservado';
  end if;

  update time_slots set is_available = false where id = p_slot_id;

  insert into appointments (time_slot_id, patient_name, patient_phone, patient_email, note)
  values (p_slot_id, p_name, p_phone, p_email, p_note)
  returning id into v_appointment_id;

  return v_appointment_id;
end;
$$;

grant execute on function book_appointment(bigint, text, text, text, text) to anon;

-- ─── SEED DATA ────────────────────────────────────────────────────────────

insert into dentists (name, specialty, bio, color, initials) values
  ('Dra. Camila Ramos', 'Ortodontia', 'Especialista em aparelhos estéticos e alinhadores invisíveis com mais de 10 anos de experiência.', '#2C6E8A', 'CR'),
  ('Dr. Rafael Souza', 'Implantodontia', 'Referência em implantes osseointegrados e reabilitação oral completa na região.', '#1A5276', 'RS'),
  ('Dra. Fernanda Lima', 'Estética Dental', 'Focada em lentes de contato dental, clareamento e sorriso harmonioso.', '#117A65', 'FL'),
  ('Dr. Lucas Mendes', 'Endodontia', 'Especialista em tratamento de canal com técnicas modernas e anestesia sem dor.', '#6C3483', 'LM'),
  ('Dra. Juliana Castro', 'Odontopediatria', 'Atendimento especializado para crianças e adolescentes com abordagem lúdica e acolhedora.', '#B7770D', 'JC');

-- Generates a handful of open slots per dentist for the next 15 weekdays,
-- thinning them out with a deterministic modulo so it looks like a real,
-- partially-booked calendar instead of every slot being open.
insert into time_slots (dentist_id, slot_date, slot_time)
select d.id, day::date, t.slot_time
from dentists d
cross join lateral (
  select generate_series(
    date_trunc('day', now()) + interval '1 day',
    date_trunc('day', now()) + interval '18 day',
    interval '1 day'
  ) as day
) days
cross join lateral (
  select unnest(array['09:00','10:00','11:00','14:00','15:00','16:00']::time[]) as slot_time
) t
where extract(isodow from day) < 6
  and mod((d.id + extract(day from day)::int + extract(hour from t.slot_time)::int), 3) != 0;
