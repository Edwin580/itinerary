-- ============================================================
-- NYC Itinerary — Supabase schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL editor)
-- ============================================================

-- Days (stops stored as JSONB — keeps the client simple for a personal app)
create table if not exists days (
  id         text        primary key,
  sort_order integer     not null default 0,
  day        text        not null,
  date       text        not null,
  title      text        not null,
  subtitle   text        not null,
  blurb      text        not null,
  stops      jsonb       not null default '[]'::jsonb,
  created_at timestamptz default now()
);

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
-- This is a private personal app — no auth needed.
-- Disable RLS so the anon key can read/write freely.
alter table days        disable row level security;
alter table check_items disable row level security;
alter table app_state   disable row level security;
