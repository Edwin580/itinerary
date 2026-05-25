-- ============================================================
-- NYC Itinerary — Supabase schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL editor)
-- ============================================================

-- Days
--   slots  — ordered TimeSlot[] (the time grid, never reordered)
--   events — Record<slotId, StopEvent> (content payloads, reassigned on swap)
create table if not exists days (
  id         text        primary key,
  sort_order integer     not null default 0,
  day        text        not null,
  date       text        not null,
  title      text        not null,
  subtitle   text        not null,
  blurb      text        not null,
  slots      jsonb       not null default '[]'::jsonb,
  events     jsonb       not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Options bank — global staging pool (single row, id = 1)
--   events — StopEvent[] that haven't been moved into a day yet
create table if not exists bank_state (
  id     int  primary key default 1,
  events jsonb not null default '[]'::jsonb
);

insert into bank_state (id, events)
values (1, '[]')
on conflict do nothing;

-- Pre-trip checklist items
create table if not exists check_items (
  id          text        primary key,
  sort_order  integer     not null default 0,
  title       text        not null,
  description text        not null default '',
  completed   boolean     not null default false,
  created_at  timestamptz default now()
);

-- Key-value store for lightweight app state (active day, editing mode)
create table if not exists app_state (
  key   text primary key,
  value text not null
);

-- Seed default app state rows
insert into app_state (key, value)
values
  ('day_idx', '0'),
  ('editing',  'false')
on conflict (key) do nothing;

-- ── Row-level security ───────────────────────────────────────────────────────
-- Private personal app — anon key reads/writes freely.
alter table days        disable row level security;
alter table check_items disable row level security;
alter table app_state   disable row level security;
alter table bank_state  disable row level security;

-- ── Migration: old schema → slots/events model ──────────────────────────────
-- If you get PGRST204 ("Could not find the 'events' column") you are running
-- the old schema that had a single `stops jsonb` column.  Run the block below
-- in the Supabase SQL editor, then reload the app — it will auto-seed.
--
-- OPTION A — drop & recreate (recommended; app auto-seeds from INITIAL_DAYS):
--
--   drop table if exists days;
--   create table days (
--     id         text        primary key,
--     sort_order integer     not null default 0,
--     day        text        not null,
--     date       text        not null,
--     title      text        not null,
--     subtitle   text        not null,
--     blurb      text        not null,
--     slots      jsonb       not null default '[]'::jsonb,
--     events     jsonb       not null default '{}'::jsonb,
--     created_at timestamptz default now()
--   );
--   alter table days disable row level security;
--
-- OPTION B — add columns in-place (keeps rows; existing rows get empty
--            slots/events so you'll see no stops until you hit Reset All):
--
--   alter table days add column if not exists
--     slots  jsonb not null default '[]'::jsonb;
--   alter table days add column if not exists
--     events jsonb not null default '{}'::jsonb;
--   -- optional: alter table days drop column if exists stops;
--
-- After either option, reload the app.  If the days table is now empty the app
-- auto-seeds; if rows exist with empty slots/events use "↺ Reset All" in edit
-- mode to repopulate.
