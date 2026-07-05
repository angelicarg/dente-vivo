-- Adds the ability for the admin panel to block days/times off (vacation,
-- holidays, lunch breaks) independently from patient bookings.
-- Run this in the Supabase SQL Editor after schema.sql.

alter table time_slots add column blocked boolean not null default false;

-- Semantics (computed, not stored anywhere else):
--   is_available = true                    -> open, patients can book it
--   is_available = false and blocked = true -> blocked by the clinic (no patient booking)
--   is_available = false and blocked = false -> booked by a patient
